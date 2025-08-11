const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

router.get('/',
  authenticateToken,
  categoryController.getCategories
);

router.post('/',
  authenticateToken,
  authorize('admin'),
  categoryController.createCategory
);

module.exports = router;