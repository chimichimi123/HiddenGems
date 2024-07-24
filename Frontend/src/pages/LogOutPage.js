import React from "react";
import { useAuth } from "../components/AuthContext";

const Logout = () => {
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="logout-container">
      {isAuthenticated ? (
        <div className="logout-message">
          <p>You are logged in.</p>
          <button onClick={handleLogout} className="form-button">
            Logout
          </button>
        </div>
      ) : (
        <p>You are not logged in.</p>
      )}
    </div>
  );
};

export default Logout;
