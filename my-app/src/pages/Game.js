import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RingProgress, Center, ActionIcon, Autocomplete, Button, Card, Loader, Modal } from '@mantine/core';
import { IconPlayerPlayFilled, IconBrandDeezer, IconFlameFilled, IconArrowNarrowLeft } from '@tabler/icons-react'; // Play Icon
import { fetchSnippet, fetchSongSuggestions } from '../utils/api'; // Import the fetchSnippet function
import { HeaderSimple } from '../components/Header';
import './Game.css'; // Import the CSS file
import styles from './test.module.css';

const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const {song: initialSong, songPreviewUrl: initialSongPreviewUrl } = location.state || {};
    const [song, setSong] = useState(initialSong);
    const [songPreviewUrl, setSongPreviewUrl] = useState(initialSongPreviewUrl);
    const [inputTitle, setInputTitle] = useState('');
    const [validationMessage, setValidationMessage] = useState(' ');
    const [progress, setProgress] = useState(0); // Progress state
    const [isPlaying, setIsPlaying] = useState(false); // Track if the play button is pressed
    const [intervalId, setIntervalId] = useState(null); // Track interval ID for clearing
    const [error, setError] = useState(null);
    const [playCount, setPlayCount] = useState(0); 
    const [currentStreak, setCurrentStreak] = useState(0);
    const audioRef = useRef(null);
    const [isLoadingNextSong, setIsLoadingNextSong] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Loading next song...');
    const inputRef = useRef(null); //reference to input field 9mb undo cuz this function isn't really working
    const [songSuggestions, setSongSuggestions] = useState([]);

    useEffect(() => {
        if (audioRef.current && songPreviewUrl) {
            audioRef.current.load(); // Reload the audio element when the URL changes
            //audioRef.current.src = songPreviewUrl;
        }
    }, [songPreviewUrl]);

    useEffect(() => {
        const handleKeyDown = (event) => {
          if (event.code === 'Space' && document.activeElement !== inputRef.current) {
            event.preventDefault(); // Prevent default spacebar action (scrolling)
            if (!isPlaying && playCount > 0) {
              playSnippet();
            }
          }
        };
      
        window.addEventListener('keydown', handleKeyDown);
      
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isPlaying, playCount]);

    useEffect(() => {
        // Fetch song suggestions from the backend API
        const fetchSuggestions = async () => {
          try {
            const data = await fetchSongSuggestions();
            setSongSuggestions(data);
          } catch (error) {
            console.error('Error fetching song suggestions:', error);
          }
        };
    
        fetchSuggestions();
    }, []);

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
        if (playCount >= 3) {
          setValidationMessage('You have reached the maximum number of plays.');
          return;
        }
    
        // Reset progress when starting a new snippet
        setProgress(0);
        setIsPlaying(true);
        console.log("playing snippet");
    
        if (audioRef.current) {
          const audio = audioRef.current;
          const duration = audio.duration;
          const maxStartTime = duration - 3; // Ensures there is enough time for 3 second snippet
          const startTime = Math.random() * maxStartTime;
    
          audio.currentTime = startTime;
          const playPromise = audio.play();
    
          if (playPromise !== undefined) {
            playPromise.then(() => {
              // Automatic playback started!
              // Show playing UI.
              setPlayCount((prevPlayCount) => prevPlayCount + 1);
            // Increment play count, ensures it updated based on most recent state value, rather than the version existing in the render
            //typically it is no applied immediately, rahter it is scheduled to applied in the next render (which is why it is one behind)

              console.log("playcount after autoplay works: "+  playCount); // Increment play count
              const id = setInterval(() => {
                setProgress((prevProgress) => {
                  if (prevProgress >= 100) {
                    clearInterval(id); // Stop the interval once it reaches 100%
                    audio.pause();
                    handleAudioEnded();
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
                handleAudioEnded();
            }, 3000); // Stop playback after 3 seconds
            }).catch((error) => {
            // Auto-play was prevented
            // Show paused UI.
            console.error('Auto-play was prevented:', error);
            setIsPlaying(false);
            });
        }
        } else {
        console.error('Audio ref not found');
        }
    };
            

    const stopSnippet = () => { //TODO: mb remove this, do users really need to be able to stop the button from playing 
        setIsPlaying(false);
        clearInterval(intervalId); // Clear the interval when stopping
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };

    const validateTitle = () => {
        var normalizedSongTitle = song.title.toLowerCase().replace(/\s+/g, '');
        normalizedSongTitle = normalizedSongTitle.replace(/\(taylor'sversion\)/g, ''); 
        normalizedSongTitle = normalizedSongTitle.replace(/\(feat\..*?\)/g, ''); // Remove (feat. [artist])
        normalizedSongTitle = normalizedSongTitle.replace(/\(.*?version\)/g, ''); // Remove (Live Version)
        const normalizedInputTitle = inputTitle.toLowerCase().replace(/\s+/g, '');
        console.log('Song title:', normalizedSongTitle);
        console.log('Input title:', normalizedInputTitle);

        if (normalizedInputTitle === normalizedSongTitle) {
            setLoadingMessage('Correct! Loading next song...');
            setIsLoadingNextSong(true); // Set loading next song state to true
            setTimeout(() => {
                resetGame();
                setIsLoadingNextSong(false); // Reset loading next song state after 2 seconds
            }, 1300);
        } else {
            setValidationMessage('Incorrect. Try again!');
            setTimeout(() => {
                setValidationMessage(' '); // Clear the validation message after 3 seconds
            }, 500);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsPlaying(false);
        validateTitle();
        console.log("handling submit");
    };

    const handleAudioEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const resetGame = async () => {

        console.log("resetting game");
        setPlayCount(0); // Reset play count immediately
        setCurrentStreak(currentStreak + 1); // Increment the streak
        setInputTitle(''); // Reset input title
        setValidationMessage(''); // Reset validation message
    
        // Now fetch the new snippet and play it
        await handFetchSnippet();
        // setShowTextBox(true); // Show text box again after fetching new snippet
    };

    const handFetchSnippet = async () => {
        try {
            const { song, previewUrl } = await fetchSnippet();
            setSong(song);
            setSongPreviewUrl(previewUrl);
            setError(null); // Clear any previous error
            //playSnippet(); // Play the new snippet after fetching
        } catch (err) {
            setError(err.message);
        }
    };


    const skipSnippet = async () => {   
        setValidationMessage("The song was: " + song.title); 

        setLoadingMessage(`Answer:\n${song.title}\n\nSkipping to next song...`);

        setIsLoadingNextSong(true); // Set loading next song state to true
        setTimeout(async () => {
            setInputTitle(''); // Clear the input field
            setPlayCount(0); // Reset play count
            setCurrentStreak(0);
            setValidationMessage(''); // Reset validation message
            await handleFetchSnippet(); // Fetch a new snippet
            setIsLoadingNextSong(false); // Reset loading next song state after 2 seconds
        }, 1300);
    }

    const handleBackClick = () => {
        navigate(-1); // Navigate to the previous page
    };

    return (
        <div className="game-container">
            <HeaderSimple className="header" />
            <div className="mode-header">
                <IconArrowNarrowLeft size={24}  onClick={handleBackClick}/>
                <h2>Taylor Swift Mode</h2>
            </div>
            <Card shadow="sm" padding = "0" radius = "md" className="game-card">
            {song && (
            <div className='card-content'>
              <div className="left-column">
            <div className = "left-content">
              <div className="stat">
                <IconBrandDeezer size={24} />
                <h2>{3 - playCount}</h2> 
              </div>
              <div> <h4>Plays Left For Current Song</h4> </div>
              <div className="stat">
                <IconFlameFilled size={24} /> 
                <h2>{currentStreak}</h2>
              </div>
              <div><h4>Current Streak Count</h4></div>
            </div>
              </div>
                <div className = "right-column">
                    {isLoadingNextSong ? (
                        <div style={{ color: 'white', textAlign: 'center', marginTop: '80px' }}>
                              {loadingMessage.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line}
                                    <br />
                                </React.Fragment>
                            ))}
                            <Loader color= "#916691" style={{ marginTop: '20px' }} /> 
                        </div>

                    ) : (
                    <>
                    <audio 
                        key={song.uri} 
                        ref={audioRef}
                        controls
                        style={{ display: 'none' }} // Hide the audio player
                        autoplay
                    >
                        <source src={songPreviewUrl} type="audio/mpeg" />
                        Your browser does not support the audio tag.
                    </audio>

                    <Center style={{ flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <RingProgress
                                size={150}
                                thickness={8}
                                rootColor='#44354f'
                                sections={[{ value: progress, color: '#73687b' }]}
                            />
                            <ActionIcon
                                size={60}
                                className="play-music-button" 
                                color="violet"
                                variant="filled"
                                style={{ 
                                    background: '#6d336d',
                                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '50%'
                                }} //backgroundColor: '#5b4f65',
                                onClick={isPlaying ? stopSnippet : playSnippet}
                                disabled={playCount >= 3} // Disable button after 3 plays
                            >
                                <IconPlayerPlayFilled size={24} style={{ color: 'e8e6e9'}}/>
                            </ActionIcon>
                        </div>
                    </Center>

                    <Button 
                        onClick={skipSnippet}
                        variant="outline"
                        color="gray"
                        className="skip-button"
                        style={{ backgroundColor: 'transparent', borderColor: '#5b4f65', color: 'white', justifySelf: "right", width: '80px', marginTop: '10px'}}
                    >
                        <span>Skip</span>
                    </Button>

                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '13px' }}>
                        <Autocomplete
                            clearable
                            value={inputTitle}
                            onChange={setInputTitle}
                            variant="filled"
                            placeholder="Type the song..."
                            width='100%'
                            data={songSuggestions}
                            ref={inputRef} // Add ref to the input field
                            comboboxProps={{ position: 'bottom', middlewares: { flip: false, shift: false }, offset: 0 }}
                            classNames={{
                                input: styles.input, // Apply the CSS class for input
                                dropdown: styles.dropdown, // Apply the CSS class for dropdown
                                option: styles.option // Apply the CSS class for items
                            }}
                        />
                    </form>
                    
                    <p className="validation-message" style={{ color: 'white' }}>{validationMessage}</p>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    </>
                 )}

                </div>
                </div>
            )}
            </Card>
        </div>
    );
};

export default Game;