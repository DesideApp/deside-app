import React, { useState, useEffect } from "react";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
    const [confirmedContacts, setConfirmedContacts] = useState([]);
    const [pendingContacts, setPendingContacts] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
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
            setPendingContacts(data.pending || []);
            setReceivedRequests(data.requests || []);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (wallet) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("https://backend-deside.onrender.com/api/contacts/accept", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wallet }),
            });

            if (!response.ok) throw new Error("Failed to accept contact request.");

            fetchContacts();
        } catch (error) {
            console.error("Error accepting contact request:", error);
        }
    };

    const handleRejectRequest = async (wallet) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch("https://backend-deside.onrender.com/api/contacts/reject", {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ wallet }),
            });

            if (!response.ok) throw new Error("Failed to reject contact request.");

            fetchContacts();
        } catch (error) {
            console.error("Error rejecting contact request:", error);
        }
    };

    if (loading) {
        return <p>Loading contacts...</p>;
    }

    return (
        <div className="contact-list">
            <h2>Contacts</h2>

            <h3>Confirmed Contacts</h3>
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

            <h3>Pending Requests</h3>
            <ul>
                {pendingContacts.length > 0 ? (
                    pendingContacts.map((contact) => <li key={contact.wallet}>{contact.wallet} (Pending)</li>)
                ) : (
                    <p>No pending requests.</p>
                )}
            </ul>

            <h3>Received Requests</h3>
            <ul>
                {receivedRequests.length > 0 ? (
                    receivedRequests.map((contact) => (
                        <li key={contact.wallet}>
                            {contact.wallet}
                            <button onClick={() => handleAcceptRequest(contact.wallet)}>Accept</button>
                            <button onClick={() => handleRejectRequest(contact.wallet)}>Reject</button>
                        </li>
                    ))
                ) : (
                    <p>No incoming requests.</p>
                )}
            </ul>
        </div>
    );
}

export default ContactList;
