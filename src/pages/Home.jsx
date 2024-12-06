import React, { useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./Home.css"; // Importar los estilos específicos

function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        // Crear un elemento <link> para Google Fonts
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Montserrat:wght@400;700&family=IBM+Plex+Mono:wght@400;700&display=swap";
        link.rel = "stylesheet";

        // Añadirlo al <head> del documento
        document.head.appendChild(link);

        // Limpiar el enlace cuando el componente se desmonte (opcional)
        return () => {
            document.head.removeChild(link);
        };
    }, []); // Se ejecuta solo una vez al montar

    return (
        <div className="home-container">
            <h1>DeChat</h1>
            <p>Discover a new decentralised social network built in Solana</p>
            <button onClick={() => navigate('/chat')}>Ir al Chat</button>
        </div>
    );
}

export default Home;
