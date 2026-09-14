const assert = require('assert/strict');

const resolve = (path) => require.resolve(path);
const mock = (path, exports) => {
  require.cache[resolve(path)] = { id: resolve(path), filename: resolve(path), loaded: true, exports };
};

const records = new Map();
let calendarCalls = 0;
let notificationCalls = 0;
let failCustomerWhatsApp = false;
let failCalendar = false;
const config = {
  timezone: 'Asia/Baghdad',
  calendarId: 'calendar-for-safe-test',
  slots: ['10:00', '13:00', '16:00', '19:00'],
  consultationMinutes: [45, 60, 90, 120]
};

mock('../api/_lib/http', {
  json(response, status, body) { response.status(status).setHeader('Content-Type', 'application/json').send(JSON.stringify(body)); },
  methodNotAllowed(response) { response.status(405).send(JSON.stringify({ error: 'method_not_allowed' })); },
  readJson: async (request) => request.body
});
mock('../api/_lib/config', { bookingConfig: () => config });
mock('../api/_lib/calendar', {
  bookingId: () => 'OOX-SAFE-TEST',
  createCalendarBooking: async () => {
    calendarCalls += 1;
    if (failCalendar) throw Object.assign(new Error('safe calendar failure'), { code: 'calendar_availability_unavailable' });
    return { id: `safe-calendar-event-${calendarCalls}` };
  }
});
mock('../api/_lib/drive', { storeBookingRecord: async () => ({ id: 'safe-drive-record' }) });
mock('../api/_lib/messaging', {
  sendBookingNotifications: async (booking) => {
    notificationCalls += 1;
    assert.equal(booking.customer.name, 'Safe Test Customer');
    assert.equal(booking.customer.email, 'safe.customer@example.test');
    assert.equal(booking.customer.phone, '+9647700000000');
    return {
      internalEmail: { status: 'fulfilled' },
      customerEmail: { status: 'fulfilled' },
      customerWhatsApp: failCustomerWhatsApp ? { status: 'rejected', reason: 'delivery_failed' } : { status: 'fulfilled' }
    };
  }
});
mock('../api/_lib/promo-engine', {
  normalizePromoCode: (value) => String(value || '').trim().toUpperCase(),
  validatePromoOrToken: async () => ({ valid: true, quote: { baseAmount: 30, discountAmount: 0, finalAmount: 30, currency: 'USD' }, type: 'none', notificationMode: 'final' })
});
mock('../api/_lib/db', {
  query: async (text, values) => ({ rows: text.startsWith('SELECT public_reference') && records.has(values[0]) ? [records.get(values[0])] : [] }),
  withTransaction: async (work) => work({
    query: async (text, values = []) => {
      if (text.startsWith('INSERT INTO bookings')) records.set(values[21], { public_reference: values[1], status: 'held', calendar_event_id: null, final_amount: values[16], currency: values[17] });
      if (text.startsWith('UPDATE bookings SET status = \'confirmed\'')) {
        for (const record of records.values()) {
          if (record.status === 'held') { record.status = 'confirmed'; record.calendar_event_id = values[1]; }
        }
      }
      return { rowCount: 1, rows: [{ total: 0, customer: 0 }] };
    }
  })
});

const handler = require('../api/booking/confirm');
const bookingBody = (idempotencyKey) => ({
  idempotencyKey,
  date: '2030-01-07',
  time: '13:00',
  duration: 45,
  payment: 'ZainCash',
  promoCode: '',
  customer: {
    name: 'Safe Test Customer',
    email: 'safe.customer@example.test',
    phone: '+9647700000000',
    topic: 'Brand Management',
    sector: 'Commercial',
    additional: ''
  }
});
const invoke = async (idempotencyKey) => {
  const response = {
    code: 0,
    body: null,
    status(code) { this.code = code; return this; },
    setHeader() { return this; },
    send(body) { this.body = JSON.parse(body); }
  };
  await handler({ method: 'POST', body: bookingBody(idempotencyKey) }, response);
  return response;
};

(async () => {
  const first = await invoke('safe-booking-idempotency-0001');
  assert.equal(first.code, 201);
  assert.equal(first.body.status, 'confirmed');
  assert.equal(first.body.integrations.notifications.customerEmail.status, 'fulfilled');
  assert.equal(first.body.integrations.notifications.customerWhatsApp.status, 'fulfilled');
  const replay = await invoke('safe-booking-idempotency-0001');
  assert.equal(replay.code, 200);
  assert.equal(replay.body.replayed, true);
  assert.equal(calendarCalls, 1);
  assert.equal(notificationCalls, 1);
  failCustomerWhatsApp = true;
  const notificationFailure = await invoke('safe-booking-idempotency-0002');
  assert.equal(notificationFailure.code, 201);
  assert.equal(notificationFailure.body.status, 'confirmed');
  assert.equal(notificationFailure.body.integrations.notifications.customerWhatsApp.status, 'rejected');
  assert.equal(calendarCalls, 2);
  assert.equal(notificationCalls, 2);
  failCalendar = true;
  const calendarFailure = await invoke('safe-booking-idempotency-0003');
  assert.equal(calendarFailure.code, 503);
  assert.equal(notificationCalls, 2);
  console.log('Safe consultation booking verification passed.');
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
