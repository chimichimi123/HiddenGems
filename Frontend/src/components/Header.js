import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header>
      <h1>Hidden Gems</h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/discover">Discover</Link>
        <Link to="/login">Log In</Link>
        <Link to="/register">Sign Up</Link>
        <Link to="/user">Profile</Link>
        <li>
          <Link to="/logout">Log Out</Link>
        </li>
      </nav>
    </header>
  );
}

export default Header;
