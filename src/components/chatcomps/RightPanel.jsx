import React, { useState, memo, useCallback } from "react";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
import { FaUserPlus, FaInbox } from "react-icons/fa";
import { useAuthManager } from "../../services/authManager";
import "./RightPanel.css";

const RightPanel = () => {
    const [activeTab, setActiveTab] = useState("requests");
    const { isAuthenticated, handleLoginResponse } = useAuthManager();

    // ✅ **Manejo de activación de autenticación**
    const handlePanelClick = useCallback(() => {
        if (!isAuthenticated) {
            console.warn("⚠️ Usuario no autenticado. Iniciando login...");
            handleLoginResponse(() => console.log("🔵 Login completado, listo para interactuar."));
        }
    }, [isAuthenticated, handleLoginResponse]);

    // ✅ **Cambio de pestaña sin restricciones**
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    return (
        <aside className="right-panel">
            {/* 📌 Menú de pestañas principales con iconos */}
            <nav className="right-panel-nav">
                <button 
                    className={activeTab === "requests" ? "active" : ""} 
                    onClick={() => handleTabChange("requests")}
                    aria-label="Solicitudes de contacto"
                >
                    <FaInbox size={16} />
                </button>
                <button 
                    className={activeTab === "addContact" ? "active" : ""} 
                    onClick={() => handleTabChange("addContact")}
                    aria-label="Agregar contacto"
                >
                    <FaUserPlus size={16} />
                </button>
            </nav>

            {/* 📌 Contenido dinámico de pestañas */}
            <div className="right-panel-content">
                {activeTab === "requests" && <ContactRequests />}
                {activeTab === "addContact" && <AddContactForm />}
            </div>
        </aside>
    );
};

export default memo(RightPanel);
