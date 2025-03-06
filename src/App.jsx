import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ServerContext } from "./contexts/ServerContext.jsx"; // ✅ Nuevo contexto
import Main from "./Main.jsx"; 

function App() {
    return (
        <ServerContext>  {/* 🔄 Usamos el contexto correcto */}
            <Router>
                <Main />
            </Router>
        </ServerContext>
    );
}

export default App;
