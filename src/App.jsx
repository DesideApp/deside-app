import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Chat from './pages/chat/Chat.jsx';
import BottomBar from "./components/BottomBar.jsx";
import cors from 'cors';

const allowedOrigins = ['https://deside-app.vercel.app']; // Añade aquí tu dominio de producción

function App() {
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'], // Métodos permitidos
    credentials: true, // Si necesitas enviar cookies o autenticación
}));