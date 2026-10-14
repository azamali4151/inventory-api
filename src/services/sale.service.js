const transactionDb = require('../db_apis/transaction.db');

async function create(data, userId) {
  if (
    typeof data.customer_name !== 'string' ||
    !data.customer_name.trim()
  ) {
    const error = new Error('Customer name is required');
    error.status = 400;
    throw error;
  }

  if (!Array.isArray(data.items) || data.items.length === 0) {
    const error = new Error('At least one sales item is required');
    error.status = 400;
    throw error;
  }

  const seen = new Set();

  for (const item of data.items) {
    if (
      !Number.isSafeInteger(Number(item.product_id)) ||
      Number(item.product_id) <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      const error = new Error('Invalid sales item');
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

  return transactionDb.createSale(data, userId);
}

module.exports = { create };