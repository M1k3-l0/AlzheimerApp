import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ListPage from './pages/ListPage';
import ChatPage from './pages/ChatPage';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';

function App() {
    // Controllo semplice dell'autenticazione
    const isAuthenticated = !!localStorage.getItem('alzheimer_user');

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
                    <Route index element={<ListPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="feed" element={<FeedPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
