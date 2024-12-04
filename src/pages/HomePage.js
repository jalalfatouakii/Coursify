// HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Pages.css';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/download');
  };

  return (
    <div className="HomePage">
      <div className="HomePage-content" >
        <h1 className="HomePage-title">Coursify</h1>
        <p className="HomePage-description">
          Welcome to Coursify, an innovative application designed to enhance your educational experience. 
          With Coursify, you can:
        </p>
        <div className="HomePage-features">
          <div id='downloader' className="HomePage-feature">
            <img src="downloader.png"  alt="Additional Features" className="HomePage-feature-image" />
            <p>Select and download the resources from any course of your choise.</p>
          </div>
          <div className="HomePage-feature">
            <img src="soon.jpg" alt="Course Selection" className="HomePage-feature-image" />
            <p>Receive a detailed resume of the selected course using AI.</p>
          </div>
          <div className="HomePage-feature">
            <img src="soon.jpg" alt="Exam Generation" className="HomePage-feature-image" />
            <p>Generate exam types based on those from past years to help you prepare effectively.</p>
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