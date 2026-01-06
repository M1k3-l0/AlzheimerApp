import React from 'react';

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
            justifyContent: 'center',
            borderBottom: '1px solid var(--color-border)',
            zIndex: 100,
            padding: '0 16px',
        },
        title: {
            fontSize: '22px',
            color: 'var(--color-text-primary)',
        }
    };

    return (
        <header style={styles.header}>
            <h1 style={styles.title}>{title}</h1>
        </header>
    );
};

export default Header;
