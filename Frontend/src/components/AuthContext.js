import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("http://localhost:5000/check_login", {
          withCredentials: true,
        });

        if (response.data.logged_in) {
          setIsAuthenticated(true);
          setUser(response.data.user);

          // Check if Spotify login is required
          const spotifyResponse = await axios.get(
            "http://localhost:5000/spotify-login",
            {
              withCredentials: true,
            }
          );

          if (!spotifyResponse.data.success) {
            // Redirect to Spotify login if not logged in
            window.location.href = "http://localhost:5000/spotify/login";
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication status:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setIsAuthenticated(true);
        setUser(response.data.user);

        // Check Spotify login status
        const spotifyResponse = await axios.get(
          "http://localhost:5000/spotify-login",
          {
            withCredentials: true,
          }
        );

        if (!spotifyResponse.data.success) {
          window.location.href = "http://localhost:5000/spotify/login";
        }
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/logout",
        {},
        {
          withCredentials: true,
        }
      );
      setIsAuthenticated(false);
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
