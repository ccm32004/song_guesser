import React, { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RingProgress,
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
  IconPlayerPlayFilled,
  IconBrandDeezer,
  IconFlameFilled,
  IconArrowNarrowLeft,
  IconSettings,
} from "@tabler/icons-react"; // Play Icon
import {
  fetchSnippet,
  fetchSongTitleSuggestions,
  fetchUserProfile,
  updateHighScore,
} from "../utils/api"; // Import the fetchSnippet function
import { HeaderSimple } from "../components/Header";
import "./Game.css"; // Import the CSS file
import styles from "./test.module.css";

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
  const [progress, setProgress] = useState(0); // Progress state
  const [isPlaying, setIsPlaying] = useState(false); // Track if the play button is pressed
  const [intervalId, setIntervalId] = useState(null); // Track interval ID for clearing
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
  const [loggedIn, setLoggedIn] = useState(false); //TODO: change this to false later
  const [userHighScore, setUserHighScore] = useState(0);

  const difficultyMap = {
    3: "easy", // Easy = 3 seconds
    2: "medium", // Medium = 2 seconds
    1: "hard", // Hard = 1 second
  };

  useEffect(() => {
    if (audioRef.current && songPreviewUrl) {
      //audioRef.current.src = songPreviewUrl;
      //audioRef.current.load();
      //make the player reflect the current state of the audio element

      setProgress(0);
      if (intervalId) {
        clearInterval(intervalId);
      }
      //TODO: refactor laterr

      console.log("setting interval");
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
        console.error("Error fetching song suggestions:", error);
      }
    };
    fetchSuggestions();
  }, []);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const result = await fetchUserProfile();

      if (result.display_name) {
        console.log("user is logged in");
        setLoggedIn(true);
      } else {
        console.log("user is NOT logged in");
        setLoggedIn(false);
      }
    };
    checkLoginStatus();
  }, []);

  // Handle snippet length change
  //this should reset the streak in the new mode !
  const handleSnippetLengthChange = (value) => {
    setSnippetLength(parseInt(value, 10));
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
      setValidationMessage("You have reached the maximum number of plays.");
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
        playPromise
          .then(() => {
            setPlayCount((prevPlayCount) => prevPlayCount + 1);
            // Increment play count, ensures it updated based on most recent state value, rather than the version existing in the render
            //typically it is no applied immediately, rahter it is scheduled to applied in the next render (which is why it is one behind)

            console.log("playcount after autoplay works: " + playCount); // Increment play count

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
    normalizedSongTitle = normalizedSongTitle.replace(/\(feat\..*?\)/g, ""); // Remove (feat. [artist])
    normalizedSongTitle = normalizedSongTitle.replace(/\(.*?version\)/g, ""); // Remove (Live Version)
    normalizedSongTitle = normalizedSongTitle.replace(".", "");
    normalizedSongTitle = normalizedSongTitle.replace(",", "");
    normalizedSongTitle = normalizedSongTitle.replace(" ", "");
    normalizedSongTitle = normalizedSongTitle.split("-")[0];
    normalizedSongTitle = normalizedSongTitle.replace(/\(.*?\)/g, ""); // Remove anything in brackets
    normalizedSongTitle = normalizedSongTitle.replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters

    var normalizedInputTitle = inputTitle.toLowerCase().replace(/\s+/g, "");
    normalizedInputTitle = normalizedInputTitle.replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters

    console.log("Song title:", normalizedSongTitle);
    console.log("Input title:", normalizedInputTitle);

    if (normalizedInputTitle === normalizedSongTitle) {
      console.log("correct");
      setLoadingMessage("Correct! Loading next song...");
      setIsLoadingNextSong(true); // Set loading next song state to true
      setTimeout(async () => {
        console.log("resetting game");

        setPlayCount(0); // Reset play count immediately
        await incrementCurrentStreak();
        setInputTitle(""); // Reset input title
        setValidationMessage(""); // Reset validation message

        await handleFetchSnippet();
        setIsLoadingNextSong(false);
        clearInterval;
      }, 1300);
    } else {
      console.log("wrong");
      setValidationMessage("Incorrect. Try again!");
      setTimeout(() => {
        setValidationMessage(" "); // Clear the validation message after 3 seconds
      }, 500);
    }
  };

  const incrementCurrentStreak = async () => {
    // Get the current streak value before proceeding
    const updatedStreak = currentStreak + 1;

    console.log("current streak: " + updatedStreak);
    console.log("user high score: " + userHighScore);

    // Check if we are logged in and if the new streak is higher than the user's high score
    if (loggedIn && updatedStreak > userHighScore) {
      console.log("updating high score");

      try {
        // Call async function to update the high score
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
          alert(response.message); // Show error message if any
        }
      } catch (error) {
        console.error("Error updating high score:", error);
      }
    } else {
      // Just increment the streak if no need to update high score
      console.log("current streak updated wo login: " + updatedStreak);
      setCurrentStreak(updatedStreak);
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

  const skipSnippet = async (isNewDifficulty) => {
    // Determine the loading message based on the condition
    const loadingMessage = isNewDifficulty 
        ? `Setting new difficulty: \n${difficultyMap[snippetLength]}` 
        : `Answer: \n${song.title}`;

    setLoadingMessage(loadingMessage);

    setIsLoadingNextSong(true); // Set loading next song state to true
    setTimeout(async () => {
      setInputTitle(""); // Clear the input field
      setPlayCount(0); // Reset play count
      setCurrentStreak(0);
      setValidationMessage(""); // Reset validation message
      await handleFetchSnippet(); // Fetch a new snippet
      setIsLoadingNextSong(false); // Reset loading next song state after 2 seconds
      clearInterval;
    }, 1300);
  };

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
              {/* <div className="left-content"> */}

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

              {/* </div> */}
            </div>

            <div className="right-column">
              {isLoadingNextSong ? (
                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                    marginTop: "80px",
                  }}
                >
                  {loadingMessage.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                  <Loader color="#916691" style={{ marginTop: "20px" }} />
                </div>
              ) : (
                <>
                  <audio
                    key={song.uri}
                    ref={audioRef}
                    controls
                    style={{ display: "none" }} // Hide the audio player
                    autoPlay
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
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <RingProgress
                        size={150}
                        thickness={8}
                        rootColor="#44354f"
                        sections={[{ value: progress, color: "#73687b" }]}
                      />
                      <ActionIcon
                        size={60}
                        className="play-music-button"
                        color="violet"
                        variant="filled"
                        style={{
                          background: "#6d336d",
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          borderRadius: "50%",
                        }} //backgroundColor: '#5b4f65',
                        onClick={isPlaying ? stopSnippet : playSnippet}
                        disabled={playCount >= 1} // Disable button after 2 plays
                      >
                        <IconPlayerPlayFilled
                          size={24}
                          style={{ color: "e8e6e9" }}
                        />
                      </ActionIcon>
                    </div>
                  </Center>

                  <Button
                    onClick={() => skipSnippet(false)}
                    variant="outline"
                    color="gray"
                    className="skip-button"
                    style={{
                      backgroundColor: "transparent",
                      borderColor: "#5b4f65",
                      color: "white",
                      justifySelf: "right",
                      width: "80px",
                      marginTop: "10px",
                    }}
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
                      value={inputTitle}
                      onChange={setInputTitle}
                      variant="filled"
                      placeholder="Type the song..."
                      width="100%"
                      data={songSuggestions}
                      ref={inputRef} // Add ref to the input field
                      comboboxProps={{
                        position: "bottom",
                        middlewares: { flip: false, shift: false },
                        offset: 0,
                      }}
                      classNames={{
                        input: styles.input, // Apply the CSS class for input
                        dropdown: styles.dropdown, // Apply the CSS class for dropdown
                        option: styles.option, // Apply the CSS class for items
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
        title="Choose the snippet length:"
        centered
        className="centered-modal-content"
      >
        {/* <p>Choose the snippet length:</p> */}
        <Radio.Group
          value={snippetLength.toString()} // Convert the number to string for Radio values
          onChange={handleSnippetLengthChange} // Call handler on change
          name="snippet-length"
          className="centered-radio-group" 
        >
          <Radio value="3" label="Easy (3 seconds)" />
          <Radio value="2" label="Medium (2 seconds)" />
          <Radio value="1" label="Hard (1 second)" />
        </Radio.Group>

        <Button
          onClick={() => {setIsModalOpen(false); skipSnippet(true)}}
          style={{ marginTop: "20px" }}
        >
          Close
        </Button>


      </Modal>
    </div>
  );
};

export default Game;
