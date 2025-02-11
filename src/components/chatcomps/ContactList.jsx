import React, { useState, useEffect } from "react";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newContact, setNewContact] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("https://backend-deside.onrender.com/api/contacts", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch contacts.");

            const data = await response.json();
            setConfirmedContacts(data.confirmed || []);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContact = async () => {
        if (!newContact.trim()) {
            setError("Wallet address is required.");
            return;
        }
        setError("");
        console.log(`🔵 Enviando solicitud de contacto: ${newContact}`);
        // Aquí puedes implementar la lógica real para añadir el contacto
        setNewContact(""); // Reset del input tras enviar
    };

    if (loading) {
        return <p>Loading contacts...</p>;
    }

    return (
        <div className="contact-list-container">
            {/* 🔵 Cabecera con botón de agregar contacto */}
            <h3>Contacts</h3>

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

            {/* 🔵 Lista de contactos */}
            <div className="contacts-list-wrapper">
                <ul className="contact-list">
                    {confirmedContacts.length > 0 ? (
                        confirmedContacts.map((contact) => (
                            <li key={contact.wallet} className="contact-item">
                                <div className="contact-info" onClick={() => onSelectContact(contact.wallet)}>
                                    <span className="contact-name">
                                        {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
                                    </span>
                                </div>
                                <button className="remove-contact-btn">❌</button>
                            </li>
                        ))
                    ) : (
                        <p className="no-contacts-message">No confirmed contacts.</p>
                    )}
                </ul>
            </div>
        </div>
    );
}

export default ContactList;
