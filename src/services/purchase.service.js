const transactionDb = require('../db_apis/transaction.db');

async function create(data, userId) {
  if (
    typeof data.supplier_name !== 'string' ||
    !data.supplier_name.trim()
  ) {
    const error = new Error('Supplier name is required');
    error.status = 400;
    throw error;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    const error = new Error('At least one purchase item is required');
    error.status = 400;
    throw error;
  }

  const seen = new Set();

  for (const item of data.items) {
    if (
      !Number.isSafeInteger(Number(item.product_id)) ||
      Number(item.product_id) <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.unit_price === undefined ||
      item.unit_price === null ||
      item.unit_price === '' ||
      !Number.isFinite(Number(item.unit_price)) ||
      Number(item.unit_price) < 0
    ) {
      const error = new Error('Invalid purchase item');
      error.status = 400;
      throw error;
    }

    if (seen.has(Number(item.product_id))) {
      const error = new Error('Duplicate product IDs are not allowed');
      error.status = 400;
      throw error;
    }

    seen.add(Number(item.product_id));
  }

  return transactionDb.createPurchase(data, userId);
}

module.exports = { create };