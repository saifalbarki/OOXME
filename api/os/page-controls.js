const { json, methodNotAllowed, readJson, serverTiming } = require('../_lib/http');
const { query, timedQuery } = require('../_lib/db');
const { bool, text } = require('../_lib/os-helpers');
const { requireAdmin, requireCsrf } = require('../_lib/os-auth');
const { recordAudit, setRequestId } = require('../_lib/os-audit');

const serialize = (row) => ({
  actionKey: row.action_key,
  page: row.page_key,
  route: row.route,
  label: row.label,
  selector: row.selector,
  enabled: row.enabled,
  version: row.version || 1
});

module.exports = async (request, response) => {
  setRequestId(request, response);
  response.setHeader('Cache-Control', 'no-store');
  if (request.method === 'GET') {
    const timing = serverTiming(response);
    try {
      const result = await timedQuery('SELECT action_key, page_key, route, label, selector, enabled, version FROM os_page_controls ORDER BY page_key, action_key', undefined, timing);
      timing.finish();
      return json(response, 200, { success: true, data: { controls: result.rows.map(serialize) } });
    } catch (error) {
      console.error('OS page controls read failed', error.message);
      timing.finish();
      return json(response, 503, { success: false, error: 'page_controls_unavailable' });
    }
  }
  if (!['PATCH', 'POST'].includes(request.method)) return methodNotAllowed(response, ['GET', 'PATCH']);
  try {
    const session = await requireAdmin(request);
    requireCsrf(request, session);
    const input = await readJson(request);
    const actionKey = text(input.actionKey);
    const version = Number.isInteger(Number(input.version)) ? Number(input.version) : null;
    if (!actionKey) return json(response, 400, { success: false, error: 'action_key_required' });
    const result = await query(
      `UPDATE os_page_controls
          SET enabled = $2, updated_at = now(), version = version + 1
        WHERE action_key = $1 AND ($3::int IS NULL OR version = $3)
      RETURNING action_key, page_key, route, label, selector, enabled, version`,
      [actionKey, bool(input.enabled, true), version]
    );
    if (!result.rowCount) return json(response, version === null ? 404 : 409, { success: false, error: version === null ? 'page_control_not_found' : 'page_control_conflict' });
    await recordAudit({ request, action: 'toggle', resourceType: 'page_control', resourceId: actionKey, afterState: serialize(result.rows[0]) }).catch(() => undefined);
    return json(response, 200, { success: true, data: { control: serialize(result.rows[0]) } });
  } catch (error) {
    const status = Number(error.status) || 503;
    if (status >= 500) console.error('OS page control update failed', error.code || error.message);
    return json(response, status, { success: false, error: status >= 500 ? 'page_control_update_failed' : error.message });
  }
};
