import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext.jsx";
import { checkAuthStatus } from "./services/authServices"; // ✅ Verifica autenticación
import Main from "./Main.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
        const verifyAuth = async () => {
            const status = await checkAuthStatus();
            setIsAuthenticated(status.isAuthenticated);
        };

        verifyAuth();
    }, []);

    // ✅ Evitar renderizar antes de confirmar autenticación
    if (isAuthenticated === null) {
        return <div className="loading-screen">Cargando...</div>;
    }

    return (
        <WalletProvider>
            <Router>
                <Suspense fallback={<div>Cargando contenido...</div>}>
                    <Main />
                </Suspense>
            </Router>
        </WalletProvider>
    );
}

export default App;
