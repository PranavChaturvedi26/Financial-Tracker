const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const userValidationRules = () => {
  return [
    body('username')
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  ];
};

const loginValidationRules = () => {
  return [
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Invalid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ];
};

const transactionValidationRules = () => {
  return [
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('type')
      .isIn(['income', 'expense'])
      .withMessage('Type must be either income or expense'),
    body('category_id')
      .isInt({ min: 1 })
      .withMessage('Valid category is required'),
    body('transaction_date')
      .isISO8601()
      .toDate()
      .withMessage('Valid date is required'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .escape()
  ];
};

const sanitizeInput = (req, res, next) => {
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      req.body[key] = req.body[key].replace(/[<>]/g, '');
    }
  }
  next();
};

module.exports = {
  validate,
  userValidationRules,
  loginValidationRules,
  transactionValidationRules,
  sanitizeInput
};