// HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Pages.css';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/get-started');
  };

  return (
    <div className="HomePage">
      <div className="HomePage-content">
        <h1 className="HomePage-title">Course Resumer</h1>
        <p className="HomePage-description">
          Welcome to Course Resumer, an innovative application designed to enhance your educational experience. 
          With Course Resumer, you can:
        </p>
        <div className="HomePage-features">
          <div className="HomePage-feature">
            <img src="https://via.placeholder.com/500x600" alt="Course Selection" className="HomePage-feature-image" />
            <p>Select from your study courses and receive a detailed resume of the selected course using AI.</p>
          </div>
          <div className="HomePage-feature">
            <img src="https://via.placeholder.com/500x600" alt="Exam Generation" className="HomePage-feature-image" />
            <p>Generate exam types based on those from past years to help you prepare effectively.</p>
          </div>
          <div className="HomePage-feature">
            <img src="https://via.placeholder.com/500x600" alt="Additional Features" className="HomePage-feature-image" />
            <p>Access a variety of other features tailored to support your learning journey.</p>
          </div>
        </div>
        <p className="HomePage-note">
          This application is intended for educational purposes, providing you with the tools you need to succeed in your studies.
        </p>
        <button className="style-button" onClick={handleGetStarted}>Get Started</button>
      </div>
    </div>
  );
}

export default HomePage;