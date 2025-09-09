import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../components/Card";
import "./Users.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/admin/users",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) => [...prev, res.data]);
      setFormData({ name: "", email: "", password: "", address: "" });
      alert("User added successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to add user");
    }
  };

  return (
    <div className="users-page">
      <div className="add-user-form">
        <h2>Add New User</h2>
        <form onSubmit={handleAddUser}>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-btn">Add User</button>
        </form>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "30px" }}>Users List</h2>
      <div className="users-list">
        {users.map((user) => (
          <Card
            key={user.id}
            title={user.name}
            subtitle={user.email}
            details={[
              { label: "Address", value: user.address },
              { label: "Role", value: user.role },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export default Users;
