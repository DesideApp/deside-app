import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from './pages/chat/Chat.jsx';
import BottomBar from "./components/BottomBar.jsx";

function Main() {
    console.log("App component loaded"); // Log de carga de la aplicación

    return (
        <Router>
            <div>
                <Header />
                <main>
                    <Routes>
                        <Route path="/pages" element={<Home />} />
                        <Route path="/pages/chat" element={<Chat />} /> 
                    </Routes>
                </main>
                <BottomBar />
            </div>
        </Router>
    );
}

export default Main;

