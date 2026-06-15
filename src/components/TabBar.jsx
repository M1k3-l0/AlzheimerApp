import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import AppIcon from './AppIcon';
import { supabase } from '../supabaseClient';
import styles from './TabBar.module.css';

const TabBar = () => {
    const [hasUnreadGeneral, setHasUnreadGeneral] = useState(false);
    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{}');

    useEffect(() => {
        if (!user.id) return;

        const checkUnread = async () => {
            const lastView = localStorage.getItem('last_chat_view') || '1970-01-01T00:00:00Z';
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .gt('created_at', lastView)
                .neq('sender_id', user.id); // Non contare i propri messaggi
            
            setHasUnreadGeneral(count > 0);
        };

        checkUnread();

        // Realtime per chat generale
        const channel = supabase
            .channel('general-chat-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            }, (payload) => {
                if (payload.new.sender_id !== user.id) {
                    setHasUnreadGeneral(true);
                }
            })
            .subscribe();

        // Ascolta quando l'utente entra nella chat per resettare
        const handleViewReset = () => {
            if (window.location.hash.includes('/chat')) {
                localStorage.setItem('last_chat_view', new Date().toISOString());
                setHasUnreadGeneral(false);
            }
        };

        window.addEventListener('popstate', handleViewReset);
        window.addEventListener('hashchange', handleViewReset);
        
        return () => {
            supabase.removeChannel(channel);
            window.removeEventListener('popstate', handleViewReset);
            window.removeEventListener('hashchange', handleViewReset);
        };
    }, [user.id, window.location.hash]);

    /** Compensa viewBox e padding diversi tra le SVG (512 vs 24, pieno vs cerchio) */
    const TAB_ICON_SCALE = {
        home: 0.86,
        comments: 0.9,
        'users-alt': 0.92,
        brain: 1,
        user: 0.86,
    };

    const TabIcon = ({ name, filled }) => (
        <span className={`${styles.tabIconSlot} ${filled ? styles.tabIconFilled : ''}`}>
            <AppIcon
                name={name}
                size={24}
                style={{ transform: `scale(${TAB_ICON_SCALE[name] ?? 1})` }}
            />
        </span>
    );

    const isHealthcare = user.role === 'healthcare';

    return (
        <nav className={`${styles.tabBar} bottom-navbar`} aria-label="Navigazione principale">
            <NavLink
                to="/"
                className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
            >
                <TabIcon name="home" />
                <span className={styles.label}>HOME</span>
            </NavLink>

            <NavLink
                to="/chat"
                className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
            >
                <span className={styles.tabIconSlot}>
                    <AppIcon
                        name="comments"
                        size={24}
                        style={{ transform: `scale(${TAB_ICON_SCALE.comments})` }}
                    />
                    {hasUnreadGeneral && (
                        <div style={{
                            position: 'absolute',
                            top: '-3px',
                            right: '-3px',
                            width: '12px',
                            height: '12px',
                            backgroundColor: '#EF4444',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 0 4px rgba(239, 68, 68, 0.4)'
                        }} />
                    )}
                </span>
                <span className={styles.label}>Chat</span>
            </NavLink>

            <NavLink
                to="/feed"
                className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
            >
                <TabIcon name="users-alt" />
                <span className={styles.label}>Social</span>
            </NavLink>

            {!isHealthcare && (
                <NavLink
                    to="/analytics"
                    className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
                >
                    <TabIcon name="brain" filled />
                    <span className={styles.label}>Analisi</span>
                </NavLink>
            )}

            <NavLink
                to="/profilo"
                className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
            >
                <TabIcon name="user" />
                <span className={styles.label}>Profilo</span>
            </NavLink>
        </nav>
    );
};

export default TabBar;

