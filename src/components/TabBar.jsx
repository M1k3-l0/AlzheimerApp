import React from 'react';
import { NavLink } from 'react-router-dom';
import { ListTodo, MessageCircle, Users } from 'lucide-react';
import styles from './TabBar.module.css';

const TabBar = () => {
    return (
        <nav className={styles.tabBar}>
            <NavLink
                to="/"
                className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
            >
                <ListTodo size={32} />
                <span className={styles.label}>Attività</span>
            </NavLink>

            <NavLink
                to="/chat"
                className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
            >
                <MessageCircle size={32} />
                <span className={styles.label}>Chat</span>
            </NavLink>

            <NavLink
                to="/feed"
                className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
            >
                <Users size={32} />
                <span className={styles.label}>Amici</span>
            </NavLink>
        </nav>
    );
};

export default TabBar;
