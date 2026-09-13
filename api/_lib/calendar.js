const crypto = require('crypto');
const { calendarApi } = require('./google');
const { bookingConfig } = require('./config');

const offset = '+03:00';
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const dateValue = (date, time = '12:00') => new Date(`${date}T${time}:00${offset}`);
const validDate = (date) => datePattern.test(String(date || '')) && !Number.isNaN(dateValue(date).valueOf());
const formatDate = (value) => `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}`;
const addDays = (date, amount) => {
  const value = dateValue(date);
  value.setUTCDate(value.getUTCDate() + amount);
  return formatDate(value);
};
const todayForTimezone = (timezone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date()).reduce((result, part) => {
    if (part.type !== 'literal') result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const eventRange = (date, time, duration) => {
  const start = dateValue(date, time);
  const end = new Date(start.getTime() + Number(duration) * 60_000);
  return {
    start,
    end,
    startIso: `${date}T${time}:00${offset}`,
    endIso: end.toISOString()
  };
};

const isBusy = (busy, start, end) => busy.some((entry) => (
  entry?.start && entry?.end && new Date(entry.start) < end && new Date(entry.end) > start
));

async function getBusy(timeMin, timeMax) {
  const config = bookingConfig();
  const result = await calendarApi('/freeBusy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin,
      timeMax,
      timeZone: config.timezone,
      items: [{ id: config.calendarId }]
    })
  });
  const calendar = result.calendars?.[config.calendarId];
  if (!calendar || calendar.errors?.length) {
    const error = new Error('Google Calendar free/busy lookup failed');
    error.code = 'calendar_availability_unavailable';
    throw error;
  }
  return calendar.busy || [];
}

const isBusinessDay = (date) => ![4, 5].includes(dateValue(date).getUTCDay());
const availableTimes = (date, busy, duration, config) => {
  if (!isBusinessDay(date)) return [];
  const now = new Date();
  return config.slots.filter((time) => {
    const range = eventRange(date, time, duration);
    return range.start > now && !isBusy(busy, range.start, range.end);
  });
};

async function availabilityForDate(date, duration = 45, limit = 4) {
  const config = bookingConfig();
  if (!validDate(date) || !config.consultationMinutes.includes(Number(duration))) {
    const error = new Error('Invalid availability request');
    error.code = 'invalid_availability';
    throw error;
  }
  const nextDate = addDays(date, 1);
  const busy = await getBusy(`${date}T00:00:00${offset}`, `${nextDate}T00:00:00${offset}`);
  return {
    timezone: config.timezone,
    date,
    durationMinutes: Number(duration),
    times: availableTimes(date, busy, Number(duration), config).slice(0, Math.max(1, Number(limit) || 4))
  };
}

async function availabilityForWindow(fromDate, duration = 45, limit = 4, daysToCheck = 62) {
  const config = bookingConfig();
  const startDate = validDate(fromDate) ? fromDate : todayForTimezone(config.timezone);
  if (!config.consultationMinutes.includes(Number(duration))) {
    const error = new Error('Invalid availability request');
    error.code = 'invalid_availability';
    throw error;
  }
  const endDate = addDays(startDate, daysToCheck);
  const busy = await getBusy(`${startDate}T00:00:00${offset}`, `${endDate}T00:00:00${offset}`);
  const days = [];
  for (let index = 0; index < daysToCheck && days.length < Math.max(1, Number(limit) || 4); index += 1) {
    const date = addDays(startDate, index);
    const times = availableTimes(date, busy, Number(duration), config).slice(0, 4);
    if (times.length) days.push({ date, times });
  }
  return { timezone: config.timezone, durationMinutes: Number(duration), days };
}

async function availabilityForMonth(year, month, duration = 45) {
  const config = bookingConfig();
  const start = `${year}-${String(month).padStart(2, '0')}-01T00:00:00${offset}`;
  const next = new Date(Date.UTC(year, month, 1));
  const end = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-01T00:00:00${offset}`;
  const busy = await getBusy(start, end);
  const days = {};
  const length = new Date(year, month, 0).getDate();
  for (let day = 1; day <= length; day += 1) {
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days[date] = availableTimes(date, busy, Number(duration), config);
  }
  return { timezone: config.timezone, durationMinutes: Number(duration), days };
}

async function createCalendarBooking(booking) {
  const config = bookingConfig();
  const range = eventRange(booking.date, booking.time, booking.duration);
  const busy = await getBusy(range.start.toISOString(), range.end.toISOString());
  if (isBusy(busy, range.start, range.end)) {
    const error = new Error('Selected time is no longer available');
    error.code = 'slot_unavailable';
    throw error;
  }
  return calendarApi(`/calendars/${encodeURIComponent(config.calendarId)}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summary: `OOXME Consultation — ${booking.customer.name}`,
      description: `Booking ID: ${booking.publicReference || booking.id}\nPhone: ${booking.customer.phone}\nEmail: ${booking.customer.email}\nTopic: ${booking.customer.topic}\nSector: ${booking.customer.sector}\nAdditional information: ${booking.customer.additional || '—'}\nPayment: ${booking.payment || 'Not specified'}`,
      start: { dateTime: range.startIso, timeZone: config.timezone },
      end: { dateTime: range.endIso, timeZone: config.timezone },
      attendees: [{ email: booking.customer.email }],
      extendedProperties: {
        private: {
          ooxmeBookingId: booking.id,
          ooxmeCustomerPhone: booking.customer.phone,
          ooxmeCustomerEmail: booking.customer.email
        }
      }
    })
  });
}

const bookingId = () => `OOX-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;

module.exports = {
  availabilityForDate,
  availabilityForMonth,
  availabilityForWindow,
  createCalendarBooking,
  bookingId,
  eventRange,
  isBusy
};
