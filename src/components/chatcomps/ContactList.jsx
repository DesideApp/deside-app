import React, { useState, useEffect } from "react";
import { getConnectedWallet } from "../../services/walletService.js";
import { fetchWithAuth } from "../../services/authServices.js";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newContact, setNewContact] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const checkWalletAndFetchContacts = async () => {
            const connectedWallet = await getConnectedWallet();
            if (connectedWallet?.walletAddress) {
                await fetchContacts();
            }
        };

        checkWalletAndFetchContacts();
        window.addEventListener("walletConnected", checkWalletAndFetchContacts);

        return () => window.removeEventListener("walletConnected", checkWalletAndFetchContacts);
    }, []);

    // 📌 Obtiene todos los contactos del backend
    const fetchContacts = async () => {
        try {
            const response = await fetchWithAuth("https://backend-deside.onrender.com/api/contacts");
            const data = await response.json();

            setConfirmedContacts(data.confirmed || []);
            setPendingRequests(data.pending || []);
            setReceivedRequests(data.requests || []);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    // 📌 Enviar una solicitud de contacto
    const handleAddContact = async () => {
        if (!newContact.trim()) {
            setError("Wallet address is required.");
            return;
        }

        setError("");
        console.log(`🔵 Enviando solicitud de contacto: ${newContact}`);

        try {
            const response = await fetchWithAuth("https://backend-deside.onrender.com/api/contacts/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pubkey: newContact }),
            });

            if (!response.ok) throw new Error("Failed to send contact request.");

            console.log("✅ Solicitud enviada correctamente.");
            setNewContact(""); // Limpiar el input
            fetchContacts(); // Actualizar la lista
        } catch (error) {
            console.error("Error sending contact request:", error);
            setError("Failed to send request.");
        }
    };

    // 📌 Aceptar una solicitud de contacto recibida
    const handleAcceptRequest = async (wallet) => {
        try {
            await fetchWithAuth("https://backend-deside.onrender.com/api/contacts/accept", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet }),
            });

            fetchContacts(); // 🔄 Actualizar lista tras aceptar
        } catch (error) {
            console.error("Error accepting contact request:", error);
        }
    };

    // 📌 Rechazar una solicitud de contacto recibida
    const handleRejectRequest = async (wallet) => {
        try {
            await fetchWithAuth("https://backend-deside.onrender.com/api/contacts/reject", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet }),
            });

            fetchContacts(); // 🔄 Actualizar lista tras rechazar
        } catch (error) {
            console.error("Error rejecting contact request:", error);
        }
    };

    // 📌 Eliminar un contacto confirmado
    const handleRemoveContact = async (wallet) => {
        try {
            await fetchWithAuth("https://backend-deside.onrender.com/api/contacts/remove", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ wallet }),
            });

            fetchContacts(); // 🔄 Actualizar lista tras eliminar
        } catch (error) {
            console.error("Error removing contact:", error);
        }
    };

    if (loading) return <p>Loading contacts...</p>;

    return (
        <div className="contact-list-container">
            <h3>Contacts</h3>

            {/* 🔵 Input para agregar un nuevo contacto */}
            <div className="wallet-input-container">
                <div className="input-wrapper">
                    <input
                        type="text"
                        className="contact-input"
                        placeholder="Enter wallet address"
                        value={newContact}
                        onChange={(e) => setNewContact(e.target.value)}
                    />
                    <span className="solana-fm-icon">🔍</span> {/* Icono de Solana */}
                </div>
                <button className="add-contact-button" onClick={handleAddContact}>➕ Add Contact</button>
                {error && <p className="error-message">{error}</p>}
            </div>

            {/* 🔵 Lista de contactos confirmados */}
            <h3>Confirmed Contacts</h3>
            <ul className="contact-list">
                {confirmedContacts.length > 0 ? (
                    confirmedContacts.map((contact) => (
                        <li key={contact.wallet} className="contact-item">
                            <div className="contact-info" onClick={() => onSelectContact(contact.wallet)}>
                                <span className="contact-name">
                                    {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
                                </span>
                            </div>
                            <button className="remove-contact-btn" onClick={() => handleRemoveContact(contact.wallet)}>❌</button>
                        </li>
                    ))
                ) : (
                    <p className="no-contacts-message">No confirmed contacts.</p>
                )}
            </ul>

            {/* 🔵 Lista de solicitudes enviadas (Pendientes) */}
            <h3>Pending Requests</h3>
            <ul className="contact-list">
                {pendingRequests.length > 0 ? (
                    pendingRequests.map((contact) => <li key={contact.wallet}>{contact.wallet} (Pending)</li>)
                ) : (
                    <p className="no-contacts-message">No pending requests.</p>
                )}
            </ul>

            {/* 🔵 Lista de solicitudes recibidas */}
            <h3>Received Requests</h3>
            <ul className="contact-list">
                {receivedRequests.length > 0 ? (
                    receivedRequests.map((contact) => (
                        <li key={contact.wallet}>
                            {contact.wallet}
                            <button onClick={() => handleAcceptRequest(contact.wallet)}>✅ Accept</button>
                            <button onClick={() => handleRejectRequest(contact.wallet)}>❌ Reject</button>
                        </li>
                    ))
                ) : (
                    <p className="no-contacts-message">No incoming requests.</p>
                )}
            </ul>
        </div>
    );
}

export default ContactList;
