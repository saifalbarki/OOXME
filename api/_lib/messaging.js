const { gmailApi } = require('./google');
const { required, optional } = require('./config');
const { sendWhatsAppText, sendYCloudBookingConfirmation } = require('./whatsapp');

const encode = (value) => Buffer.from(value).toString('base64url');
const dateLabel = (booking) => `${booking.date} at ${booking.time} (${booking.duration} minutes, Iraq time)`;
const customerConfirmationText = (booking) => {
  const reference = booking.publicReference || booking.id;
  return [
    `Hello ${booking.customer.name},`,
    '',
    'Your OOXME consultation booking is confirmed.',
    `Date: ${booking.date}`,
    `Time: ${booking.time} (Iraq time)`,
    `Duration: ${booking.duration} minutes`,
    `Booking reference: ${reference}`,
    '',
    'We will send the instructions for the next stage soon.'
  ].join('\n');
};

const safeProviderMessage = (error) => String(error?.message || '')
  .replace(/\+?\d{7,15}/g, '[redacted-phone]')
  .slice(0, 240);
const settledReport = (jobs) => Promise.allSettled(Object.values(jobs)).then((results) => {
  results.forEach((result, index) => {
    if (result.status === 'rejected') console.error('booking notification channel failed', {
      channel: Object.keys(jobs)[index],
      providerStatus: result.reason?.providerStatus,
      providerCode: result.reason?.providerCode,
      providerMessage: safeProviderMessage(result.reason)
    });
  });
  return Object.fromEntries(Object.keys(jobs).map((name, index) => [name, {
    status: results[index].status,
    reason: results[index].status === 'rejected' ? 'delivery_failed' : undefined
  }]));
});

async function sendEmail({ to, subject, text }) {
  const from = required('GMAIL_SENDER_EMAIL');
  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    text
  ].join('\r\n');
  return gmailApi('/users/me/messages/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: encode(raw) })
  });
}

async function sendBookingNotifications(booking) {
  const reference = booking.publicReference || booking.id;
  const isTest = booking.notificationMode === 'test';
  const details = `Booking ${reference}\nCustomer: ${booking.customer.name}\nEmail: ${booking.customer.email}\nPhone: ${booking.customer.phone}\nConsultation: ${dateLabel(booking)}\nTopic: ${booking.customer.topic}\nSector: ${booking.customer.sector}\nAdditional information: ${booking.customer.additional || '—'}\nPayment: ${booking.payment || 'Not specified'}`;
  const jobs = {
    internalEmail: sendEmail({ to: required('BOOKING_INTERNAL_EMAIL'), subject: `${isTest ? 'TEST ' : ''}New OOXME booking — ${reference}`, text: details }),
    customerEmail: sendEmail({ to: booking.customer.email, subject: `${isTest ? 'TEST ' : ''}OOXME consultation booking confirmation`, text: customerConfirmationText(booking) })
  };
  const internalWhatsApp = optional('WHATSAPP_INTERNAL_RECIPIENT');
  if (internalWhatsApp) jobs.internalWhatsApp = sendWhatsAppText(internalWhatsApp, details);
  if (booking.customer.phone) jobs.customerWhatsApp = sendYCloudBookingConfirmation(booking.customer.phone, {
    reference: isTest ? `TEST - ${reference}` : reference,
    name: booking.customer.name,
    date: booking.date,
    time: booking.time,
    duration: booking.duration
  });
  return settledReport(jobs);
}

module.exports = { sendEmail, sendBookingNotifications, dateLabel, customerConfirmationText, settledReport };
