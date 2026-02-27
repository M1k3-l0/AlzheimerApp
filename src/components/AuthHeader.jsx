import React from 'react';

/**
 * Testata con logo (cervello) + titolo MEMORA, usata in Login e Sign Up.
 * Illustrazione 80px, testo Lexend 2.2rem, colore #6d3560.
 */
const AuthHeader = () => (
    <header className="auth-header">
        <img src="/logo.svg" alt="" className="auth-header__logo" />
        <span className="auth-logo-title">MEMORA</span>
    </header>
);

export default AuthHeader;
