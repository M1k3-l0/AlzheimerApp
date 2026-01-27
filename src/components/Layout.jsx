import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TabBar from './TabBar';
import Header from './Header';

const Layout = () => {
    const location = useLocation();

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
                <Outlet />
            </main>
            <TabBar />
        </div>
    );
};

export default Layout;

