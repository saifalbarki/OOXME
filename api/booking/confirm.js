const crypto = require('crypto');
const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { bookingConfig } = require('../_lib/config');
const { createCalendarBooking, bookingId } = require('../_lib/calendar');
const { storeBookingRecord } = require('../_lib/drive');
const { sendBookingNotifications } = require('../_lib/messaging');
const { sendBookingConfirmationEmail } = require('../_lib/mailer');
const { query, withTransaction } = require('../_lib/db');
const { normalizePromoCode, validatePromoOrToken } = require('../_lib/promo-engine');

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
const identityHash = (email, phone) => crypto.createHash('sha256').update(`${normalizeEmail(email)}\u0000${normalizePhone(phone)}`).digest('hex');
const slotBounds = (date, time, duration) => {
  const start = new Date(`${date}T${time}:00+03:00`);
  const end = new Date(start.getTime() + Number(duration) * 60_000);
  return { start, end };
};
const bookingError = (code, message = code) => Object.assign(new Error(message), { code });

async function reserveBooking(input, customer, config) {
  const duration = Number(input.duration);
  const bounds = slotBounds(input.date, input.time, duration);
  const booking = {
    id: crypto.randomUUID(),
    publicReference: bookingId(),
    status: 'held',
    createdAt: new Date().toISOString(),
    timezone: config.timezone,
    date: input.date,
    time: input.time,
    duration,
    payment: input.payment || '',
    promo: normalizePromoCode(input.promoCode || input.promo),
    offerToken: input.offerToken || '',
    offerSession: input.offerSession || '',
    customer: {
      name: String(customer.name).trim(), email: normalizeEmail(customer.email), phone: String(customer.phone).trim(),
      topic: String(customer.topic).trim(), sector: String(customer.sector).trim(), additional: String(customer.additional || '').trim()
    }
  };
  const customerHash = identityHash(booking.customer.email, booking.customer.phone);
  const result = await withTransaction(async (client) => {
    const execute = client.query.bind(client);
    const promotion = await validatePromoOrToken({
      promoCode: booking.promo, offerToken: booking.offerToken, offerSession: booking.offerSession, serviceId: 'consultation', durationMinutes: duration, execute
    });
    if (!promotion.valid) throw bookingError(promotion.error);
    const quote = promotion.quote;
    booking.promo = promotion.promoCode || booking.promo;
    booking.notificationMode = promotion.notificationMode || 'final';
    if (quote.finalAmount > 0 && !['ZainCash', 'Qi'].includes(booking.payment)) throw bookingError('payment_required');

    await execute("UPDATE booking_holds SET status = 'expired', released_at = now() WHERE status = 'active' AND expires_at <= now()");
    await execute(
      `INSERT INTO bookings (id, public_reference, status, service_code, customer_name, customer_email, customer_phone, customer_email_normalized, customer_phone_normalized, customer_identity_hash, topic, sector, additional_information, scheduled_start, scheduled_end, timezone, duration_minutes, base_amount, discount_amount, final_amount, currency, payment_provider, promotion_id, promo_code_normalized, idempotency_key)
       VALUES ($1, $2, 'held', 'consultation', $3, $4, $5, $4, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
      [booking.id, booking.publicReference, booking.customer.name, booking.customer.email, booking.customer.phone, normalizePhone(booking.customer.phone), customerHash, booking.customer.topic, booking.customer.sector, booking.customer.additional, bounds.start, bounds.end, config.timezone, duration, quote.baseAmount, quote.discountAmount, quote.finalAmount, quote.currency, quote.finalAmount === 0 ? null : booking.payment, promotion.promotionId || null, booking.promo || null, crypto.randomUUID()]
    );
    await execute(
      `INSERT INTO booking_holds (id, booking_id, service_code, slot_start, slot_end, status, expires_at)
       VALUES ($1, $2, 'consultation', $3, $4, 'active', now() + interval '10 minutes')`,
      [crypto.randomUUID(), booking.id, bounds.start, bounds.end]
    );
    if (promotion.type === 'file_promo' || promotion.type === 'offer_token') {
      // The advisory lock serializes redemptions for this configured code without
      // exposing or mutating the private JSON source file at runtime.
      await execute('SELECT pg_advisory_xact_lock(hashtext($1))', [promotion.promoCode]);
      const counts = await execute(
        `SELECT count(*) FILTER (WHERE status IN ('pending', 'redeemed'))::int AS total,
                count(*) FILTER (WHERE status IN ('pending', 'redeemed') AND customer_identity_hash = $2)::int AS customer
           FROM file_promo_redemptions WHERE promo_code_normalized = $1`,
        [promotion.promoCode, customerHash]
      );
      if ((promotion.maxUses !== null && counts.rows[0].total >= promotion.maxUses) || (promotion.perCustomerLimit !== null && counts.rows[0].customer >= promotion.perCustomerLimit)) throw bookingError('promotion_limit_reached');
      await execute('INSERT INTO file_promo_redemptions (id, promo_code_normalized, booking_id, customer_identity_hash, status) VALUES ($1, $2, $3, $4, \'pending\')', [crypto.randomUUID(), promotion.promoCode, booking.id, customerHash]);
    }
    if (promotion.type === 'offer_token') {
      const held = await execute("UPDATE offer_tokens SET status = 'held', held_at = now(), customer_identity_hash = $2 WHERE id = $1 AND status = 'issued' AND expires_at > now() AND (customer_identity_hash IS NULL OR customer_identity_hash = $2) RETURNING id", [promotion.offerTokenId, customerHash]);
      if (!held.rowCount) throw bookingError('offer_unavailable');
      await execute('UPDATE bookings SET offer_token_id = $1 WHERE id = $2', [promotion.offerTokenId, booking.id]);
    }
    return { booking, promotion };
  });
  return result;
}

async function releaseReservation(booking) {
  await withTransaction(async (client) => {
    await client.query("UPDATE booking_holds SET status = 'released', released_at = now() WHERE booking_id = $1 AND status = 'active'", [booking.id]);
    await client.query("UPDATE file_promo_redemptions SET status = 'released', released_at = now() WHERE booking_id = $1 AND status = 'pending'", [booking.id]);
    await client.query("UPDATE offer_tokens SET status = 'issued', held_at = NULL WHERE consumed_booking_id IS NULL AND id = (SELECT offer_token_id FROM bookings WHERE id = $1)", [booking.id]);
    await client.query("UPDATE bookings SET status = 'failed', updated_at = now() WHERE id = $1", [booking.id]);
  });
}

async function finalizeReservation(booking, calendarEventId) {
  await withTransaction(async (client) => {
    await client.query("UPDATE bookings SET status = 'confirmed', calendar_event_id = $2, confirmed_at = now(), updated_at = now() WHERE id = $1", [booking.id, calendarEventId]);
    await client.query("UPDATE booking_holds SET status = 'confirmed' WHERE booking_id = $1 AND status = 'active'", [booking.id]);
    await client.query("UPDATE file_promo_redemptions SET status = 'redeemed', redeemed_at = now() WHERE booking_id = $1 AND status = 'pending'", [booking.id]);
    await client.query("UPDATE offer_tokens SET status = 'consumed', consumed_at = now(), consumed_booking_id = $1 WHERE id = (SELECT offer_token_id FROM bookings WHERE id = $1) AND status = 'held'", [booking.id]);
  });
}

module.exports = async (request, response) => {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  let reservation;
  try {
    const input = await readJson(request); const customer = input.customer || {};
    const duration = Number(input.duration); const config = bookingConfig();
    if (!customer.name || !validEmail(customer.email) || normalizePhone(customer.phone).length < 7 || !customer.topic || !customer.sector || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !config.slots.includes(input.time) || !config.consultationMinutes.includes(duration)) return json(response, 400, { error: 'invalid_booking' });
    reservation = await reserveBooking(input, customer, config);
    const event = await createCalendarBooking(reservation.booking);
    reservation.booking.calendarEventId = event.id;
    reservation.booking.status = 'confirmed';
    reservation.booking.quote = reservation.promotion.quote;
    await finalizeReservation(reservation.booking, event.id);
    const [drive, notifications] = await Promise.allSettled([storeBookingRecord(reservation.booking), sendBookingNotifications(reservation.booking)]);
    sendBookingConfirmationEmail(reservation.booking).catch((mailError) => console.error('SMTP booking email failed', mailError.message));
    return json(response, 201, { id: reservation.booking.publicReference, status: reservation.booking.status, calendarEventId: event.id, requiresPayment: reservation.promotion.quote.finalAmount > 0, finalAmount: reservation.promotion.quote.finalAmount, currency: reservation.promotion.quote.currency, integrations: { drive: drive.status, notifications: notifications.status } });
  } catch (error) {
    if (reservation?.booking) await releaseReservation(reservation.booking).catch(() => undefined);
    console.error('booking confirmation failed', error.message);
    const status = ['slot_unavailable', 'promotion_limit_reached', 'offer_unavailable', 'promotion_unavailable', 'payment_required'].includes(error.code) ? 409 : (error.code === 'invalid_booking' || error.code === 'unsupported_price' ? 400 : 503);
    return json(response, status, { error: error.code || 'booking_unavailable' });
  }
};
