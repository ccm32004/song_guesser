import React, { useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { RingProgress, Center, ActionIcon, Autocomplete, Button, Card } from '@mantine/core';
import { IconPlayerPlayFilled,  IconPlayerSkipForward, IconBrandDeezer, IconFlameFilled, IconArrowNarrowLeft } from '@tabler/icons-react'; // Play Icon
import { fetchSnippet } from '../utils/api'; // Import the fetchSnippet function
import { HeaderSimple } from '../components/Header';
import './Game.css'; // Import the CSS file

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

    const handleSubmit = (event) => {
        event.preventDefault();
        validateTitle();
    };

    return (
        <div className="game-container">
            <HeaderSimple className="header" />
            <div className="mode-header">
                <IconArrowNarrowLeft size={24} />
                <h2>Taylor Swift Mode</h2>
            </div>
            <Card shadow="sm" padding = "0" radius = "md" className="game-card">
            {song && (
            <div className='card-content'>
              <div className="left-column">
            <div className = "left-content">
              <div className="stat">
                <IconBrandDeezer size={24} />
                <h2>3</h2>
              </div>
              <div> <h4>Plays Left For Current Song</h4> </div>
              <div className="stat">
                <IconFlameFilled size={24} /> 
                <h2>0</h2>
              </div>
              <div><h4>Current Streak Count</h4></div>
            </div>
              </div>
                <div className = "right-column">
                    {/* <h2>{song.title} by {song.artist}</h2> */}
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
                                rootColor='#a19aa7'
                                sections={[{ value: progress, color: '#73687b' }]}
                            />
                            <ActionIcon
                                size={60}
                                color="violet"
                                variant="filled"
                                style={{ backgroundColor: '#5b4f65', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%'}}
                                onClick={isPlaying ? stopSnippet : playSnippet}
                            >
                                <IconPlayerPlayFilled size={24} style={{ color: 'e8e6e9'}}/>
                            </ActionIcon>
                        </div>
                    </Center>

                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <Autocomplete
                            value={inputTitle}
                            onChange={setInputTitle}
                            variant = "filled"
                            placeholder="Enter the song title"
                            width='100%'
                            data={[]} // You can provide a list of suggestions here
                            styles={{
                                input: {
                                    backgroundColor: '#5b4f65',
                                    border: '1px solid  white',
                                    color: 'white',
                                    padding: '0 3em',
                                    textAlign: 'center',
                                }
                            }}     
                        />
                    </form>
                    <p style={{ color: 'white' }}>{validationMessage}</p>
                    <Button 
                        onClick={handleFetchSnippet}
                        variant="outline"
                        color="gray"
                        style={{ backgroundColor: 'transparent', borderColor: '#5b4f65', color: 'white' }}
                    >
                        <IconPlayerSkipForward size={16} style={{ marginRight: 8,}} />
                        Skip
                    </Button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
                </div>
            )}
            </Card>
        </div>
    );
};

export default Game;