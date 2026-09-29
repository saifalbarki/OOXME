const crypto = require('crypto');
const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { bookingConfig } = require('../_lib/config');
const { createCalendarBooking, bookingId, eventRange, meetsMinimumBookingLeadTime } = require('../_lib/calendar');
const { storeBookingRecord } = require('../_lib/drive');
const { sendBookingNotifications } = require('../_lib/messaging');
const { query, withTransaction } = require('../_lib/db');
const { normalizePromoCode, validatePromoOrToken, RESERVATION_TTL_MINUTES } = require('../_lib/promo-engine');

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/\D/g, '');
const identityHash = (email, phone) => crypto.createHash('sha256').update(`${normalizeEmail(email)}\u0000${normalizePhone(phone)}`).digest('hex');
const validIdempotencyKey = (value) => /^[A-Za-z0-9._:-]{16,128}$/.test(String(value || ''));
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
    language: input.language === 'ar' ? 'ar' : 'en',
    payment: ['ZainCash', 'Qi'].includes(input.payment) ? input.payment : '',
    idempotencyKey: String(input.idempotencyKey),
    promo: normalizePromoCode(input.promoCode || input.promo),
    offerToken: input.offerToken || '',
    offerSession: input.offerSession || '',
    customer: {
      name: String(customer.name).trim(),
      email: normalizeEmail(customer.email),
      phone: String(customer.phone).trim(),
      topic: String(customer.topic).trim(),
      sector: String(customer.sector).trim(),
      additional: String(customer.additional || '').trim()
    }
  };
  const customerHash = identityHash(booking.customer.email, booking.customer.phone);
  const result = await withTransaction(async (client) => {
    const execute = client.query.bind(client);
    const promotion = await validatePromoOrToken({
      promoCode: booking.promo,
      offerToken: booking.offerToken,
      offerSession: booking.offerSession,
      serviceId: 'consultation',
      durationMinutes: duration,
      execute
    });
    if (!promotion.valid) throw bookingError(promotion.error);
    const quote = promotion.quote;
    booking.promo = promotion.promoCode || booking.promo;
    booking.notificationMode = promotion.notificationMode || 'final';
    await execute("UPDATE booking_holds SET status = 'expired', released_at = now() WHERE status = 'active' AND expires_at <= now()");
    await execute(
      `INSERT INTO bookings (id, public_reference, status, service_code, customer_name, customer_email, customer_phone, customer_email_normalized, customer_phone_normalized, customer_identity_hash, topic, sector, additional_information, scheduled_start, scheduled_end, timezone, duration_minutes, base_amount, discount_amount, final_amount, currency, payment_provider, promotion_id, promo_code_normalized, idempotency_key, booking_language)
       VALUES ($1, $2, 'held', 'consultation', $3, $4, $5, $4, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)`,
      [booking.id, booking.publicReference, booking.customer.name, booking.customer.email, booking.customer.phone, normalizePhone(booking.customer.phone), customerHash, booking.customer.topic, booking.customer.sector, booking.customer.additional, bounds.start, bounds.end, config.timezone, duration, quote.baseAmount, quote.discountAmount, quote.finalAmount, quote.currency, quote.finalAmount === 0 ? null : (booking.payment || null), promotion.promotionId || null, booking.promo || null, booking.idempotencyKey, booking.language]
    );
    await execute(
      `INSERT INTO booking_holds (id, booking_id, service_code, slot_start, slot_end, status, expires_at)
       VALUES ($1, $2, 'consultation', $3, $4, 'active', now() + interval '10 minutes')`,
      [crypto.randomUUID(), booking.id, bounds.start, bounds.end]
    );
    if (promotion.type === 'promotion' || promotion.type === 'offer_token') {
      await execute('SELECT pg_advisory_xact_lock(hashtext($1))', [promotion.promoCode]);
      await execute(
        `UPDATE promotion_redemptions
            SET status = 'released', released_at = now()
          WHERE promotion_id = $1 AND status = 'pending' AND reservation_expires_at <= now()`,
        [promotion.promotionId]
      );
      const counts = await execute(
        `SELECT count(*) FILTER (WHERE status = 'redeemed' OR (status = 'pending' AND reservation_expires_at > now()))::int AS total,
                count(*) FILTER (WHERE customer_identity_hash = $2 AND (status = 'redeemed' OR (status = 'pending' AND reservation_expires_at > now())))::int AS customer
           FROM promotion_redemptions WHERE promotion_id = $1`,
        [promotion.promotionId, customerHash]
      );
      if ((promotion.maxUses !== null && counts.rows[0].total >= promotion.maxUses) || (promotion.perCustomerLimit !== null && counts.rows[0].customer >= promotion.perCustomerLimit)) throw bookingError('promotion_limit_reached');
      await execute('INSERT INTO promotion_redemptions (id, promotion_id, booking_id, customer_identity_hash, status, reservation_expires_at) VALUES ($1, $2, $3, $4, \'pending\', now() + ($5 * interval \'1 minute\'))', [crypto.randomUUID(), promotion.promotionId, booking.id, customerHash, RESERVATION_TTL_MINUTES]);
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
    await client.query("UPDATE promotion_redemptions SET status = 'released', released_at = now() WHERE booking_id = $1 AND status = 'pending'", [booking.id]);
    await client.query("UPDATE offer_tokens SET status = 'issued', held_at = NULL WHERE consumed_booking_id IS NULL AND id = (SELECT offer_token_id FROM bookings WHERE id = $1)", [booking.id]);
    await client.query("UPDATE bookings SET status = 'failed', updated_at = now() WHERE id = $1", [booking.id]);
  });
}

