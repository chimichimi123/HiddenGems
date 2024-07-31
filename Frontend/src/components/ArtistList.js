// src/components/ArtistList.js
import React from "react";

function ArtistList({ artists, onArtistClick }) {
  return (
    <div>
      {artists.length === 0 ? (
        <p>No artists available</p>
      ) : (
        <ul>
          {artists.map((artist) => (
            <li key={artist.id} onClick={() => onArtistClick(artist)}>
              <div>
                <p>
                  <strong>{artist.name}</strong>
                </p>
                <p>
                  Genres:{" "}
                  {artist.genres
                    ? artist.genres.join(", ")
                    : "No genres available"}
                </p>
                <p>Popularity: {artist.popularity}</p>
                <p>
                  <img
                    src={
                      artist.images && artist.images.length > 0
                        ? artist.images[0].url
                        : "default_image_url.jpg"
                    }
                    alt={`${artist.name} profile`}
                    style={{ width: "100px", height: "100px" }}
                  />
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ArtistList;
