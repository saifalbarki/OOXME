const { gmailApi, googleFetch } = require('./google');
const { required, optional } = require('./config');
const { sendWhatsAppText } = require('./whatsapp');

const encode = (value) => Buffer.from(value).toString('base64url');
const escapeHtml = (value) => String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
const dateLabel = (booking) => `${booking.date} at ${booking.time} (${booking.duration} minutes, Iraq time)`;

async function sendEmail({ to, subject, text }) {
  const from = required('GMAIL_SENDER_EMAIL');
  const raw = [`From: ${from}`, `To: ${to}`, `Subject: ${subject}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=UTF-8', '', text].join('\r\n');
  return gmailApi('/users/me/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ raw: encode(raw) }) });
}

async function sendBookingNotifications(booking) {
  const details = `Booking ${booking.id}\nCustomer: ${booking.customer.name}\nEmail: ${booking.customer.email}\nPhone: ${booking.customer.phone}\nConsultation: ${dateLabel(booking)}\nTopic: ${booking.customer.topic}\nSector: ${booking.customer.sector}\nAdditional information: ${booking.customer.additional || '—'}\nPayment: ${booking.payment || 'Not specified'}`;
  const customer = `Your OOXME consultation is booked for ${dateLabel(booking)}. We will send a reminder before your appointment. Booking reference: ${booking.id}.`;
  const jobs = [
    sendEmail({ to: required('BOOKING_INTERNAL_EMAIL'), subject: `New OOXME booking — ${booking.id}`, text: details }),
    sendEmail({ to: booking.customer.email, subject: 'OOXME consultation confirmation', text: customer })
  ];
  const internalWhatsApp = optional('WHATSAPP_INTERNAL_RECIPIENT');
  if (internalWhatsApp) jobs.push(sendWhatsAppText(internalWhatsApp, details));
  if (booking.customer.phone) jobs.push(sendWhatsAppText(booking.customer.phone, customer));
  return Promise.allSettled(jobs);
}

module.exports = { sendEmail, sendBookingNotifications, dateLabel };
