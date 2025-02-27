import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext.jsx";
import { checkAuthStatus } from "./services/authServices"; // ✅ Verifica autenticación
import Main from "./Main.jsx";

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // ✅ Nuevo estado de carga

    useEffect(() => {
        const verifyAuth = async () => {
            const status = await checkAuthStatus();
            setIsAuthenticated(status.isAuthenticated);
            setIsLoading(false); // ✅ Solo cambia después de verificar autenticación
        };

        verifyAuth();
    }, []);

    if (isLoading) {
        return <div className="loading-screen">Cargando...</div>;
    }

    return (
        <WalletProvider>
            <Router>
                <Suspense fallback={<div>Cargando contenido...</div>}>
                    <Main isAuthenticated={isAuthenticated} />
                </Suspense>
            </Router>
        </WalletProvider>
    );
}

export default App;
