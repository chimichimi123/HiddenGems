import React from "react";

function PlaylistItem({ playlist }) {
  return (
    <li>
      <p>{playlist.title}</p>
    </li>
  );
}

export default PlaylistItem;
