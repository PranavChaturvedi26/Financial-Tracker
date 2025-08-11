CREATE TYPE user_role AS ENUM ('admin', 'user', 'read-only');

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  icon VARCHAR(50),
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id),
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category_id);

INSERT INTO categories (name, type, icon, color) VALUES
('Salary', 'income', 'wallet', '#4CAF50'),
('Freelance', 'income', 'laptop', '#8BC34A'),
('Investment', 'income', 'trending-up', '#00BCD4'),
('Other Income', 'income', 'plus-circle', '#009688'),
('Food', 'expense', 'utensils', '#FF5722'),
('Transport', 'expense', 'car', '#795548'),
('Entertainment', 'expense', 'film', '#E91E63'),
('Shopping', 'expense', 'shopping-bag', '#9C27B0'),
('Bills', 'expense', 'receipt', '#F44336'),
('Healthcare', 'expense', 'heart', '#FF9800'),
('Education', 'expense', 'book', '#3F51B5'),
('Other Expense', 'expense', 'circle', '#607D8B');