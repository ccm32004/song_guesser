import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mantine/core'; // Import the Grid component
import { HeaderSimple } from '../components/Header';
import DashboardCard from '../components/DashboardCard'; // Import the CardComponent
import './Dashboard.css'; // Import the CSS file
import { fetchSnippet } from '../utils/api'; // Import the fetchSnippet function

//image file paths
import tsImage from '/ts.png'; // Adjust the path to your image file

//https://commons.wikimedia.org/wiki/File:Playboi_Carti_(cropped).jpg
import playboiCartiImage from '/Playboi_Carti.png'; // Adjust the path to your image file

//https://commons.wikimedia.org/wiki/File:FEQ_July_2018_The_Weeknd_(44778856382).jpg
import theWeekndImage from  '/theWeeknd.png'; // Adjust the path to your image file

const Dashboard = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const navigateToGamePage = async (artistName) => {
    try {
      const { song, previewUrl } = await fetchSnippet(artistName);
      setError(null); // Clear any previous error
      navigate('/game', { state: { song, songPreviewUrl: previewUrl, artistName} });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      <HeaderSimple className="header" />
      <h1>Choose an artist:</h1>
      <div className="grid-container">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <DashboardCard
            title="Taylor Swift"
            imageSrc={tsImage}
            buttonText="Begin game!"
            onButtonClick={() => navigateToGamePage('Taylor Swift')}
            error={error}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <DashboardCard
            title="Playboi Carti"
            imageSrc={playboiCartiImage} 
            buttonText="Begin game!"
            onButtonClick={() => navigateToGamePage('Playboi Carti')}
            error={error}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <DashboardCard
            title="The Weeknd"
            imageSrc={theWeekndImage}
            buttonText="Begin game!"
            onButtonClick={() => navigateToGamePage('The Weeknd')}
            error={error}
          />
        </Grid.Col>
      </Grid>
    </div>
    </div>
  );
};

export default Dashboard;