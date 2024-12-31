// // // Login.js
// import React from 'react';
// import { Button, CloseButton, Container, Title } from '@mantine/core';
// import { HeaderSimple } from '../components/Header';
// import taylor from '../../public/ts.png';

// const Login = () => {
//   const handleLogin = () => {
//     window.location.href = 'http://localhost:8888/login'; // Redirect to your login endpoint
//   };

//   return (
//     <>
//     <HeaderSimple />
//     <Container size="xs" style={{ textAlign: 'center', marginTop: '50px' }}>
//     <img src={taylor} alt="taylor" style={{ width: '150px', marginBottom: '20px' }} />
//       <Title order={1}>Login to Spotify</Title>
//       <Button 
//         variant="filled" 
//         color="violet"
//         onClick={handleLogin} 
//         style={{ marginTop: '20px' }}>
//         Login with Spotify 
//       </Button>
//     </Container>
//     </>
//   );
// };

// export default Login;

// Login.js
import React from 'react';
import { Button, Container, Title } from '@mantine/core';
import { HeaderSimple } from '../components/Header';
import './Login.css'; // Import the CSS file

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8888/login'; // Redirect to your login endpoint
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
          style={{ marginTop: '20px' }}
        >
          Login with Spotify
        </Button>
      </Container>
    </div>
  );
};

export default Login;