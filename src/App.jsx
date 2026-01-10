import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ListPage from './pages/ListPage';
import ChatPage from './pages/ChatPage';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import SettingsPage from './pages/SettingsPage';
import { Bell, ShieldCheck } from 'lucide-react';

const NotificationPrompt = ({ onDone }) => {
    const [requesting, setRequesting] = React.useState(false);

    const handleEnable = async () => {
        setRequesting(true);
        try {
            if (window.OneSignal) {
                await window.OneSignal.Notifications.requestPermission();
            } else if ("Notification" in window) {
                await Notification.requestPermission();
            }
        } catch (e) {
            console.error(e);
        }
        setRequesting(false);
        onDone();
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'var(--color-bg-primary)',
            zIndex: 9999, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', padding: '30px',
            textAlign: 'center'
        }}>
            <div style={{
                backgroundColor: 'white', padding: '40px 20px', borderRadius: '32px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'
            }}>
                <div style={{ 
                    width: '80px', height: '80px', backgroundColor: '#E8F5E9', 
                    borderRadius: '50%', display: 'flex', alignItems: 'center', 
                    justifyContent: 'center', margin: '0 auto 24px auto', color: '#2E7D32'
                }}>
                    <Bell size={40} />
                </div>
                <h2 style={{ color: 'var(--color-primary-dark)', marginBottom: '16px', fontSize: '26px' }}>
                    Attiva la Sicurezza
                </h2>
                <p style={{ color: '#666', marginBottom: '32px', fontSize: '18px', lineHeight: '1.5' }}>
                    Per proteggere {JSON.parse(localStorage.getItem('alzheimer_user') || '{"name":"l\'utente"}').name}, l'app deve poter inviare avvisi acustici e promemoria importanti.
                </p>
                
                <button 
                    onClick={handleEnable}
                    disabled={requesting}
                    style={{
                        width: '100%', padding: '20px', backgroundColor: 'var(--color-primary)',
                        color: 'white', border: 'none', borderRadius: '18px',
                        fontSize: '20px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(156, 105, 167, 0.4)'
                    }}
                >
                    {requesting ? 'Attivazione...' : 'ATTIVA ORA'}
                </button>
                
                <p style={{ marginTop: '20px', fontSize: '13px', color: '#999' }}>
                    Operazione obbligatoria per il corretto funzionamento dell'assistenza.
                </p>
            </div>
        </div>
    );
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(!!localStorage.getItem('alzheimer_user'));
    const [showSafePrompt, setShowSafePrompt] = React.useState(false);

    // Controlla permessi ad ogni avvio
    React.useEffect(() => {
        const checkPerms = () => {
            const hasPerm = (window.OneSignal?.Notifications?.permission === true) || (Notification.permission === 'granted');
            if (!hasPerm && isAuthenticated) {
                setShowSafePrompt(true);
            } else {
                setShowSafePrompt(false);
            }
        };

        checkPerms();
        // Spesso OneSignal carica dopo un po'
        const timer = setTimeout(checkPerms, 2000);
        return () => clearTimeout(timer);
    }, [isAuthenticated]);

    // Ascolta cambiamenti al localStorage (es. login/logout)
    React.useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem('alzheimer_user'));
        };
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
                    <Route index element={<ListPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="feed" element={<FeedPage />} />
                    <Route path="impostazioni" element={<SettingsPage />} />
                </Route>
            </Routes>
            {showSafePrompt && <NotificationPrompt onDone={() => setShowSafePrompt(false)} />}
        </BrowserRouter>
    );
}

export default App;
