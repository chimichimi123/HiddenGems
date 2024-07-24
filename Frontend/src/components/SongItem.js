import React from "react";

function SongItem({ song }) {
  return (
    <li>
      <p>
        {song.title} - {song.artist}
      </p>
    </li>
  );
}

export default SongItem;
