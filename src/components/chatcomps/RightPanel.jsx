import React, { useState, memo, useCallback } from "react";
import * as MdIcons from "react-icons/md";
import { MdOutlineMail, MdMail, MdPersonOutline, MdPerson } from "react-icons/md";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
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
        <>
            {/* ✅ Header estructural vacío pero con espacio fijo */}
            <header className="right-panel-header"></header>

            {/* 📌 Contenedor del contenido con efecto hundido */}
            <div className="right-panel-content">
                {activeTab === "requests" && <ContactRequests />}
                {activeTab === "addContact" && <AddContactForm />}
            </div>

            {/* 📌 Menú de pestañas con iconos */}
            <nav className="right-panel-nav">
                <button
                    className={activeTab === "requests" ? "active" : ""}
                    onClick={() => handleTabChange("requests")}
                    aria-label="Solicitudes de contacto"
                >
                    {activeTab === "requests" ? <MdMail size={24} /> : <MdOutlineMail size={24} />}
                </button>
                <button
                    className={activeTab === "addContact" ? "active" : ""}
                    onClick={() => handleTabChange("addContact")}
                    aria-label="Agregar contacto"
                >
                    {activeTab === "addContact" ? <MdPerson size={24} /> : <MdPersonOutline size={24} />}
                </button>
            </nav>
        </>
    );
};

export default memo(RightPanel);
