import React from 'react';
import ReactDOM from 'react-dom/client'; // Para React 18+
import Main from '/src/Main.jsx'; // Componente principal

// Selecciona el elemento raíz desde el DOM
const rootElement = document.getElementById('root');

// Crea la raíz de React y renderiza el componente principal
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<Main />);
} else {
    console.error("No se encontró el elemento con id 'root' en el DOM.");
}
