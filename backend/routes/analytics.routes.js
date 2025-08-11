const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.get('/monthly',
  authenticateToken,
  analyticsController.getMonthlyOverview
);

router.get('/categories',
  authenticateToken,
  analyticsController.getCategoryBreakdown
);

router.get('/yearly',
  authenticateToken,
  analyticsController.getYearlyTrends
);

router.get('/recent',
  authenticateToken,
  analyticsController.getRecentTransactions
);

module.exports = router;