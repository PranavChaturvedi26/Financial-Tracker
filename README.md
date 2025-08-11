# Personal Finance Tracker

A comprehensive full-stack personal finance tracking application built with the PERN stack (PostgreSQL, Express.js, React, Node.js) featuring role-based access control, analytics dashboards, and real-time data visualization.

## Features

### User Authentication & Authorization
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Three user roles:
  - **Admin**: Full access to all features including user management
  - **User**: Can manage their own transactions and view analytics
  - **Read-only**: Can only view their own data

### Transaction Management
- Add, edit, delete income/expense transactions
- Categorize transactions with pre-defined categories
- Search and filter transactions by date, category, type
- Pagination for large transaction lists

### Analytics Dashboard
- Monthly/yearly spending overview
- Category-wise expense/income breakdown
- Interactive charts using Chart.js:
  - Line charts for trends
  - Pie charts for category distribution
  - Bar charts for monthly comparisons
- Recent transactions overview

### Performance Features
- Lazy loading for React components
- Redis caching for frequently accessed data
- Rate limiting on API endpoints
- Optimized database queries with indexing

### Security Features
- XSS prevention through input sanitization
- SQL injection prevention using parameterized queries
- CORS protection
- Helmet.js for security headers
- Input validation on both client and server

## Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** for data storage
- **Redis** for caching
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Express-rate-limit** for API rate limiting
- **Helmet** for security headers

### Frontend
- **React 18+** with TypeScript
- **React Router** for navigation
- **TanStack Query** for data fetching and caching
- **Chart.js** with react-chartjs-2 for data visualization
- **React Hook Form** for form management
- **Lucide React** for icons
- **CSS Custom Properties** for theming

## Project Structure

```
Chart PERN/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── analytics.controller.js
│   │   ├── transaction.controller.js
│   │   ├── category.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── analytics.routes.js
│   │   ├── transaction.routes.js
│   │   ├── category.routes.js
│   │   └── user.routes.js
│   ├── database/
│   │   └── schema.sql
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   └── TransactionForm.tsx
    │   ├── contexts/
    │   │   ├── AuthContext.tsx
    │   │   └── ThemeContext.tsx
    │   ├── hooks/
    │   │   ├── useTransactions.ts
    │   │   ├── useAnalytics.ts
    │   │   └── useCategories.ts
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── Transactions.tsx
    │   │   ├── Analytics.tsx
    │   │   ├── Users.tsx
    │   │   ├── Settings.tsx
    │   │   ├── Login.tsx
    │   │   └── Register.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── styles/
    │   │   └── [component].css
    │   └── types/
    │       └── index.ts
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database and Redis configuration.

4. Set up PostgreSQL database:
   ```sql
   CREATE DATABASE finance_tracker;
   ```

5. Run the database schema:
   ```bash
   psql -d finance_tracker -f database/schema.sql
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the React development server:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Transactions
- `GET /api/transactions` - Get user transactions (with filters)
- `GET /api/transactions/:id` - Get specific transaction
- `POST /api/transactions` - Create transaction (user/admin only)
- `PUT /api/transactions/:id` - Update transaction (user/admin only)
- `DELETE /api/transactions/:id` - Delete transaction (user/admin only)

### Analytics
- `GET /api/analytics/monthly` - Monthly overview
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/yearly` - Yearly trends
- `GET /api/analytics/recent` - Recent transactions

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get specific user
- `PATCH /api/users/:id/role` - Update user role
- `DELETE /api/users/:id` - Delete user

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes
- General API endpoints: 100 requests per hour
- Analytics endpoints: 50 requests per hour

## Caching Strategy

- User analytics: 15 minutes
- Category lists: 1 hour
- Automatic cache invalidation on data updates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@financetracker.com or create an issue in the repository.