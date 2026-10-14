const productService = require('../services/product.service');

async function create(req, res, next) {
  try {
    const id = await productService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: await productService.getById(id),
    });
  } catch (error) {
    next(error);
  }
}

async function getAll(req, res, next) {
  try {
    res.json({
      success: true,
      data: await productService.getAll(),
    });
  } catch (error) {
    next(error);
  }
}

async function getById(req, res, next) {
  try {
    res.json({
      success: true,
      data: await productService.getById(Number(req.params.id)),
    });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const data = await productService.update(
      Number(req.params.id),
      req.body
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function remove(req, res, next) {
  try {
    await productService.remove(Number(req.params.id));

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, getAll, getById, update, remove };