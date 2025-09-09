const bcrypt = require("bcryptjs");
const pool = require("./db");

async function createAdmin() {
  try {
    const name = "Super Admin";
    const email = "admin@roxiler.com";
    const address = "Head Office";
    const password = "Admin_17"; // login password
    const role = "admin";

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, address, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [name, email, address, hashedPassword, role]
    );

    console.log("Admin created with ID:", result.rows[0].id);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}




createAdmin();
