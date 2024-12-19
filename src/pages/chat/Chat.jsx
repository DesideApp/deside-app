import React from 'react';
import ContactList from '../../components/chatcomps/ContactList.jsx';
import ChatWindow from '../../components/chatcomps/ChatWindow.jsx';
import RightPanel from '../../components/chatcomps/RightPanel.jsx';
import useSignal from '../../hooks/useSignal'; // Importar el hook useSignal
import "./Chat.css"; // Asegúrate de que este archivo CSS también exista en la ruta indicada

function Chat() {
  const backendUrl = 'https://your-backend-url.com'; // URL del backend
  const pubkey = 'your-public-key'; // Clave pública del usuario

  const { connected, signals, sendSignal } = useSignal(backendUrl, pubkey); // Usar el hook useSignal

  return (
    <div className="chat-page-container">
      {/* Panel Izquierdo: Contactos */}
      <div className="left-panel">
        <ContactList />
      </div>

      {/* Ventana de Chat */}
      <div className="chat-window-panel">
        <ChatWindow />
      </div>

      {/* Panel Derecho */}
      <div className="right-panel">
        <RightPanel />
      </div>
    </div>
  );
}

export default Chat;
