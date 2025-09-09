// index.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { Pool } = require("pg");

// Load environment variables from .env
dotenv.config();

const app = express();

// PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,      
  host: process.env.DB_HOST,      
  database: process.env.DB_NAME,  
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,      
});

// Export pool for use in routes
module.exports = pool;

// Middleware
app.use(cors()); // allow all frontend requests
app.use(express.json()); // parse JSON request bodies

// Routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const ratingsRoutes = require("./routes/ratings");
const storeOwnerRoutes = require("./routes/storeOwner");
const storeRoutes = require("./routes/stores");

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/ratings", ratingsRoutes);
app.use("/store-owner", storeOwnerRoutes);
app.use("/stores", storeRoutes);

// Debug route to check DB connection
app.get("/debugdb", async (req, res) => {
  try {
    const result = await pool.query(`SELECT current_user, current_database();`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("DB debug error");
  }
});

// Root route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
