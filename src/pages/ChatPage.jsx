import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import AppIcon from '../components/AppIcon';
import {
    withMockGroupMessages,
    appendLocalGroupMessage,
} from '../utils/chatMockData';
import { formatFullName } from '../utils/avatarUtils';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [hasMockThread, setHasMockThread] = useState(false);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const messagesScrollerRef = useRef(null);
    const shouldStickToBottomRef = useRef(true);
    const [viewportHeight, setViewportHeight] = useState(window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

    // Gestione altezza dinamica e rilevamento tastiera
    useEffect(() => {
        const handleResize = () => {
             // L'altezza visuale corrente
            const currentHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            setViewportHeight(currentHeight);
            
            // Se l'altezza disponibile è significativamente minore dell'altezza dello schermo, la tastiera è aperta
            // (Usiamo una soglia di 150px che è meno di qualsiasi tastiera virtuale)
            const screenHeight = window.screen.height;
            // Nota: su mobile window.innerHeight cambia, window.screen.height no
            // Se la differenza è grande (> 20%), probabile tastiera
            if (currentHeight < window.outerHeight * 0.75) {
                setIsKeyboardOpen(true);
            } else {
                setIsKeyboardOpen(false);
            }
            
            // Scrolla in basso solo se l'utente era già in fondo alla lista
            setTimeout(() => {
                if (shouldStickToBottomRef.current) scrollToBottom(false);
            }, 100);
        };

        // Ascolta sia resize standard che visualViewport (più preciso su mobile moderni)
        window.visualViewport?.addEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);
        
        // Initial check
        handleResize();

        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const scrollToBottom = (smooth = true) => {
        const scroller = messagesScrollerRef.current;
        if (scroller) {
            scroller.scrollTo({
                top: scroller.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto',
            });
            return;
        }
        messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    };

    useEffect(() => {
        const scroller = messagesScrollerRef.current;
        if (!scroller) return undefined;

        const handleScroll = () => {
            const distanceFromBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
            shouldStickToBottomRef.current = distanceFromBottom < 80;
        };

        scroller.addEventListener('scroll', handleScroll, { passive: true });
        return () => scroller.removeEventListener('scroll', handleScroll);
    }, [loading]);

    useEffect(() => {
        if (!loading) {
            shouldStickToBottomRef.current = true;
            scrollToBottom(false);
        }
    }, [loading]);

    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{"name":"Utente"}');
    const currentUserId = user.id || (user.name + (user.surname || ''));

    useEffect(() => {
        fetchMessages();
        const channel = supabase
            .channel('messages')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    const msg = payload.new;
                    setMessages(prev => {
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
        return () => { supabase.removeChannel(channel); };
    }, [currentUserId]);

    const fetchMessages = async () => {
        try {
            const [{ data }, { data: profiles }] = await Promise.all([
                supabase.from('messages').select('*').order('created_at', { ascending: true }),
                supabase.from('profiles').select('*'),
            ]);

            const merged = withMockGroupMessages(data || [], profiles || []);
            const isMock = !(data?.length);
            setHasMockThread(isMock);

            setMessages(merged.map((msg) => ({
                id: msg.id,
                text: msg.text,
                sender: msg.sender_id === currentUserId ? 'me' : 'other',
                senderName: msg.sender_name || formatFullName(profiles?.find((p) => p.id === msg.sender_id)) || 'Utente',
                time: new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                isMock: Boolean(msg.isMock),
            })));
        } catch (e) {}
        setLoading(false);
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const textToSend = inputText;
        setInputText("");

        if (hasMockThread) {
            setMessages((prev) => appendLocalGroupMessage(prev, currentUserId, user, textToSend));
            shouldStickToBottomRef.current = true;
            setTimeout(() => scrollToBottom(true), 50);
            return;
        }

        const { error } = await supabase.from('messages').insert([{
            text: textToSend,
            sender_name: user.name + ' ' + (user.surname || ''),
            sender_id: currentUserId
        }]);

        if (error) {
            setInputText(textToSend);
            alert("Errore invio");
        } else {
            setTimeout(scrollToBottom, 50);
        }
    };

    const styles = {
        container: {
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-primary)',
            overflow: 'hidden',
        },
        chatInner: {
            width: '100%',
            maxWidth: 'var(--page-max-width)',
            marginLeft: 'auto',
            marginRight: 'auto',
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
        },
        messageList: {
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowX: 'hidden',
            overflowY: 'auto',
            paddingTop: '24px',
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
        },
        inputArea: {
            flexShrink: 0,
            minWidth: 0,
            padding: '12px 0',
            paddingBottom: '16px',
            backgroundColor: 'white',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--card-shadow)',
            boxSizing: 'border-box',
        },
        input: {
            flex: 1,
            minWidth: 0,
            maxWidth: '100%',
            padding: '12px var(--content-padding-x)',
            borderRadius: 'var(--card-radius-lg)',
            border: '1px solid #E5E7EB',
            fontSize: '1rem',
            outline: 'none',
            backgroundColor: 'var(--color-bg-primary)',
            minHeight: '44px',
            transition: 'border-color 0.2s',
        },
        sendButton: {
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 8px rgba(136, 0, 68, 0.25)',
        },
        bubble: (sender) => ({
            maxWidth: 'min(85%, 20rem)',
            minWidth: '4.5rem',
            padding: sender === 'me' ? '0.4375rem 0.625rem' : '0.25rem 0.625rem',
            borderRadius: '0.75rem',
            backgroundColor: sender === 'me' ? 'var(--color-primary)' : 'white',
            color: sender === 'me' ? 'var(--color-on-primary)' : 'var(--color-text-primary)',
            alignSelf: sender === 'me' ? 'flex-end' : 'flex-start',
            boxShadow: sender === 'me' ? '0 2px 10px rgba(136, 0, 68, 0.2)' : '0 2px 8px rgba(0,0,0,0.06)',
            borderBottomRightRadius: sender === 'me' ? '0.3125rem' : '0.75rem',
            borderBottomLeftRadius: sender === 'me' ? '0.75rem' : '0.3125rem',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            fontSize: '0.875rem',
            lineHeight: 1.3,
        }),
        emptyState: {
            textAlign: 'center',
            color: '#9CA3AF',
            marginTop: '40%',
            fontSize: '0.9375rem',
        },
        senderName: {
            fontSize: '0.6875rem',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '0.125rem',
        },
        messageText: {
            wordBreak: 'break-word',
            lineHeight: 1.3,
            fontSize: '0.875rem',
            margin: 0,
        },
        messageTime: {
            fontSize: '0.625rem',
            opacity: 0.8,
            textAlign: 'right',
            marginTop: '0.125rem',
        }
    };

    if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'40px',color:'#9CA3AF'}}>Caricamento messaggi...</div>;

    return (
        <div className="chat-page-wrapper chat-page" style={styles.container}>
            <div
                ref={messagesScrollerRef}
                className="messages-scroller chat-messages chat-messages-container"
                style={styles.messageList}
            >
                {messages.length === 0 && <div style={styles.emptyState}>Nessun messaggio ancora.<br/>Inizia la conversazione!</div>}
                {messages.map(msg => (
                    <div key={msg.id} className={`message-bubble ${msg.sender === 'me' ? 'sent' : 'received'}`} style={styles.bubble(msg.sender)}>
                        {msg.sender === 'other' && <div style={styles.senderName}>{msg.senderName}</div>}
                        <p style={styles.messageText}>{msg.text}</p>
                        <div style={styles.messageTime}>{msg.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-outer-wrapper">
                <div className="custom-chat-input">
                    <input
                        type="text"
                        placeholder="Scrivi un messaggio..."
                        className="inner-input"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                    />
                    <button type="button" className="send-button-circle" onClick={handleSend} aria-label="Invia">
                        <AppIcon name="paper-plane" size={22} color="white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;

