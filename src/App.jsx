import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";

function App() {
    return (
        <Router>
            <div>
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

