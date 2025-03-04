import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext.jsx";
import Main from "./Main.jsx"; // ✅ Carga normal (no es necesario `lazy` en este caso)

function App() {
    return (
        <WalletProvider>
            <Router>
                <Main />
            </Router>
        </WalletProvider>
    );
}

export default App;
