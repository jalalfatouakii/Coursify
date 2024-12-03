// QnAPage.js
import React from 'react';
import '../styles/Pages.css';

function QnAPage() {
  return (
    <div className="QnAPage">
      <h1>Frequently Asked Questions (FAQ)</h1>
      <div className="faq-item">
        <h2>What is this project about?</h2>
        <p>
          This project is designed to help students access and download course materials from the Studium platform. It provides a convenient way to manage and download PDFs and other resources.
        </p>
      </div>
      <div className="faq-item">
        <h2>Is it safe to use my Studium login?</h2>
        <p>
          Yes, this application uses the official Studium login mechanism to authenticate users. Your credentials are securely handled and not stored by this application.
        </p>
      </div>
      <div className="faq-item">
        <h2>What can I do with this application?</h2>
        <p>
          You can, currently, log in with your Studium credentials, view your enrolled courses, and download all PDF files from a selected course in a zip file.
        </p>
      </div>
      <div className="faq-item">
        <h2>Is this application free to use?</h2>
        <p>
          Yes, this application is free to use and is intended for educational purposes only.
        </p>
      </div>
      <div className="faq-item">
        <h2>Who created this project?</h2>
        <p>
          This project was created by Jalal Fatouaki and is inspired by a 0xD34DC0DE's work. It is intended to provide a helpful tool for students.
        </p>
      </div>
      <div className="faq-item">
        <h2>Is this project affiliated with Studium or the Université de Montréal?</h2>
        <p>
          No, this project is not affiliated with Studium or the Université de Montréal. It is an independent project created for educational purposes.
        </p>
      </div>
    </div>
  );
}

export default QnAPage;