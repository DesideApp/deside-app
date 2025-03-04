import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext"; // ✅ Importamos el contexto global
import "./Home.css";

function Home() {
    const navigate = useNavigate();
    const { walletStatus, isReady, connectWallet } = useWallet();
    const [errorMessage, setErrorMessage] = useState(""); // 🔹 Estado para mostrar mensajes de error

    useEffect(() => {
        setErrorMessage(""); // ✅ Limpiar errores cuando cambia el estado de la wallet
    }, [walletStatus, isReady]);

    const handleNavigate = () => {
        if (!isReady) {
            setErrorMessage("⏳ Espera a que la wallet esté lista.");
            return;
        }
        if (walletStatus === "not_connected") {
            setErrorMessage("⚠️ Conéctate con una wallet primero.");
            return;
        }
        if (walletStatus !== "authenticated") {
            setErrorMessage("⚠️ Debes autenticarte antes de acceder al chat.");
            return;
        }
        navigate("/chat");
    };

    return (
        <div className="home-container">
            <h1>DeChat</h1>
            <p>Discover a new decentralized social network built on Solana</p>

            {!isReady ? (
                <p className="loading-message">🔄 Cargando estado de la wallet...</p>
            ) : walletStatus === "not_connected" ? (
                <button onClick={connectWallet}>🔌 Conectar Wallet</button>
            ) : walletStatus === "authenticated" ? (
                <button onClick={handleNavigate}>💬 Entrar al Chat</button>
            ) : (
                <>
                    <p className="auth-warning">⚠️ Conéctate y autentícate para acceder al chat.</p>
                    {errorMessage && <p className="error-message">{errorMessage}</p>} {/* ✅ Mensaje dinámico */}
                </>
            )}
        </div>
    );
}

export default Home;
