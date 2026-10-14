const pool = require('../config/db');

async function create(data) {
  const [result] = await pool.execute(
    `INSERT INTO products
      (product_name, sku, purchase_price, selling_price, stock_quantity)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.product_name,
      data.sku,
      data.purchase_price,
      data.selling_price,
      data.stock_quantity || 0,
    ]
  );

  return result.insertId;
}

async function findAll() {
  const [rows] = await pool.execute(
    `SELECT id, product_name, sku, purchase_price,
            selling_price, stock_quantity, created_at
     FROM products
     ORDER BY id DESC`
  );

  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM products WHERE id = ? LIMIT 1',
    [id]
  );

  return rows[0] || null;
}

async function update(id, data) {
  const [result] = await pool.execute(
    `UPDATE products
     SET product_name = ?, sku = ?,
         purchase_price = ?, selling_price = ?
     WHERE id = ?`,
    [
      data.product_name,
      data.sku,
      data.purchase_price,
      data.selling_price,
      id,
    ]
  );

  return result.affectedRows;
}

async function remove(id) {
  const [result] = await pool.execute(
    'DELETE FROM products WHERE id = ?',
    [id]
  );

  return result.affectedRows;
}

module.exports = {
  create,
  findAll,
  findById,
  update,
  remove,
};