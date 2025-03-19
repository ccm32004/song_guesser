import React from 'react';
import { Card, Button } from '@mantine/core';
import './DashboardCard.css'; // Import the CSS file

const DashboardCard = ({ title, imageSrc, buttonText, onButtonClick, error }) => {
  return (
    <Card shadow="sm" padding="md" radius= "md" className="card-component">
    <Card.Section className="card-section">
      <img src={imageSrc} alt={title} />
    </Card.Section>
      <div className="card-component-content">
        <h3>{title}</h3>
        <Button color="white" variant="outline" onClick={onButtonClick}>
          {buttonText}
        </Button>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </Card>
  );
};

export default DashboardCard;