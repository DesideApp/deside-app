import React, { useState, memo } from "react";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
import { useAuthManager } from "../../services/authManager"; // 🔄 Importamos AuthManager
import "./RightPanel.css";

const RightPanel = () => {
    const [activeTab, setActiveTab] = useState("requests");
    const { isAuthenticated, isLoading, handleLoginResponse } = useAuthManager(); // ✅ Verificamos autenticación

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
            }); // 🔄 Activa autenticación y continúa la acción
            return;
        }
        action();
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
        </aside>
    );
};

export default memo(RightPanel);
