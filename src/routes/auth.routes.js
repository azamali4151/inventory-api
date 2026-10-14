const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth.controller');
const validateRequest = require('../middleware/validate.middleware');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isString().notEmpty(),
  ],
  validateRequest,
  authController.login
);

module.exports = router;