import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import AppIcon from '../components/AppIcon';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { getUserCardStyle, getRoleBadgeStyle, formatFullName, getRoleLabel } from '../utils/avatarUtils';
import SearchUserAvatar from '../components/SearchUserAvatar';

const FindPeoplePage = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const currentUser = JSON.parse(localStorage.getItem('alzheimer_user') || '{}');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, surname, email, photo_url, role, last_active')
            .order('name', { ascending: true });
        
        if (error) {
            console.error("Error fetching users:", error);
        } else {
            // Filtriamo noi stessi qui invece che nella query per sicurezza
            setUsers(data.filter(u => u.id !== currentUser.id));
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(u => {
        const fullName = `${u.name} ${u.surname}`.toLowerCase();
        return fullName.includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const styles = {
        container: { padding: '20px', backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', paddingBottom: '100px' },
        header: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary-dark)', margin: 0 },
        searchContainer: {
            position: 'relative',
            marginBottom: '20px',
        },
        searchInput: {
            width: '100%',
            padding: '12px 16px 12px 44px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            fontSize: '1rem',
            outline: 'none',
            boxSizing: 'border-box',
            backgroundColor: 'white',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        },
        searchIcon: {
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
        },
        userCard: { 
            borderRadius: '16px', 
            padding: '12px 16px', 
            marginBottom: '10px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            textDecoration: 'none',
            color: 'inherit',
        },
        userInfo: { flex: 1, minWidth: 0 },
        userName: { fontWeight: 'bold', fontSize: '0.9375rem', color: '#111' },
        userRole: { fontSize: '0.75rem', color: '#6B7280' },
        roleBadge: {
            fontSize: '0.625rem',
            padding: '2px 8px',
            borderRadius: '10px',
            fontWeight: 'bold',
            marginTop: '2px',
            display: 'inline-block',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <AppIcon name="arrow-left" size={24} color="primary" />
                </button>
                <h1 style={styles.title}>Cerca Persone</h1>
            </div>

            <div style={styles.searchContainer}>
                <Search style={styles.searchIcon} size={20} />
                <input 
                    type="text" 
                    placeholder="Cerca per nome, cognome o email..." 
                    style={styles.searchInput}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Caricamento utenti...</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredUsers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Nessun utente trovato</div>
                    ) : (
                        filteredUsers.map(u => (
                            <Link
                                key={u.id}
                                to={`/profilo/${u.id}`}
                                style={{ ...styles.userCard, ...getUserCardStyle(u.role) }}
                            >
                                <SearchUserAvatar user={u} size={48} />
                                <div style={styles.userInfo}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={styles.userName}>{formatFullName(u)}</div>
                                        <div style={{ 
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            backgroundColor: (u.last_active && (new Date() - new Date(u.last_active)) < 600000) ? '#10B981' : '#EF4444' 
                                        }} />
                                    </div>
                                    <div style={{ ...styles.roleBadge, ...getRoleBadgeStyle() }}>
                                        {getRoleLabel(u.role)}
                                    </div>
                                </div>
                                <ChevronRight size={18} color="#D1D5DB" />
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FindPeoplePage;
