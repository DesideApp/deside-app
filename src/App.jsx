import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext.jsx";
import Main from "./Main.jsx";

function App() {
    const [isLoading, setIsLoading] = useState(true); // ✅ Estado de carga inicializado

    useEffect(() => {
        const verifyAuth = async () => {
            setIsLoading(false); // ✅ Eliminamos la autenticación redundante aquí
        };

        verifyAuth();
    }, []);// a ver

    if (isLoading) {
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
