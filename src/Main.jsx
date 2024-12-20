import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from './pages/chat/Chat.jsx';
import BottomBar from "./components/BottomBar.jsx";

// Carga dinámica de componentes
const Home = lazy(() => import("./pages/Home.jsx"));
const Chat = lazy(() => import("./pages/chat/Chat.jsx"));

function Main() {
    console.log("App component loaded"); // Log de carga de la aplicación

    return (
        <Router>
            <div>
                <Header />
                <main>
                    <Suspense fallback={<div>Cargando...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/chat" element={<Chat />} />
                        </Routes>
                    </Suspense>
                </main>
                <BottomBar />
            </div>
        </Router>
    );
}

export default Main;

