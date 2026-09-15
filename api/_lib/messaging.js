const { gmailApi } = require('./google');
const { required, optional } = require('./config');
const { sendWhatsAppText, sendYCloudBookingConfirmation } = require('./whatsapp');

const encode = (value) => Buffer.from(value).toString('base64url');
const dateLabel = (booking) => `${booking.date} at ${booking.time} (${booking.duration} minutes, Iraq time)`;
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
const bookingLanguage = (booking) => booking.language === 'ar' ? 'ar' : 'en';
const bookingReference = (booking) => booking.publicReference || booking.id;
const emailAssetOrigin = () => optional('OOXME_PRODUCTION_ORIGIN', 'https://www.ooxme.com').replace(/\/+$/, '');
const customerConfirmationText = (booking) => {
  const reference = booking.publicReference || booking.id;
  const language = bookingLanguage(booking);
  if (language === 'ar') return [
    `مرحبا ${booking.customer.name}،`,
    '',
    'سعداء جدا بتواصلك مع اوكسوم، ويسعدنا اكثر ان نؤكد لك حجز استشارتك حول:',
    booking.customer.topic,
    '',
    'تم تثبيت موعد الاستشارة بنجاح، وتفاصيل حجزك هي:',
    `رقم الاستشارة: ${reference}`,
    `التاريخ: ${booking.date}`,
    `الوقت: ${booking.time} — بتوقيت العراق`,
    `المدة: ${booking.duration}`,
    '',
    'اكمال الدفع',
    'يرجى التأكد من اكمال عملية الدفع الخاصة بالاستشارة من خلال احدى وسائل الدفع المتوفرة لدينا: Zain Cash او SuperQi.',
    'تم ارسال معلومات ووسائل الدفع الى بريدك الالكتروني المسجل مع الحجز.',
    '',
    'ارشادات الاستشارة',
    '- تنزيل تطبيق Google Meet والتأكد من جاهزية حسابك، ويفضل استخدام نفس الاسم والبريد الالكتروني المسجلين اثناء الحجز.',
    '- الاستعداد للدخول قبل موعد الاستشارة بـ 15 دقيقة على الاقل.',
    '- التأكد من وجود اتصال انترنت مستقر طوال مدة الاستشارة.',
    '- اختيار مكان هادئ ومناسب بعيدا عن مصادر الازعاج او التشتت.',
    '- تجهيز ما قد تحتاجه اثناء الجلسة، مثل الاوراق، القلم، الملفات او المعلومات المتعلقة بموضوع الاستشارة.',
    '- تحضير اهم الاسئلة والنقاط التي ترغب في مناقشتها مسبقا، حتى يتم استثمار وقت الاستشارة بافضل شكل ممكن.',
    '- قد يتم تسجيل وتوثيق الاستشارة وفق الية اوكسوم المعتمدة، ويمكن تزويدك بنسخة من التسجيل بعد انتهاء الجلسة او عند الطلب، وفق الشروط المعتمدة.',
    '',
    'ملاحظات مهمة',
    '- مسؤولية الجاهزية التقنية والشخصية قبل واثناء الاستشارة تقع على العميل، واي وقت يضيع نتيجة عدم الجاهزية لا يؤدي الى تمديد مدة الاستشارة او استرداد قيمتها.',
    '- في حال الرغبة في الالغاء او اعادة الجدولة، يجب تقديم الطلب قبل موعد الاستشارة بـ 24 ساعة على الاقل، وفق سياسة اوكسوم المعتمدة.',
    '',
    'التذكير بالموعد',
    'سنرسل لك تذكيرا قبل موعد الاستشارة بـ 5 ساعات لمساعدتك على الاستعداد للجلسة.',
    '',
    'نتطلع الى لقائك، ونتمنى ان تكون الاستشارة خطوة عملية ومثمرة نحو ما ترغب في تحقيقه.',
    '',
    'اوكسوم',
    'تطوير الاعمال وادارة العلامات التجارية'
  ].join('\n');
  return [
    `Hello ${booking.customer.name},`,
    '',
    'We are very pleased to hear from you, and even more pleased to confirm your OOXME consultation about:',
    booking.customer.topic,
    '',
    'Your consultation has been successfully scheduled. Your booking details are:',
    `Consultation ID: ${reference}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time} — Iraq Time`,
    `Duration: ${booking.duration}`,
    '',
    'Complete Payment',
    'Please make sure your consultation payment is completed using one of our available payment methods: Zain Cash or SuperQi.',
    'The payment details and available payment methods have been sent to the email address used for your booking.',
    '',
    'Consultation Guidelines',
    '- Download the Google Meet app and make sure your account is ready. We recommend using the same name and email address used for your booking.',
    '- Be ready to join at least 15 minutes before your consultation.',
    '- Make sure you have a stable internet connection throughout the consultation.',
    '- Choose a quiet and suitable environment without unnecessary distractions.',
    '- Prepare anything you may need during the session, including paper, a pen, files, or information related to your consultation topic.',
    '- Prepare your most important questions and discussion points in advance so the consultation time can be used effectively.',
    '- The consultation may be recorded and documented according to OOXME procedures. A copy may be provided after the session or upon request, subject to the applicable terms.',
    '',
    'Important Notes',
    '- The customer is responsible for technical and personal readiness before and during the consultation. Time lost due to lack of preparation will not extend the consultation or qualify for a refund.',
    '- For cancellation or rescheduling, a request must be submitted at least 24 hours before the scheduled consultation, according to OOXME policy.',
    '',
    'Appointment Reminder',
    'We will send you a reminder 5 hours before your consultation to help you prepare.',
    '',
    'We look forward to meeting you and hope the consultation becomes a practical and productive step toward what you want to achieve.',
    '',
    'OOXME',
    'Business Development & Brand Management'
  ].join('\n');
};

