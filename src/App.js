import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Download from './pages/Download';
import NavBar from './components/NavBar';
import './App.css';
import QnAPage from './pages/QnAPage';
import Planificateur from './pages/Planificateur';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/download" element={<Download />} />
          <Route path="/qna" element={<QnAPage />} />
          <Route path="/planificateur" element={<Planificateur />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;