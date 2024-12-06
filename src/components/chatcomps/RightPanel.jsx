import React from 'react';
import "./RightPanel.css";

function RightPanel() {
    return (
        <div className="right-panel-container">
            <h3>Información del Chat</h3>
            <div className="right-section">
                <p><strong>Participantes:</strong> Tú y Alice</p>
                <p><strong>Última Actividad:</strong> Hace 5 minutos</p>
                <p><strong>Mensajes Totales:</strong> 12</p>
            </div>
            <div className="additional-info">
                <h4>Herramientas del Chat</h4>
                <ul>
                    <li>Estadísticas de Mensajes</li>
                    <li>Historial de Interacciones</li>
                    <li>Exportar Conversación</li>
                </ul>
            </div>
        </div>
    );
}

export default RightPanel;
