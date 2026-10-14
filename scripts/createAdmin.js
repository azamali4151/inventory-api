require('dotenv').config();

const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

async function createAdmin() {
  const name = process.env.ADMIN_NAME || 'System Admin';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error(
      'Set ADMIN_PASSWORD to a strong password of at least 12 characters'
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await pool.execute(
    `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, 'admin')`,
    [name, email, passwordHash]
  );

  console.log(`Admin created: ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error('Failed to create admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });