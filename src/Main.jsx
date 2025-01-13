import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import Chat from './pages/chat/Chat.jsx';
import BottomBar from "./components/BottomBar.jsx";

const routes = [
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/chat",
        element: <Chat />,
    },
];

const router = createBrowserRouter(routes, {
    future: {
        v7_relativeSplatPath: true,
    },
});

function Main() {
    console.log("App component loaded"); // Log de carga de la aplicación

    return (
        <RouterProvider router={router}>
            <div>
                <Header />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/chat" element={<Chat />} /> 
                    </Routes>
                </main>
                <BottomBar />
            </div>
        </RouterProvider>
    );
}

export default Main;

