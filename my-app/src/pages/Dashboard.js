// Dashboard.js
import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@mantine/core';

const Dashboard = () => {
    const [song, setSong] = useState(null);
    const [songPreviewUrl, setSongPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const [inputTitle, setInputTitle] = useState('');
    const [validationMessage, setValidationMessage] = useState('');
    const audioRef = useRef(null);

    const fetchSnippet = async () => {
        try {
            const response = await fetch('http://localhost:8888/getTrackId', {
                credentials: 'include', // Include cookies
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setSong(data);
            setError(null); // Clear any previous error

            //testing the new workaround 
            const trackId = data.uri.split(':').pop(); // Get the last part of the URI
            const trackResponse = await fetch(`http://localhost:8888/track/${trackId}`);

            if (!trackResponse.ok) {
                throw new Error('Network response was not ok');
            }
            else{
                const data = await trackResponse.json();
                const previewUrl = data.previewUrl;
                console.log('Preview URL:', previewUrl);
                setSongPreviewUrl(previewUrl);
            }

        } catch (err) {
            console.error('Error fetching the snippet or track details:', err);
            setError('Error fetching the song snippet or track details.');
            setSong(null); // Clear any previous song data
        }
    };

    const playRandomSnippet = () => {
        if (audioRef.current){
            const audio =audioRef.current;
            const duration = audio.duration;
            const maxStartTime = duration - 1; //ensures there is enough time for 3 second snippet : ALSO: TODO, allow customization of preview time frame
            const startTime = Math.random() * maxStartTime;

            audio.currentTime = startTime;
            audio.play();

            setTimeout(() => {
                audio.pause();
            }, 1000); // Stop playback after 3 seconds

        }
        else{
            console.error('Audio ref not found');
        }

    };

    //TODO, make it so that u press play three times on the same track before it regens!

    const handleInputChange = (e) => {
        console.log(e.target.value);
    };

    const validateTitle = () => {
        const normalizedSongTitle = song.title.toLowerCase().replace(/\s+/g, '');
        const normalizedInputTitle = inputTitle.toLowerCase().replace(/\s+/g, '');
        console.log('Song title:', normalizedSongTitle);
        console.log('Input title:', normalizedInputTitle);

        if (normalizedInputTitle === normalizedSongTitle) {
            setValidationMessage('Correct!');
        }else{
            setValidationMessage('Incorrect. Try again!');
        }
    };

    useEffect(() => {
        if (audioRef.current && songPreviewUrl) {
            audioRef.current.load(); // Reload the audio element when the URL changes
        }
    }, [songPreviewUrl]);

    return (
        <div>
            <h1>Taylor Swift Song Snippet</h1>
            <Button onClick={fetchSnippet}>Get Song Snippet</Button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {song && (
                <div>
                     {console.log('Rendering song:', song)} {/* Log the song details */}
                    <h2>{song.title} by {song.artist}</h2>
                    <audio 
                        key={song.uri} 
                        ref={audioRef}
                        controls
                        onLoadedMetadata={playRandomSnippet}>

                        {console.log("rendering url", songPreviewUrl)}
                        <source src={songPreviewUrl} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio>

                    <div>
                        <input
                            type="text"
                            value={inputTitle}
                            onChange={(e) => setInputTitle(e.target.value)}
                            placeholder="Enter the song title"

                        />
                        <button onClick={validateTitle}>Check Answer</button>
                        <p>{validationMessage}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
