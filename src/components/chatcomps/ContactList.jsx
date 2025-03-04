import React, { useState, useEffect, useCallback } from "react";
import useContactManager from "../../hooks/useContactManager";
import { useWallet } from "../../contexts/WalletContext";
import AddContactForm from "./AddContactForm";
import { checkAuthStatus } from "../../services/apiService.js";
import "./ContactList.css";

const ContactList = ({ onSelectContact }) => {
  const { walletAddress, walletStatus, isReady } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { confirmedContacts, fetchContacts } = useContactManager();
  const [showAddContactModal, setShowAddContactModal] = useState(false);

  // ✅ **Verificar autenticación solo si la wallet cambia y aún no está autenticado**
  useEffect(() => {
    if (!walletAddress || isAuthenticated) return;

    const verifyAuth = async () => {
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

  // ✅ **Abrir modal solo si está autenticado**
  const handleAddContact = useCallback(() => {
    if (!isAuthenticated) {
      setErrorMessage("⚠️ Debes estar autenticado para agregar un contacto.");
      return;
    }
    setShowAddContactModal(true);
  }, [isAuthenticated]);

  if (!isReady) {
    return <p className="auth-warning">🔒 Cargando datos de la wallet...</p>;
  }

  return (
    <div className="contact-list-container">
      <h3>📞 Contactos</h3>

      {!walletAddress ? (
        <p className="auth-warning">⚠️ Conéctate a una wallet para gestionar contactos.</p>
      ) : confirmedContacts.length > 0 ? (
        <ul className="contact-list">
          {confirmedContacts.map(({ wallet }) => (
            <li key={wallet} className="contact-item" onClick={() => onSelectContact(wallet)}>
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
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
            <button className="modal-close" onClick={() => setShowAddContactModal(false)}>X</button>
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
};

export default React.memo(ContactList);
