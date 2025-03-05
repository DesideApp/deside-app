import React, { useState, memo } from "react";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
import { useAuthManager } from "../../services/authManager"; // 🔄 Importamos AuthManager
import "./RightPanel.css";

const RightPanel = () => {
    const [activeTab, setActiveTab] = useState("requests");
    const { isAuthenticated, isLoading, handleLoginResponse } = useAuthManager(); // ✅ Verificamos autenticación

    // ✅ **Manejo de pestañas con autenticación**
    const handleTabChange = (tab) => {
        if (!isAuthenticated) {
            console.warn(`⚠️ Intento de acceder a ${tab} sin autenticación.`);
            handleLoginResponse(); // 🔄 Activa el proceso de autenticación
            return;
        }
        setActiveTab(tab);
    };

    return (
        <aside className="right-panel" aria-label="Panel derecho">
            <nav className="right-panel-nav">
                <button 
                    className={activeTab === "requests" ? "active" : ""} 
                    onClick={() => handleTabChange("requests")}
                >
                    📩 Solicitudes
                </button>
                <button 
                    className={activeTab === "addContact" ? "active" : ""} 
                    onClick={() => handleTabChange("addContact")}
                >
                    ➕ Agregar
                </button>
            </nav>

            <div className="right-panel-content">
                {isLoading ? (
                    <p>🔄 Verificando autenticación...</p>
                ) : (
                    <>
                        {activeTab === "requests" && <ContactRequests />}
                        {activeTab === "addContact" && <AddContactForm onContactAdded={() => setActiveTab("requests")} />}
                    </>
                )}
            </div>
        </aside>
    );
};

export default memo(RightPanel);
