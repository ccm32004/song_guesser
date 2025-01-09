// Login.js
import React from 'react';
import { Button, Container, Title } from '@mantine/core';
import { HeaderSimple } from '../components/Header';
import './Login.css'; // Import the CSS file

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8888/login'; // TODO: put this in an env. 
  };

  return (
    <div className="login-container">
      <HeaderSimple className = "header"/>
      <Container size="xs" className="login-content">
        <Title order={1} style={{ color: 'white' }}>Login to Spotify</Title>
        <Button
          variant="filled"
          color= "#8933D4"
          onClick={handleLogin}
          style={{ marginTop: '20px' }} //TODO: put this in a css file
        >
          Login with Spotify
        </Button>
      </Container>
    </div>
  );
};

export default Login;