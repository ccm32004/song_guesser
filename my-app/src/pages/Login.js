// Login.js
import React from 'react';

const Login = () => {
    const handleLogin = () => {
        window.location.href = 'http://localhost:8888/login'; // Redirect to your login endpoint
    };

    return (
        <div>
            <h1>Login to Spotify</h1>
            <button onClick={handleLogin}>Login with Spotify</button>
        </div>
    );
};

export default Login;
