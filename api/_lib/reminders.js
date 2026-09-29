const { query, withTransaction } = require('./db');
const { sendEmail } = require('./messaging');
const { sendYCloudConsultationReminder } = require('./whatsapp');
const { required, optional } = require('./config');

const BATCH_SIZE = 5;
const MAX_ATTEMPTS = 5;
const LEASE_SECONDS = 90;
const REQUEST_TIMEOUT_MS = 8_000;
const BACKOFF_MINUTES = [1, 5, 15, 30];
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const reminderDate = (booking) => new Intl.DateTimeFormat(booking.booking_language === 'ar' ? 'ar-IQ' : 'en-GB', {
  timeZone: booking.timezone || 'Asia/Baghdad', year: 'numeric', month: 'long', day: 'numeric'
}).format(new Date(booking.scheduled_start));
const reminderPreparation = (language) => language === 'ar'
  ? 'جهّز أسئلتك والمواد المتعلقة بالاستشارة، وتأكد من جاهزية Google Meet واتصال إنترنت مستقر. يُرجى الانضمام قبل الموعد بـ 15 دقيقة واختيار مكان هادئ.'
  : 'Prepare your questions and any materials related to the consultation. Make sure Google Meet is ready and your internet connection is stable. Please join 15 minutes early from a quiet place.';

