import React from "react";

function SongList({ songs }) {
  return (
    <div>
      {songs.length === 0 ? (
        <p>No songs available</p>
      ) : (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <p>
                <strong>{song.name}</strong> by {song.artist}
              </p>
              <p>Album: {song.album}</p>
              <p>Popularity: {song.popularity}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
