const { json, methodNotAllowed, serverTiming } = require('../http');
const { timedQuery } = require('../db');

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  response.setHeader('Cache-Control', 'no-store');
  const timing = serverTiming(response);
  try {
    const result = await timedQuery(`
      WITH active_notification AS (
        SELECT id,title,body,title_ar,body_ar,frequency,appearance_limit,audience,targeting
          FROM notifications
         WHERE status = 'published'
           AND publish_date <= now()
           AND (valid_until IS NULL OR valid_until > now())
         ORDER BY publish_date DESC, updated_at DESC
         LIMIT 1
      ), controls AS (
        SELECT action_key,page_key,route,label,selector,enabled,version
          FROM os_page_controls
         ORDER BY page_key,action_key
      )
      SELECT
        (SELECT json_build_object(
          'id',id,
          'title',json_build_object('en',title,'ar',COALESCE(title_ar,title)),
          'body',json_build_object('en',body,'ar',COALESCE(body_ar,body)),
          'frequency',COALESCE(frequency,'once'),
          'appearanceLimit',appearance_limit,
          'audience',audience,
          'targeting',COALESCE(targeting,'{}'::jsonb)
        ) FROM active_notification) AS notification,
        COALESCE((SELECT json_agg(json_build_object(
          'actionKey',action_key,
          'page',page_key,
          'route',route,
          'label',label,
          'selector',selector,
          'enabled',enabled,
          'version',COALESCE(version,1)
        ) ORDER BY page_key,action_key) FROM controls),'[]'::json) AS controls
    `, undefined, timing);
    timing.finish();
    const row = result.rows[0] || {};
    return json(response, 200, {
      success: true,
      data: { notification: row.notification || null, controls: row.controls || [] }
    });
  } catch (error) {
    console.error('Public runtime bootstrap failed', error.message);
    timing.finish();
    return json(response, 503, { success: false, error: 'public_runtime_unavailable' });
  }
};
