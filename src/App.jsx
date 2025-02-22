import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from './contexts/WalletContext.jsx';  // Importamos el WalletProvider
import Main from "./Main.jsx";  // Tu componente principal

function App() {
    return (
        <WalletProvider>  {/* Envolvemos toda la app con el WalletProvider */}
            <Router>
                <Main />
            </Router>
        </WalletProvider>
    );
}

export default App;
