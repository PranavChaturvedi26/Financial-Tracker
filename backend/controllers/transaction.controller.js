const db = require('../config/database');
const { invalidateCache } = require('../config/redis');

const getTransactions = async (req, res) => {
  try {
    const userId = req.user.role === 'admin' ? req.query.userId : req.user.id;
    const { page = 1, limit = 20, category, type, startDate, endDate, search } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (category) {
      query += ` AND t.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (type) {
      query += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

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

    if (search) {
      query += ` AND t.description ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countQuery = query.replace('SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color', 'SELECT COUNT(*)');
    const countResult = await db.query(countQuery, params);
    const totalCount = parseInt(countResult.rows[0].count);

    query += ` ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await db.query(query, params);

    res.json({
      transactions: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

const getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    let query = `
      SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = $1
    `;
    const params = [id];

    if (userId) {
      query += ' AND t.user_id = $2';
      params.push(userId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

const createTransaction = async (req, res) => {
  try {
    const { amount, type, category_id, description, transaction_date } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO transactions (user_id, amount, type, category_id, description, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, amount, type, category_id, description, transaction_date]
    );

    await invalidateCache(`analytics:${userId}:*`);
    await invalidateCache(`transactions:${userId}:*`);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category_id, description, transaction_date } = req.body;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    let query = `
      UPDATE transactions 
      SET amount = $1, type = $2, category_id = $3, description = $4, 
          transaction_date = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
    `;
    const params = [amount, type, category_id, description, transaction_date, id];

    if (userId) {
      query += ' AND user_id = $7';
      params.push(userId);
    }

    query += ' RETURNING *';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or access denied' });
    }

    await invalidateCache(`analytics:${userId || result.rows[0].user_id}:*`);
    await invalidateCache(`transactions:${userId || result.rows[0].user_id}:*`);

    res.json({
      message: 'Transaction updated successfully',
      transaction: result.rows[0]
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.role === 'admin' ? null : req.user.id;

    let query = 'DELETE FROM transactions WHERE id = $1';
    const params = [id];

    if (userId) {
      query += ' AND user_id = $2';
      params.push(userId);
    }

    query += ' RETURNING user_id';

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or access denied' });
    }

    await invalidateCache(`analytics:${result.rows[0].user_id}:*`);
    await invalidateCache(`transactions:${result.rows[0].user_id}:*`);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction
};