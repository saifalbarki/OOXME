const { json, methodNotAllowed } = require('../_lib/http');
const { calendarApi } = require('../_lib/google');
const { bookingConfig, required } = require('../_lib/config');
const { sendEmail } = require('../_lib/messaging');
const { sendWhatsAppText } = require('../_lib/whatsapp');

const HOUR = 60 * 60 * 1000;
const reminderRules = [
  { key: 'customer24h', hours: 24, audience: 'customer' },
  { key: 'customer1h', hours: 1, audience: 'customer' },
  { key: 'internal24h', hours: 24, audience: 'internal' },
  { key: 'internal6h', hours: 6, audience: 'internal' },
  { key: 'internal1h', hours: 1, audience: 'internal' }
];
const dueRules = (start, now) => reminderRules.filter((rule) => Math.abs(start - now - rule.hours * HOUR) <= 35 * 60 * 1000);
const eventText = (event) => `Reminder: ${event.summary || 'OOXME consultation'} starts at ${new Date(event.start.dateTime).toLocaleString('en-GB', { timeZone: 'Asia/Baghdad' })} Iraq time.`;

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return json(response, 503, { error: 'reminders_disabled' });
  const authorization = request.headers.authorization || '';
  if (authorization !== `Bearer ${cronSecret}`) return response.status(401).send('Unauthorized');
  try {
    const config = bookingConfig(); const now = Date.now();
    const events = await calendarApi(`/calendars/${encodeURIComponent(config.calendarId)}/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(new Date(now).toISOString())}&timeMax=${encodeURIComponent(new Date(now + 26 * HOUR).toISOString())}`);
    let sent = 0;
    for (const event of events.items || []) {
      const start = new Date(event.start.dateTime).getTime(); if (!Number.isFinite(start)) continue;
      const properties = event.extendedProperties?.private || {}; const due = dueRules(start, now);
      for (const rule of due) {
        if (properties[`ooxmeReminder_${rule.key}`]) continue;
        const recipient = rule.audience === 'customer' ? properties.ooxmeCustomerEmail : config.internalEmail;
        if (recipient) await sendEmail({ to: recipient, subject: `OOXME consultation reminder`, text: eventText(event) });
        if (rule.audience === 'customer' && properties.ooxmeCustomerPhone) await sendWhatsAppText(properties.ooxmeCustomerPhone, eventText(event));
        properties[`ooxmeReminder_${rule.key}`] = new Date().toISOString(); sent += 1;
      }
      if (due.length) await calendarApi(`/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(event.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ extendedProperties: { private: properties } }) });
    }
    return json(response, 200, { sent });
  } catch (error) { console.error('reminder job failed', error.message); return json(response, 503, { error: 'reminders_unavailable' }); }
};
