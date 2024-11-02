import React, { useState } from 'react';

const SongSnippet = () => {
    const [song, setSong] = useState(null);
    const [trackDetails, setTrackDetails] = useState(null);
    const [error, setError] = useState(null);

    const handleLogin = () => {
        window.location.href = 'http://localhost:8888/login'; // Redirect to your login endpoint
    };

    const fetchSnippet = async () => {
        try {
            const response = await fetch('http://localhost:8888/getTrackId');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setSong(data);
            setError(null); // Clear any previous error

            // Fetch track details using the track ID
            const trackId = data.uri.split(':').pop(); // Get the last part of the URI
            const trackResponse = await fetch(`http://localhost:8888/track/${trackId}`);
            if (!trackResponse.ok) {
                throw new Error('Network response was not ok');
            }

            const trackData = await trackResponse.json();
            setTrackDetails(trackData); // Store the track details
        } catch (err) {
            console.error('Error fetching the snippet or track details:', err);
            setError('Error fetching the song snippet or track details.');
            setSong(null); // Clear any previous song data
            setTrackDetails(null); // Clear previous track details
        }
    };

    return (
        <div>
            <h1>Taylor Swift Song Snippet</h1>
            <button onClick={handleLogin}>Login to Spotify</button>
            <button onClick={fetchSnippet} disabled={!song}>Get Song Snippet</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {song && (
                <div>
                    <h2>{song.title} by {song.artist}</h2>
                    <audio controls>
                        <source src={song.preview_url} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            )}
            {trackDetails && (
                <div>
                    <h3>Track Details</h3>
                    <p>Album: {trackDetails.album}</p>
                </div>
            )}
        </div>
    );
};

export default SongSnippet;
