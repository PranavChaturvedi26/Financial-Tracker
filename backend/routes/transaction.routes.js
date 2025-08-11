const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticateToken, authorize, checkResourceOwnership } = require('../middleware/auth.middleware');
const { transactionValidationRules, validate, sanitizeInput } = require('../middleware/validation.middleware');

router.get('/',
  authenticateToken,
  transactionController.getTransactions
);

router.get('/:id',
  authenticateToken,
  checkResourceOwnership,
  transactionController.getTransaction
);

router.post('/',
  authenticateToken,
  authorize('admin', 'user'),
  sanitizeInput,
  transactionValidationRules(),
  validate,
  transactionController.createTransaction
);

router.put('/:id',
  authenticateToken,
  authorize('admin', 'user'),
  checkResourceOwnership,
  sanitizeInput,
  transactionValidationRules(),
  validate,
  transactionController.updateTransaction
);

router.delete('/:id',
  authenticateToken,
  authorize('admin', 'user'),
  checkResourceOwnership,
  transactionController.deleteTransaction
);

module.exports = router;