const customerConfirmationHtml = (booking) => {
  const language = bookingLanguage(booking);
  const ar = language === 'ar';
  const reference = escapeHtml(bookingReference(booking));
  const name = escapeHtml(booking.customer.name);
  const topic = escapeHtml(booking.customer.topic);
  const date = escapeHtml(booking.date);
  const time = escapeHtml(booking.time);
  const duration = escapeHtml(booking.duration);
  const origin = emailAssetOrigin();
  const paymentImages = `${origin}/assets/Payment/ZAINCASH.png|${origin}/assets/Payment/QI.png`;
  const copy = ar ? {
    greeting: `مرحبا <strong>${name}</strong>،`, intro: 'سعداء جدا بتواصلك مع اوكسوم، ويسعدنا اكثر ان نؤكد لك حجز استشارتك حول:', details: 'تم تثبيت موعد الاستشارة بنجاح، وتفاصيل حجزك هي:', id: 'رقم الاستشارة', date: 'التاريخ', time: 'الوقت', duration: 'المدة', payment: 'اكمال الدفع', paymentText: 'يرجى التأكد من اكمال عملية الدفع الخاصة بالاستشارة من خلال احدى وسائل الدفع المتوفرة لدينا: <strong>Zain Cash</strong> او <strong>SuperQi</strong>.', paymentEmail: 'تم ارسال معلومات ووسائل الدفع الى بريدك الالكتروني المسجل مع الحجز.', guidelines: 'ارشادات الاستشارة', guidelineItems: ['تنزيل <strong>تطبيق Google Meet</strong> والتأكد من جاهزية حسابك، ويفضل استخدام نفس الاسم والبريد الالكتروني المسجلين اثناء الحجز.', 'الاستعداد للدخول قبل موعد الاستشارة بـ <strong>15 دقيقة</strong> على الاقل.', 'التأكد من وجود اتصال انترنت مستقر طوال مدة الاستشارة.', 'اختيار مكان هادئ ومناسب بعيدا عن مصادر الازعاج او التشتت.', 'تجهيز ما قد تحتاجه اثناء الجلسة، مثل الاوراق، القلم، الملفات او المعلومات المتعلقة بموضوع الاستشارة.', 'تحضير اهم الاسئلة والنقاط التي ترغب في مناقشتها مسبقا، حتى يتم استثمار وقت الاستشارة بافضل شكل ممكن.', 'قد يتم تسجيل وتوثيق الاستشارة وفق الية اوكسوم المعتمدة، ويمكن تزويدك بنسخة من التسجيل بعد انتهاء الجلسة او عند الطلب، وفق الشروط المعتمدة.'], notes: 'ملاحظات مهمة', noteItems: ['مسؤولية الجاهزية التقنية والشخصية قبل واثناء الاستشارة تقع على العميل، واي وقت يضيع نتيجة عدم الجاهزية لا يؤدي الى تمديد مدة الاستشارة او استرداد قيمتها.', 'في حال الرغبة في <strong>الالغاء او اعادة الجدولة</strong>، يجب تقديم الطلب قبل موعد الاستشارة بـ <strong>24 ساعة على الاقل</strong>، وفق سياسة اوكسوم المعتمدة.'], reminder: 'التذكير بالموعد', reminderText: 'سنرسل لك تذكيرا قبل موعد الاستشارة بـ <strong>5 ساعات</strong> لمساعدتك على الاستعداد للجلسة.', closing: 'نتطلع الى لقائك، ونتمنى ان تكون الاستشارة خطوة عملية ومثمرة نحو ما ترغب في تحقيقه.', signature: 'اوكسوم<br><span>تطوير الاعمال وادارة العلامات التجارية</span>'
  } : {
    greeting: `Hello <strong>${name}</strong>,`, intro: 'We are very pleased to hear from you, and even more pleased to confirm your OOXME consultation about:', details: 'Your consultation has been successfully scheduled. Your booking details are:', id: 'Consultation ID', date: 'Date', time: 'Time', duration: 'Duration', payment: 'Complete Payment', paymentText: 'Please make sure your consultation payment is completed using one of our available payment methods: <strong>Zain Cash</strong> or <strong>SuperQi</strong>.', paymentEmail: 'The payment details and available payment methods have been sent to the email address used for your booking.', guidelines: 'Consultation Guidelines', guidelineItems: ['Download the <strong>Google Meet app</strong> and make sure your account is ready. We recommend using the same name and email address used for your booking.', 'Be ready to join at least <strong>15 minutes</strong> before your consultation.', 'Make sure you have a stable internet connection throughout the consultation.', 'Choose a quiet and suitable environment without unnecessary distractions.', 'Prepare anything you may need during the session, including paper, a pen, files, or information related to your consultation topic.', 'Prepare your most important questions and discussion points in advance so the consultation time can be used effectively.', 'The consultation may be recorded and documented according to OOXME procedures. A copy may be provided after the session or upon request, subject to the applicable terms.'], notes: 'Important Notes', noteItems: ['The customer is responsible for technical and personal readiness before and during the consultation. Time lost due to lack of preparation will not extend the consultation or qualify for a refund.', 'For <strong>cancellation or rescheduling</strong>, a request must be submitted at least <strong>24 hours</strong> before the scheduled consultation, according to OOXME policy.'], reminder: 'Appointment Reminder', reminderText: 'We will send you a reminder <strong>5 hours</strong> before your consultation to help you prepare.', closing: 'We look forward to meeting you and hope the consultation becomes a practical and productive step toward what you want to achieve.', signature: 'OOXME<br><span>Business Development &amp; Brand Management</span>'
  };
  const list = (items) => `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  return `<!doctype html><html lang="${language}" dir="${ar ? 'rtl' : 'ltr'}"><body style="margin:0;background:#f3f4f6;color:#171717;font-family:${ar ? 'Tahoma, Arial, sans-serif' : 'Arial, Helvetica, sans-serif'};direction:${ar ? 'rtl' : 'ltr'};text-align:${ar ? 'right' : 'left'}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 12px 36px rgba(0,0,0,.10)"><tr><td style="padding:28px 34px;background:#f5f5f5;text-align:center"><img src="${origin}/assets/logo/OX-001-LOGO-black.png" width="72" alt="OOXME" style="display:inline-block;max-width:72px;height:auto"></td></tr><tr><td style="padding:38px 34px;font-size:16px;line-height:1.8"><p>${copy.greeting}</p><p>${copy.intro}</p><p style="font-size:20px;font-weight:700;margin:0 0 26px">${topic}</p><p>${copy.details}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f8;border-radius:14px;margin:18px 0 30px"><tr><td style="padding:18px"><p style="margin:0 0 7px"><strong>${copy.id}:</strong> ${reference}</p><p style="margin:0 0 7px"><strong>${copy.date}:</strong> ${date}</p><p style="margin:0 0 7px"><strong>${copy.time}:</strong> ${time} — ${ar ? 'بتوقيت العراق' : 'Iraq Time'}</p><p style="margin:0"><strong>${copy.duration}:</strong> ${duration}</p></td></tr></table><h2 style="font-size:19px;margin:30px 0 10px">${copy.payment}</h2><p>${copy.paymentText}</p><p>${copy.paymentEmail}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0 30px"><tr><td width="50%" style="padding:4px"><img src="${paymentImages.split('|')[0]}" alt="Zain Cash" style="width:100%;height:auto;border-radius:12px;display:block"></td><td width="50%" style="padding:4px"><img src="${paymentImages.split('|')[1]}" alt="SuperQi" style="width:100%;height:auto;border-radius:12px;display:block"></td></tr></table><h2 style="font-size:19px;margin:30px 0 10px">${copy.guidelines}</h2>${list(copy.guidelineItems)}<h2 style="font-size:19px;margin:30px 0 10px">${copy.notes}</h2>${list(copy.noteItems)}<h2 style="font-size:19px;margin:30px 0 10px">${copy.reminder}</h2><p>${copy.reminderText}</p><p style="margin-top:30px">${copy.closing}</p><p style="font-weight:700;margin-top:28px">${copy.signature}</p></td></tr></table></td></tr></table></body></html>`;
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

async function sendEmail({ to, subject, text, html }) {
  const from = required('GMAIL_SENDER_EMAIL');
  const boundary = 'OOXME_BOOKING_BOUNDARY';
  const subjectHeader = /[^\x00-\x7F]/.test(subject) ? `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=` : subject;
  const raw = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subjectHeader}`,
    'MIME-Version: 1.0',
    html ? `Content-Type: multipart/alternative; boundary="${boundary}"` : 'Content-Type: text/plain; charset=UTF-8',
    '',
    ...(html ? [`--${boundary}`, 'Content-Type: text/plain; charset=UTF-8', '', text, `--${boundary}`, 'Content-Type: text/html; charset=UTF-8', '', html, `--${boundary}--`] : [text])
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
    customerEmail: sendEmail({
      to: booking.customer.email,
      subject: bookingLanguage(booking) === 'ar' ? 'تأكيد حجز استشارة اوكسوم' : 'OOXME consultation booking confirmation',
      text: customerConfirmationText(booking),
      html: customerConfirmationHtml(booking)
    })
  };
  const internalWhatsApp = optional('WHATSAPP_INTERNAL_RECIPIENT');
  if (internalWhatsApp) jobs.internalWhatsApp = sendWhatsAppText(internalWhatsApp, details);
  if (booking.customer.phone) jobs.customerWhatsApp = sendYCloudBookingConfirmation(booking.customer.phone, {
    reference: isTest ? `TEST - ${reference}` : reference,
    name: booking.customer.name,
    topic: booking.customer.topic,
    date: booking.date,
    time: booking.time,
    duration: booking.duration,
    language: bookingLanguage(booking)
  });
  return settledReport(jobs);
}

module.exports = { sendEmail, sendBookingNotifications, dateLabel, customerConfirmationText, customerConfirmationHtml, bookingLanguage, settledReport };
