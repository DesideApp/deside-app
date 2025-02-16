import React, { useState, useEffect } from "react";
import useContactManager from "../../hooks/useContactManager";
import { getConnectedWallet, authenticateWallet } from "../../services/walletService";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const { 
        confirmedContacts, 
        pendingRequests, 
        receivedRequests, 
        handleAcceptRequest, 
        handleRejectRequest 
    } = useContactManager();

    const [view, setView] = useState("contacts");
    const [walletStatus, setWalletStatus] = useState({ walletAddress: null, isAuthenticated: false });

    useEffect(() => {
        setWalletStatus(getConnectedWallet());
    }, []);

    return (
        <div className="contact-list-container">
            <h3>📞 Contactos</h3>

            <button className="requests-button" onClick={() => setView(view === "contacts" ? "requests" : "contacts")}>
                {view === "contacts" ? "📩 Solicitudes" : "⬅️ Volver"}
            </button>

            {!walletStatus.walletAddress && (
                <p className="auth-warning">⚠️ Conéctate a una wallet para gestionar contactos.</p>
            )}

            {!walletStatus.isAuthenticated && walletStatus.walletAddress && (
                <p className="auth-warning">⚠️ Firma para autenticarte antes de agregar contactos.</p>
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
                        <button className={`request-tab ${view === "received" ? "active" : ""}`} onClick={() => setView("received")}>
                            📥 Recibidas ({receivedRequests.length})
                        </button>
                        <button className={`request-tab ${view === "sent" ? "active" : ""}`} onClick={() => setView("sent")}>
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
                                            <button onClick={() => handleAcceptRequest(contact.wallet)}>✅</button>
                                            <button onClick={() => handleRejectRequest(contact.wallet)}>❌</button>
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
        </div>
    );
}

export default ContactList;
