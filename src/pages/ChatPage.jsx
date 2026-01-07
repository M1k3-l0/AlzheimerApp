import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);

    // Recupera utente corrente
    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{"name":"Utente"}');
    const currentUserId = user.name + (user.surname || '');

    // Carica messaggi iniziali
    useEffect(() => {
        fetchMessages();

        // Subscribe a nuovi messaggi in tempo reale
        const channel = supabase
            .channel('messages')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const msg = payload.new;
                    setMessages(prev => {
                        // Evita duplicati se l'insert arriva sia da risposta API che da realtime
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, {
                            id: msg.id,
                            text: msg.text,
                            sender: msg.sender_id === currentUserId ? 'me' : 'other',
                            senderName: msg.sender_name,
                            time: new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                        }];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId]);

    const fetchMessages = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (!error && data) {
                setMessages(data.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    sender: msg.sender_id === currentUserId ? 'me' : 'other',
                    senderName: msg.sender_name,
                    time: new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                })));
            }
        } catch (e) {
            console.error("Errore fetch messaggi");
        }
        setLoading(false);
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const { error } = await supabase
            .from('messages')
            .insert([{
                text: inputText,
                sender_name: user.name + ' ' + (user.surname || ''),
                sender_id: currentUserId
            }]);

        if (!error) {
            setInputText("");
        }
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'var(--color-bg-primary)',
        },
        messageList: {
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingBottom: '20px'
        },
        messageBubble: (sender) => ({
            maxWidth: '85%',
            padding: '12px 16px',
            borderRadius: '18px',
            backgroundColor: sender === 'me' ? 'var(--color-primary)' : 'white',
            color: sender === 'me' ? 'white' : 'var(--color-text-primary)',
            alignSelf: sender === 'me' ? 'flex-end' : 'flex-start',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            borderBottomRightRadius: sender === 'me' ? '4px' : '18px',
            borderBottomLeftRadius: sender === 'me' ? '18px' : '4px',
        }),
        messageText: {
            fontSize: '16px',
            lineHeight: '1.4',
            fontWeight: '500'
        },
        messageTime: (sender) => ({
            fontSize: '10px',
            color: sender === 'me' ? 'rgba(255,255,255,0.7)' : '#999',
            textAlign: 'right',
            marginTop: '4px',
        }),
        inputArea: {
            padding: '12px 16px',
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderTop: '1px solid var(--color-border)',
            paddingBottom: 'calc(12px + var(--safe-area-bottom))'
        },
        input: {
            flex: 1,
            padding: '12px 20px',
            borderRadius: '25px',
            border: '1px solid #eee',
            backgroundColor: '#F3F4F6',
            fontSize: '16px',
            outline: 'none',
        },
        sendButton: {
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(156, 105, 167, 0.3)'
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.container, justifyContent: 'center', alignItems: 'center' }}>
                <div style={{color: 'var(--color-primary)', fontWeight: 'bold'}}>Apertura chat...</div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.messageList}>
                {messages.length === 0 ? (
                    <div style={{textAlign:'center', color:'#888', marginTop: '20px', fontSize: '14px'}}>Nessun messaggio. Inizia la conversazione! 👋</div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} style={styles.messageBubble(msg.sender)}>
                            {msg.sender === 'other' && (
                                <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '4px' }}>
                                    {msg.senderName}
                                </div>
                            )}
                            <div style={styles.messageText}>{msg.text}</div>
                            <div style={styles.messageTime(msg.sender)}>{msg.time}</div>
                        </div>
                    ))
                )}
            </div>
            <div style={styles.inputArea}>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Scrivi un messaggio..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button style={styles.sendButton} onClick={handleSend}>
                    <Send size={20} fill="white" />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
