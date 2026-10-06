const { json, methodNotAllowed, serverTiming } = require('../http');
const { timedQuery } = require('../db');

module.exports = async (request, response) => {
  if (request.method !== 'GET') return methodNotAllowed(response, ['GET']);
  response.setHeader('Cache-Control', 'no-store');
  const timing = serverTiming(response);
  try {
    const result = await timedQuery(`SELECT id,title,body,title_ar,body_ar,publish_date,audience,status,
                                       frequency,appearance_limit,targeting,valid_until
                                  FROM notifications
                                 WHERE status = 'published'
                                   AND publish_date <= now()
                                   AND (valid_until IS NULL OR valid_until > now())
                                 ORDER BY publish_date DESC, updated_at DESC
                                 LIMIT 1`, undefined, timing);
    const row = result.rows[0];
    timing.finish();
    return json(response, 200, { success: true, data: { notification: row ? {
      id: row.id,
      title: { en: row.title, ar: row.title_ar || row.title },
      body: { en: row.body, ar: row.body_ar || row.body },
      frequency: row.frequency || 'once',
      appearanceLimit: row.appearance_limit,
      audience: row.audience,
      targeting: row.targeting || {}
    } : null } });
  } catch (error) {
    console.error('Active notification read failed', error.message);
    timing.finish();
    return json(response, 503, { success: false, error: 'active_notification_unavailable' });
  }
};
