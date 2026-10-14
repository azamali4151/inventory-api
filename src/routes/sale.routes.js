const express = require('express');

const controller = require('../controllers/sale.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('admin'), controller.create);

module.exports = router;