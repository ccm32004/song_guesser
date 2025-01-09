import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RingProgress, Center, ActionIcon, Autocomplete, Button } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react'; // Play Icon
import { fetchSnippet } from '../utils/api'; // Import the fetchSnippet function

const Game = () => {
    const location = useLocation();
    const { song: initialSong, songPreviewUrl: initialSongPreviewUrl } = location.state || {};
    const [song, setSong] = useState(initialSong);
    const [songPreviewUrl, setSongPreviewUrl] = useState(initialSongPreviewUrl);
    const [inputTitle, setInputTitle] = useState('');
    const [validationMessage, setValidationMessage] = useState('');
    const [progress, setProgress] = useState(0); // Progress state
    const [isPlaying, setIsPlaying] = useState(false); // Track if the play button is pressed
    const [intervalId, setIntervalId] = useState(null); // Track interval ID for clearing
    const [error, setError] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current && songPreviewUrl) {
            audioRef.current.load(); // Reload the audio element when the URL changes
        }
    }, [songPreviewUrl]);

    const handleFetchSnippet = async () => {
        try {
            const { song, previewUrl } = await fetchSnippet();
            setSong(song);
            setSongPreviewUrl(previewUrl);
            setError(null); // Clear any previous error
        } catch (err) {
            setError(err.message);
        }
    };

    const playSnippet = () => {
        // Reset progress when starting a new snippet
        setProgress(0);
        setIsPlaying(true);

        if (audioRef.current) {
            const audio = audioRef.current;
            const duration = audio.duration;
            const maxStartTime = duration - 3; // Ensures there is enough time for 3 second snippet
            const startTime = Math.random() * maxStartTime;

            audio.currentTime = startTime;
            audio.play();

            const id = setInterval(() => {
                setProgress((prevProgress) => {
                    if (prevProgress >= 100) {
                        clearInterval(id); // Stop the interval once it reaches 100%
                        audio.pause();
                        return 100;
                    }
                    return prevProgress + 1; // Increment progress by 1
                });
            }, 30); // Adjust the speed by changing the interval time (ms)

            setIntervalId(id);

            setTimeout(() => {
                audio.pause();
                setIsPlaying(false);
                clearInterval(id);
            }, 3000); // Stop playback after 3 seconds
        } else {
            console.error('Audio ref not found');
        }
    };

    const stopSnippet = () => {
        setIsPlaying(false);
        clearInterval(intervalId); // Clear the interval when stopping
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const validateTitle = () => {
        const normalizedSongTitle = song.title.toLowerCase().replace(/\s+/g, '');
        const normalizedInputTitle = inputTitle.toLowerCase().replace(/\s+/g, '');
        console.log('Song title:', normalizedSongTitle);
        console.log('Input title:', normalizedInputTitle);

        if (normalizedInputTitle === normalizedSongTitle) {
            setValidationMessage('Correct!');
        } else {
            setValidationMessage('Incorrect. Try again!');
        }
    };

    return (
        <div className="game-container">
            {song && (
                <div>
                    <h2>{song.title} by {song.artist}</h2>
                    <audio 
                        key={song.uri} 
                        ref={audioRef}
                        controls
                        style={{ display: 'none' }} // Hide the audio player
                    >
                        <source src={songPreviewUrl} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio>

                    <Center style={{ flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <RingProgress
                                size={120}
                                thickness={8}
                                sections={[{ value: progress, color: 'blue' }]}
                            />
                            <ActionIcon
                                size="xl"
                                color="blue"
                                variant="filled"
                                style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                                onClick={isPlaying ? stopSnippet : playSnippet}
                            >
                                <IconPlayerPlay size={24} />
                            </ActionIcon>
                        </div>
                    </Center>

                    <div>
                        <Autocomplete
                            value={inputTitle}
                            onChange={setInputTitle}
                            placeholder="Enter the song title"
                            data={[]} // You can provide a list of suggestions here
                        />
                        <button onClick={validateTitle}>Check Answer</button>
                        <p>{validationMessage}</p>
                    </div>
                    <Button onClick={handleFetchSnippet}>Next</Button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            )}
        </div>
    );
};

export default Game;