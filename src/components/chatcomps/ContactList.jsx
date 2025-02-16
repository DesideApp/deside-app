import React, { useState, useEffect } from "react";
import useContactManager from "../../hooks/useContactManager";
import { getWalletStatus, authenticateWallet } from "../../services/walletService";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const { 
        confirmedContacts, 
        pendingRequests, 
        receivedRequests, 
        handleAddContact, 
        handleAcceptRequest, 
        handleRejectRequest 
    } = useContactManager();

    const [newContact, setNewContact] = useState("");
    const [view, setView] = useState("contacts");
    const [walletStatus, setWalletStatus] = useState("disconnected");

    useEffect(() => {
        const status = getWalletStatus();
        setWalletStatus(status.status);
    }, []);

    // ✅ Autenticar solo cuando es necesario
    const handleAddContactClick = async () => {
        if (walletStatus !== "authenticated") {
            console.warn("⚠️ Se requiere autenticación para agregar contactos.");
            await authenticateWallet("phantom");
            setWalletStatus("authenticated");
            return;
        }
        handleAddContact(newContact);
    };

    return (
        <div className="contact-list-container">
            <h3>📞 Contactos</h3>

            <div className="wallet-input-container">
                <input
                    type="text"
                    className="contact-input"
                    placeholder="Introduce wallet"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                />
                <button className="add-contact-button" onClick={handleAddContactClick}>➕ Agregar</button>
                <button className="requests-button" onClick={() => setView(view === "contacts" ? "requests" : "contacts")}>
                    {view === "contacts" ? "📩 Solicitudes" : "⬅️ Volver"}
                </button>
            </div>

            {walletStatus !== "authenticated" && (
                <p className="auth-warning">⚠️ Debes autenticarte para gestionar contactos.</p>
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
                                {receivedRequests.map((contact) => (
                                    <li key={contact.wallet}>
                                        {contact.wallet}
                                        <button onClick={() => handleAcceptRequest(contact.wallet)}>✅</button>
                                        <button onClick={() => handleRejectRequest(contact.wallet)}>❌</button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <ul className="contact-list">
                                {pendingRequests.map((contact) => (
                                    <li key={contact.wallet}>{contact.wallet} (Pendiente)</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContactList;
