const { query, withTransaction } = require('./db');
const { hashPassword } = require('./account-auth');

const accountTypes = new Set(['employee', 'client']);
const statuses = new Set(['active', 'inactive', 'suspended']);
const username = (value) => String(value || '').trim();
const profileName = (value) => String(value || '').trim();

const detailQuery = `SELECT users.id, users.username, users.account_type, users.status, users.created_at, users.last_login_at,
  employee_profiles.display_name AS employee_display_name, employee_profiles.job_title,
  client_profiles.display_name AS client_display_name, client_profiles.company_name
  FROM users
  LEFT JOIN employee_profiles ON employee_profiles.user_id = users.id
  LEFT JOIN client_profiles ON client_profiles.user_id = users.id`;

const list = async () => (await query(`${detailQuery} ORDER BY users.created_at DESC`)).rows;
const details = async (id) => (await query(`${detailQuery} WHERE users.id = $1 LIMIT 1`, [id])).rows[0] || null;

const create = async ({ username: rawUsername, password, accountType, displayName, jobTitle, companyName }) => {
  const accountUsername = username(rawUsername);
  const type = String(accountType || '');
  if (accountUsername.length < 3 || String(password || '').length < 8 || !accountTypes.has(type) || !profileName(displayName)) {
    const error = new Error('invalid_account_input'); error.code = 'invalid_account_input'; throw error;
  }
  return withTransaction(async (client) => {
    const user = await client.query(
      `INSERT INTO users (username, password_hash, account_type, status)
       VALUES ($1, $2, $3, 'active') RETURNING id`,
      [accountUsername, await hashPassword(password), type]
    );
    if (type === 'employee') {
      await client.query('INSERT INTO employee_profiles (user_id, display_name, job_title) VALUES ($1, $2, $3)', [user.rows[0].id, profileName(displayName), jobTitle || null]);
    } else {
      await client.query('INSERT INTO client_profiles (user_id, display_name, company_name) VALUES ($1, $2, $3)', [user.rows[0].id, profileName(displayName), companyName || null]);
    }
    return user.rows[0].id;
  });
};

const update = async ({ id, username: rawUsername, displayName, jobTitle, companyName }) => withTransaction(async (client) => {
  const account = await client.query('SELECT id, account_type FROM users WHERE id = $1 FOR UPDATE', [id]);
  if (!account.rows[0]) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
  const accountUsername = username(rawUsername);
  if (accountUsername.length < 3 || !profileName(displayName)) { const error = new Error('invalid_account_input'); error.code = 'invalid_account_input'; throw error; }
  await client.query('UPDATE users SET username = $1, updated_at = now() WHERE id = $2', [accountUsername, id]);
  if (account.rows[0].account_type === 'employee') await client.query('UPDATE employee_profiles SET display_name = $1, job_title = $2, updated_at = now() WHERE user_id = $3', [profileName(displayName), jobTitle || null, id]);
  else await client.query('UPDATE client_profiles SET display_name = $1, company_name = $2, updated_at = now() WHERE user_id = $3', [profileName(displayName), companyName || null, id]);
});

const resetPassword = async ({ id, password }) => {
  if (String(password || '').length < 8) { const error = new Error('invalid_password'); error.code = 'invalid_password'; throw error; }
  const result = await query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [await hashPassword(password), id]);
  if (!result.rowCount) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
};

const setStatus = async ({ id, status }) => {
  if (!statuses.has(status)) { const error = new Error('invalid_status'); error.code = 'invalid_status'; throw error; }
  const result = await query('UPDATE users SET status = $1, updated_at = now() WHERE id = $2', [status, id]);
  if (!result.rowCount) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
};

const remove = async ({ id }) => {
  const result = await query('DELETE FROM users WHERE id = $1', [id]);
  if (!result.rowCount) { const error = new Error('account_not_found'); error.code = 'account_not_found'; throw error; }
};

module.exports = { create, details, list, remove, resetPassword, setStatus, update };
