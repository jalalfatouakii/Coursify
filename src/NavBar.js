// NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function NavBar() {
  return (
    <nav className="NavBar">
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/qna">Q&A</Link></li>
      </ul>
    </nav>
  );
}

export default NavBar;