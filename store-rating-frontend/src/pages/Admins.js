import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../components/Card";
import "./Admins.css";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admin/admins", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmins(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchAdmins();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/admin/admins",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAdmins((prev) => [...prev, res.data]);
      setFormData({ name: "", email: "", password: "", address: "" });
      alert("Admin added successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to add admin");
    }
  };

  return (
    <div className="admins-page">
      <div className="add-admin-form">
        <h2>Add New Admin</h2>
        <form onSubmit={handleAddAdmin}>
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
          <button type="submit" className="submit-btn">Add Admin</button>
        </form>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "30px" }}>Admins List</h2>
      <div className="admins-list">
        {admins.map((admin) => (
          <Card
            key={admin.id}
            title={admin.name}
            subtitle={admin.email}
            details={[
              { label: "Address", value: admin.address },
              { label: "Role", value: admin.role },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export default Admins;
