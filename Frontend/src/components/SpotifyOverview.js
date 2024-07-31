import React from "react";
import MostObscureSongs from "./MostObscureSongs";
import FavoriteArtistsPage from "./FavoriteArtists";
import FavoriteSongsPage from "./FavoriteSongs";
import "../CSS/SpotifyOverview.css"; //

function SpotifyOverview() {
  return (
    <div>
      <h2>Spotify Overview</h2>
      <div className="spotify-overview">
        <FavoriteSongsPage />
        <FavoriteArtistsPage />
        <MostObscureSongs />
      </div>
    </div>
  );
}

export default SpotifyOverview;
