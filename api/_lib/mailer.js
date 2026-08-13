const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }
  return transporter;
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
const amount = (value, currency = 'USD') => `${Number(value || 0).toFixed(2)} ${currency}`;

async function sendBookingConfirmationEmail(booking) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return { skipped: true };
  const reference = `#${booking.publicReference || booking.id}`;
  const summary = [
    ['Customer Name / اسم العميل', booking.customer.name],
    ['Email / البريد الإلكتروني', booking.customer.email],
    ['Phone / رقم الهاتف', booking.customer.phone],
    ['Service / الخدمة', 'OOXME Consultation / استشارة OOXME'],
    ['Duration / المدة', `${booking.duration} minutes / دقيقة`],
    ['Consultation Topic / موضوع الاستشارة', booking.customer.topic],
    ['Business Sector / قطاع العمل', booking.customer.sector],
    ['Date & Time / التاريخ والوقت', `${booking.date} ${booking.time} (Asia/Baghdad)`],
    ['Promo Code / كود الخصم', booking.promo || '—'],
    ['Total Amount Paid / المبلغ الإجمالي المدفوع', amount(booking.quote?.finalAmount, booking.quote?.currency)]
  ];
  const text = [`OOXME Booking Confirmation / تأكيد حجز OOXME`, `Reference / المرجع: ${reference}`, '', ...summary.map(([label, value]) => `${label}: ${value}`), '', '📌 تذكير هام: ستستلم بريداً آخر بالأرشادات عند تأكيد الدفع.', 'Important Note: You will receive another email with instructions upon payment confirmation.'].join('\n');
  const rows = summary.map(([label, value]) => `<tr><td style="padding:8px 0;color:#60646c">${escapeHtml(label)}</td><td style="padding:8px 0;text-align:end;font-weight:600">${escapeHtml(value)}</td></tr>`).join('');
  const html = `<div dir="auto" style="font-family:Arial,sans-serif;color:#111827;max-width:620px;margin:auto;padding:24px"><h1 style="font-size:22px;margin:0 0 8px">OOXME Booking Confirmation<br><span lang="ar" dir="rtl">تأكيد حجز OOXME</span></h1><p style="margin:0 0 20px">Reference / المرجع: <strong>${escapeHtml(reference)}</strong></p><table style="width:100%;border-collapse:collapse">${rows}</table><div style="margin-top:24px;padding:14px 16px;background:#f3f4f6;border-radius:12px;line-height:1.6"><strong lang="ar" dir="rtl">📌 تذكير هام: ستستلم بريداً آخر بالأرشادات عند تأكيد الدفع.</strong><br><em>Important Note: You will receive another email with instructions upon payment confirmation.</em></div></div>`;
  return getTransporter().sendMail({
    from: process.env.GMAIL_USER,
    to: booking.customer.email,
    subject: `OOXME booking confirmation / تأكيد الحجز ${reference}`,
    text,
    html
  });
}

module.exports = { sendBookingConfirmationEmail };
