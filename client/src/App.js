import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Game from './pages/Game';
import Stats from './pages/Stats';


const App = () => {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/game" element={<Game/>} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default App;