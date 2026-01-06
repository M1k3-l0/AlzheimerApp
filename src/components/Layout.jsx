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
            case '/feed': return 'Bacheca Amici';
            default: return 'App';
        }
    };

    return (
        <div className="app-container">
            <Header title={getTitle(location.pathname)} />
            <main className="main-content">
                <Outlet />
            </main>
            <TabBar />
        </div>
    );
};

export default Layout;
