import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserSearch() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:5000/search-users?query=${query}`,
        {
          withCredentials: true,
        }
      );
      setSearchResults(response.data);
      setError(null); // Clear previous errors
    } catch (error) {
      console.error("Error fetching search results:", error);
      setError("Failed to fetch search results. Please try again later.");
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users..."
        />
        <button type="submit">Search</button>
      </form>
      {error && <p>{error}</p>}
      <ul>
        {searchResults.length > 0 ? (
          searchResults.map((user) => (
            <li
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              style={{ cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={
                    user.profile_image
                      ? `http://localhost:5000/uploads/${user.profile_image}`
                      : "defaultProfileImage.jpg"
                  }
                  alt={user.username}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "50%",
                    marginRight: "10px",
                  }}
                />
                <div>
                  <p>
                    <strong>{user.username}</strong>
                  </p>
                  <p>{user.display_name}</p>
                  <p>{user.email}</p>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </ul>
    </div>
  );
}

export default UserSearch;
