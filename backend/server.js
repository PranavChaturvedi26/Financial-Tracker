require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const transactionRoutes = require("./routes/transaction.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const categoryRoutes = require("./routes/category.routes");
const { errorHandler } = require("./middleware/error.middleware");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
});

const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: "Too many analytics requests, please try again later.",
});

app.use("/auth", authLimiter, authRoutes);
app.use("/users", apiLimiter, userRoutes);
app.use("/transactions", apiLimiter, transactionRoutes);
app.use("/analytics", analyticsLimiter, analyticsRoutes);
app.use("/categories", apiLimiter, categoryRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on p ort ${PORT}`);
});
