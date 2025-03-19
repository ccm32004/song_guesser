import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RingProgress, Center, ActionIcon, Autocomplete, Button, Card, Loader, Modal, Radio } from '@mantine/core';
import { IconPlayerPlayFilled, IconBrandDeezer, IconFlameFilled, IconArrowNarrowLeft, IconSettings } from '@tabler/icons-react'; // Play Icon
import { fetchSnippet, fetchSongTitleSuggestions } from '../utils/api'; // Import the fetchSnippet function
import { HeaderSimple } from '../components/Header';
import './Game.css'; // Import the CSS file
import styles from './test.module.css';

const Game = () => {
    const location = useLocation();
    const navigate = useNavigate();

    //these are the initial values when you first enter the page
    const {song: initialSong, songPreviewUrl: initialSongPreviewUrl, artistName} = location.state || {};

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [snippetLength, setSnippetLength] = useState(2); 

    const difficultyMap = {
        easy: 3,    // Easy = 3 seconds
        medium: 2,  // Medium = 2 seconds
        hard: 1     // Hard = 1 second
    };

    useEffect(() => {
        if (audioRef.current && songPreviewUrl) {
            audioRef.current.src = songPreviewUrl;
            audioRef.current.load();
            //make the player reflect the current state of the audio element

            setProgress(0);
            if (intervalId) {
                clearInterval(intervalId);
            }
            //TODO: refactor laterr
            const id = setInterval(() => {
                setProgress((prevProgress) => {
                  if (prevProgress >= 100) {
                    clearInterval(id); // Stop the interval once it reaches 100%
                    audioRef.current.pause();
                    handleAudioEnded();
                    return 100;
                  }
                  return prevProgress + 0.5; 
                });
            }, snippetLength * 10); 
        }
    }, [songPreviewUrl]);

    useEffect(() => {
        const fetchSuggestions = async () => {
          try {
            const data = await fetchSongTitleSuggestions(artistName);
            setSongSuggestions(data);
          } catch (error) {
            console.error('Error fetching song suggestions:', error);
          }
        };
    
        fetchSuggestions();
    }, []);

    // Handle snippet length change
    //this should reset the streak in the new mode ! 
    const handleSnippetLengthChange = (value) => {
        // Directly set snippetLength from the value passed by Radio
        setSnippetLength(parseInt(value, 10)); // Convert string to number
    };

    const handleFetchSnippet = async () => {
        try {
            const { song, previewUrl } = await fetchSnippet(artistName);
            setSong(song);
            setSongPreviewUrl(previewUrl);
            setError(null); // Clear any previous error
        } catch (err) {
            setError(err.message);
        }
    };

    const playSnippet = () => {
        if (playCount >= 2) {
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

              //this is the part that controls the ring progress, and pauses after 3 seconds
              const id = setInterval(() => {
                console.log("entered interval : " + progress);
                setProgress((prevProgress) => {
                  if (prevProgress >= 100) {
                    clearInterval(id); // Stop the interval once it reaches 100%
                    audio.pause();
                    handleAudioEnded();
                    return 100;
                  }
                  return prevProgress + 1; // Increment progress by 1
                });
              }, snippetLength * 10); // Adjust the speed by changing the interval time (ms)
            
            setIntervalId(id);

            // setTimeout(() => {
            //     audio.pause();
            //     setIsPlaying(false);
            //     clearInterval(id);
            //     handleAudioEnded();
            // }, 3000); // Stop playback after 3 seconds
            }).catch((error) => {
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
        normalizedSongTitle = normalizedSongTitle.replace('.', ''); 
        normalizedSongTitle = normalizedSongTitle.replace(',', ''); 
        normalizedSongTitle = normalizedSongTitle.replace(' ', ''); 
        const normalizedInputTitle = inputTitle.toLowerCase().replace(/\s+/g, '');
        console.log('Song title:', normalizedSongTitle);
        console.log('Input title:', normalizedInputTitle);

        if (normalizedInputTitle === normalizedSongTitle) {
            setLoadingMessage('Correct! Loading next song...');
            setIsLoadingNextSong(true); // Set loading next song state to true
            setTimeout(async () => {
                console.log("resetting game");

                setPlayCount(0); // Reset play count immediately
                setCurrentStreak(currentStreak + 1); // Increment the streak
                setInputTitle(''); // Reset input title
                setValidationMessage(''); // Reset validation message
            
                await handleFetchSnippet();
                setIsLoadingNextSong(false);
                clearInterval
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
            clearInterval
        }, 1300);
    }

    const handleBackClick = () => {
        navigate(-1); // Navigate to the previous page
    };

    const handleGearClick = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="game-container">
            <HeaderSimple className="header" />
            <div className="mode-header">
                <IconArrowNarrowLeft size={24}  onClick={handleBackClick}/>
                <h2>{artistName} Mode</h2>
                <ActionIcon 
                    size={24} 
                    style={{ 
                        backgroundColor: 'transparent',
                     }} 
                    onClick={handleGearClick}>
                    <IconSettings size={24} style={{ color: 'FFFFFF', backgroundColor: 'transparent'}}  />
                </ActionIcon>
            </div>
            <Card shadow="sm" padding = "0" radius = "md" className="game-card">
            {song && (
            <div className='card-content'>
              <div className="left-column">
            <div className = "left-content">
              <div className="stat">
                <IconBrandDeezer size={24} />
                <h2>{1 - playCount}</h2> 
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
                        autoPlay
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
                                disabled={playCount >= 1} // Disable button after 2 plays
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
                            clearable //TODO address this console error
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
            <Modal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Settings"
                centered 
            >
                <p>Choose the snippet length:</p>
                <Radio.Group
                    value={snippetLength.toString()} // Convert the number to string for Radio values
                    onChange={handleSnippetLengthChange} // Call handler on change
                    name="snippet-length"
                >
                    <Radio value="3" label="Easy" />
                    <Radio value="2" label="Medium" />
                    <Radio value="1" label="Hard" />
                </Radio.Group>
            </Modal>
        </div>
    );
};

export default Game;

