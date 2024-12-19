import React from 'react';
import ReactDOM from 'react-dom/client'; // Usa `react-dom/client` si estás en React 18+
import Main from './Main.jsx'; // Importar el componente principal

// Crea el punto de conexión al DOM
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(<Main />);
