const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
pool.on("connect", () => {
  console.log("Connected to the database");
});
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Error acquiring client:", err.stack);
    return;
  }
  console.log("🔗 PostgreSQL connection test successful");
  console.log(`📊 Database: ${process.env.DB_NAME}`);
  console.log(`👤 User: ${process.env.DB_USER}`);
  console.log(`🏠 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  release();
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
