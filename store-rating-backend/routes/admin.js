const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Middleware: Only Admins allowed
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// -----------------------
// Add Store (Admin Only)
// -----------------------
router.post("/stores", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, address } = req.body;
    if (!name || !email || !address) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await pool.query(
      "INSERT INTO stores (name, email, address) VALUES ($1, $2, $3) RETURNING *",
      [name, email, address]
    );

    res.status(201).json({ message: "Store added successfully", store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Update Store (Admin Only)
router.put("/stores/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    // Check if store exists
    const storeCheck = await pool.query("SELECT * FROM stores WHERE id=$1", [id]);
    if (storeCheck.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Update store
    const updatedStore = await pool.query(
      "UPDATE stores SET name=$1, email=$2, address=$3 WHERE id=$4 RETURNING *",
      [
        name || storeCheck.rows[0].name,
        email || storeCheck.rows[0].email,
        address || storeCheck.rows[0].address,
        id
      ]
    );

    res.json({ message: "Store updated successfully", store: updatedStore.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// Delete Store (Admin Only)
// -----------------------
router.delete("/stores/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM stores WHERE id=$1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({ message: "Store deleted successfully", store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// Add User (Admin Only)
// -----------------------
router.post("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (!name || !email || !password || !address || !role) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role",
      [name, email, hashedPassword, address, role]
    );

    res.status(201).json({ message: "User added successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// Admin Dashboard
// -----------------------
router.get("/dashboard", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const storesCount = await pool.query("SELECT COUNT(*) FROM stores");
    const ratingsCount = await pool.query("SELECT COUNT(*) FROM ratings");

    res.json({
      total_users: usersCount.rows[0].count,
      total_stores: storesCount.rows[0].count,
      total_ratings: ratingsCount.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// List Stores with Ratings
// -----------------------
router.get("/stores", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.name, s.email, s.address,
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS overall_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// -----------------------
// List Users with Filters
// -----------------------
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, address, role } = req.query;
    let query = "SELECT id, name, email, address, role FROM users WHERE 1=1";
    const values = [];
    let idx = 1;

    if (name) {
      query += ` AND LOWER(name) LIKE LOWER($${idx++})`;
      values.push(`%${name}%`);
    }
    if (email) {
      query += ` AND LOWER(email) LIKE LOWER($${idx++})`;
      values.push(`%${email}%`);
    }
    if (address) {
      query += ` AND LOWER(address) LIKE LOWER($${idx++})`;
      values.push(`%${address}%`);
    }
    if (role) {
      query += ` AND role=$${idx++}`;
      values.push(role);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// Update User (Admin Only)
router.put("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address, role } = req.body;

    // Check if user exists
    const userCheck = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user
    const updatedUser = await pool.query(
      "UPDATE users SET name=$1, email=$2, address=$3, role=$4 WHERE id=$5 RETURNING id, name, email, address, role",
      [
        name || userCheck.rows[0].name,
        email || userCheck.rows[0].email,
        address || userCheck.rows[0].address,
        role || userCheck.rows[0].role,
        id
      ]
    );

    res.json({ message: "User updated successfully", user: updatedUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// -----------------------
// Delete User (Admin Only)
// -----------------------
router.delete("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await pool.query("SELECT * FROM users WHERE id=$1", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});




// -----------------------
// View User Details
// -----------------------
router.get("/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT id, name, email, address, role FROM users WHERE id=$1", [id]);

    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    let userData = user.rows[0];

    if (userData.role === "store_owner") {
      const avgRating = await pool.query(
        `SELECT COALESCE(ROUND(AVG(r.rating), 2), 0) AS store_rating
         FROM ratings r
         JOIN stores s ON s.id = r.store_id
         WHERE s.owner_id = $1`,
        [id]
      );
      userData.store_rating = avgRating.rows[0].store_rating;
    }

    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
