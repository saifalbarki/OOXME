const { required, optional } = require('./config');

const normalizeRecipient = (phone) => {
  let digits = String(phone || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `964${digits.slice(1)}`;
  return digits;
};
const e164Phone = (phone) => {
  const digits = normalizeRecipient(phone);
  return digits ? `+${digits}` : '';
};
const bookingConfirmationTemplate = 'ooxme_booking_confirmation';

async function sendWhatsAppText(to, body) {
  const recipient = normalizeRecipient(to);
  if (!recipient) return { skipped: true, reason: 'no_recipient' };
  const phoneNumberId = required('WHATSAPP_PHONE_NUMBER_ID');
  const accessToken = required('WHATSAPP_ACCESS_TOKEN');
  const version = optional('WHATSAPP_GRAPH_API_VERSION', 'v22.0');
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to: recipient, type: 'text', text: { body } })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`WhatsApp send failed: ${result.error?.message || response.status}`);
  return result;
}

const yCloudBookingParameters = ({ reference, name, date, time, duration }) => [
  reference,
  `${name} — ${date} at ${time} (Iraq time)`,
  `${duration} minutes. Booking confirmed. Next-stage instructions will be sent.`
];

async function sendYCloudBookingConfirmation(to, { reference, name, date, time, duration }) {
  const recipient = normalizeRecipient(to);
  if (!recipient) return { skipped: true, reason: 'no_recipient' };
  const apiKey = required('YCLOUD_API_KEY');
  const from = e164Phone(required('YCLOUD_WHATSAPP_FROM'));
  if (!from) throw new Error('YCLOUD_WHATSAPP_FROM is not a valid phone number');
  const language = optional('YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE', 'en_US');
  const response = await fetch('https://api.ycloud.com/v2/whatsapp/messages/sendDirectly', {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: e164Phone(recipient),
      type: 'template',
      template: {
        name: bookingConfirmationTemplate,
        language: { code: language, policy: 'deterministic' },
        components: [{ type: 'body', parameters: yCloudBookingParameters({ reference, name, date, time, duration }).map((text) => ({ type: 'text', text })) }]
      }
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`YCloud WhatsApp send failed: ${result.error?.message || result.message || response.status}`);
    error.providerCode = result.error?.code || result.code || '';
    error.providerStatus = response.status;
    throw error;
  }
  return result;
}

module.exports = { sendWhatsAppText, sendYCloudBookingConfirmation, normalizeRecipient, e164Phone, yCloudBookingParameters, bookingConfirmationTemplate };
