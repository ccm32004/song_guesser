import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mantine/core'; // Import the Grid component
import { HeaderSimple } from '../components/Header';
import CardComponent from '../components/CardComponent'; // Import the CardComponent
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
      <div className="grid-container">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <CardComponent
            title="Taylor Swift"
            imageSrc={tsImage}
            buttonText="Begin game!"
            onButtonClick={handleFetchSnippet}
            error={error}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <CardComponent
            title="Artist 2"
            imageSrc={tsImage} // Replace with the actual image source
            buttonText="Begin game!"
            onButtonClick={handleFetchSnippet}
            error={error}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <CardComponent
            title="Artist 3"
            imageSrc={tsImage} // Replace with the actual image source
            buttonText="Begin game!"
            onButtonClick={handleFetchSnippet}
            error={error}
          />
        </Grid.Col>
      </Grid>
    </div>
    </div>
  );
};

export default Dashboard;