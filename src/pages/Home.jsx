import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext"; 
import "./Home.css";

function Home() {
    const navigate = useNavigate();
    const { walletStatus, isReady, connectWallet } = useWallet();
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        setErrorMessage(""); // ✅ Limpia errores al cambiar estado de la wallet
    }, [walletStatus]);

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

    const renderButton = useMemo(() => {
        if (!isReady) return <p className="loading-message">🔄 Cargando estado de la wallet...</p>;
        if (walletStatus === "not_connected") return <button onClick={connectWallet}>🔌 Conectar Wallet</button>;
        if (walletStatus === "authenticated") return <button onClick={handleNavigate}>💬 Entrar al Chat</button>;
        return <p className="auth-warning">⚠️ Conéctate y autentícate para acceder al chat.</p>;
    }, [isReady, walletStatus, connectWallet, handleNavigate]);

    return (
        <div className="home-container">
            <h1>DeChat</h1>
            <p>Discover a new decentralized social network built on Solana</p>

            {renderButton}

            {errorMessage && <p className="error-message" aria-live="assertive">{errorMessage}</p>} {/* ✅ Mejora de accesibilidad */}
        </div>
    );
}

export default Home;
