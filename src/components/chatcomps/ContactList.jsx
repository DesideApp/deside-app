import React, { useState, useEffect } from "react";
import useContactManager from "../../hooks/useContactManager";
import { useWallet } from "../../contexts/WalletContext";
import AddContactForm from "./AddContactForm";
import { checkAuthStatus } from "../../services/apiService.js";
import "./ContactList.css";

function ContactList({ onSelectContact }) {
  const { walletAddress, walletStatus, isReady } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { confirmedContacts, fetchContacts } = useContactManager();
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // ✅ Verifica autenticación solo cuando cambia la wallet y si aún no está autenticado
  useEffect(() => {
    const verifyAuth = async () => {
      if (!walletAddress || isAuthenticated) return;

      try {
        const status = await checkAuthStatus();
        setIsAuthenticated(status.isAuthenticated);
      } catch (error) {
        console.error("❌ Error verificando autenticación:", error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, [walletAddress, isAuthenticated]);

  if (!isReady) {
    return <p className="auth-warning">🔒 Cargando datos de la wallet...</p>;
  }

  // 🔒 Verifica autenticación antes de abrir el modal
  const handleAddContact = () => {
    if (!isAuthenticated) {
      setErrorMessage("⚠️ Debes estar autenticado para agregar un contacto.");
      return;
    }
    setShowAddContactModal(true);
  };

  return (
    <div className="contact-list-container">
      <h3>📞 Contactos</h3>

      {!walletAddress ? (
        <p className="auth-warning">⚠️ Conéctate a una wallet para gestionar contactos.</p>
      ) : confirmedContacts.length > 0 ? (
        <ul className="contact-list">
          {confirmedContacts.map((contact) => (
            <li key={contact.wallet} className="contact-item" onClick={() => onSelectContact(contact.wallet)}>
              {contact.wallet.slice(0, 6)}...{contact.wallet.slice(-4)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-contacts-message">Aún no tienes contactos.</p>
      )}

      {/* ✅ Mostrar mensaje de error en la interfaz en lugar de usar alert() */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <button className="floating-add-button" onClick={handleAddContact} disabled={!walletAddress || !isAuthenticated}>
        ➕
      </button>

      {/* Modal para agregar contacto */}
      {showAddContactModal && (
        <div className="modal-overlay" onClick={() => setShowAddContactModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAddContactModal(false)}>
              X
            </button>
            <AddContactForm
              onContactAdded={() => {
                setShowAddContactModal(false);
                fetchContacts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactList;
