import React from "react";
import SongItem from "./SongItem";

function SongList({ songs }) {
  return (
    <ul>
      {songs.map((song) => (
        <SongItem key={song.id} song={song} />
      ))}
    </ul>
  );
}

export default SongList;
