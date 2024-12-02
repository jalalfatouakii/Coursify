// HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';


function HomePage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/get-started');
  };

  return (
    <div className="HomePage">
      <h1>Course Resumer</h1>
      <p>
        Welcome to Course Resumer, an innovative application designed to enhance your educational experience. 
        With Course Resumer, you can:
      </p>
      <ul>
        <li>Select from your study courses and receive a detailed resume of the selected course using AI.</li>
        <li>Generate exam types based on those from past years to help you prepare effectively.</li>
        <li>Access a variety of other features tailored to support your learning journey.</li>
      </ul>
      <p>
        This application is intended for educational purposes, providing you with the tools you need to succeed in your studies.
      </p>
      <button onClick={handleGetStarted}>Get Started</button>
    </div>
  );
}

export default HomePage;