const { json, methodNotAllowed, readJson } = require('../_lib/http');
const { query } = require('../_lib/db');
const { text } = require('../_lib/os-helpers');
const { requireAdmin, requireCsrf } = require('../_lib/os-auth');
const { recordAudit, setRequestId } = require('../_lib/os-audit');
const { cancelCalendarBooking } = require('../_lib/calendar');

const serialize = (row) => ({ id: row.id, reference: row.public_reference, status: row.status, service: row.service_code, customer: { name: row.customer_name, email: row.customer_email, phone: row.customer_phone }, topic: row.topic, sector: row.sector, notes: row.additional_information || '', scheduledStart: row.scheduled_start, scheduledEnd: row.scheduled_end, timezone: row.timezone, durationMinutes: row.duration_minutes, amount: Number(row.final_amount), currency: row.currency, paymentProvider: row.payment_provider, calendarEventId: row.calendar_event_id, version: row.version || 1 });

module.exports = async (request, response) => {
  setRequestId(request, response); response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method)) return methodNotAllowed(response, ['GET', 'POST']);
  try {
    const session = await requireAdmin(request);
    if (request.method === 'GET') {
      const result = await query(`SELECT id,public_reference,status,service_code,customer_name,customer_email,customer_phone,topic,sector,additional_information,scheduled_start,scheduled_end,timezone,duration_minutes,final_amount,currency,payment_provider,calendar_event_id,version,updated_at
        FROM bookings ORDER BY scheduled_start DESC LIMIT 200`);
      return json(response, 200, { success: true, data: { consultations: result.rows.map(serialize) } });
    }
    requireCsrf(request, session); const body = await readJson(request); const id = text(body.id); const status = text(body.status); const version = Number(body.version);
    if (!id || !['pending', 'held', 'confirmed', 'cancelled', 'failed'].includes(status) || !Number.isInteger(version)) return json(response, 400, { success: false, error: 'consultation_update_invalid' });
    const current = await query('SELECT id,status,calendar_event_id,version FROM bookings WHERE id=$1', [id]);
    if (!current.rowCount) return json(response, 404, { success: false, error: 'consultation_not_found' });
    if (status === 'cancelled' && current.rows[0].status !== 'cancelled' && current.rows[0].calendar_event_id) await cancelCalendarBooking(current.rows[0].calendar_event_id);
    const result = await query(`UPDATE bookings SET status=$2, updated_at=now(), version=version+1 WHERE id=$1 AND version=$3 RETURNING id,public_reference,status,service_code,customer_name,customer_email,customer_phone,topic,sector,additional_information,scheduled_start,scheduled_end,timezone,duration_minutes,final_amount,currency,payment_provider,calendar_event_id,version`, [id, status, version]);
    if (!result.rowCount) return json(response, 409, { success: false, error: 'consultation_conflict' });
    await recordAudit({ request, action: 'status_update', resourceType: 'consultation', resourceId: id, afterState: serialize(result.rows[0]) }).catch(() => undefined);
    return json(response, 200, { success: true, data: { consultation: serialize(result.rows[0]) } });
  } catch (error) { const status = Number(error.status) || 503; if (status >= 500) console.error('OS consultations request failed', error.code || error.message); return json(response, status, { success: false, error: status >= 500 ? 'consultations_unavailable' : error.message }); }
};
