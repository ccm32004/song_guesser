// Login.js
import React from 'react';
import { Button, Container, Title } from '@mantine/core';
import { HeaderSimple } from '../components/Header';
import './Login.css'; // Import the CSS file

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8888/login'; // TODO: put this in an env. 
  };

  const handlePlayWithoutLogin = () => {
    // Handle the action for playing without logging in
    console.log('Play without logging in');
  };

  return (
    <div className="login-container">
      <HeaderSimple className = "header"/>
      <Container size="xs" className="login-content">
        <Title>Welcome</Title>
        <p> Press button below to begin!</p>
        <div className="button-group">
          <Button
            onClick={handleLogin}
            className="login-button"
          >
            Login with Spotify
          </Button>
          <Button
            onClick={handlePlayWithoutLogin}
            className="play-button"
          >
            Play w/o Login
          </Button>
        </div>
        
      </Container>
    </div>
  );
};

export default Login;