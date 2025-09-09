const bcrypt = require("bcryptjs");
const pool = require("./db");

async function createStoreOwner() {
  try {
    const name = "Ramesh Kumar";
    const email = "ramesh.owner@gmail.com";
    const address = "Pune, India";
    const password = "StoreOwner_17"; // choose a password
    const role = "store_owner";

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, address, hashedPassword, role]
    );

    console.log("Store owner created with ID:", result.rows[0].id);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createStoreOwner();
