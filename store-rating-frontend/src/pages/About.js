import React, { useState, useEffect } from "react";
import axios from "axios";
import "./About.css";

const About = ({ role, setRole }) => {
  const [stats, setStats] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStats = async () => {
      if (role === "admin") {
        try {
          const res = await axios.get("http://localhost:5000/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setStats(res.data);
        } catch (err) {
          console.log(err);
        }
      }
    };
    fetchStats();
  }, [role, token]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        "http://localhost:5000/auth/update-password",
        { password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      console.log(err);
      alert("Failed to update password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setRole(null);
    window.location.reload();
  };

  return (
    <div className="about-page">
      {role === "admin" && (
        <div className="stats-container">
          <h2>System Statistics</h2>
          <p>Total Users: {stats.totalUsers || 0}</p>
          <p>Total Stores: {stats.totalStores || 0}</p>
          <p>Total Ratings Submitted: {stats.totalRatings || 0}</p>
        </div>
      )}

      <div className="update-password-container">
        <h2>Update Password</h2>
        <form onSubmit={handleUpdatePassword}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit-btn">Update Password</button>
        </form>
      </div>

      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default About;
