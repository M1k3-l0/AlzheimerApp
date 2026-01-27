import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
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
            
            // Scrolla in basso quando cambia l'altezza (es. tastiera si apre)
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
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

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!loading) scrollToBottom();
    }, [messages, loading]);

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
            const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: true });
            if (data) {
                setMessages(data.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    sender: msg.sender_id === currentUserId ? 'me' : 'other',
                    senderName: msg.sender_name,
                    time: new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                })));
            }
        } catch (e) {}
        setLoading(false);
    };

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const textToSend = inputText;
        setInputText(""); 

        const { error } = await supabase.from('messages').insert([{
            text: textToSend,
            sender_name: user.name + ' ' + (user.surname || ''),
            sender_id: currentUserId
        }]);

        if (error) {
            setInputText(textToSend);
            alert("Errore invio");
        } else {
            // Force scroll after send
            setTimeout(scrollToBottom, 50);
        }
    };

    const styles = {
        container: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--color-bg-primary)',
            overflow: 'hidden',
        },
        messageList: {
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingBottom: '20px',
            WebkitOverflowScrolling: 'touch',
        },
        inputArea: {
            flexShrink: 0, 
            padding: '12px 16px',
            backgroundColor: 'white',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingBottom: '16px',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        },
        input: {
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid #E5E7EB',
            fontSize: '16px',
            outline: 'none',
            backgroundColor: '#F9F9FB',
            minHeight: '44px',
            transition: 'border-color 0.2s',
        },
        sendButton: {
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
        },
        bubble: (sender) => ({
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: '18px',
            backgroundColor: sender === 'me' ? 'var(--color-primary)' : 'white',
            color: sender === 'me' ? 'white' : '#1F2937',
            alignSelf: sender === 'me' ? 'flex-end' : 'flex-start',
            boxShadow: sender === 'me' ? '0 2px 8px rgba(124, 58, 237, 0.2)' : '0 2px 8px rgba(0,0,0,0.08)',
            borderBottomRightRadius: sender === 'me' ? '4px' : '18px',
            borderBottomLeftRadius: sender === 'me' ? '18px' : '4px',
        }),
        emptyState: {
            textAlign: 'center',
            color: '#9CA3AF',
            marginTop: '40%',
            fontSize: '15px',
        },
        senderName: {
            fontSize: '12px',
            fontWeight: '700',
            color: 'var(--color-primary)',
            marginBottom: '4px',
        },
        messageText: {
            wordBreak: 'break-word',
            lineHeight: '1.4',
        },
        messageTime: {
            fontSize: '10px',
            opacity: 0.7,
            textAlign: 'right',
            marginTop: '4px',
        }
    };

    if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'40px',color:'#9CA3AF'}}>Caricamento messaggi...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.messageList}>
                 {messages.length === 0 && <div style={styles.emptyState}>Nessun messaggio ancora.<br/>Inizia la conversazione!</div>}
                 {messages.map(msg => (
                    <div key={msg.id} style={styles.bubble(msg.sender)}>
                        {msg.sender === 'other' && <div style={styles.senderName}>{msg.senderName}</div>}
                        <div style={styles.messageText}>{msg.text}</div>
                        <div style={styles.messageTime}>{msg.time}</div>
                    </div>
                 ))}
                 <div ref={messagesEndRef} />
            </div>
            
            <div style={styles.inputArea}>
                <input 
                    style={styles.input}
                    placeholder="Scrivi un messaggio..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
                <button 
                    style={styles.sendButton} 
                    onClick={handleSend}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Send size={20}/>
                </button>
            </div>
        </div>
    );
};

export default ChatPage;

