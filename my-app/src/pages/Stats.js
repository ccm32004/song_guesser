import React, { useState, useEffect } from 'react';
import { HeaderSimple } from '../components/Header';
import {Button, Loader} from '@mantine/core';
import { Carousel } from '@mantine/carousel'; // Import Carousel from Mantine
import { CompositeChart } from '@mantine/charts';
import { deleteAllUsers } from '../utils/api';
import {fetchUserProfile, fetchUserStats} from '../utils/api';
import StatsCard from '../components/StatsCard'; // Import the StatsCard component
import styles from './indicator.module.css'
import './Stats.css';
import '@mantine/carousel/styles.css'; 

//TODO: add a loading icon to this screen bestie while its getting login info lest u end up with a flickering situation

const Stats = () => {
    const [userStats, setUserStats] = useState(null);
    const [error, setError] = useState(null);
    const [artistsData, setArtistsData] = useState([]);
    const [loading, setLoading] = useState(true); 

    //TO FETCH THE USER PROFILE FUNCTION AND CHECK IF IT RETURNS ANYRTHING
    // Dummy data for different user stats
    const artistStatsData = [
        {
            artist: 'Taylor Swift',
            streaks: { easy: 0, medium: 0, hard: 0 },
            chartData: [10, 20, 40, 20, 40, 10, 50, 60, 70, 100]
        },
        {
            artist: 'the Weeknd',
            streaks: { easy: 0, medium: 0, hard: 0},
            chartData: [10, 20, 40, 20, 40, 10, 50, 60, 70, 100]
        },
        {
            artist: 'Playboi Carti',
            streaks: { easy: 0, medium: 0, hard: 0 },
            chartData: [10, 20, 40, 20, 40, 10, 50, 60, 70, 100]
        },
    ];

    const data = [
        {
            date: 'Mar 22',
            Apples: 1890,
            Oranges: 1338,
            Tomatoes: 2452,
        },
        {
            date: 'Mar 23',
            Apples: 1756,
            Oranges: 1103,
            Tomatoes: 2402,
        },
        {
            date: 'Mar 24',
            Apples: 1322,
            Oranges: 986,
            Tomatoes: 1821,
        },
        {
            date: 'Mar 25',
            Apples: 1470,
            Oranges: 1108,
            Tomatoes: 2809,
        },
        {
            date: 'Mar 26',
            Apples: 1129,
            Oranges: 726,
            Tomatoes: 2290,
        },
        // New data
        {
            date: 'Mar 27',
            Apples: 1603,
            Oranges: 1184,
            Tomatoes: 1952,
        },
        {
            date: 'Mar 28',
            Apples: 1678,
            Oranges: 1295,
            Tomatoes: 2201,
        },
        {
            date: 'Mar 29',
            Apples: 1553,
            Oranges: 1089,
            Tomatoes: 2083,
        },
        {
            date: 'Mar 30',
            Apples: 1402,
            Oranges: 1122,
            Tomatoes: 2379,
        },
    ];

    useEffect(() => {
        const getUserData = async () => {
            try {
                const profile = await fetchUserProfile();

                if (profile && profile.display_name) {
                    const userStats = await fetchUserStats();

                    if (userStats) {
                        setUserStats(userStats);
                        console.log(userStats);

                        if (userStats.artists.length !== 0){
                            console.log('User has artists stats data');
                            const transformedData = userStats.artists.map((artist) => ({
                                artist: artist.artistName,
                                streaks: {
                                  easy: artist.highScores.easy.score,
                                  medium: artist.highScores.medium.score,
                                  hard: artist.highScores.hard.score,
                                },
                                chartData: [10, 20, 40, 20, 40, 10, 50, 60, 70, 100], // Example chart data
                            }));
                            setArtistsData(transformedData); // Update the state with the transformed data
                        } else {
                            setArtistsData(artistStatsData);
                        }
                    } else {
                        setError('Error fetching user stats');
                    }
                } else {
                    setError('Error fetching user profile for stats');
                }
            } catch (error) {
                setArtistsData(artistStatsData);
                console.error(error);
            } finally {
                setLoading(false); // Set loading to false when data fetch is complete
            }
        };

        getUserData();
    }, []);

    const handleLogin = () => {
        window.location.href = import.meta.env.VITE_LOGIN_URL;
    };

    if (loading) {
        // Show loading spinner while data is being fetched
        return (
            <div className="loading-container">
                <Loader size="xl" />
            </div>
        );
    }

    return (
        <div className="stats-container">
            <HeaderSimple />

            {error ? (
                <div>{error}</div>
            ) : userStats ? (
                <div>
                    <h1>{userStats.displayName}'s Longest Streaks</h1>
                    <Carousel
                        className="carousel-container"
                        withIndicators
                        slideSize="75%"
                        classNames={{
                            indicators: styles.indicators,
                            indicator: styles.indicator,
                            controls: styles.controls,
                        }}>
                        {artistsData.map((data, index) => (
                            <Carousel.Slide key={index} className="carousel-slide">
                                <StatsCard
                                    artist={data.artist}
                                    streaks={data.streaks}
                                    chartData={data.chartData}
                                    className="stats-card"
                                />
                            </Carousel.Slide>
                        ))}
                    </Carousel>
                </div>
            ) : (
                <div className="not-loggedin-outer">
                    <h1>Your Longest Streaks</h1>
                    <div className="not-loggedin">
                        <CompositeChart
                            h={280}
                            w="70%"
                            data={data}
                            dataKey="date"
                            maxBarWidth={35}
                            series={[
                                { name: 'Tomatoes', color: 'rgba(44, 28, 57, 0.9)', type: 'bar' },
                                { name: 'Apples', color: 'rgba(192, 72, 72)', type: 'line' },
                                { name: 'Oranges', color: '#b078df', type: 'area' },
                            ]}
                            curveType="linear"
                            tickLine="none"
                            gridAxis="none"
                            withXAxis={false}
                            withYAxis={false}
                            withTooltip={false}
                        />
                        <div className="login-message-container">
                            Please log in to view your stats!
                        </div>
                        <Button className="login-button" onClick={handleLogin}>
                            Login with Spotify
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
    

//     useEffect(() => {
//         const getUserData = async () => {
//             const profile = await fetchUserProfile();

//             if (profile && profile.display_name) {
//                 const userStats = await fetchUserStats();

//                 if (userStats) {
//                     setUserStats(userStats);
//                     console.log(userStats);

//                     if (userStats.artists.length !== 0){
//                         console.log('User has artists stats data');
//                         const transformedData = userStats.artists.map((artist) => ({
//                             artist: artist.artistName,
//                             streaks: {
//                               easy: artist.highScores.easy.score,
//                               medium: artist.highScores.medium.score,
//                               hard: artist.highScores.hard.score,
//                             },
//                             chartData: [10, 20, 40, 20, 40, 10, 50, 60, 70, 100], // Example chart data
//                         }));
//                         setArtistsData(transformedData); // Update the state with the transformed data
//                     }else{
//                         setArtistsData(artistStatsData);
//                     }
//                 }
//                 else {
//                     console.log('Error fetching user stats');
//                     setError('Error fetching user stats');
//                 }
//             } else{
//                 console.log('Error fetching user profile for stats');
//             }   
//         }
//         getUserData();
//     }, []);

//     const handleLogin = () => {
//         window.location.href = import.meta.env.VITE_LOGIN_URL; 
//     };

//     return (
//         <div className = "stats-container">
//             <HeaderSimple />

//             {error ? (
//                 <div>{error}</div>
//       ) : userStats ? (
//         <div>
//             <h1>{userStats.displayName}'s Longest Streaks</h1>
//             <Carousel
//                     className="carousel-container"
//                     withIndicators  
//                     slideSize="75%"
//                     classNames={{
//                         indicators: styles.indicators,
//                         indicator: styles.indicator,
//                         controls: styles.controls,
//                     }}>
//                     {artistsData.map((data, index) => (
//                         <Carousel.Slide key={index} className="carousel-slide">
//                             <StatsCard 
//                             artist={data.artist} 
//                             streaks={data.streaks} 
//                             chartData={data.chartData} 
//                             className="stats-card"
//                             />
//                         </Carousel.Slide>
//                         ))}
//                 </Carousel >   
//             </div>       
//       ) : (

//         <div className = "not-loggedin-outer">
//             <h1>Your Longest Streaks</h1>
//                 <div className = "not-loggedin">
//                 <CompositeChart
//                         h={280}
//                         w="70%" 
//                         data={data}
//                         dataKey="date"
//                         maxBarWidth={35}
//                         series={[
//                             { name: 'Tomatoes', color: 'rgba(44, 28, 57, 0.9)', type: 'bar' },
//                             { name: 'Apples', color: 'rgba(192, 72, 72)', type: 'line' },
//                             { name: 'Oranges', color: '#b078df', type: 'area' },
//                         ]}
//                         curveType="linear"
//                         tickLine="none"
//                         gridAxis="none"
//                         withXAxis={false}
//                         withYAxis={false}
//                         withTooltip={false}
//                     />
//                     <div className="login-message-container">
//                         Please log in to view your stats!
//                     </div>
//                     <Button className = "login-button" onClick = {handleLogin}> Login with Spotify</Button>
//                 </div>
//         </div>
//         )}
                
//         {/* <button onClick={deleteAllUsers}>Delete All Users</button> */}
//         </div>
       
//     );
// }

export default Stats;
