const crypto = require('crypto');
const { query, withTransaction } = require('./db');

const statuses = new Set(['todo', 'in_progress', 'blocked', 'completed', 'cancelled', 'archived']);
const text = value => String(value || '').trim();
const date = value => value ? new Date(value) : null;
const validDate = value => value && !Number.isNaN(value.valueOf());
const positiveInteger = value => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;

const fields = `tasks.id, tasks.task_code, tasks.title, tasks.description, tasks.status, tasks.starts_at, tasks.duration_minutes, tasks.due_at, tasks.version,
  tasks.project_id, tasks.assigned_employee_id, projects.name AS project_name, client_profiles.id AS client_id, client_profiles.display_name AS client_name,
  client_profiles.company_name, employee_profiles.display_name AS employee_name, users.display_code AS employee_display_code`;

const list = async () => (await query(`SELECT ${fields}
  FROM tasks JOIN projects ON projects.id = tasks.project_id
  LEFT JOIN client_profiles ON client_profiles.id = projects.client_id
  LEFT JOIN employee_profiles ON employee_profiles.id = tasks.assigned_employee_id
  LEFT JOIN users ON users.id = employee_profiles.user_id
  WHERE tasks.status <> 'archived' ORDER BY tasks.updated_at DESC, tasks.created_at DESC`)).rows;

const create = async ({ title, description, projectId, employeeId, startsAt, durationMinutes, status = 'in_progress' }) => {
  const start = date(startsAt) || new Date();
  const duration = positiveInteger(durationMinutes);
  if (!text(title) || !projectId || !employeeId || !validDate(start) || !duration || !statuses.has(status) || status === 'archived') {
    const error = new Error('invalid_task_input'); error.code = 'invalid_task_input'; throw error;
  }
  return withTransaction(async client => {
    const project = await client.query("SELECT id FROM projects WHERE id = $1 AND status <> 'archived'", [projectId]);
    const employee = await client.query("SELECT id FROM employee_profiles JOIN users ON users.id = employee_profiles.user_id WHERE employee_profiles.id = $1 AND users.status = 'active'", [employeeId]);
    if (!project.rowCount || !employee.rowCount) { const error = new Error('task_relationship_not_found'); error.code = 'task_relationship_not_found'; throw error; }
    return (await client.query(`INSERT INTO tasks (id, project_id, assigned_employee_id, title, description, status, starts_at, duration_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`, [crypto.randomUUID(), projectId, employeeId, text(title), text(description) || null, status, start, duration])).rows[0].id;
  });
};

const update = async ({ id, expectedVersion, title, description, projectId, employeeId, startsAt, durationMinutes, status = 'in_progress' }) => {
  const start = date(startsAt); const duration = positiveInteger(durationMinutes);
  if (!id || !text(title) || !projectId || !employeeId || !validDate(start) || !duration || !statuses.has(status) || status === 'archived') {
    const error = new Error('invalid_task_input'); error.code = 'invalid_task_input'; throw error;
  }
  const result = await query(`UPDATE tasks SET project_id = $1, assigned_employee_id = $2, title = $3, description = $4, status = $5, starts_at = $6, duration_minutes = $7, version = version + 1, updated_at = now()
    WHERE id = $8 AND status <> 'archived' AND ($9::integer IS NULL OR version = $9) RETURNING id`, [projectId, employeeId, text(title), text(description) || null, status, start, duration, id, expectedVersion ?? null]);
  if (!result.rowCount) { const error = new Error('task_not_found'); error.code = 'task_not_found'; throw error; }
  return result.rows[0].id;
};

const archive = async id => {
  const result = await query("UPDATE tasks SET status = 'archived', archived_at = now(), archive_reason = 'Archived from OOXME OS', version = version + 1, updated_at = now() WHERE id = $1 AND status <> 'archived' RETURNING id", [id]);
  if (!result.rowCount) { const error = new Error('task_not_found'); error.code = 'task_not_found'; throw error; }
};

module.exports = { archive, create, list, update };
