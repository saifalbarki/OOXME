const crypto = require('crypto');
const { calendarApi } = require('./google');
const { bookingConfig } = require('./config');

const offset = '+03:00';
const eventRange = (date, time, duration) => {
  const start = new Date(`${date}T${time}:00${offset}`);
  const end = new Date(start.getTime() + Number(duration) * 60_000);
  return { start, end, startIso: `${date}T${time}:00${offset}`, endIso: end.toISOString() };
};
const isBusy = (busy, start, end) => busy.some((entry) => new Date(entry.start) < end && new Date(entry.end) > start);

async function getBusy(timeMin, timeMax) {
  const config = bookingConfig();
  const result = await calendarApi('/freeBusy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ timeMin, timeMax, timeZone: config.timezone, items: [{ id: config.calendarId }] }) });
  const calendar = result.calendars?.[config.calendarId];
  if (!calendar || calendar.errors?.length) {
    const error = new Error('Google Calendar free/busy lookup failed');
    error.code = 'calendar_availability_unavailable';
    throw error;
  }
  // Google Calendar includes every event whose "Show me as" value is Busy
  // here (and excludes Transparent/Free events). The caller removes each
  // overlapping website slot before returning it to the client.
  return calendar.busy || [];
}

async function availabilityForMonth(year, month) {
  const config = bookingConfig();
  const start = `${year}-${String(month).padStart(2, '0')}-01T00:00:00${offset}`;
  const next = new Date(Date.UTC(year, month, 1));
  const end = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00${offset}`;
  const busy = await getBusy(start, end);
  const days = {};
  const length = new Date(year, month, 0).getDate();
  for (let day = 1; day <= length; day += 1) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const weekday = new Date(`${date}T12:00:00${offset}`).getUTCDay();
    const times = weekday === 4 || weekday === 5 ? [] : config.slots.filter((time) => {
      const range = eventRange(date, time, 45);
      return !isBusy(busy, range.start, range.end);
    });
    days[date] = times;
  }
  return { timezone: config.timezone, days };
}

async function createCalendarBooking(booking) {
  const config = bookingConfig();
  const range = eventRange(booking.date, booking.time, booking.duration);
  const busy = await getBusy(range.start.toISOString(), range.end.toISOString());
  if (isBusy(busy, range.start, range.end)) { const error = new Error('Selected time is no longer available'); error.code = 'slot_unavailable'; throw error; }
  const event = await calendarApi(`/calendars/${encodeURIComponent(config.calendarId)}/events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary: `OOXME Consultation — ${booking.customer.name}`, description: `Booking ID: ${booking.publicReference || booking.id}\nPhone: ${booking.customer.phone}\nEmail: ${booking.customer.email}\nTopic: ${booking.customer.topic}\nSector: ${booking.customer.sector}\nAdditional information: ${booking.customer.additional || '—'}\nPayment: ${booking.payment || 'Not specified'}`, start: { dateTime: range.startIso, timeZone: config.timezone }, end: { dateTime: range.endIso, timeZone: config.timezone }, attendees: [{ email: booking.customer.email }], extendedProperties: { private: { ooxmeBookingId: booking.id, ooxmeCustomerPhone: booking.customer.phone, ooxmeCustomerEmail: booking.customer.email } } })
  });
  return event;
}

const bookingId = () => `OOX-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
module.exports = { availabilityForMonth, createCalendarBooking, bookingId };
