import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import SignupLogin from "./pages/SignupLogin";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Stores from "./pages/Stores";
import Admins from "./pages/Admins";
import About from "./pages/About";

function App() {
  const [role, setRole] = useState(localStorage.getItem("role"));
  const token = localStorage.getItem("token");

  // If user not logged in, redirect to Signup/Login page
  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="*" element={<SignupLogin setRole={setRole} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Navbar role={role} />
      <Routes>
        {role === "user" && <Route path="/" element={<Dashboard />} />}
        {role === "admin" && (
          <>
            <Route path="/users" element={<Users />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/admins" element={<Admins />} />
          </>
        )}
        <Route path="/about" element={<About role={role} setRole={setRole} />} />
        <Route path="*" element={<Navigate to={role === "user" ? "/" : "/users"} />} />
      </Routes>
    </Router>
  );
}

export default App;
