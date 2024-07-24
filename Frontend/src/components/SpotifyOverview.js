import React from "react";
import MostObscureSongs from "./MostObscureSongs";
import FavoriteArtistsPage from "./FavoriteArtists";
import FavoriteSongsPage from "./FavoriteSongs";

function SpotifyOverview() {
  return (
    <div>
      <h2>Spotify Overview</h2>
      <FavoriteSongsPage />
      <FavoriteArtistsPage />
      <MostObscureSongs />
    </div>
  );
}

export default SpotifyOverview;
