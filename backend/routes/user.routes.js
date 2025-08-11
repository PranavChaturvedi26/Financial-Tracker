const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorize } = require('../middleware/auth.middleware');

router.get('/',
  authenticateToken,
  authorize('admin'),
  userController.getAllUsers
);

router.get('/:id',
  authenticateToken,
  authorize('admin'),
  userController.getUser
);

router.patch('/:id/role',
  authenticateToken,
  authorize('admin'),
  userController.updateUserRole
);

router.delete('/:id',
  authenticateToken,
  authorize('admin'),
  userController.deleteUser
);

module.exports = router;