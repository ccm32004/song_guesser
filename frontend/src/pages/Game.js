import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Center,
  ActionIcon,
  Autocomplete,
  Button,
  Card,
  Loader,
  Modal,
  Radio,
} from "@mantine/core";
import {
  IconBrandDeezer,
  IconFlameFilled,
  IconArrowNarrowLeft,
  IconSettings,
  IconLeaf,
} from "@tabler/icons-react"; 
import {
  fetchSnippet,
  fetchSongTitleSuggestions,
  fetchUserProfile,
  updateHighScore,
} from "../utils/api"; 
import { HeaderSimple } from "../components/Header";
import "./Game.css"; 
import styles from "./autocomplete.module.css";

//components imported
import PlayButton from "../components/PlayButton";

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();

  //these are the initial values when you first enter the page
  const {
    song: initialSong,
    songPreviewUrl: initialSongPreviewUrl,
    artistName,
  } = location.state || {};

  const [song, setSong] = useState(initialSong);
  const [songPreviewUrl, setSongPreviewUrl] = useState(initialSongPreviewUrl);

  const [inputTitle, setInputTitle] = useState("");
  const [validationMessage, setValidationMessage] = useState(" ");
  const [progress, setProgress] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(false); 
  const [intervalId, setIntervalId] = useState(null); 
  const [error, setError] = useState(null);
  const [playCount, setPlayCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const audioRef = useRef(null);
  const [isLoadingNextSong, setIsLoadingNextSong] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading next song...");
  const inputRef = useRef(null); //reference to input field 9mb undo cuz this function isn't really working
  const [songSuggestions, setSongSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [snippetLength, setSnippetLength] = useState(2);

  //stuff for keeping the high score
  const [loggedIn, setLoggedIn] = useState(false); 
  const [userHighScore, setUserHighScore] = useState(0);

  //state variable to track whether the track is started or not (for the ring progress)
  const [isTrackStarted, setIsTrackStarted] = useState(false);
  const [isPreviewUrlChanged, setIsPreviewUrlChanged] = useState(true);

  const difficultyMap = {
    3: "easy", // Easy = 3 seconds
    2: "medium", // Medium = 2 seconds
    1: "hard", // Hard = 1 second
  };

   //TODO: remove the functionality of the play button 

  function setProgressIndicator() {
    const id = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(id); // Stop the interval once it reaches 100%
          if (audioRef.current) {
            audioRef.current.pause();
          }
          handleAudioEnded();
          return 100;
        }
        return prevProgress + 0.85; 
      });
    }, snippetLength * 10);
    setIntervalId(id);
  }

  //only run if the song preview url changes
  useEffect(() => {
    if (audioRef.current && songPreviewUrl && isTrackStarted & isPreviewUrlChanged) {
      if (intervalId) {
        clearInterval(intervalId);
      }
      setProgressIndicator();
    }
  }, [isTrackStarted]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await fetchSongTitleSuggestions(artistName);
        setSongSuggestions(data);
      } catch (error) {
        console.error("Error fetching song suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const result = await fetchUserProfile();

      if (result.display_name) {
        setLoggedIn(true);
      } else {
        setLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  const handleSnippetLengthChange = (value) => {
    setSnippetLength(parseInt(value, 10));
  };

  const handlePlay = () => {
    setIsTrackStarted(true);
  };

  const handleFetchSnippet = async () => {
    try {
      const { song, previewUrl } = await fetchSnippet(artistName);
      setSong(song);
      setIsPreviewUrlChanged(true);
      setSongPreviewUrl(previewUrl);
      setError(null); 
    } catch (err) {
      setError(err.message);
    }
  };

  const playSnippet = () => {
    if (playCount >= 2) {
      setValidationMessage("You have reached the maximum number of plays.");
      return;
    }

    setIsPlaying(true);

    if (audioRef.current) {
      const audio = audioRef.current;
      const duration = audio.duration;
      const maxStartTime = duration - 3; // Ensures there is enough time for 3 second snippet
      const startTime = Math.random() * maxStartTime;

      audio.currentTime = startTime;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setPlayCount((prevPlayCount) => prevPlayCount + 1);
            // Increment play count, ensures it updated based on most recent state value, rather than the version existing in the render
            //typically it is no applied immediately, rahter it is scheduled to applied in the next render (which is why it is one behind)
            setProgress(0);
            setProgressIndicator();
          })
          .catch((error) => {
            console.error("Auto-play was prevented:", error);
            setIsPlaying(false);
          });
      }
    } else {
      console.error("Audio ref not found");
    }
  };

  const stopSnippet = () => {
    //TODO: mb remove this, do users really need to be able to stop the button from playing
    setIsPlaying(false);
    clearInterval(intervalId); // Clear the interval when stopping
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const validateTitle = () => {
    var normalizedSongTitle = song.title.toLowerCase().replace(/\s+/g, "");
    normalizedSongTitle = normalizedSongTitle.replace( /\(taylor'sversion\)/g,"");
    normalizedSongTitle = normalizedSongTitle.replace(/\(feat\..*?\)/g, ""); 
    normalizedSongTitle = normalizedSongTitle.replace(/\(.*?version\)/g, ""); 
    normalizedSongTitle = normalizedSongTitle.replace(".", "");
    normalizedSongTitle = normalizedSongTitle.replace(",", "");
    normalizedSongTitle = normalizedSongTitle.replace(" ", "");
    normalizedSongTitle = normalizedSongTitle.split("-")[0];
    normalizedSongTitle = normalizedSongTitle.replace(/\(.*?\)/g, ""); 
    normalizedSongTitle = normalizedSongTitle.replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters

    var normalizedInputTitle = inputTitle.toLowerCase().replace(/\s+/g, "");
    normalizedInputTitle = normalizedInputTitle.replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters from input titles

    console.log("Song title:", normalizedSongTitle);
    console.log("Input title:", normalizedInputTitle);

    if (normalizedInputTitle === normalizedSongTitle) {
      setLoadingMessage("Correct! Loading next song...");
      setIsLoadingNextSong(true); 
      setProgress(0);
      
      setTimeout(async () => {
        await incrementCurrentStreak();
        setPlayCount(0); 
        setInputTitle(""); 
        setValidationMessage(""); 
        await handleFetchSnippet();
        setIsLoadingNextSong(false);
        clearInterval;
      }, 1300);


    } else {
      setValidationMessage("Incorrect. Try again!");
      setTimeout(() => {
        setValidationMessage(" "); // Clear the validation message after 3 seconds
      }, 500);
    }
  };

  const incrementCurrentStreak = async () => {
    const updatedStreak = currentStreak + 1;

    if (loggedIn && updatedStreak > userHighScore) {
      try {
        const response = await updateHighScore(
          artistName,
          difficultyMap[snippetLength],
          updatedStreak
        );

        if (response.status === 200) {
          setUserHighScore(response.highScore);
          console.log(
            "User high score updated successfully:",
            response.highScore
          );
          setCurrentStreak(updatedStreak);
          console.log("current streak updated: " + currentStreak);
        } else {
          alert(response.message); 
        }
      } catch (error) {
        console.error("Error updating high score:", error);
      }
    } else {
      console.log("current streak updated wo login: " + updatedStreak);
      setCurrentStreak(updatedStreak);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsPlaying(false);
    validateTitle();
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setIsTrackStarted(false);
    setIsPreviewUrlChanged(false);
  };

  const skipSnippet = async (isNewDifficulty) => {
    const loadingMessage = isNewDifficulty 
        ? `Setting difficulty: \n${difficultyMap[snippetLength]}` 
        : `Answer: \n${song.title}`;

    setLoadingMessage(loadingMessage);
    setIsLoadingNextSong(true); 
    setProgress(0);
    
    setTimeout(async () => {
      setInputTitle(""); 
      setPlayCount(0); 
      setCurrentStreak(0);
      setValidationMessage(""); 
      await handleFetchSnippet(); 
      setIsLoadingNextSong(false); 
      clearInterval;
    }, 1300);
  };

  const handleBackClick = () => {
    navigate(-1); 
  };

  const handleGearClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="game-container">
      <HeaderSimple className="header" />
      <div className="mode-header">
        <IconArrowNarrowLeft size={24} onClick={handleBackClick} />
        <h2>{artistName} Mode</h2>
        <ActionIcon
          size={24}
          style={{
            backgroundColor: "transparent",
          }}
          onClick={handleGearClick}
        >
          <IconSettings
            size={24}
            style={{ color: "FFFFFF", backgroundColor: "transparent" }}
          />
        </ActionIcon>
      </div>
      <Card shadow="sm" padding="0" radius="md" className="game-card">
        {song && (
          <div className="card-content">

            <div className="left-column">
              <div className="left-content">

              <div className = "stats-info-container">
                <div className="stat">
                  <IconBrandDeezer size={24} />
                  <h2>{1 - playCount}</h2>
                </div>
                  <h5>Plays Left For Song</h5>
                </div>

                <div className = "stats-info-container">
                <div className="stat">
                  <IconFlameFilled size={24} />
                  <h2>{currentStreak}</h2>
                </div>
                  <h5> Streak </h5>
                </div>

              </div>
            </div>

            <div className="right-column">
              {isLoadingNextSong ? (
                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  {loadingMessage.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                  <Loader color="#916691" style={{ marginTop: "35px" }} />
                </div>
              ) : (
                <>
                  <audio
                    key={song.uri}
                    ref={audioRef}
                    controls
                    style={{ display: "none" }} 
                    autoPlay
                    onPlay={handlePlay}
                  >
                    <source src={songPreviewUrl} type="audio/mpeg" />
                    Your browser does not support the audio tag.
                  </audio>

                  <Center
                    style={{
                      flexDirection: "column",
                      alignItems: "center",
                      marginTop: 20,
                    }}
                  >
                    <PlayButton
                      progress={progress}
                      isPlaying={isPlaying}
                      playCount={playCount}
                      stopSnippet={stopSnippet}
                      playSnippet={playSnippet}
                    />
                  </Center>

                  <Button
                    onClick={() => skipSnippet(false)}
                    variant="outline"
                    color="gray"
                    className="skip-button"
                  >
                    <span>Skip</span>
                  </Button>

                  <form
                    onSubmit={handleSubmit}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "13px",
                    }}
                  >
                    <Autocomplete
                      clearable //TODO address this console error
                      autoFocus
                      value={inputTitle}
                      onChange={setInputTitle}
                      variant="filled"
                      placeholder="Type the song..."
                      width="100%"
                      data={songSuggestions}
                      ref={inputRef} 
                      comboboxProps={{
                        position: "bottom",
                        middlewares: { flip: false, shift: false },
                        offset: 0,
                        transitionProps: { transition: 'scale-y', duration: 150 },
                      }}
                      classNames={{
                        input: styles.input, 
                        dropdown: styles.dropdown, 
                        option: styles.option, 
                      }}
                    />
                  </form>

                  <p className="validation-message" style={{ color: "white" }}>
                    {validationMessage}
                  </p>
                  {error && <p style={{ color: "red" }}>{error}</p>}
                </>
              )}
            </div>
           
          </div>
        )}
      </Card>
      <Modal
        opened={isModalOpen}
        onClose={() => {setIsModalOpen(false); skipSnippet(true)}}
        title= {
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconLeaf size={24} style={{ marginRight: '8px' }} /> 
            Choose the snippet length
          </div>
        }
        centered
        className="centered-modal-content"
      >
        <Radio.Group
          value={snippetLength.toString()} 
          onChange={handleSnippetLengthChange} 
          name="snippet-length"
          className="centered-radio-group" 
        >
          <Radio value="3" label="Easy (3 seconds)" />
          <Radio value="2" label="Medium (2 seconds)" />
          <Radio value="1" label="Hard (1 second)" />
        </Radio.Group>

        <Button
          onClick={() => {setIsModalOpen(false); skipSnippet(true)}}
          className = "close-button" 
          style={{ marginTop: "20px" }}
        >
          Close
        </Button>

      </Modal>
    </div>
  );
};

export default Game;
