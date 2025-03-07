import React, { useState, memo } from "react";
import ContactRequests from "../chatcomps/ContactRequests";
import AddContactForm from "../chatcomps/AddContactForm";
import { FaUserPlus, FaInbox } from "react-icons/fa"; // ✅ Iconos representativos
import "./RightPanel.css";

const RightPanel = () => {
    const [activeTab, setActiveTab] = useState("requests"); // ✅ Control de pestañas principales

    // ✅ Función para cambiar entre pestañas principales
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
                    <FaInbox size={18} /> {/* 📩 Icono de bandeja de entrada */}
                </button>
                <button 
                    className={activeTab === "addContact" ? "active" : ""} 
                    onClick={() => handleTabChange("addContact")}
                    aria-label="Agregar contacto"
                >
                    <FaUserPlus size={18} /> {/* ➕ Icono de agregar usuario */}
                </button>
            </nav>

            {/* 📌 Solo una pestaña activa a la vez */}
            <div className="right-panel-content">
                {activeTab === "requests" && <ContactRequests />}
                {activeTab === "addContact" && <AddContactForm />}
            </div>
        </aside>
    );
};

export default memo(RightPanel);
