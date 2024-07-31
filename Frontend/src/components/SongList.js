import React from "react";
import { Link } from "react-router-dom";

const SongList = ({ songs = [] }) => {
  return (
    <div>
      {songs.length === 0 ? (
        <p>No songs available</p>
      ) : (
        <ul>
          {songs.map((song) => (
            <li key={song.id}>
              <div>
                <p>
                  <strong>{song.name}</strong>
                </p>
                <p>Artist: {song.artist}</p>
                <p>Album: {song.album}</p>
                <p>Popularity: {song.popularity}</p>
                <img
                  src={song.image_url || "default_image_url.jpg"}
                  alt={song.name}
                  style={{ width: "100px", height: "100px" }}
                />
                <button>
                  <Link to={`/song/${song.id}`}>View Song Details</Link>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SongList;
