import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import LogInPage from "./pages/LogInPage";
import Dashboard from "./pages/Dashboard";
import EditProfilePage from "./pages/EditProfilePage";
import DiscoverPage from "./pages/DiscoverPage";
import UserProfilePage from "./pages/UserProfilePage";
import LogOut from "./pages/LogOutPage";
import UserProfiles from "./pages/UserProfiles";
import UserSearch from "./pages/UserSearch";
import SongDetails from "./pages/SongDetails";
import LikedSongs from "./components/LikedSongs";

import { AuthProvider } from "./components/AuthContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/song/:id" element={<SongDetails />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/search" element={<UserSearch />} />
          <Route path="/user/liked_songs" element={<LikedSongs />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/user" element={<UserProfilePage />} />
          <Route path="/user/:userId" element={<UserProfiles />} />
          <Route path="/logout" element={<LogOut />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
