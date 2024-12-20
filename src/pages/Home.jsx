import React from "react";
import { useNavigate } from 'react-router-dom';
import "./Home.css"; // Importar los estilos específicos

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <h1>DeChat</h1>
            <p>Discover a new decentralised social network built in Solana</p>
            <button onClick={() => navigate('/chat')}>Ir al Chat</button>
        </div>
    );
}

export default Home;
