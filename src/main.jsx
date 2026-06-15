import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Applica Caratteri Grandi all'avvio (classe su html per scalare tutti i rem)
if (localStorage.getItem('setting_largeText') === 'true') {
  document.documentElement.classList.add('large-font-mode');
}

// Diagnostica per APK: mostra l'errore a schermo se il mount fallisce
try {
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error("Elemento 'root' non trovato!");

    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    );
} catch (error) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding: 20px; color: red; font-family: sans-serif;';
    const h1 = document.createElement('h1');
    h1.style.fontSize = '20px';
    h1.textContent = 'Errore Avvio App';
    const p = document.createElement('p');
    p.style.fontSize = '14px';
    p.textContent = error?.message || 'Errore sconosciuto';
    wrap.appendChild(h1);
    wrap.appendChild(p);
    document.body.textContent = '';
    document.body.appendChild(wrap);
}
