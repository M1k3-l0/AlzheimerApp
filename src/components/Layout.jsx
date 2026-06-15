import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import TabBar from './TabBar';
import Header from './Header';
import FloatingSosButton from './FloatingSosButton';
import { isDev } from '../utils/dev';

const pageTransition = (reduced) => ({
    initial: reduced ? false : { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: reduced ? false : { opacity: 0, x: -20 },
    transition: { 
        duration: reduced ? 0 : 0.35, 
        ease: [0.25, 1, 0.5, 1] // Custom cubic-bezier for a "fluid" feel
    }
});

const Layout = () => {
    const location = useLocation();
    const reduceMotion = useReducedMotion();

    // Sincronizza Caratteri Grandi: classe su html in base al flag in localStorage
    useEffect(() => {
        const isLarge = localStorage.getItem('setting_largeText') === 'true';
        if (isLarge) document.documentElement.classList.add('large-font-mode');
        else document.documentElement.classList.remove('large-font-mode');
    }, []);

    const currentPath = window.location.hash.replace('#', '');
    const isFullPage = currentPath.includes('chat') || 
                       currentPath.includes('profilo') || 
                       ['/', '/chat', '/feed', '/profilo'].includes(currentPath);
    const isPrivateChatPage = currentPath.includes('chat-privata');
    const isGroupChatPage = currentPath === '/chat' || currentPath.startsWith('/chat?');
    const isChatFillLayout = isGroupChatPage || isPrivateChatPage;
    const isProfilePage = currentPath.includes('profilo');
    const hideTabBar = isPrivateChatPage;
    const isGuidePage = currentPath.includes('guida');
    
    const getTitle = (path) => {
        if (path.includes('chat-privata')) return 'Chat';
        if (path.startsWith('/profilo/')) return 'Profilo';
        if (path.startsWith('/feed')) return 'Memoriae';
        if (path.startsWith('/messaggi')) return 'Messaggi';
        if (path.startsWith('/cerca-persone') || path.startsWith('/utenti')) return 'Ricerca';
        if (path.startsWith('/impostazioni')) return 'Impostazioni';
        if (path.startsWith('/report-umore')) return 'Report Umore';
        if (path.startsWith('/guida')) return 'Guida all\'Uso';
        if (path.startsWith('/analytics')) return 'Analisi e Dati';
        if (path.startsWith('/ai-chat')) return 'Assistente AI';
        if (path.startsWith('/users')) return 'Gestione Utenti';
        
        if (path === '/' || path === '') return 'Home';
        return 'Memora';
    };

    const simulatedRole = isDev ? localStorage.getItem('simulated_role') : null;

    return (
        <div className={`app-container${isFullPage ? ' full-page' : ''}`}>
            {simulatedRole && (
                <div style={{
                    position: 'fixed',
                    top: '14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#10b981',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.625rem',
                    fontWeight: 'bold',
                    zIndex: 10001,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: '1px solid rgba(255,255,255,0.3)'
                }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }} />
                    SIMULAZIONE: {simulatedRole.toUpperCase()}
                </div>
            )}
            <Header title={getTitle(currentPath)} />
            <main className={`main-content${isFullPage ? ' full-page' : ''}${isChatFillLayout ? ' full-page-fill' : ''}${isProfilePage ? ' page-profilo' : ''}${isGuidePage ? ' page-guida' : ''}`} style={{ paddingTop: 'var(--header-height)' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        {...pageTransition(reduceMotion)}
                        style={isChatFillLayout ? { height: '100%', minHeight: 0 } : undefined}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            {!hideTabBar && <TabBar />}
            <FloatingSosButton />
        </div>
    );
};

export default Layout;
