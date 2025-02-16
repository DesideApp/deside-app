import React, { useState } from "react";
import useContactManager from "../../hooks/useContactManager";
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
                <button className="add-contact-button" onClick={() => handleAddContact(newContact)}>➕ Agregar</button>
                <button className="requests-button" onClick={() => setView(view === "contacts" ? "requests" : "contacts")}>
                    {view === "contacts" ? "📩 Solicitudes" : "⬅️ Volver"}
                </button>
            </div>

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
                                        <li key={contact.wallet} className="request-item">
                                            {contact.wallet}
                                            <button className="accept-btn" onClick={() => handleAcceptRequest(contact.wallet)}>✅</button>
                                            <button className="reject-btn" onClick={() => handleRejectRequest(contact.wallet)}>❌</button>
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
                                        <li key={contact.wallet} className="request-item">
                                            {contact.wallet} (Pendiente)
                                        </li>
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
