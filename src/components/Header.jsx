import { Link } from 'react-router-dom';
import AppIcon from './AppIcon';
import { useState, useEffect } from 'react';

const Header = ({ title }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('alzheimer_user') || '{}'));

    // Listen for profile updates
    useEffect(() => {
        const handleStorageChange = () => {
            setUser(JSON.parse(localStorage.getItem('alzheimer_user') || '{}'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const styles = {
        header: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 'var(--header-height)',
            backgroundColor: 'var(--color-bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: '1px solid var(--color-border)',
            zIndex: 100,
            padding: '0 16px',
        },
        title: {
            fontSize: '1.25rem',
            color: 'var(--color-primary-dark)',
            fontWeight: '700',
            letterSpacing: '-0.02em',
        },
        profileBtn: {
            position: 'absolute',
            left: '24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
        },
        avatar: {
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            overflow: 'hidden',
            fontSize: '1rem',
            boxShadow: 'var(--shadow-sm)',
        },
        avatarImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        settingsBtn: {
            position: 'absolute',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'var(--color-primary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '10px',
        }
    };

    return (
        <header className="app-header" style={styles.header}>
            <Link to="/profilo" className="app-header-profile" style={styles.profileBtn}>
                <div style={styles.avatar}>
                    {user.photo ? (
                        <img src={user.photo} style={styles.avatarImg} alt="Profilo" />
                    ) : (
                        user.name?.[0] || <AppIcon name="user" size={20} />
                    )}
                </div>
            </Link>
            <h1 style={styles.title}>{title}</h1>
            <Link to="/impostazioni" className="app-header-settings" style={styles.settingsBtn}>
                <AppIcon name="settings" size={24} />
            </Link>
        </header>
    );
};

export default Header;
