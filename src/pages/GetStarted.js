// NewPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function NewPage() {
    const navigate = useNavigate();

    const returnToHome = () => {
        navigate('/');}
    return (
        <div className="NewPage">
        <h1>Welcome to the New Page</h1>
        <button onClick={returnToHome}>Home</button>
        </div>
    );
}

export default NewPage;