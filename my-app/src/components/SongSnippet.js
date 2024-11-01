import React, { useState } from 'react';

const SongSnippet = () => {
    const [song, setSong] = useState(null);
    const [trackDetails, setTrackDetails] = useState(null);
    const [error, setError] = useState(null);

    const fetchSnippet = async () => {
        try {
            const response = await fetch('http://localhost:3001/getTrackId');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setSong(data);
            setError(null); // Clear any previous error

            const trackId = data.uri.split(':').pop(); // Get the last part of the URI
            console.log('Track ID:', trackId);
            
            // Fetch track details using the track ID
            const trackResponse = await fetch(`http://localhost:3001/track/${trackId}`);
            if (!trackResponse.ok) {
                throw new Error('Network response was not ok');
            }

            const trackData = await trackResponse.json();
            setTrackDetails(trackData); // Store the track details
            console.log(trackDetails.preview_url);
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
            <button onClick={fetchSnippet}>Get Song Snippet</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {song && (
                <div>
                    <h2>{song.title} by {song.artist}</h2>
                    <audio controls>
                        <source src={trackDetails.preview_url} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio>
                </div>
            )}
            {trackDetails && (
                <div>
                    <h3>Track Details</h3>
                    <p>Album: {trackDetails.album}</p>
                    {/* Add more track details as needed */}
                </div>
            )}
        </div>
    );
};

export default SongSnippet;
