import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

const Header = ({ title }) => {
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
            justifyContent: 'center', // Center title by default
            borderBottom: '1px solid var(--color-border)',
            zIndex: 100,
            padding: '0 16px',
        },
        title: {
            fontSize: '22px',
            color: 'var(--color-primary-dark)',
            fontWeight: '800'
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
            <h1 style={styles.title}>{title}</h1>
            <Link to="/impostazioni" style={styles.settingsBtn}>
                <Settings />
            </Link>
        </header>
    );
};

export default Header;
