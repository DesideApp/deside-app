import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../contexts/WalletContext"; // ✅ Importamos el contexto global
import "./Home.css";

function Home() {
    const navigate = useNavigate();
    const { walletStatus, isReady } = useWallet();
    const [errorMessage, setErrorMessage] = useState(""); // 🔹 Estado para mostrar mensajes de error

    const handleNavigate = () => {
        if (walletStatus !== "authenticated") {
            setErrorMessage("⚠️ Debes autenticarte antes de acceder al chat."); // ✅ Mostrar mensaje en lugar de `alert()`
            return;
        }
        navigate("/chat");
    };

    return (
        <div className="home-container">
            <h1>DeChat</h1>
            <p>Discover a new decentralised social network built in Solana</p>

            {!isReady ? (
                <p className="loading-message">🔄 Cargando estado de la wallet...</p>
            ) : (
                <>
                    {walletStatus === "authenticated" ? (
                        <button onClick={handleNavigate}>Enter Chat</button>
                    ) : (
                        <>
                            <p className="auth-warning">⚠️ Connect and authenticate to access the chat.</p>
                            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* ✅ Mensaje dinámico */}
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default Home;
