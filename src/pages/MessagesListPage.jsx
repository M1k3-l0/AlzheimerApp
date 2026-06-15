import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AppIcon from '../components/AppIcon';
import { formatFullName, getSearchAvatarUrl } from '../utils/avatarUtils';
import { withMockConversations } from '../utils/chatMockData';

const MessagesListPage = () => {
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{}');
    const currentUserId = user.id;

    useEffect(() => {
        if (!currentUserId) return;
        fetchConversations();

        const channel = supabase
            .channel('messages-list')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'private_messages' }, () => {
                fetchConversations();
            })
            .subscribe();
        
        return () => { supabase.removeChannel(channel); };
    }, [currentUserId]);

    const fetchConversations = async () => {
        try {
            const [{ data, error }, { data: profiles }] = await Promise.all([
                supabase
                    .from('private_messages')
                    .select('*, sender:profiles!private_messages_sender_id_fkey(*), receiver:profiles!private_messages_receiver_id_fkey(*)')
                    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                    .order('created_at', { ascending: false }),
                supabase.from('profiles').select('*'),
            ]);

            if (error) throw error;

            const convMap = {};
            (data || []).forEach((msg) => {
                const otherUser = msg.sender_id === currentUserId ? msg.receiver : msg.sender;
                if (!otherUser) return;
                if (!convMap[otherUser.id]) {
                    const isAudio = msg.content && typeof msg.content === 'string' && (msg.content.includes('.webm') || msg.content.includes('.mp4') || msg.content.includes('.m4a') || msg.content.includes('.wav'));
                    convMap[otherUser.id] = {
                        user: {
                            ...otherUser,
                            photo_url: otherUser.photo_url || otherUser.photo || getSearchAvatarUrl(otherUser),
                        },
                        lastMessage: isAudio ? 'Messaggio vocale' : msg.content,
                        time: new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                        date: new Date(msg.created_at),
                        unread: !msg.is_read && msg.receiver_id === currentUserId,
                    };
                }
            });

            const merged = withMockConversations(
                Object.values(convMap),
                currentUserId,
                profiles || [],
                user,
            );
            setConversations(merged);
        } catch (e) {
            console.error("Errore fetch conversazioni:", e);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        container: {
            width: '100%',
            backgroundColor: 'var(--color-bg-primary)',
            minHeight: '100%',
            padding: '20px 16px 100px 16px',
            boxSizing: 'border-box',
        },
        title: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
            color: 'var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            transition: 'transform 0.1s',
        },
        avatar: {
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.125rem',
            overflow: 'hidden',
        },
        content: {
            flex: 1,
            minWidth: 0,
        },
        name: {
            fontWeight: 'bold',
            fontSize: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        lastMsg: {
            fontSize: '0.875rem',
            color: '#6B7280',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: '2px',
        },
        time: {
            fontSize: '0.75rem',
            color: '#9CA3AF',
            fontWeight: 'normal',
        },
        unreadBadge: {
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Caricamento messaggi...</div>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <AppIcon name="arrow-left" size={28} color="primary" />
                </button>
                Messaggi Privati
            </h1>

            {conversations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                    <AppIcon name="comments" size={48} color="#E5E7EB" />
                    <p style={{ marginTop: '16px' }}>Non hai ancora nessuna conversazione.<br/>Vai sul profilo di un utente per scrivergli!</p>
                </div>
            ) : (
                conversations.map(conv => (
                    <div key={conv.user.id} style={styles.card} onClick={() => navigate(`/chat-privata/${conv.user.id}`)}>
                        <div style={styles.avatar}>
                            {conv.user.photo_url ? <img src={conv.user.photo_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt="Avatar" /> : conv.user.name[0]}
                        </div>
                        <div style={styles.content}>
                            <div style={styles.name}>
                                {formatFullName(conv.user)}
                                <span style={styles.time}>{conv.time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <p style={{...styles.lastMsg, fontWeight: conv.unread ? 'bold' : 'normal', color: conv.unread ? '#111' : '#6B7280'}}>
                                    {conv.lastMessage}
                                </p>
                                {conv.unread && <div style={styles.unreadBadge}></div>}
                            </div>
                        </div>
                        <AppIcon name="angle-right" size={16} color="#D1D5DB" />
                    </div>
                ))
            )}
        </div>
    );
};

export default MessagesListPage;
