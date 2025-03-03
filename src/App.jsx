import React, { Suspense } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext.jsx";
import Main from "./Main.jsx";

function App() {
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
