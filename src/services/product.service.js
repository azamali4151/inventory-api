const productDb = require('../db_apis/product.db');

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function validateProduct(data, includeStock = false) {
  if (
    typeof data.product_name !== 'string' ||
    !data.product_name.trim()
  ) {
    throw httpError('Product name is required');
  }

  if (typeof data.sku !== 'string' || !data.sku.trim()) {
    throw httpError('SKU is required');
  }

  for (const field of ['purchase_price', 'selling_price']) {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === '' ||
      !Number.isFinite(Number(data[field])) ||
      Number(data[field]) < 0
    ) {
      throw httpError(`${field} must be a non-negative number`);
    }
  }

  if (includeStock) {
    const stock = data.stock_quantity ?? 0;

    if (!Number.isSafeInteger(Number(stock)) || Number(stock) < 0) {
      throw httpError('Stock must be a non-negative integer');
    }
  }
}

async function create(data) {
  validateProduct(data, true);

  return productDb.create({
    ...data,
    product_name: data.product_name.trim(),
    sku: data.sku.trim(),
  });
}

async function getAll() {
  return productDb.findAll();
}

async function getById(id) {
  const product = await productDb.findById(id);

  if (!product) {
    throw httpError('Product not found', 404);
  }

  return product;
}

async function update(id, data) {
  validateProduct(data);

  const affected = await productDb.update(id, {
    ...data,
    product_name: data.product_name.trim(),
    sku: data.sku.trim(),
  });

  if (!affected) {
    const existing = await productDb.findById(id);

    if (!existing) {
      throw httpError('Product not found', 404);
    }
  }

  return productDb.findById(id);
}

async function remove(id) {
  const existing = await productDb.findById(id);

  if (!existing) {
    throw httpError('Product not found', 404);
  }

  try {
    await productDb.remove(id);
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      throw httpError(
        'Product has transaction history and cannot be deleted',
        409
      );
    }

    throw error;
  }
}

module.exports = { create, getAll, getById, update, remove };