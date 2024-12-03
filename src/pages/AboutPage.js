// AboutPage.js
import React from 'react';
import '../styles/Pages.css';

function AboutPage() {
  return (
    <div className="AboutPage">
      <h1>About This Project</h1>
      <p>
        This project was made by Jalal Fatouaki and is inspired by the following work made by 0xD34DC0DE : 
        <a href="https://gist.github.com/0xD34DC0DE/fd7a269e4e7cb2e508c8a4b9ba1bad95" target="_blank" rel="noopener noreferrer"> File link</a>.
      </p>
      <p>
        It uses the Studium platform to log in and access course materials. This application is intended for educational purposes only.
      </p>
    </div>
  );
}

export default AboutPage;