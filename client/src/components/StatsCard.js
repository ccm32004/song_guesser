// StatsCard.js
import React from 'react';
import { IconPlaylist } from '@tabler/icons-react';
import { Sparkline } from '@mantine/charts'; 
import './StatsCard.css';

const StatsCard = ({ artist, streaks, chartData }) => {
  return (
    <div className="outer-container">
      <div className="row">
        {/* First column containing the artist portrait */}
        <div className="column image-column">
          <div className="microphone-icon">
            <IconPlaylist size={48} /> {/* Icon size can be adjusted here */}
          </div>
          <p className="artist-name"> {artist}</p>
        </div>

        {/* Second column containing the chart */}
        <div className="column chart-column">
          <Sparkline
            w={450}
            h={100}
            data={chartData} // Dynamic data for each artist
            curveType="linear"
            color="purple"
            fillOpacity={0.8}
            strokeWidth={2}
          />
        </div>
      </div>

      {/* Streak content below the row */}
      <div className="card-content-stats">
        <div className="streak-item">
          <div className="text-content">
            <p className="streak-value">{streaks.easy}</p>
            <h3 className="streak-heading">Easy Mode</h3>
          </div>
        </div>

        <div className="streak-item">
          <div className="text-content">
            <p className="streak-value">{streaks.medium}</p>
            <h3 className="streak-heading">Medium Mode</h3>
          </div>
        </div>

        <div className="streak-item">
          <div className="text-content">
            <p className="streak-value">{streaks.hard}</p>
            <h3 className="streak-heading">Hard Mode</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
