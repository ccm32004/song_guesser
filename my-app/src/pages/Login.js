// Login.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Button, Container, Title } from '@mantine/core';
import { HeaderSimple } from '../components/Header';
import './Login.css'; // Import the CSS file

const Login = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    window.location.href = import.meta.env.VITE_LOGIN_URL; // TODO: put this in an env. 
  };

  const handlePlayWithoutLogin = () => {
    navigate('/dashboard'); // Redirect to the dashboard page
  };

  return (
    <div className="login-container">
      <HeaderSimple className = "header"/>
      <Container size="xs" className="login-content">
        <Title>Welcome</Title>
        <p> Test your knowledge of your favourite artists</p>
        <div className="button-group">
        <Button
            onClick={handlePlayWithoutLogin} //TODO: fix this it doesn't hover properly for some reason
            className="play-button"
          >
            Play Now
          </Button>
          {/* <Button
            onClick={handleLogin}
            className="login-button"
          >
            Login with Spotify
          </Button> */}
        </div>   
      </Container>
    </div>
  );
};

export default Login;