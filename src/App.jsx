import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext.jsx";

const Main = lazy(() => import("./Main.jsx")); // ✅ Carga asíncrona optimizada

function App() {
    return (
        <WalletProvider>
            <Router>
                <Suspense fallback={<div className="loading-screen">🔄 Cargando la aplicación...</div>}>
                    <Main />
                </Suspense>
            </Router>
        </WalletProvider>
    );
}

export default App;
