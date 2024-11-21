// Login.js
import React from 'react';
import { Button, CloseButton, Container, Title } from '@mantine/core';
import { HeaderSimple } from '../components/Header';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8888/login'; // Redirect to your login endpoint
  };

  return (
    <Container size="xs" style={{ textAlign: 'center', marginTop: '50px' }}>
      <Title order={1}>Login to Spotify</Title>
      <Button 
        variant="filled" 
        color="violet"
        onClick={handleLogin} 
        style={{ marginTop: '20px' }}>
        Login with Spotify
      </Button>
    </Container>
  );
};

export default Login;
