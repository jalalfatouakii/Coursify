import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GetStarted from './pages/GetStarted';
import NavBar from './components/NavBar';
import './App.css';
import AboutPage from './pages/AboutPage';
import QnAPage from './pages/QnAPage';

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