import React from "react";
import SongList from "../components/SongList";

function DiscoverPage() {
  // Placeholder data
  const songs = [
    { id: 1, title: "Recommended Song 1", artist: "Artist 1" },
    { id: 2, title: "Recommended Song 2", artist: "Artist 2" },
  ];

  return (
    <div>
      <h2>Discover</h2>
      <SongList songs={songs} />
    </div>
  );
}

export default DiscoverPage;
