import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ServerProvider } from "./contexts/ServerContext.jsx"; // ✅ Importamos correctamente el proveedor del contexto
import Main from "./Main.jsx"; 

function App() {
    return (
        <ServerProvider>  {/* ✅ Usamos el proveedor del contexto */}
            <Router>
                <Main />
            </Router>
        </ServerProvider>
    );
}

export default App;
