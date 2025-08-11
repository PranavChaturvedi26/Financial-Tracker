const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { 
  userValidationRules, 
  loginValidationRules, 
  validate,
  sanitizeInput 
} = require('../middleware/validation.middleware');

router.post('/register', 
  sanitizeInput,
  userValidationRules(), 
  validate, 
  authController.register
);

router.post('/login', 
  sanitizeInput,
  loginValidationRules(), 
  validate, 
  authController.login
);

router.get('/profile', 
  authenticateToken, 
  authController.getProfile
);

module.exports = router;