const pool = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, name, email, password, role
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

async function createUser({ name, email, password, role }) {
  const [result] = await pool.execute(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    [name, email, password, role]
  );

  return result.insertId;
}

module.exports = {
  findByEmail,
  createUser,
};