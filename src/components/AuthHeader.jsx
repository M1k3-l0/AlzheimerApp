import React from 'react';

/**
 * Testata con logo app + titolo MEMORA, usata in Login e Sign Up.
 */
const AuthHeader = () => (
    <header className="auth-header">
        <img src="/logo.svg" alt="Memora" className="auth-header__logo" />
        <span className="auth-logo-title">MEMORA</span>
    </header>
);

export default AuthHeader;
