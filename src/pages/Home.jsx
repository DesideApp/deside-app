import React, { useEffect } from "react";
import "./Home.css"; // Importar los estilos específicos

function Home() {
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
            <h1>Bienvenido a Web3 App</h1>
            <p>Conéctate con tu wallet para comenzar a explorar.</p>
        </div>
    );
}

export default Home;
