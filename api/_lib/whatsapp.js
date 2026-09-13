const { required, optional } = require('./config');

const normalizeRecipient = (phone) => String(phone || '').replace(/[^0-9]/g, '');

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

async function sendYCloudBookingConfirmation(to, { reference, consultation, duration }) {
  const recipient = normalizeRecipient(to);
  if (!recipient) return { skipped: true, reason: 'no_recipient' };
  const apiKey = required('YCLOUD_API_KEY');
  const from = required('YCLOUD_WHATSAPP_FROM');
  const templateName = optional('YCLOUD_WHATSAPP_BOOKING_CONFIRMATION_TEMPLATE', 'ooxme_booking_confirmation');
  const language = optional('YCLOUD_WHATSAPP_TEMPLATE_LANGUAGE', 'en_US');
  const response = await fetch('https://api.ycloud.com/v2/whatsapp/messages/sendDirectly', {
    method: 'POST',
    headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: `+${recipient}`,
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components: [{ type: 'body', parameters: [
          { type: 'text', text: reference },
          { type: 'text', text: consultation },
          { type: 'text', text: String(duration) }
        ] }]
      }
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`YCloud WhatsApp send failed: ${result.error?.message || result.message || response.status}`);
  return result;
}

module.exports = { sendWhatsAppText, sendYCloudBookingConfirmation, normalizeRecipient };
