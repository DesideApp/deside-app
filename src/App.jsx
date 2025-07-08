import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ServerProvider } from "./contexts/ServerContext.jsx";
import Layout from "./Layout.jsx";
import NotificationContainer from "./components/common/NotificationContainer.jsx"; // ✅ Importación añadida

function App() {
    return (
        <ServerProvider>
            <Router>
                <Layout />
                <NotificationContainer />
            </Router>
        </ServerProvider>
    );
}

export default App