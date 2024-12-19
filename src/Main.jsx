import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Chat from './pages/chat/Chat.jsx';
import BottomBar from "./components/BottomBar.jsx";

// Asegúrate de que este archivo contenga el código necesario para tu componente principal

function Main() {
    console.log("App component loaded"); // Log de carga de la aplicación

    return (
        <Router>
            <div>
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/chat" element={<Chat />} /> 
                    </Routes>
                </main>
                <BottomBar />
            </div>
        </Router>
    );
}

export default Main;

