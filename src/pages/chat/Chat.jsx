import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider, useWallet } from "../../contexts/WalletContext.jsx";
import { checkAuthStatus } from "../../services/apiService.js";
import WalletModal from "../../components/common/WalletModal.jsx";

const Main = lazy(() => import("./Main.jsx"));

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isReady, walletStatus } = useWallet();

    // ✅ Verificar autenticación sin bloquear la UI
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const status = await checkAuthStatus();
                setIsAuthenticated(status.isAuthenticated || false);
            } catch (error) {
                console.error("❌ Error verificando autenticación:", error);
                setIsAuthenticated(false);
            } finally {
                setIsCheckingAuth(false);
            }
        };

        verifyAuth();
    }, []);

    // ✅ Si la wallet no está lista, mostrar pantalla de carga
    if (!isReady) {
        return <div className="loading-screen">🔄 Preparando la aplicación...</div>;
    }

    return (
        <WalletProvider>
            <Router>
                <Suspense fallback={<div className="loading-screen">🔄 Cargando la aplicación...</div>}>
                    <Main />
                </Suspense>
            </Router>

            {/* ✅ Muestra el modal solo si no está autenticado */}
            {!isAuthenticated && !isCheckingAuth && walletStatus === "connected" && (
                <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            )}
        </WalletProvider>
    );
}

export default App;
