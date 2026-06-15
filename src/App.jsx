import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import GlobalErrorBoundary from './components/DebugConsole/GlobalErrorBoundary';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { isDev } from './utils/dev';
import { logout } from './utils/logout';
import ListPage from './pages/ListPage';
import ChatPage from './pages/ChatPage';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ReportUmorePage from './pages/ReportUmorePage';
import UsersPage from './pages/UsersPage';
import MessagesListPage from './pages/MessagesListPage';
import PrivateChatPage from './pages/PrivateChatPage';
import FindPeoplePage from './pages/FindPeoplePage';
import GuidePage from './pages/GuidePage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIChatPage from './pages/AIChatPage';

function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const location = useLocation();

    React.useEffect(() => {
        let mounted = true;

        const initSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!mounted) return;

                if (!session) {
                    localStorage.removeItem('alzheimer_user');
                    if (!isDev) localStorage.removeItem('simulated_role');
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                setIsAuthenticated(!!session);
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('alzheimer_user');
                if (!isDev) localStorage.removeItem('simulated_role');
                setIsAuthenticated(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    React.useEffect(() => {
        let interval;
        if (isAuthenticated) {
            const sendSignal = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;
                if (!userId) return;

                await supabase
                    .from('profiles')
                    .update({ last_active: new Date().toISOString() })
                    .eq('id', userId);
            };

            sendSignal();
            interval = setInterval(sendSignal, 30000);
        }
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    React.useEffect(() => {
        if (!isAuthenticated) return;

        const syncProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                const userId = session?.user?.id;

                if (!userId) {
                    localStorage.removeItem('alzheimer_user');
                    setIsAuthenticated(false);
                    return;
                }

                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (error || !profile) {
                    const { data: { user } } = await supabase.auth.getUser();
                    const newProfile = {
                        id: userId,
                        name: user?.user_metadata?.name || 'Utente',
                        surname: user?.user_metadata?.surname || '',
                        role: user?.user_metadata?.role || 'caregiver',
                        email: user?.email || userId,
                        photo_url: user?.user_metadata?.photo_url || null
                    };

                    await supabase.from('profiles').upsert([newProfile]).select().single();
                    return;
                }

                if (profile.is_banned) {
                    await logout();
                    return;
                }

                const simulatedRole = isDev ? localStorage.getItem('simulated_role') : null;
                const updatedUser = {
                    id: userId,
                    name: profile.name,
                    surname: profile.surname,
                    email: profile.email,
                    role: simulatedRole || profile.role,
                    photo: profile.photo_url
                };

                localStorage.setItem('alzheimer_user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('user_updated'));
            } catch (e) {
                console.error('Errore sync profilo:', e);
            }
        };

        syncProfile();
    }, [isAuthenticated, location.pathname]);

    if (loading) {
        return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-primary)' }}>Caricamento sessione...</div>;
    }

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
                    <Route index element={<ListPage />} />
                    <Route path="chat" element={<ChatPage />} />
                    <Route path="feed" element={<FeedPage />} />
                    <Route path="profilo" element={<ProfilePage />} />
                    <Route path="profilo/:id" element={<ProfilePage />} />
                    <Route path="messaggi" element={<MessagesListPage />} />
                    <Route path="chat-privata/:receiverId" element={<PrivateChatPage />} />
                    <Route path="cerca-persone" element={<FindPeoplePage />} />
                    <Route path="impostazioni" element={<SettingsPage />} />
                    <Route path="report-umore" element={<ReportUmorePage />} />
                    <Route path="report-umore/:userId" element={<ReportUmorePage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="guida" element={<GuidePage />} />
                    <Route path="analytics" element={<AnalyticsPage />} />
                    <Route path="ai-chat" element={<AIChatPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
}

const DevTools = isDev
    ? React.lazy(async () => {
        const [{ default: ErrorInterceptor }, { default: DebugConsole }] = await Promise.all([
            import('./components/DebugConsole/ErrorInterceptor'),
            import('./components/DebugConsole/DebugConsole'),
        ]);
        return {
            default: () => (
                <>
                    <ErrorInterceptor />
                    <DebugConsole />
                </>
            ),
        };
    })
    : null;

const AppWrapper = () => (
    <GlobalErrorBoundary>
        <HashRouter>
            <App />
        </HashRouter>
        {DevTools && (
            <React.Suspense fallback={null}>
                <DevTools />
            </React.Suspense>
        )}
    </GlobalErrorBoundary>
);

export default AppWrapper;
