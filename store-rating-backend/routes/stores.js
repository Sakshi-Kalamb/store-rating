const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Create a store (only store owners can do this)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "store_owner") {
      return res.status(403).json({ message: "Access denied. Store owners only." });
    }

    const { name, email, address } = req.body;

    if (!name || !email || !address) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await pool.query(
      "INSERT INTO stores (name, email, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, address, req.user.id]
    );

    res.json({ message: "Store created successfully", store: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all stores (for normal users)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const stores = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
        COALESCE((
          SELECT r.rating FROM ratings r 
          WHERE r.store_id = s.id AND r.user_id = $1
        ), 0) AS user_rating,
        COALESCE((
          SELECT AVG(rating) FROM ratings r2 
          WHERE r2.store_id = s.id
        ), 0) AS overall_rating
      FROM stores s`,
      [req.user.id]
    );

    res.json(stores.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Update store (only owner of the store can update)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    // check store exists & belongs to this owner
    const store = await pool.query("SELECT * FROM stores WHERE id=$1", [id]);
    if (store.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }
    if (store.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: "You can only update your own store" });
    }

    const updated = await pool.query(
      "UPDATE stores SET name=$1, email=$2, address=$3 WHERE id=$4 RETURNING *",
      [name || store.rows[0].name, email || store.rows[0].email, address || store.rows[0].address, id]
    );

    res.json({ message: "Store updated successfully", store: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete store (only owner can delete)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // check store exists & belongs to this owner
    const store = await pool.query("SELECT * FROM stores WHERE id=$1", [id]);
    if (store.rows.length === 0) {
      return res.status(404).json({ message: "Store not found" });
    }
    if (store.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own store" });
    }

    await pool.query("DELETE FROM stores WHERE id=$1", [id]);
    res.json({ message: "Store deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// Search stores by name or address
router.get("/search", authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const stores = await pool.query(
      `SELECT s.id, s.name, s.email, s.address,
        COALESCE((
          SELECT r.rating FROM ratings r 
          WHERE r.store_id = s.id AND r.user_id = $1
        ), 0) AS user_rating,
        COALESCE((
          SELECT AVG(rating) FROM ratings r2 
          WHERE r2.store_id = s.id
        ), 0) AS overall_rating
      FROM stores s
      WHERE LOWER(s.name) LIKE LOWER($2) OR LOWER(s.address) LIKE LOWER($2)`,
      [req.user.id, `%${query}%`]
    );

    res.json(stores.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
