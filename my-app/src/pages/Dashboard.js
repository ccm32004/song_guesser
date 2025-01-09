// // Dashboard.js
// import React, { useRef, useState, useEffect } from 'react';
// import { RingProgress, Center, ActionIcon, Button, Autocomplete, Card} from '@mantine/core';
// import { IconPlayerPlay } from '@tabler/icons-react'; // Play Icon
// import { HeaderSimple } from '../components/Header';
// import tsImage from '/ts.png'; // Adjust the path to your image file
// import './Dashboard.css'; // Import the CSS file

// const Dashboard = () => {
//     const [song, setSong] = useState(null);
//     const [songPreviewUrl, setSongPreviewUrl] = useState(null);
//     const [error, setError] = useState(null);
//     const [inputTitle, setInputTitle] = useState('');
//     const [validationMessage, setValidationMessage] = useState('');
//     const audioRef = useRef(null);

//     const [progress, setProgress] = useState(0); // Progress state
//     const [isPlaying, setIsPlaying] = useState(false); // Track if the play button is pressed
//     const [intervalId, setIntervalId] = useState(null); // Track interval ID for clearing

//     const fetchSnippet = async () => {
//         try {
//             const response = await fetch('http://localhost:8888/getTrackId', {
//                 credentials: 'include', // Include cookies
//             });
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }

//             const data = await response.json();
//             setSong(data);
//             setError(null); // Clear any previous error

//             //testing the new workaround 
//             const trackId = data.uri.split(':').pop(); // Get the last part of the URI
//             const trackResponse = await fetch(`http://localhost:8888/track/${trackId}`);

//             if (!trackResponse.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             else{
//                 const data = await trackResponse.json();
//                 const previewUrl = data.previewUrl;
//                 console.log('Preview URL:', previewUrl);
//                 setSongPreviewUrl(previewUrl);
//             }

//         } catch (err) {
//             console.error('Error fetching the snippet or track details:', err);
//             setError('Error fetching the song snippet or track details.');
//             setSong(null); // Clear any previous song data
//         }
//     };

//     const playSnippet = () => {
//         // Reset progress when starting a new snippet
//         setProgress(0);
//         setIsPlaying(true);

//         if (audioRef.current) {
//             const audio = audioRef.current;
//             const duration = audio.duration;
//             const maxStartTime = duration - 3; // Ensures there is enough time for 3 second snippet
//             const startTime = Math.random() * maxStartTime;

//             audio.currentTime = startTime;
//             audio.play();

//             const id = setInterval(() => {
//                 setProgress((prevProgress) => {
//                     if (prevProgress >= 100) {
//                         clearInterval(id); // Stop the interval once it reaches 100%
//                         audio.pause();
//                         return 100;
//                     }
//                     return prevProgress + 1; // Increment progress by 1
//                 });
//             }, 30); // Adjust the speed by changing the interval time (ms)

//             setIntervalId(id);

//             setTimeout(() => {
//                 audio.pause();
//                 setIsPlaying(false);
//                 clearInterval(id);
//             }, 3000); // Stop playback after 3 seconds
//         } else {
//             console.error('Audio ref not found');
//         }
//     };

//     const stopSnippet = () => {
//         setIsPlaying(false);
//         clearInterval(intervalId); // Clear the interval when stopping
//         if (audioRef.current) {
//             audioRef.current.pause();
//         }
//     };

//     const handleInputChange = (e) => {
//         console.log(e.target.value);
//     };

//     const validateTitle = () => {
//         const normalizedSongTitle = song.title.toLowerCase().replace(/\s+/g, '');
//         const normalizedInputTitle = inputTitle.toLowerCase().replace(/\s+/g, '');
//         console.log('Song title:', normalizedSongTitle);
//         console.log('Input title:', normalizedInputTitle);

//         if (normalizedInputTitle === normalizedSongTitle) {
//             setValidationMessage('Correct!');
//         }else{
//             setValidationMessage('Incorrect. Try again!');
//         }
//     };

