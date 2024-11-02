import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';


const App = () => {
    return (
    <Router>
        <Routes>
            <Route path="/login" element={<Login/>} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/" element = {<Login/>} />
        </Routes>
    </Router>
    );
};

export default App;
