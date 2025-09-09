const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Middleware ensures only store owners can access
router.use(authMiddleware);

router.get("/dashboard", async (req, res) => {
  try {
    // Check if the logged-in user is a store owner
    if (req.user.role !== "store_owner") {
      return res.status(403).json({ message: "Access denied. Store owners only." });
    }

    // Get the store(s) owned by this user
    const stores = await pool.query(
      "SELECT id, name, email, address FROM stores WHERE owner_id=$1",
      [req.user.id]
    );

    if (stores.rows.length === 0) {
      return res.json({ message: "No stores assigned to this owner" });
    }

    const storeId = stores.rows[0].id;

    // Get ratings for this store
    const ratings = await pool.query(
      "SELECT r.user_id, u.name, r.rating FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id=$1",
      [storeId]
    );

    // Calculate average rating
    const avgResult = await pool.query(
      "SELECT AVG(rating) AS average_rating FROM ratings WHERE store_id=$1",
      [storeId]
    );

    res.json({
      store: stores.rows[0],
      ratings: ratings.rows,
      average_rating: parseFloat(avgResult.rows[0].average_rating).toFixed(2)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
