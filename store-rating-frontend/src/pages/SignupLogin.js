import React, { useState } from "react";
import axios from "axios";
import "./SignupLogin.css";

const SignupLogin = ({ setRole }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isLogin
      ? "http://localhost:5000/auth/login"
      : "http://localhost:5000/auth/signup";

    try {
      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "application/json" },
      });

      if (isLogin) {
        // Save token and role
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.role);
        setRole(res.data.role);
      } else {
        alert("Signup successful! You can now login.");
        setIsLogin(true);
      }

      // Clear form
      setFormData({ name: "", email: "", password: "", address: "" });
    } catch (err) {
      console.error(err);
      alert(
        "Error: " + (err.response?.data?.message || "Request failed. Check backend connection.")
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>{isLogin ? "Login" : "Signup"}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
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
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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
          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Signup"}
          </button>
        </form>
        <p className="toggle-text">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Signup" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupLogin;
