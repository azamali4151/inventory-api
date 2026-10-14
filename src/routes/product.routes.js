const express = require('express');

const controller = require('../controllers/product.controller');
const {
  authenticateToken,
  authorizeRoles,
} = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);

router.post('/', authorizeRoles('admin'), controller.create);
router.put('/:id', authorizeRoles('admin'), controller.update);
router.delete('/:id', authorizeRoles('admin'), controller.remove);

module.exports = router;