function reminderCopy(booking) {
  const ar = booking.booking_language === 'ar';
  const name = booking.customer_name;
  const reference = booking.public_reference;
  const date = reminderDate(booking);
  const time = booking.scheduled_time || new Intl.DateTimeFormat('en-GB', {
    timeZone: booking.timezone || 'Asia/Baghdad', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(new Date(booking.scheduled_start));
  const duration = Number(booking.duration_minutes);
  const topic = booking.topic;
  const preparation = reminderPreparation(ar ? 'ar' : 'en');
  const text = ar
    ? `مرحباً ${name}،\n\nتذكير بموعد استشارتك القادم مع اوكسوم.\n\nرقم الحجز: ${reference}\nالتاريخ: ${date}\nالوقت: ${time} — بتوقيت العراق\nالمدة: ${duration} دقيقة\nالموضوع: ${topic}\n\nالاستعداد للاستشارة\n${preparation}\n\nنتطلع إلى لقائك،\nاوكسوم`
    : `Hello ${name},\n\nA reminder about your upcoming OOXME consultation.\n\nBooking reference: ${reference}\nDate: ${date}\nTime: ${time} — Iraq time\nDuration: ${duration} minutes\nTopic: ${topic}\n\nGetting ready\n${preparation}\n\nWe look forward to meeting you,\nOOXME`;
  const title = ar ? 'تذكير بموعد الاستشارة' : 'Consultation reminder';
  const origin = optional('OOXME_PRODUCTION_ORIGIN', 'https://www.ooxme.com').replace(/\/+$/, '');
  const html = `<!doctype html><html lang="${ar ? 'ar' : 'en'}" dir="${ar ? 'rtl' : 'ltr'}"><body style="margin:0;background:#f3f4f6;color:#171717;font-family:${ar ? 'Tahoma, Arial, sans-serif' : 'Arial, Helvetica, sans-serif'};direction:${ar ? 'rtl' : 'ltr'};text-align:${ar ? 'right' : 'left'}"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fff;border-radius:18px"><tr><td style="padding:24px;text-align:center;background:#f5f5f5"><img src="${origin}/assets/logo/Logo.png" width="72" alt="OOXME"></td></tr><tr><td style="padding:30px;font-size:16px;line-height:1.8"><h1 style="font-size:22px">${escapeHtml(title)}</h1><p>${escapeHtml(ar ? `مرحباً ${name}، تذكير بموعد استشارتك القادم مع اوكسوم.` : `Hello ${name}, a reminder about your upcoming OOXME consultation.`)}</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f7f8;border-radius:12px"><tr><td style="padding:16px"><p><strong>${ar ? 'رقم الحجز' : 'Booking reference'}:</strong> ${escapeHtml(reference)}</p><p><strong>${ar ? 'التاريخ' : 'Date'}:</strong> ${escapeHtml(date)}</p><p><strong>${ar ? 'الوقت' : 'Time'}:</strong> ${escapeHtml(time)} — ${ar ? 'بتوقيت العراق' : 'Iraq time'}</p><p><strong>${ar ? 'المدة' : 'Duration'}:</strong> ${duration} ${ar ? 'دقيقة' : 'minutes'}</p><p><strong>${ar ? 'الموضوع' : 'Topic'}:</strong> ${escapeHtml(topic)}</p></td></tr></table><h2 style="font-size:18px">${ar ? 'الاستعداد للاستشارة' : 'Getting ready'}</h2><p>${escapeHtml(preparation)}</p><p style="margin-top:28px">${ar ? 'نتطلع إلى لقائك،' : 'We look forward to meeting you,'}<br><strong>OOXME</strong></p></td></tr></table></td></tr></table></body></html>`;
  return { name, reference, date, time, duration, topic, preparation, subject: ar ? 'تذكير بموعد استشارتك مع اوكسوم' : 'Your OOXME consultation reminder', text, html };
}

async function sendReminder(reminder) {
  const booking = reminder.booking;
  const copy = reminderCopy(booking);
  if (reminder.channel === 'email') {
    if (!booking.customer_email) throw Object.assign(new Error('Customer email is missing'), { permanent: true, providerCode: 'missing_recipient' });
    try { required('GMAIL_SENDER_EMAIL'); } catch (_) { throw Object.assign(new Error('Email reminder is not configured'), { permanent: true, providerCode: 'email_not_configured' }); }
    const result = await sendEmail({
      to: booking.customer_email,
      subject: copy.subject,
      text: copy.text,
      html: copy.html,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });
    return result?.id || null;
  }
  if (!booking.customer_phone) throw Object.assign(new Error('Customer phone is missing'), { permanent: true, providerCode: 'missing_recipient' });
  const result = await sendYCloudConsultationReminder(booking.customer_phone, {
    reminderId: reminder.id,
    reference: copy.reference,
    name: copy.name,
    topic: copy.topic,
    date: copy.date,
    time: copy.time,
    duration: copy.duration,
    language: booking.booking_language,
    preparation: copy.preparation,
    externalId: reminder.externalId,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  return result?.id || null;
}

async function markIneligibleReminders() {
  await query(
    `UPDATE booking_reminders r
        SET status = 'cancelled', lease_expires_at = NULL, updated_at = now(), last_error_code = 'booking_not_current'
       FROM bookings b
      WHERE b.id = r.booking_id AND r.status IN ('queued', 'retry')
        AND (b.status <> 'confirmed' OR b.scheduled_start <> r.scheduled_start_snapshot OR b.scheduled_start <= now())`
  );
  await query(
    `UPDATE booking_reminders
        SET status = 'unknown', lease_expires_at = NULL, updated_at = now(), last_error_code = 'processing_lease_expired_unknown_outcome'
      WHERE status = 'processing' AND lease_expires_at <= now()`
  );
}

async function claimDueReminders(limit = BATCH_SIZE) {
  return withTransaction(async (client) => {
    const result = await client.query(
      `WITH due AS (
         SELECT r.id
           FROM booking_reminders r
           JOIN bookings b ON b.id = r.booking_id
          WHERE r.status IN ('queued', 'retry')
            AND r.due_at <= now() AND r.next_attempt_at <= now()
            AND b.status = 'confirmed'
            AND b.scheduled_start = r.scheduled_start_snapshot
            AND b.scheduled_start > now()
          ORDER BY r.due_at, r.created_at
          FOR UPDATE OF r SKIP LOCKED
          LIMIT $1
       ), claimed AS (
         UPDATE booking_reminders r
            SET status = 'processing', attempts = r.attempts + 1,
                lease_expires_at = now() + ($2 * interval '1 second'), updated_at = now()
           FROM due WHERE r.id = due.id
          RETURNING r.*
       )
       SELECT c.*, b.public_reference, b.customer_name, b.customer_email, b.customer_phone,
              b.topic, b.scheduled_start, b.duration_minutes, b.timezone, b.booking_language,
              to_char(b.scheduled_start AT TIME ZONE b.timezone, 'HH24:MI') AS scheduled_time
         FROM claimed c JOIN bookings b ON b.id = c.booking_id`,
      [limit, LEASE_SECONDS]
    );
    return result.rows.map(({ id, booking_id, channel, due_at, scheduled_start_snapshot, attempts, external_id, ...booking }) => ({
      id, bookingId: booking_id, channel, dueAt: due_at, scheduledStartSnapshot: scheduled_start_snapshot,
      attempts, externalId: external_id, booking
    }));
  });
}

const isRetryable = (error) => Number(error?.providerStatus) === 429 && !error.permanent && !error.outcomeUnknown;
const retryDelayMinutes = (attempts) => BACKOFF_MINUTES[Math.min(Math.max(attempts - 1, 0), BACKOFF_MINUTES.length - 1)];

async function updateReminderFailure(reminder, error) {
  if (isRetryable(error) && reminder.attempts < MAX_ATTEMPTS) {
    const delay = retryDelayMinutes(reminder.attempts);
    await query(
      `UPDATE booking_reminders SET status = 'retry', next_attempt_at = now() + ($2 * interval '1 minute'),
         lease_expires_at = NULL, last_error_code = $3, updated_at = now() WHERE id = $1 AND status = 'processing'`,
      [reminder.id, delay, String(error.providerCode || 'provider_rate_limited').slice(0, 100)]
    );
    return 'retry';
  }
  const status = error.permanent || (Number(error.providerStatus) >= 400 && Number(error.providerStatus) < 500 && Number(error.providerStatus) !== 429) ||
    (Number(error.providerStatus) === 429 && reminder.attempts >= MAX_ATTEMPTS)
    ? 'failed'
    : 'unknown';
  await query(
    'UPDATE booking_reminders SET status = $2, lease_expires_at = NULL, last_error_code = $3, updated_at = now() WHERE id = $1 AND status = \'processing\'',
    [reminder.id, status, String(error.providerCode || (status === 'unknown' ? 'provider_outcome_unknown' : 'provider_rejected')).slice(0, 100)]
  );
  return status;
}

async function processReminder(reminder) {
  const current = await query(
    `SELECT b.status, b.scheduled_start, r.status AS reminder_status
       FROM booking_reminders r JOIN bookings b ON b.id = r.booking_id
      WHERE r.id = $1`, [reminder.id]
  );
  const bookingState = current.rows[0];
  if (!bookingState || bookingState.reminder_status !== 'processing' || bookingState.status !== 'confirmed' ||
      new Date(bookingState.scheduled_start).getTime() !== new Date(reminder.scheduledStartSnapshot).getTime() ||
      new Date(bookingState.scheduled_start).getTime() <= Date.now()) {
    await query("UPDATE booking_reminders SET status = 'cancelled', lease_expires_at = NULL, last_error_code = 'booking_not_current', updated_at = now() WHERE id = $1 AND status = 'processing'", [reminder.id]);
    return 'cancelled';
  }
  try {
    const providerMessageId = await sendReminder(reminder);
    await query(
      `UPDATE booking_reminders SET status = 'sent', sent_at = now(), provider_message_id = $2,
         lease_expires_at = NULL, last_error_code = NULL, updated_at = now() WHERE id = $1 AND status = 'processing'`,
      [reminder.id, providerMessageId]
    );
    return 'sent';
  } catch (error) {
    return updateReminderFailure(reminder, error);
  }
}

async function processDueReminders() {
  await markIneligibleReminders();
  const claimed = await claimDueReminders();
  const outcomes = await Promise.allSettled(claimed.map(processReminder));
  const summary = { claimed: claimed.length, sent: 0, retry: 0, failed: 0, unknown: 0, cancelled: 0 };
  outcomes.forEach((result) => {
    const status = result.status === 'fulfilled' ? result.value : 'unknown';
    if (Object.prototype.hasOwnProperty.call(summary, status)) summary[status] += 1;
  });
  return summary;
}

module.exports = { processDueReminders, claimDueReminders, processReminder, reminderCopy, isRetryable, retryDelayMinutes, updateReminderFailure };
