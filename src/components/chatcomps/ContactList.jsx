import React, { useState, useEffect, useCallback } from "react";
import useContactManager from "../../hooks/useContactManager";
import { getConnectedWallet } from "../../services/walletService"; // 🔧 Corregida la ruta
import AddContactForm from "./AddContactForm";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const { 
        confirmedContacts, 
        pendingRequests, 
        receivedRequests, 
        handleAcceptRequest, 
        handleRejectRequest, 
        fetchContacts // ✅ Agregado para actualizar lista tras acciones
    } = useContactManager();

    const [view, setView] = useState("contacts");
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });
    const [showAddContactModal, setShowAddContactModal] = useState(false);

    // ✅ Optimización de `updateWalletStatus`
    const updateWalletStatus = useCallback(() => {
        setWalletStatus(getConnectedWallet());
    }, []);

    useEffect(() => {
        updateWalletStatus();
        window.addEventListener("walletConnected", updateWalletStatus);
        window.addEventListener("walletDisconnected", updateWalletStatus);

        return () => {
            window.removeEventListener("walletConnected", updateWalletStatus);
            window.removeEventListener("walletDisconnected", updateWalletStatus);
        };
    }, [updateWalletStatus]);

    // ✅ Mejoramos cambio de vista de solicitudes
    const toggleView = () => {
        if (view === "contacts") {
            setView("received"); // 🔧 Por defecto mostrar solicitudes recibidas al cambiar a "Solicitudes"
        } else {
            setView("contacts");
        }
    };

    return (
        <div className="contact-list-container">
            <h3>📞 Contactos</h3>

            <button 
                className="requests-button" 
                onClick={toggleView}
                disabled={!walletStatus.walletAddress}
            >
                {view === "contacts" ? "📩 Solicitudes" : "⬅️ Volver"}
            </button>

            {!walletStatus.walletAddress && (
                <p className="auth-warning">⚠️ Conéctate a una wallet para gestionar contactos.</p>
            )}

            {view === "contacts" ? (
                <ul className="contact-list">
                    {confirmedContacts.length > 0 ? (
                        confirmedContacts.map((contact) => (
                            <li key={contact.wallet} className="contact-item" onClick={() => onSelectContact(contact.wallet)}>
                                {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
                            </li>
                        ))
                    ) : (
                        <p className="no-contacts-message">Aún no tienes contactos.</p>
                    )}
                </ul>
            ) : (
                <div>
                    <div className="request-tabs">
                        <button 
                            className={`request-tab ${view === "received" ? "active" : ""}`} 
                            onClick={() => setView("received")}
                        >
                            📥 Recibidas ({receivedRequests.length})
                        </button>
                        <button 
                            className={`request-tab ${view === "sent" ? "active" : ""}`} 
                            onClick={() => setView("sent")}
                        >
                            📤 Enviadas ({pendingRequests.length})
                        </button>
                    </div>
                    <div className="requests-container">
                        {view === "received" ? (
                            <ul className="contact-list">
                                {receivedRequests.length > 0 ? (
                                    receivedRequests.map((contact) => (
                                        <li key={contact.wallet}>
                                            {contact.wallet}
                                            <button onClick={async () => { 
                                                await handleAcceptRequest(contact.wallet);
                                                fetchContacts(); // ✅ Recargar contactos tras acción
                                            }}>✅</button>
                                            <button onClick={async () => { 
                                                await handleRejectRequest(contact.wallet);
                                                fetchContacts(); // ✅ Recargar contactos tras acción
                                            }}>❌</button>
                                        </li>
                                    ))
                                ) : (
                                    <p className="no-contacts-message">No tienes solicitudes recibidas.</p>
                                )}
                            </ul>
                        ) : (
                            <ul className="contact-list">
                                {pendingRequests.length > 0 ? (
                                    pendingRequests.map((contact) => (
                                        <li key={contact.wallet}>{contact.wallet} (Pendiente)</li>
                                    ))
                                ) : (
                                    <p className="no-contacts-message">No has enviado solicitudes aún.</p>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Botón flotante para agregar contacto */}
            <button 
                className="floating-add-button" 
                onClick={() => setShowAddContactModal(true)}
                disabled={!walletStatus.walletAddress || !walletStatus.isAuthenticated}
            >
                ➕
            </button>

            {/* Modal para agregar contacto */}
            {showAddContactModal && (
                <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAddContactModal(false)}>X</button>
                        <AddContactForm onContactAdded={() => {
                            setShowAddContactModal(false);
                            updateWalletStatus();
                            fetchContacts(); // ✅ Actualizar la lista después de agregar un contacto
                        }} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactList;
