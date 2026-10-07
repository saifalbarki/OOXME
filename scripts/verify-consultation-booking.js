const assert = require('assert/strict');
const { calculateQuote, getBasePrice, getBaseQuote, validatePromotionInput } = require('../api/_lib/promo-engine');

const resolve = (path) => require.resolve(path);
const mock = (path, exports) => {
  require.cache[resolve(path)] = { id: resolve(path), filename: resolve(path), loaded: true, exports };
};

const records = new Map();
let calendarCalls = 0;
let notificationCalls = 0;
const notificationLanguages = [];
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
  eventRange: (date, time, duration) => ({ start: new Date(`${date}T${time}:00+03:00`), end: new Date(new Date(`${date}T${time}:00+03:00`).getTime() + Number(duration) * 60_000) }),
  meetsMinimumBookingLeadTime: () => true,
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
    assert.ok(['ar', 'en'].includes(booking.language));
    notificationLanguages.push(booking.language);
    return {
      internalEmail: { status: 'fulfilled' },
      customerEmail: { status: 'fulfilled' },
      customerWhatsApp: failCustomerWhatsApp ? { status: 'rejected', reason: 'delivery_failed' } : { status: 'fulfilled' }
    };
  }
});
mock('../api/_lib/promo-engine', {
  normalizePromoCode: (value) => String(value || '').trim().toUpperCase(),
  validatePromoOrToken: async ({ serviceId, durationMinutes, promoCode }) => {
    const basePrice = getBasePrice({ serviceCode: serviceId, durationMinutes });
    if (!promoCode) return { valid: true, quote: getBaseQuote({ serviceCode: serviceId, durationMinutes }), type: 'none', notificationMode: 'final' };
    return { valid: true, type: 'promotion', promotionId: 'safe-promo', promoCode, maxUses: null, perCustomerLimit: null, quote: calculateQuote(basePrice, { discountType: 'percentage', discountValue: 20, currency: 'USD' }), notificationMode: 'final' };
  }
});
mock('../api/_lib/db', {
  query: async (text, values) => ({ rows: text.startsWith('SELECT public_reference') && records.has(values[0]) ? [records.get(values[0])] : [] }),
  withTransaction: async (work) => work({
    query: async (text, values = []) => {
      if (text.startsWith('INSERT INTO bookings')) records.set(values[21], { public_reference: values[1], status: 'held', calendar_event_id: null, customer_phone: values[4], customer_phone_normalized: values[5], final_amount: values[16], currency: values[17], payment_provider: values[18], booking_language: values[22] });
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
  language: 'ar',
  customer: {
    name: 'Safe Test Customer',
    email: 'safe.customer@example.test',
    phone: '+9647700000000',
    topic: 'Brand Management',
    sector: 'Commercial',
    additional: ''
  }
});
const invoke = async (idempotencyKey, overrides = {}) => {
  const response = {
    code: 0,
    body: null,
    status(code) { this.code = code; return this; },
    setHeader() { return this; },
    send(body) { this.body = JSON.parse(body); }
  };
  await handler({ method: 'POST', body: { ...bookingBody(idempotencyKey), ...overrides } }, response);
  return response;
};

(async () => {
  const expectedQuotes = new Map([[45, 50], [60, 75], [90, 125], [120, 175]]);
  const noPromoExecute = async () => ({ rows: [] });
  for (const [duration, baseAmount] of expectedQuotes) {
    const noPromoQuote = await validatePromotionInput({ promoCode: '', serviceCode: 'consultation', durationMinutes: duration, execute: noPromoExecute });
    assert.equal(noPromoQuote.valid, true);
    assert.deepEqual(noPromoQuote.quote, { baseAmount, discountAmount: 0, finalAmount: baseAmount, currency: 'USD', durationMinutes: duration, serviceCode: 'consultation', discountType: null, discountValue: 0 });
  }
  const freeQuote = await validatePromotionInput({
    promoCode: 'FREE',
    serviceCode: 'consultation',
    durationMinutes: 45,
    execute: async (text) => {
      if (text.includes('FROM promotions')) return { rows: [{ id: 'free-promotion', code_normalized: 'FREE', status: 'active', campaign_source: 'promo_input', starts_at: null, ends_at: null, total_usage_limit: null, per_customer_limit: null, service_restrictions: ['consultation'], duration_restrictions: [], discount_type: 'percentage', discount_value: 100, currency: null }] };
      if (text.includes('count(*) FILTER')) return { rows: [{ total: 0, customer: 0 }] };
      return { rows: [] };
    }
  });
  assert.deepEqual(freeQuote.quote, { baseAmount: 50, discountAmount: 50, finalAmount: 0, currency: 'USD', durationMinutes: 45, serviceCode: 'consultation', discountType: 'percentage', discountValue: 100 });
  const discountExecute = async (text) => {
    if (text.includes('FROM promotions')) return { rows: [{ id: 'safe-promotion', code_normalized: 'SAVE20', status: 'active', campaign_source: 'promo_input', starts_at: null, ends_at: null, total_usage_limit: null, per_customer_limit: null, service_restrictions: ['consultation'], duration_restrictions: [], discount_type: 'percentage', discount_value: 20, currency: null }] };
    if (text.includes('count(*) FILTER')) return { rows: [{ total: 0, customer: 0 }] };
    return { rows: [] };
  };
  const discountedQuotes = new Map([[45, [10, 40]], [60, [15, 60]], [90, [25, 100]], [120, [35, 140]]]);
  for (const [duration, [discountAmount, finalAmount]] of discountedQuotes) {
    const quote = await validatePromotionInput({ promoCode: 'SAVE20', serviceCode: 'consultation', durationMinutes: duration, execute: discountExecute });
    assert.equal(quote.valid, true);
    assert.equal(quote.quote.discountAmount, discountAmount);
    assert.equal(quote.quote.finalAmount, finalAmount);
  }
  const noPayment = await invoke('safe-booking-no-payment', { payment: '' });
  assert.equal(noPayment.code, 201);
  assert.equal(noPayment.body.status, 'confirmed');
  assert.equal(records.get('safe-booking-no-payment').payment_provider, null);
  assert.equal(records.get('safe-booking-no-payment').booking_language, 'ar');
  const tamperedPrice = await invoke('safe-booking-client-price-override', { baseAmount: 1, discountAmount: 49, finalAmount: 1, phone: '+٩٦٤٧٧٠٠٠٠٠٠٠٠' });
  assert.equal(tamperedPrice.code, 201);
  assert.equal(tamperedPrice.body.finalAmount, 50);
  assert.equal(records.get('safe-booking-client-price-override').final_amount, 50);
  assert.equal(records.get('safe-booking-client-price-override').customer_phone, '+9647700000000');
  assert.equal(records.get('safe-booking-client-price-override').customer_phone_normalized, '9647700000000');
  assert.equal(calendarCalls, 2);
  assert.equal(notificationCalls, 2);
  const first = await invoke('safe-booking-idempotency-0001');
  assert.equal(first.code, 201);
  assert.equal(first.body.status, 'confirmed');
  assert.equal(records.get('safe-booking-idempotency-0001').payment_provider, 'ZainCash');
  assert.equal(first.body.integrations.notifications.customerEmail.status, 'fulfilled');
  assert.equal(first.body.integrations.notifications.customerWhatsApp.status, 'fulfilled');
  const replay = await invoke('safe-booking-idempotency-0001');
  assert.equal(replay.code, 200);
  assert.equal(replay.body.replayed, true);
  assert.equal(calendarCalls, 3);
  assert.equal(notificationCalls, 3);
  failCustomerWhatsApp = true;
  const notificationFailure = await invoke('safe-booking-idempotency-0002');
  assert.equal(notificationFailure.code, 201);
  assert.equal(notificationFailure.body.status, 'confirmed');
  assert.equal(notificationFailure.body.integrations.notifications.customerWhatsApp.status, 'rejected');
  assert.equal(calendarCalls, 4);
  assert.equal(notificationCalls, 4);
  failCalendar = true;
  const calendarFailure = await invoke('safe-booking-idempotency-0003');
  assert.equal(calendarFailure.code, 503);
  assert.equal(notificationCalls, 4);
  failCalendar = false;
  const englishLanguage = await invoke('safe-booking-language-en', { language: 'en' });
  assert.equal(englishLanguage.code, 201);
  assert.equal(records.get('safe-booking-language-en').booking_language, 'en');
  assert.deepEqual(notificationLanguages.slice(-2), ['ar', 'en']);
  for (const [duration, language, finalAmount] of [[45, 'ar', 50], [60, 'en', 75], [90, 'ar', 125], [120, 'en', 175]]) {
    const response = await invoke(`safe-booking-pricing-${duration}-${language}`, { duration, language });
    assert.equal(response.code, 201);
    assert.equal(response.body.finalAmount, finalAmount);
    assert.equal(records.get(`safe-booking-pricing-${duration}-${language}`).final_amount, finalAmount);
  }
  for (const [duration, finalAmount] of [[45, 40], [60, 60], [90, 100], [120, 140]]) {
    const response = await invoke(`safe-booking-discounted-${duration}`, { duration, promoCode: 'SAVE20' });
    assert.equal(response.code, 201);
    assert.equal(response.body.finalAmount, finalAmount);
    assert.equal(records.get(`safe-booking-discounted-${duration}`).final_amount, finalAmount);
  }
  console.log('Safe consultation booking verification passed.');
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
