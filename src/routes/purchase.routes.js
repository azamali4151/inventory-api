const express = require('express');

const controller = require('../controllers/purchase.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRoles('admin'), controller.create);

module.exports = router;