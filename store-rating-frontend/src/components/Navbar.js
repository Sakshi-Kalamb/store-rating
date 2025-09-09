import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ role }) => {
  return (
    <nav className="navbar">
      <h1 className="logo">Store Rating</h1>
      <div className="nav-links">
        {role === "user" && <Link to="/">Dashboard</Link>}
        {role === "admin" && (
          <>
            <Link to="/users">Users</Link>
            <Link to="/stores">Stores</Link>
            <Link to="/admins">Admins</Link>
          </>
        )}
        <Link to="/about">About Me</Link>
      </div>
    </nav>
  );
};

export default Navbar;
