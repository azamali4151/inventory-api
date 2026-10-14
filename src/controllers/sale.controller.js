const saleService = require('../services/sale.service');

async function create(req, res, next) {
  try {
    const sale = await saleService.create(req.body, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Sale created successfully',
      data: sale,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { create };