const purchaseService = require('../services/purchase.service');

async function create(req, res, next) {
  try {
    const purchase = await purchaseService.create(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: purchase,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { create };