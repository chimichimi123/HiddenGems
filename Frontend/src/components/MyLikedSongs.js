import React from "react";
import SongList from "./SongList";

function MyLikedSongs() {
  // Placeholder data
  const songs = [
    { id: 1, title: "Liked Song 1", artist: "Artist 1" },
    { id: 2, title: "Liked Song 2", artist: "Artist 2" },
  ];

  return (
    <div>
      <h3>My Liked Songs</h3>
      <SongList songs={songs} />
    </div>
  );
}

export default MyLikedSongs;
