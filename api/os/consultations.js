const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { query, withTransaction } = require('../_lib/db');
const { text } = require('../_lib/os-helpers');
const { requireAdmin, requireCsrf } = require('../_lib/os-auth');
const { recordAudit, setRequestId } = require('../_lib/os-audit');
const { cancelCalendarBooking } = require('../_lib/calendar');

const serialize = (row) => ({ id: row.id, reference: row.public_reference, status: row.status, service: row.service_code, customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone }, topic: row.topic, sector: row.sector, notes: row.additional_information || '', scheduledStart: row.scheduled_start, scheduledEnd: row.scheduled_end, timezone: row.timezone, durationMinutes: row.duration_minutes, baseAmount: Number(row.base_amount), discountAmount: Number(row.discount_amount), finalAmount: Number(row.final_amount), amount: Number(row.final_amount), currency: row.currency, promoCode: row.promo_code_normalized || '', paymentProvider: row.payment_provider, bookingLanguage: row.booking_language, calendarEventId: row.calendar_event_id, createdAt: row.created_at, updatedAt: row.updated_at, confirmedAt: row.confirmed_at, version: row.version || 1 });

module.exports = async (request, response) => {
  setRequestId(request, response); response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(response, ['GET', 'POST']);
  try {
    const session = await requireAdmin(request);
    if (request.method === 'GET') {
      const result = await query(`SELECT id,public_reference,status,service_code,customer_name,customer_email,customer_phone,topic,sector,additional_information,scheduled_start,scheduled_end,timezone,duration_minutes,base_amount,discount_amount,final_amount,currency,payment_provider,promo_code_normalized,booking_language,calendar_event_id,version,created_at,updated_at,confirmed_at
        FROM bookings ORDER BY scheduled_start DESC LIMIT 200`);
      return json(response, 200, { success: true, data: { consultations: result.rows.map(serialize) } });
    }
    requireCsrf(request, session); const body = await readJson(request); const id = text(body.id); const action = text(body.action); const requestedStatus = text(body.status); const version = Number(body.version);
    const status = action === 'approve' ? 'confirmed' : action === 'reject' ? 'cancelled' : requestedStatus;
    if (!id || (action !== 'delete' && !['pending', 'held', 'confirmed', 'cancelled', 'failed'].includes(status)) || !['approve', 'reject', 'delete', ''].includes(action) || !Number.isInteger(version)) return json(response, 400, { success: false, error: 'consultation_update_invalid' });
    const current = await query('SELECT id,status,calendar_event_id,version FROM bookings WHERE id=$1', [id]);
    if (!current.rowCount) return json(response, 404, { success: false, error: 'consultation_not_found' });
    if (current.rows[0].version !== version) return json(response, 409, { success: false, error: 'consultation_conflict' });
    if ((status === 'cancelled' || action === 'delete') && current.rows[0].status !== 'cancelled' && current.rows[0].calendar_event_id) await cancelCalendarBooking(current.rows[0].calendar_event_id);
    if (action === 'delete') {
      await withTransaction(async (client) => {
        await client.query('DELETE FROM booking_holds WHERE booking_id=$1', [id]);
        await client.query('DELETE FROM promotion_redemptions WHERE booking_id=$1', [id]);
        await client.query('DELETE FROM file_promo_redemptions WHERE booking_id=$1', [id]);
        await client.query('DELETE FROM booking_reminders WHERE booking_id=$1', [id]);
        await client.query('UPDATE idempotency_keys SET booking_id=NULL WHERE booking_id=$1', [id]);
        await client.query('UPDATE offer_tokens SET consumed_booking_id=NULL WHERE consumed_booking_id=$1', [id]);
        await client.query('UPDATE bookings SET offer_token_id=NULL WHERE id=$1', [id]);
        const deleted = await client.query('DELETE FROM bookings WHERE id=$1 AND version=$2 RETURNING id', [id, version]);
        if (!deleted.rowCount) throw Object.assign(new Error('consultation_conflict'), { status: 409 });
      });
      await recordAudit({ request, action: 'delete', resourceType: 'consultation', resourceId: id, beforeState: current.rows[0] }).catch(() => undefined);
      return json(response, 200, { success: true, data: { deleted: id } });
    }
    const result = await query(`UPDATE bookings SET status=$2, confirmed_at=CASE WHEN $2='confirmed' THEN COALESCE(confirmed_at, now()) ELSE confirmed_at END, updated_at=now(), version=version+1 WHERE id=$1 AND version=$3 RETURNING id,public_reference,status,service_code,customer_name,customer_email,customer_phone,topic,sector,additional_information,scheduled_start,scheduled_end,timezone,duration_minutes,base_amount,discount_amount,final_amount,currency,payment_provider,promo_code_normalized,booking_language,calendar_event_id,version,created_at,updated_at,confirmed_at`, [id, status, version]);
    if (!result.rowCount) return json(response, 409, { success: false, error: 'consultation_conflict' });
    await recordAudit({ request, action: 'status_update', resourceType: 'consultation', resourceId: id, afterState: serialize(result.rows[0]) }).catch(() => undefined);
    return json(response, 200, { success: true, data: { consultation: serialize(result.rows[0]) } });
  } catch (error) { const status = Number(error.status) || 503; if (status >= 500) console.error('OS consultations request failed', error.code || error.message); return json(response, status, { success: false, error: status >= 500 ? 'consultations_unavailable' : error.message }); }
};