async function finalizeReservation(booking, calendarEventId) {
  await withTransaction(async (client) => {
    await client.query("UPDATE bookings SET status = 'confirmed', calendar_event_id = $2, confirmed_at = now(), updated_at = now() WHERE id = $1", [booking.id, calendarEventId]);
    await client.query("UPDATE booking_holds SET status = 'confirmed' WHERE booking_id = $1 AND status = 'active'", [booking.id]);
    await client.query("UPDATE promotion_redemptions SET status = 'redeemed', redeemed_at = now(), reservation_expires_at = NULL WHERE booking_id = $1 AND status = 'pending'", [booking.id]);
    await client.query("UPDATE offer_tokens SET status = 'consumed', consumed_at = now(), consumed_booking_id = $1 WHERE id = (SELECT offer_token_id FROM bookings WHERE id = $1) AND status = 'held'", [booking.id]);
    await client.query(
      `INSERT INTO booking_reminders (id, booking_id, channel, due_at, scheduled_start_snapshot, next_attempt_at, external_id)
       SELECT $2, b.id, 'email', b.scheduled_start - interval '5 hours', b.scheduled_start,
              b.scheduled_start - interval '5 hours', $3
         FROM bookings b WHERE b.id = $1
       ON CONFLICT (booking_id, channel) DO NOTHING`,
      [booking.id, crypto.randomUUID(), `ooxme-reminder-email-${booking.id}`]
    );
    await client.query(
      `INSERT INTO booking_reminders (id, booking_id, channel, due_at, scheduled_start_snapshot, next_attempt_at, external_id)
       SELECT $2, b.id, 'whatsapp', b.scheduled_start - interval '5 hours', b.scheduled_start,
              b.scheduled_start - interval '5 hours', $3
         FROM bookings b WHERE b.id = $1
       ON CONFLICT (booking_id, channel) DO NOTHING`,
      [booking.id, crypto.randomUUID(), `ooxme-reminder-whatsapp-${booking.id}`]
    );
  });
}

async function findBookingByIdempotencyKey(key) {
  const result = await query('SELECT public_reference, status, calendar_event_id, final_amount, currency FROM bookings WHERE idempotency_key = $1', [key]);
  return result.rows[0] || null;
}

const bookingResponse = (booking, quote, integrations = {}, replayed = false) => ({
  id: booking.publicReference || booking.public_reference,
  status: booking.status,
  calendarEventId: booking.calendarEventId || booking.calendar_event_id,
  requiresPayment: Number(quote?.finalAmount ?? booking.final_amount) > 0,
  finalAmount: Number(quote?.finalAmount ?? booking.final_amount),
  currency: quote?.currency || booking.currency,
  integrations,
  replayed
});

module.exports = async (request, response) => {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  let reservation;
  try {
    const input = await readJson(request);
    const customer = input.customer || {};
    const duration = Number(input.duration);
    const config = bookingConfig();
    if (!customer.name || !validEmail(customer.email) || normalizePhone(customer.phone).length < 7 || !customer.topic || !customer.sector || !validIdempotencyKey(input.idempotencyKey) || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !config.slots.includes(input.time) || !config.consultationMinutes.includes(duration)) {
      return json(response, 400, { error: 'invalid_booking' });
    }
    const existing = await findBookingByIdempotencyKey(input.idempotencyKey);
    if (existing?.status === 'confirmed') return json(response, 200, bookingResponse(existing, null, {}, true));
    if (existing) return json(response, 409, { error: 'booking_in_progress' });
    if (!meetsMinimumBookingLeadTime(eventRange(input.date, input.time, duration).start)) {
      throw bookingError('booking_minimum_lead_time');
    }
    reservation = await reserveBooking(input, customer, config);
    const event = await createCalendarBooking(reservation.booking);
    reservation.booking.calendarEventId = event.id;
    reservation.booking.status = 'confirmed';
    reservation.booking.quote = reservation.promotion.quote;
    await finalizeReservation(reservation.booking, event.id);
    const [drive, notifications] = await Promise.allSettled([
      storeBookingRecord(reservation.booking),
      sendBookingNotifications(reservation.booking)
    ]);
    const notificationReport = notifications.status === 'fulfilled' ? notifications.value : { delivery: { status: 'rejected', reason: 'notification_dispatch_failed' } };
    const notificationFailures = Object.entries(notificationReport).filter(([, result]) => result.status === 'rejected').map(([channel]) => channel);
    if (notificationFailures.length) console.error('booking notification delivery failed', { booking: reservation.booking.publicReference, channels: notificationFailures });
    return json(response, 201, bookingResponse(reservation.booking, reservation.promotion.quote, {
      drive: { status: drive.status },
      notifications: notificationReport
    }));
  } catch (error) {
    if (reservation?.booking) await releaseReservation(reservation.booking).catch(() => undefined);
    console.error('booking confirmation failed', error.message);
    const duplicateIdempotencyKey = error.code === '23505' && error.constraint === 'bookings_idempotency_key_unique';
    const errorCode = duplicateIdempotencyKey ? 'booking_in_progress' : error.code || 'booking_unavailable';
    const status = ['slot_unavailable', 'booking_minimum_lead_time', 'promotion_limit_reached', 'offer_unavailable', 'promotion_unavailable', 'booking_in_progress'].includes(errorCode)
      ? 409
      : (errorCode === 'invalid_booking' || errorCode === 'unsupported_price' ? 400 : 503);
    return json(response, status, { error: errorCode });
  }
};
