const db = require('../config/database');
const { getOrSetCache } = require('../config/redis');

const getMonthlyOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    const cacheKey = `analytics:${userId}:monthly:${year}:${month}`;
    
    const data = await getOrSetCache(cacheKey, async () => {
      const result = await db.query(`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
        FROM transactions
        WHERE user_id = $1 
          AND EXTRACT(YEAR FROM transaction_date) = $2
          AND EXTRACT(MONTH FROM transaction_date) = $3
      `, [userId, year, month]);

      const dailyData = await db.query(`
        SELECT 
          DATE(transaction_date) as date,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = $1 
          AND EXTRACT(YEAR FROM transaction_date) = $2
          AND EXTRACT(MONTH FROM transaction_date) = $3
        GROUP BY DATE(transaction_date)
        ORDER BY date
      `, [userId, year, month]);

      return {
        overview: {
          totalIncome: parseFloat(result.rows[0].total_income || 0),
          totalExpense: parseFloat(result.rows[0].total_expense || 0),
          balance: parseFloat((result.rows[0].total_income || 0) - (result.rows[0].total_expense || 0)),
          incomeCount: parseInt(result.rows[0].income_count || 0),
          expenseCount: parseInt(result.rows[0].expense_count || 0)
        },
        dailyData: dailyData.rows
      };
    }, 900);

    res.json(data);
  } catch (error) {
    console.error('Monthly overview error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly overview' });
  }
};

const getCategoryBreakdown = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type = 'expense' } = req.query;
    
    const cacheKey = `analytics:${userId}:category:${type}:${startDate}:${endDate}`;
    
    const data = await getOrSetCache(cacheKey, async () => {
      let query = `
        SELECT 
          c.id,
          c.name,
          c.icon,
          c.color,
          SUM(t.amount) as total,
          COUNT(t.id) as count
        FROM transactions t
        JOIN categories c ON t.category_id = c.id
        WHERE t.user_id = $1 AND t.type = $2
      `;
      const params = [userId, type];
      let paramIndex = 3;

      if (startDate) {
        query += ` AND t.transaction_date >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        query += ` AND t.transaction_date <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }

      query += ` GROUP BY c.id, c.name, c.icon, c.color ORDER BY total DESC`;

      const result = await db.query(query, params);

      const total = result.rows.reduce((sum, row) => sum + parseFloat(row.total), 0);

      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        icon: row.icon,
        color: row.color,
        total: parseFloat(row.total),
        count: parseInt(row.count),
        percentage: total > 0 ? (parseFloat(row.total) / total * 100).toFixed(2) : 0
      }));
    }, 900);

    res.json(data);
  } catch (error) {
    console.error('Category breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
};

const getYearlyTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year = new Date().getFullYear() } = req.query;
    
    const cacheKey = `analytics:${userId}:yearly:${year}`;
    
    const data = await getOrSetCache(cacheKey, async () => {
      const result = await db.query(`
        SELECT 
          EXTRACT(MONTH FROM transaction_date) as month,
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
        FROM transactions
        WHERE user_id = $1 AND EXTRACT(YEAR FROM transaction_date) = $2
        GROUP BY EXTRACT(MONTH FROM transaction_date)
        ORDER BY month
      `, [userId, year]);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = new Array(12).fill(null).map((_, index) => {
        const monthData = result.rows.find(row => parseInt(row.month) === index + 1);
        return {
          month: months[index],
          income: monthData ? parseFloat(monthData.income) : 0,
          expense: monthData ? parseFloat(monthData.expense) : 0,
          balance: monthData ? parseFloat(monthData.income) - parseFloat(monthData.expense) : 0
        };
      });

      const totals = monthlyData.reduce((acc, month) => ({
        totalIncome: acc.totalIncome + month.income,
        totalExpense: acc.totalExpense + month.expense,
        totalBalance: acc.totalBalance + month.balance
      }), { totalIncome: 0, totalExpense: 0, totalBalance: 0 });

      return {
        monthlyData,
        ...totals,
        averageMonthlyIncome: totals.totalIncome / 12,
        averageMonthlyExpense: totals.totalExpense / 12
      };
    }, 900);

    res.json(data);
  } catch (error) {
    console.error('Yearly trends error:', error);
    res.status(500).json({ error: 'Failed to fetch yearly trends' });
  }
};

const getRecentTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const result = await db.query(`
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT $2
    `, [userId, limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Recent transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch recent transactions' });
  }
};

module.exports = {
  getMonthlyOverview,
  getCategoryBreakdown,
  getYearlyTrends,
  getRecentTransactions
};