import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Stats from './pages/Stats';


const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/game" element={<Game/>} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/" element={<Login />} />
    </Routes>
  );
};

export default App;