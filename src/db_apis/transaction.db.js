const pool = require('../config/db');

async function createPurchase(data, userId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let total = 0;
    const preparedItems = [];

    // Lock products in sorted ID order to reduce deadlocks.
    const items = [...data.items].sort(
      (a, b) => Number(a.product_id) - Number(b.product_id)
    );

    for (const item of items) {
      const [rows] = await connection.execute(
        `SELECT id, purchase_price
         FROM products
         WHERE id = ?
         FOR UPDATE`,
        [item.product_id]
      );

      if (!rows.length) {
        const error = new Error(`Product ${item.product_id} not found`);
        error.status = 404;
        throw error;
      }

      const unitPrice = Number(item.unit_price);
      const lineTotal = unitPrice * item.quantity;

      if (!Number.isSafeInteger(lineTotal * 100)) {
        const error = new Error('Invalid purchase amount');
        error.status = 400;
        throw error;
      }

      total += lineTotal;

      preparedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    if (!Number.isSafeInteger(total * 100)) {
      const error = new Error('Invalid purchase total');
      error.status = 400;
      throw error;
    }

    const purchaseNo = `PUR-${Date.now()}-${require('crypto')
      .randomBytes(3).toString('hex')}`;

    const [header] = await connection.execute(
      `INSERT INTO purchases
        (purchase_no, supplier_name, total_amount, created_by)
       VALUES (?, ?, ?, ?)`,
      [purchaseNo, data.supplier_name, total.toFixed(2), userId]
    );

    for (const item of preparedItems) {
      await connection.execute(
        `INSERT INTO purchase_items
          (purchase_id, product_id, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        [
          header.insertId,
          item.product_id,
          item.quantity,
          item.unit_price.toFixed(2),
          item.line_total.toFixed(2),
        ]
      );

      await connection.execute(
        `UPDATE products
         SET stock_quantity = stock_quantity + ?,
             purchase_price = ?
         WHERE id = ?`,
        [item.quantity, item.unit_price.toFixed(2), item.product_id]
      );
    }

    await connection.commit();

    return {
      id: header.insertId,
      purchase_no: purchaseNo,
      supplier_name: data.supplier_name,
      total_amount: total.toFixed(2),
      items: preparedItems,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function createSale(data, userId) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let total = 0;
    const preparedItems = [];

    const items = [...data.items].sort(
      (a, b) => Number(a.product_id) - Number(b.product_id)
    );

    for (const item of items) {
      const [rows] = await connection.execute(
        `SELECT id, selling_price, stock_quantity
         FROM products
         WHERE id = ?
         FOR UPDATE`,
        [item.product_id]
      );

      if (!rows.length) {
        const error = new Error(`Product ${item.product_id} not found`);
        error.status = 404;
        throw error;
      }

      const product = rows[0];

      if (product.stock_quantity < item.quantity) {
        const error = new Error(
          `Insufficient stock for product ${item.product_id}`
        );
        error.status = 409;
        throw error;
      }

      const unitPrice = Number(product.selling_price);
      const lineTotal = unitPrice * item.quantity;

      total += lineTotal;

      preparedItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: unitPrice,
        line_total: lineTotal,
      });
    }

    if (!Number.isSafeInteger(total * 100)) {
      const error = new Error('Invalid sales total');
      error.status = 400;
      throw error;
    }

    const saleNo = `SAL-${Date.now()}-${require('crypto')
      .randomBytes(3).toString('hex')}`;

    const [header] = await connection.execute(
      `INSERT INTO sales
        (sale_no, customer_name, total_amount, created_by)
       VALUES (?, ?, ?, ?)`,
      [saleNo, data.customer_name, total.toFixed(2), userId]
    );

    for (const item of preparedItems) {
      await connection.execute(
        `INSERT INTO sale_items
          (sale_id, product_id, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        [
          header.insertId,
          item.product_id,
          item.quantity,
          item.unit_price.toFixed(2),
          item.line_total.toFixed(2),
        ]
      );

      await connection.execute(
        `UPDATE products
         SET stock_quantity = stock_quantity - ?
         WHERE id = ? AND stock_quantity >= ?`,
        [item.quantity, item.product_id, item.quantity]
      );
    }

    await connection.commit();

    return {
      id: header.insertId,
      sale_no: saleNo,
      customer_name: data.customer_name,
      total_amount: total.toFixed(2),
      items: preparedItems,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createPurchase,
  createSale,
};