import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import TabBar from './TabBar';
import Header from './Header';

const pageTransition = (reduced) => ({
    initial: reduced ? false : { opacity: 0 },
    animate: { opacity: 1 },
    exit: reduced ? false : { opacity: 0 },
    transition: { duration: reduced ? 0 : 0.2 }
});

const Layout = () => {
    const location = useLocation();
    const reduceMotion = useReducedMotion();

    const getTitle = (path) => {
        switch (path) {
            case '/': return 'Le mie Attività';
            case '/chat': return 'Messaggi';
            case '/feed': return 'MemoraBook';
            case '/impostazioni': return 'Impostazioni';
            default: return 'App';
        }
    };

    const isHome = location.pathname === '/';

    return (
        <div className="app-container">
            {!isHome && <Header title={getTitle(location.pathname)} />}
            <main className="main-content" style={{ paddingTop: isHome ? 0 : 'var(--header-height)' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        {...pageTransition(reduceMotion)}
                        style={{ height: '100%' }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <TabBar />
        </div>
    );
};

export default Layout;

