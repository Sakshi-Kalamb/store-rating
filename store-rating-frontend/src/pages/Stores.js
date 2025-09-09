import React, { useState, useEffect } from "react";
import axios from "axios";
import Card from "../components/Card";
import Stars from "../components/Stars";
import "./Stores.css";

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await axios.get("http://localhost:5000/admin/stores", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStores(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchStores();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/admin/stores",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStores((prev) => [...prev, res.data]);
      setFormData({ name: "", email: "", address: "" });
      alert("Store added successfully!");
    } catch (err) {
      console.log(err);
      alert("Failed to add store");
    }
  };

  return (
    <div className="stores-page">
      <div className="add-store-form">
        <h2>Add New Store</h2>
        <form onSubmit={handleAddStore}>
          <input
            type="text"
            name="name"
            placeholder="Store Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Store Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Store Address"
            value={formData.address}
            onChange={handleChange}
            required
          />
          <button type="submit" className="submit-btn">Add Store</button>
        </form>
      </div>

      <h2 style={{ textAlign: "center", marginTop: "30px" }}>Stores List</h2>
      <div className="stores-list">
        {stores.map((store) => (
          <Card
            key={store.id}
            title={store.name}
            subtitle={store.email}
            details={[
              { label: "Address", value: store.address },
              { label: "Rating", value: store.rating || 0 },
            ]}
          />
        ))}
      </div>
    </div>
  );
};

export default Stores;
