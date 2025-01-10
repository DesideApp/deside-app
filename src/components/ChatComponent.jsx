import React, { useState, useEffect } from 'react';
import useSignal from '../hooks/useSignal';

const ChatComponent = ({ backendUrl, pubkey }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar si el usuario está autenticado al cargar el componente
    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    // Inicializar el hook useSignal con la URL del backend, la clave pública y el estado de autenticación
    const { connected, signals, sendSignal } = useSignal(backendUrl, pubkey, isAuthenticated);

    // Manejar el envío de señales (mensajes)
    const handleSendSignal = (targetPubkey, message) => {
        sendSignal(targetPubkey, message);
    };

    return (
        <div>
            <h2>Chat Component</h2>
            {connected ? <p>Connected</p> : <p>Disconnected</p>}
            <div>
                <h3>Received Signals</h3>
                <ul>
                    {signals.map((signal, index) => (
                        <li key={index}>{signal}</li>
                    ))}
                </ul>
            </div>
            <div>
                <h3>Send Signal</h3>
                <input type="text" placeholder="Target Public Key" id="targetPubkey" />
                <input type="text" placeholder="Message" id="message" />
                <button onClick={() => handleSendSignal(document.getElementById('targetPubkey').value, document.getElementById('message').value)}>
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;
