import React, { useState, useEffect } from 'react';
import { 
    User, 
    Settings, 
    LogOut, 
    Mail, 
    Shield, 
    Calendar,
    Smile,
    Meh,
    Frown,
    Heart
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('alzheimer_user') || '{}'));
    const [currentMood, setCurrentMood] = useState(null);
    const [loading, setLoading] = useState(true);

    const isPatient = user.role === 'patient';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const profileId = user.id || (user.name + (user.surname || ''));
                const { data, error } = await supabase
                    .from('profiles')
                    .select('current_mood, role, bio, location')
                    .eq('id', profileId)
                    .single();

                if (!error && data) {
                    setCurrentMood(data.current_mood);
                    setUser(prev => ({ ...prev, ...data }));
                }
            } catch (e) {
                console.error("Error fetching user data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [user.id, user.name, user.surname]);

    const handleLogout = () => {
        if (window.confirm("Sei sicuro di voler uscire?")) {
            localStorage.removeItem('alzheimer_user');
            window.location.href = '/login';
        }
    };

    const handleMoodSelect = async (mood) => {
        if (!isPatient) return;
        setCurrentMood(mood);
        try {
            const profileId = user.id || (user.name + (user.surname || ''));
            await supabase.from('profiles').upsert([{ 
                id: profileId, 
                current_mood: mood,
                name: user.name,
                surname: user.surname,
                role: user.role
            }]);
        } catch (e) {
            console.error("Error saving mood", e);
        }
    };

    const getMoodIcon = (mood) => {
        switch (mood) {
            case 'happy': return <Smile size={20} color="#F59E0B" />;
            case 'neutral': return <Meh size={20} color="#9CA3AF" />;
            case 'sad': return <Frown size={20} color="#EF4444" />;
            default: return null;
        }
    };

    const getRoleLabel = (r) => {
        switch(r) { 
            case 'patient': return 'Paziente'; 
            case 'caregiver': return 'Caregiver'; 
            case 'healthcare': return 'Medico'; 
            default: return 'Utente'; 
        }
    };

    const styles = {
        container: {
            padding: '24px',
            backgroundColor: '#F9F9FB',
            minHeight: '100dvh',
        },
        headerCard: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            marginBottom: '20px',
        },
        avatarContainer: {
            position: 'relative',
            marginBottom: '16px',
        },
        avatar: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '36px',
            fontWeight: 'bold',
            overflow: 'hidden',
            border: '4px solid #fff',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        },
        moodBadge: {
            position: 'absolute',
            bottom: '0',
            right: '0',
            backgroundColor: 'white',
            borderRadius: '50%',
            padding: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        name: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1A1A1A',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
        },
        roleBadge: {
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            color: 'var(--color-primary)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '12px',
        },
        moodIconContainer: {
            display: 'flex',
            gap: '12px',
            marginTop: '12px',
            justifyContent: 'center',
        },
        moodBtn: (mood) => ({
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: currentMood === mood ? 'rgba(124, 58, 237, 0.1)' : '#F3F4F6',
            border: currentMood === mood ? '2px solid #7C3AED' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        }),
        infoCard: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            marginBottom: '20px',
        },
        infoRow: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 0',
            borderBottom: '1px solid #F3F4F6',
            color: '#4B5563',
            fontSize: '15px',
        },
        actionCard: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            marginBottom: '20px',
        },
        actionBtn: {
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'none',
            border: 'none',
            color: '#1F2937',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            borderRadius: '16px',
            transition: 'background-color 0.2s',
        },
        logoutBtn: {
            width: '100%',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: 'none',
            color: '#EF4444',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '20px',
            cursor: 'pointer',
            marginTop: '10px',
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Caricamento...</div>;

    return (
        <div style={styles.container}>
            {/* Minimal Header Card */}
            <div style={styles.headerCard}>
                <div style={styles.avatarContainer}>
                    <div style={styles.avatar}>
                        {user.photo ? <img src={user.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" /> : user.name?.[0]}
                    </div>
                    {!isPatient && currentMood && (
                        <div style={styles.moodBadge}>
                            {getMoodIcon(currentMood)}
                        </div>
                    )}
                </div>
                <h1 style={styles.name}>
                    {user.name} {user.surname}
                </h1>
                <div style={styles.roleBadge}>{getRoleLabel(user.role)}</div>

                {isPatient && (
                    <div style={styles.moodIconContainer}>
                        <div style={styles.moodBtn('happy')} onClick={() => handleMoodSelect('happy')}>
                            <Smile size={24} color={currentMood === 'happy' ? "#7C3AED" : "#F59E0B"} />
                        </div>
                        <div style={styles.moodBtn('neutral')} onClick={() => handleMoodSelect('neutral')}>
                            <Meh size={24} color={currentMood === 'neutral' ? "#7C3AED" : "#9CA3AF"} />
                        </div>
                        <div style={styles.moodBtn('sad')} onClick={() => handleMoodSelect('sad')}>
                            <Frown size={24} color={currentMood === 'sad' ? "#7C3AED" : "#EF4444"} />
                        </div>
                    </div>
                )}

                {user.bio && <p style={{ color: '#6B7280', fontSize: '14px', margin: '12px 0 0 0' }}>{user.bio}</p>}
            </div>

            {/* Account Details Card */}
            <div style={styles.infoCard}>
                <div style={styles.infoRow}>
                    <Mail size={20} color="var(--color-primary)" />
                    <span>{user.email || 'Email non disponibile'}</span>
                </div>
                <div style={styles.infoRow}>
                    <Shield size={20} color="var(--color-primary)" />
                    <span>Ruolo: <strong>{getRoleLabel(user.role)}</strong></span>
                </div>
                <div style={{ ...styles.infoRow, borderBottom: 'none' }}>
                    <Calendar size={20} color="var(--color-primary)" />
                    <span>Iscritto a Gennaio 2026</span>
                </div>
            </div>

            {/* Quick Actions Card */}
            <div style={styles.actionCard}>
                <button style={styles.actionBtn} onClick={() => navigate('/impostazioni')}>
                    <Settings size={20} color="#6B7280" />
                    <span>Impostazioni App</span>
                </button>
                <button style={{ ...styles.actionBtn, borderTop: '1px solid #F3F4F6' }} onClick={() => navigate('/feed')}>
                    <Heart size={20} color="#6B7280" />
                    <span>I miei Post</span>
                </button>
            </div>

            {/* Logout Button */}
            <button style={styles.logoutBtn} onClick={handleLogout}>
                <LogOut size={20} />
                <span>Disconnetti</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '30px', color: '#9CA3AF', fontSize: '12px' }}>
                Memora v2.0 • Made with ❤️ for CosmoNet
            </div>
        </div>
    );
};

export default ProfilePage;
