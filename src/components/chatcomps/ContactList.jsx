import React, { useState, useEffect } from "react";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <p>Loading contacts...</p>;
    }

    return (
        <div className="contact-list">
            <h2>Contacts</h2>
            <ul>
                {confirmedContacts.length > 0 ? (
                    confirmedContacts.map((contact) => (
                        <li key={contact.wallet} onClick={() => onSelectContact(contact.wallet)}>
                            {contact.wallet}
                        </li>
                    ))
                ) : (
                    <p>No confirmed contacts.</p>
                )}
            </ul>
        </div>
    );
}

export default ContactList;
