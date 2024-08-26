import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import LogInPage from "./pages/LogInPage";
import EditProfilePage from "./pages/EditProfilePage";
import UserProfilePage from "./pages/UserProfilePage";
import LogOut from "./pages/LogOutPage";
import UserProfiles from "./pages/UserProfiles";
import UserSearch from "./pages/UserSearch";
import { ChakraProvider } from "@chakra-ui/react";
import Friends from "./pages/Friends"; // New component
import Messaging from "./pages/Messaging"; // New component

import { AuthProvider } from "./components/AuthContext";

function App() {
  return (
    <Router>
      <ChakraProvider>
        <AuthProvider>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/search" element={<UserSearch />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/user" element={<UserProfilePage />} />
            <Route path="/friends" element={<Friends />} /> {/* New route */}
            <Route path="/messages" element={<Messaging />} /> {/* New route */}
            <Route path="/user/:userId" element={<UserProfiles />} />
            <Route path="/logout" element={<LogOut />} />
          </Routes>
        </AuthProvider>
      </ChakraProvider>
    </Router>
  );
}

export default App;
