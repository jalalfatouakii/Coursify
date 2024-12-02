import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import GetStarted from './GetStarted';
import NavBar from './NavBar';
import './App.css';
import AboutPage from './AboutPage';
import QnAPage from './QnAPage';

function App() {
  return (
    <Router>
      <NavBar />
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/qna" element={<QnAPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;