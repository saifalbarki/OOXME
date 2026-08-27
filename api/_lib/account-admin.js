const { query, withTransaction } = require('./db');
const { hashPassword } = require('./account-auth');

const accountTypes = new Set(['employee', 'client']);
const statuses = new Set(['active', 'inactive', 'suspended', 'archived']);
const username = (value) => String(value || '').trim().toLowerCase();
const profileName = (value) => String(value || '').trim();
const email = (value) => username(value);
const phone = (value) => String(value || '').trim() || null;
const validEmail = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
const validPhone = (value) => value === null || /^\+[1-9]\d{7,14}$/.test(value);

const detailQuery = `SELECT users.id, users.display_code, users.username, users.account_type, users.status, users.version, users.archived_at, users.created_at, users.updated_at, users.last_login_at,
  employee_profiles.display_name AS employee_display_name, employee_profiles.job_title, employee_profiles.email AS employee_email, employee_profiles.phone_e164 AS employee_phone_e164,
  client_profiles.display_name AS client_display_name, client_profiles.company_name, client_profiles.email AS client_email, client_profiles.phone_e164 AS client_phone_e164
  FROM users
  LEFT JOIN employee_profiles ON employee_profiles.user_id = users.id
  LEFT JOIN client_profiles ON client_profiles.user_id = users.id`;

const list = async () => (await query(`${detailQuery} ORDER BY users.created_at DESC`)).rows;
const details = async (id) => (await query(`${detailQuery} WHERE users.id = $1 LIMIT 1`, [id])).rows[0] || null;
const summary = async () => (await query(`SELECT
  count(*) FILTER (WHERE account_type = 'employee' AND status = 'active')::int AS active_employees,
  count(*) FILTER (WHERE account_type = 'employee')::int AS employees,
  count(*) FILTER (WHERE account_type = 'client' AND status = 'active')::int AS active_clients,
  count(*) FILTER (WHERE account_type = 'client')::int AS clients,
  (SELECT count(*)::int FROM promotions WHERE promotion_type = 'public_promo' AND status = 'active') AS active_discount_codes,
  (SELECT count(*)::int FROM promotions WHERE promotion_type = 'public_promo') AS discount_codes
  FROM users`)).rows[0];

const create = async ({ username: rawUsername, email: rawEmail, phoneE164, password, accountType, displayName, jobTitle, companyName }) => {
  const accountEmail = email(rawEmail || rawUsername);
  const accountUsername = accountEmail;
  const normalizedPhone = phone(phoneE164);
  const type = String(accountType || '');
  if (!validEmail(accountEmail) || !validPhone(normalizedPhone) || String(password || '').length < 8 || !accountTypes.has(type) || !profileName(displayName)) {
    const error = new Error('invalid_account_input'); error.code = 'invalid_account_input'; throw error;
  }
  return withTransaction(async (client) => {
    const user = await client.query(
      `INSERT INTO users (username, password_hash, account_type, status)
       VALUES ($1, $2, $3, 'active') RETURNING id`,
      [accountUsername, await hashPassword(password), type]
    );
    if (type === 'employee') {
      await client.query('INSERT INTO employee_profiles (user_id, display_name, job_title, email, phone_e164) VALUES ($1, $2, $3, $4, $5)', [user.rows[0].id, profileName(displayName), jobTitle || null, accountEmail, normalizedPhone]);
    } else {
      await client.query('INSERT INTO client_profiles (user_id, display_name, company_name, email, phone_e164) VALUES ($1, $2, $3, $4, $5)', [user.rows[0].id, profileName(displayName), companyName || null, accountEmail, normalizedPhone]);
    }
    return user.rows[0].id;
  });
};

const update = async ({ id, expectedVersion, username: rawUsername, email: rawEmail, phoneE164, displayName, jobTitle, companyName }) => withTransaction(async (client) => {
  const account = await client.query('SELECT id, account_type, version FROM users WHERE id = $1 FOR UPDATE', [id]);
  if (!account.rows[0]) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
  const accountEmail = email(rawEmail || rawUsername), normalizedPhone = phone(phoneE164);
  if (!validEmail(accountEmail) || !validPhone(normalizedPhone) || !profileName(displayName)) { const error = new Error('invalid_account_input'); error.code = 'invalid_account_input'; throw error; }
  if (expectedVersion !== undefined && Number(expectedVersion) !== account.rows[0].version) { const error = new Error('version_conflict'); error.code = 'version_conflict'; throw error; }
  await client.query('UPDATE users SET username = $1, version = version + 1, updated_at = now() WHERE id = $2', [accountEmail, id]);
  if (account.rows[0].account_type === 'employee') await client.query('UPDATE employee_profiles SET display_name = $1, job_title = $2, email = $3, phone_e164 = $4, updated_at = now() WHERE user_id = $5', [profileName(displayName), jobTitle || null, accountEmail, normalizedPhone, id]);
  else await client.query('UPDATE client_profiles SET display_name = $1, company_name = $2, email = $3, phone_e164 = $4, updated_at = now() WHERE user_id = $5', [profileName(displayName), companyName || null, accountEmail, normalizedPhone, id]);
});

const resetPassword = async ({ id, password }) => {
  if (String(password || '').length < 8) { const error = new Error('invalid_password'); error.code = 'invalid_password'; throw error; }
  const result = await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [await hashPassword(password), id]);
  if (!result.rowCount) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
};

const setStatus = async ({ id, status }) => {
  if (!statuses.has(status)) { const error = new Error('invalid_status'); error.code = 'invalid_status'; throw error; }
  const result = await query("UPDATE users SET status = $1, archived_at = CASE WHEN $1 = 'archived' THEN now() ELSE archived_at END, version = version + 1, updated_at = now() WHERE id = $2", [status, id]);
  if (!result.rowCount) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
};

const remove = async ({ id }) => {
  const result = await query('DELETE FROM users WHERE id = $1', [id]);
  if (!result.rowCount) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
};

module.exports = { create, details, list, remove, resetPassword, setStatus, summary, update };
