import React, { useState, useEffect } from 'react';
import { HeaderSimple } from '../components/Header.js';
import {Button, Loader} from '@mantine/core';
import { Carousel } from '@mantine/carousel'; // Import Carousel from Mantine
import { CompositeChart } from '@mantine/charts';
import { IconBrandSpotifyFilled } from '@tabler/icons-react';
import {fetchUserProfile, fetchUserStats} from '../utils/api.js';
import StatsCard from '../components/StatsCard.js'; // Import the StatsCard component
import {data, artistStatsData} from './graphdata.js'; // Import the JSON data
import './Stats.css';
import '@mantine/carousel/styles.css'; 


const Stats = () => {
    const [userStats, setUserStats] = useState(null);
    const [error, setError] = useState(null);
    const [artistsData, setArtistsData] = useState([]);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const getUserData = async () => {
            try {
                const profile = await fetchUserProfile();

                if (profile && profile.display_name) {
                    const userStats = await fetchUserStats();

                    if (userStats) {
                        setUserStats(userStats);

                        if (userStats.artists.length !== 0){
                            const transformedData = userStats.artists.map((artist) => ({
                                artist: artist.artistName,
                                streaks: {
                                  easy: artist.highScores.easy.score,
                                  medium: artist.highScores.medium.score,
                                  hard: artist.highScores.hard.score,
                                },
                                chartData: [10, 20, 40, 20, 40, 10, 50, 60, 70, 100], 
                            }));
                            setArtistsData(transformedData); 
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
                setLoading(false); 
            }
        };

        getUserData();
    }, []);

    const handleLogin = () => {
        window.location.href = import.meta.env.VITE_LOGIN_URL;
    };

    if (loading) {
        return (
            <div className="stats-container">
                <HeaderSimple />
                <div className="loading-container">
                    <Loader size="xl" />
                </div>
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
                        slideSize="75%">
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
                            <IconBrandSpotifyFilled size={20} className="icon" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};
    
export default Stats;
