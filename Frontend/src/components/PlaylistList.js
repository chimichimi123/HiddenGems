import React from "react";
import PlaylistItem from "./PlaylistItem";

function PlaylistList({ playlists }) {
  return (
    <ul>
      {playlists.map((playlist) => (
        <PlaylistItem key={playlist.id} playlist={playlist} />
      ))}
    </ul>
  );
}

export default PlaylistList;
