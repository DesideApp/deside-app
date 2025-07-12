import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ServerProvider } from "./contexts/ServerContext.jsx";
import { LayoutProvider } from "./contexts/LayoutContext.jsx";
import Layout from "./Layout.jsx";
import NotificationContainer from "./components/common/NotificationContainer.jsx";

function App() {
    return (
        <ServerProvider>
            <LayoutProvider>
                <Router>
                    <Layout />
                    <NotificationContainer />
                </Router>
            </LayoutProvider>
        </ServerProvider>
    );
}

export default App;
