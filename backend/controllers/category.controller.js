const db = require('../config/database');
const { getOrSetCache } = require('../config/redis');

const getCategories = async (req, res) => {
  try {
    const { type } = req.query;
    
    const cacheKey = type ? `categories:${type}` : 'categories:all';
    
    const categories = await getOrSetCache(cacheKey, async () => {
      let query = 'SELECT * FROM categories';
      const params = [];

      if (type) {
        query += ' WHERE type = $1';
        params.push(type);
      }

      query += ' ORDER BY name';

      const result = await db.query(query, params);
      return result.rows;
    }, 3600);

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, type, icon, color } = req.body;

    const result = await db.query(
      'INSERT INTO categories (name, type, icon, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, type, icon, color]
    );

    const { invalidateCache } = require('../config/redis');
    await invalidateCache('categories:*');

    res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0]
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

module.exports = {
  getCategories,
  createCategory
};