const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Submit or Update a rating
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { store_id, rating } = req.body;

    if (!store_id || !rating) {
      return res.status(400).json({ message: "Missing store_id or rating" });
    }

    // Check if user already submitted rating for this store
    const existing = await pool.query(
      "SELECT * FROM ratings WHERE user_id=$1 AND store_id=$2",
      [req.user.id, store_id]
    );

    if (existing.rows.length > 0) {
      // Update existing rating
      await pool.query(
        "UPDATE ratings SET rating=$1 WHERE user_id=$2 AND store_id=$3",
        [rating, req.user.id, store_id]
      );
      return res.json({ message: "Rating updated successfully" });
    }

    // Insert new rating
    const result = await pool.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *",
      [req.user.id, store_id, rating]
    );

    res.json({ message: "Rating submitted successfully", rating: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
