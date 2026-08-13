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

module.exports = { sendWhatsAppText, normalizeRecipient };
