// src/pages/LogInPage.js
import React, { useState, useContext } from "react";
import { useAuth } from "../components/AuthContext";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const { login } = useAuth();

  const handleLogin = () => {
    login(email, password);
    setLoginSuccess(true);
  };

  return (
    <div>
      <h2>Login</h2>
      {loginSuccess && <div className="success-message">Login successful!</div>}
      <div className="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-input"
        />
        <button onClick={handleLogin} className="form-button">
          Login
        </button>
        <div className="register-link">
          <p>If you don't already have an account, create one here!</p>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <button className="form-button">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
