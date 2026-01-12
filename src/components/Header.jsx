import { Link } from 'react-router-dom';
import { Settings, User } from 'lucide-react';
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
            fontSize: '22px',
            color: 'var(--color-primary-dark)',
            fontWeight: '800'
        },
        profileBtn: {
            position: 'absolute',
            left: '16px',
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
            fontWeight: 'bold',
            overflow: 'hidden',
            fontSize: '16px'
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
            cursor: 'pointer'
        }
    };

    return (
        <header style={styles.header}>
            <Link to="/profilo" style={styles.profileBtn}>
                <div style={styles.avatar}>
                    {user.photo ? (
                        <img src={user.photo} style={styles.avatarImg} alt="Profilo" />
                    ) : (
                        user.name?.[0] || <User size={20} />
                    )}
                </div>
            </Link>
            <h1 style={styles.title}>{title}</h1>
            <Link to="/impostazioni" style={styles.settingsBtn}>
                <Settings />
            </Link>
        </header>
    );
};

export default Header;
