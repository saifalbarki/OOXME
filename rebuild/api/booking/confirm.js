const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { bookingConfig } = require('../_lib/config');
const { createCalendarBooking, bookingId } = require('../_lib/calendar');
const { storeBookingRecord } = require('../_lib/drive');
const { sendBookingNotifications } = require('../_lib/messaging');

const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || ''));
module.exports = async (request, response) => {
  if (request.method !== 'POST') return methodNotAllowed(response, ['POST']);
  try {
    const input = await readJson(request); const customer = input.customer || {};
    const duration = Number(input.duration);
    const config = bookingConfig();
    if (!customer.name || !validEmail(customer.email) || String(customer.phone || '').replace(/\D/g, '').length < 7 || !customer.topic || !customer.sector || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !config.slots.includes(input.time) || !config.consultationMinutes.includes(duration)) return json(response, 400, { error: 'invalid_booking' });
    const booking = { id: bookingId(), status: 'confirmed', createdAt: new Date().toISOString(), timezone: config.timezone, date: input.date, time: input.time, duration, payment: input.payment || '', promo: input.promo || '', customer: { name: String(customer.name).trim(), email: String(customer.email).trim(), phone: String(customer.phone).trim(), topic: String(customer.topic).trim(), sector: String(customer.sector).trim(), additional: String(customer.additional || '').trim() } };
    const event = await createCalendarBooking(booking); booking.calendarEventId = event.id;
    const [drive, notifications] = await Promise.allSettled([storeBookingRecord(booking), sendBookingNotifications(booking)]);
    return json(response, 201, { id: booking.id, status: booking.status, calendarEventId: event.id, integrations: { drive: drive.status, notifications: notifications.status } });
  } catch (error) {
    console.error('booking confirmation failed', error.message);
    return json(response, error.code === 'slot_unavailable' ? 409 : 503, { error: error.code || 'booking_unavailable' });
  }
};
