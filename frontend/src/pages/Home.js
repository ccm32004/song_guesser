import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Button, Container, Title } from '@mantine/core';
import { HeaderSimple } from '../components/Header';
import './Home.css'; 

const Home = () => {
  const navigate = useNavigate();

  const handlePlayWithoutLogin = () => {
    navigate('/dashboard'); 
  };

  return (
    <div className="login-container">
      <HeaderSimple className = "header"/>
      <Container size="xs" className="login-content">
        <Title>Welcome</Title>
        <p> Test your knowledge of your favourite artists</p>
        <div className="button-group">
        <Button
            onClick={handlePlayWithoutLogin} 
            className="play-button"
          >
            Play Now
          </Button>
        </div>   
      </Container>
    </div>
  );
};

export default Home;