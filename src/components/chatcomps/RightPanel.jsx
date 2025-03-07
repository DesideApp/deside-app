import React, { useState, memo } from "react";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
import { useAuthManager } from "../../services/authManager";
import "./RightPanel.css";

const RightPanel = () => {
    const [activeTab, setActiveTab] = useState("requests");
    const { isAuthenticated, isLoading, handleLoginResponse } = useAuthManager();

    // ✅ **Permitir cambio de pestaña sin restricciones**
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    // ✅ **Manejo de acciones protegidas**
    const handleProtectedAction = (action) => {
        if (!isAuthenticated) {
            console.warn("⚠️ Intento de ejecutar acción protegida.");
            handleLoginResponse(() => {
                console.log("✅ Usuario autenticado. Ejecutando acción...");
                action();
            });
            return;
        }
        action();
    };

    return (
        <>
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
                        {activeTab === "requests" && (
                            <ContactRequests 
                                onProtectedAction={(action) => handleProtectedAction(action)}
                            />
                        )}
                        {activeTab === "addContact" && (
                            <AddContactForm 
                                onContactAdded={() => setActiveTab("requests")} 
                                onProtectedAction={(action) => handleProtectedAction(action)}
                            />
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default memo(RightPanel);
