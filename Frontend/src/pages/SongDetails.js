import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const SongDetails = () => {
  const { id } = useParams();
  const [songDetails, setSongDetails] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/spotify/track/${id}`,
          { withCredentials: true }
        );
        setSongDetails(response.data);
      } catch (error) {
        console.error("Error fetching song details:", error);
      }
    };

    fetchSongDetails();
  }, [id]);

  const likeSong = async (song) => {
    try {
      await axios.post(
        "http://localhost:5000/spotify/like_song",
        {
          song_id: song.id,
          name: song.name,
          artist: song.artist,
          album: song.album,
          popularity: song.popularity,
          image: song.image_url,
        },
        { withCredentials: true }
      );
      setLiked(true);
      alert("Song liked successfully");
    } catch (error) {
      console.error("Error liking song:", error);
    }
  };

  const handleLikeSong = () => {
    if (songDetails) {
      likeSong(songDetails);
    }
  };

  if (!songDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{songDetails.name}</h2>
      <img src={songDetails.image_url} alt={songDetails.name} />
      <p>Artist: {songDetails.artist}</p>
      <p>Album: {songDetails.album}</p>
      <p>Popularity: {songDetails.popularity}</p>
      <p>Duration: {(songDetails.duration_ms / 60000).toFixed(2)} minutes</p>
      <p>Explicit: {songDetails.explicit ? "Yes" : "No"}</p>
      {songDetails.preview_url && (
        <audio controls src={songDetails.preview_url}></audio>
      )}
      <iframe
        src={songDetails.embed_url}
        width="300"
        height="80"
        frameBorder="0"
        allowTransparency="true"
        allow="encrypted-media"
      ></iframe>
      <p>
        <a
          href={songDetails.external_urls.spotify}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Spotify
        </a>
      </p>
      <button onClick={handleLikeSong} disabled={liked}>
        {liked ? "Liked" : "Like this song"}
      </button>
    </div>
  );
};

export default SongDetails;