//     useEffect(() => {
//         if (audioRef.current && songPreviewUrl) {
//             audioRef.current.load(); // Reload the audio element when the URL changes
//         }
//     }, [songPreviewUrl]);

//     return (
//         <div className="dashboard-container">
//             <HeaderSimple className = "header" />
//             <Card shadow="sm" padding="lg" style={{ marginBottom: 20 , marginLeft: '20px', marginRight: '20px', backgroundColor: 'rgba(68, 0, 97, 0.7)',  display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
//             <h3 style={{marginTop: 0, flex: 1}}>Taylor Swift</h3>
//             <img src={tsImage} alt="Taylor Swift" style={{ width: '50%', height: 'auto', marginBottom: 20, flex: 1}}/>
//             <Button color = "white" variant="outline" onClick={fetchSnippet} style={{ flex: 1, padding: '10px'}}>Begin game !</Button> {/* TODO: figure out how to make button color universal purple vibes */}
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             {song && (
//                 <div>
//                     {console.log('Rendering song:', song)} {/* Log the song details */}
//                     <audio 
//                         key={song.uri} 
//                         ref={audioRef}
//                         controls
//                         style={{ display: 'none' }} // Hide the audio player
//                         >

//                         {console.log("rendering url", songPreviewUrl)}
//                         <source src={songPreviewUrl} type="audio/mpeg" />
//                         Your browser does not support the audio tag.
//                     </audio>

                
//                     <Center style={{ flexDirection: 'column', alignItems: 'center', marginTop: 20 }}>
//                         <div style={{ position: 'relative', display: 'inline-block' }}>
//                             <RingProgress
//                                 size={120}
//                                 thickness={8}
//                                 sections={[{ value: progress, color: 'blue' }]}
//                             />
//                             <ActionIcon
//                                 size="xl"
//                                 color="blue"
//                                 variant="filled"
//                                 style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
//                                 onClick={isPlaying ? stopSnippet : playSnippet}
//                             >
//                                 <IconPlayerPlay size={24} />
//                             </ActionIcon>
//                         </div>
//                     </Center>

//                     <div>
//                         <Autocomplete
//                             value={inputTitle}
//                             onChange={setInputTitle}
//                             placeholder="Enter the song title"
//                             data={[]} // You can provide a list of suggestions here
//                         />
//                         <button onClick={validateTitle}>Check Answer</button>
//                         <p>{validationMessage}</p>
//                     </div>
//             </div>
//             )}
//         </Card>
//         </div>
//     );
// };

// export default Dashboard;

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@mantine/core';
import { HeaderSimple } from '../components/Header';
import tsImage from '/ts.png'; // Adjust the path to your image file
import './Dashboard.css'; // Import the CSS file
import { fetchSnippet } from '../utils/api'; // Import the fetchSnippet function

const Dashboard = () => {
    const [song, setSong] = useState(null);
    const [songPreviewUrl, setSongPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleFetchSnippet = async () => {
        try {
            const { song, previewUrl } = await fetchSnippet();
            setSong(song);
            setSongPreviewUrl(previewUrl);
            setError(null); // Clear any previous error

            // Navigate to the Game component with song data
            navigate('/game', { state: { song, songPreviewUrl: previewUrl } });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="dashboard-container">
            <HeaderSimple className="header" />
            <Card shadow="sm" padding="lg" style={{ marginBottom: 20, marginLeft: '20px', marginRight: '20px', backgroundColor: 'rgba(68, 0, 97, 0.7)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ marginTop: 0 }}>Taylor Swift</h3>
                <img src={tsImage} alt="Taylor Swift" style={{ width: '50%', height: 'auto', marginBottom: 20 }} />
                <Button color="white" variant="outline" onClick={handleFetchSnippet} style={{ padding: '10px' }}>Begin game!</Button>
            </Card>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Dashboard;