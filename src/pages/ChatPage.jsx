import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!loading) scrollToBottom();
    }, [messages, loading]);

    // Re-scroll on viewport resize (keyboard open/close)
    useEffect(() => {
        const handleResize = () => {
             // Delay to allow keyboard animation
            setTimeout(scrollToBottom, 300);
        };
        window.visualViewport?.addEventListener('resize', handleResize);
        window.addEventListener('resize', handleResize);
        return () => {
            window.visualViewport?.removeEventListener('resize', handleResize);
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{"name":"Utente"}');
    const currentUserId = user.name + (user.surname || '');

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
        setInputText(""); // Optimistic clear

        const { error } = await supabase.from('messages').insert([{
            text: textToSend,
            sender_name: user.name + ' ' + (user.surname || ''),
            sender_id: currentUserId
        }]);

        if (error) {
            setInputText(textToSend); // Restore on error
            alert("Errore invio");
        }
    };

    // Stili "Bulletproof" per Mobile
    const styles = {
        pageContainer: {
            display: 'flex',
            flexDirection: 'column',
            height: '100vh', // Fallback
            height: '100dvh', // Modern browsers
            backgroundColor: '#f5f5f5',
            position: 'relative'
        },
        messageList: {
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            paddingBottom: '80px', // Extra space at bottom so messages aren't hidden behind input
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        // INPUT AREA: Fixed at bottom, high z-index to stay above TabBar
        inputWrapper: {
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            backgroundColor: 'white',
            padding: '10px 16px',
            paddingBottom: 'max(10px, env(safe-area-inset-bottom))', // Safe area for iOS
            borderTop: '1px solid #ddd',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 9999, // Ensure it's on top of EVERYTHING
            marginBottom: '57px' // Altezza approssimativa TabBar per non coprirla quando tastiera è chiusa
        },
        input: {
            flex: 1,
            padding: '12px 16px',
            borderRadius: '24px',
            border: '1px solid #ccc',
            fontSize: '16px', // 16px prevents zoom on iOS focus
            outline: 'none',
            backgroundColor: '#f9f9f9'
        },
        sendBtn: {
            background: 'var(--color-primary, #6200EE)',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            cursor: 'pointer'
        },
        bubble: (sender) => ({
            maxWidth: '80%',
            padding: '10px 14px',
            borderRadius: '16px',
            backgroundColor: sender === 'me' ? 'var(--color-primary, #6200EE)' : 'white',
            color: sender === 'me' ? 'white' : 'black',
            alignSelf: sender === 'me' ? 'flex-end' : 'flex-start',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            borderBottomRightRadius: sender === 'me' ? '4px' : '16px',
            borderBottomLeftRadius: sender === 'me' ? '16px' : '4px'
        })
    };

    // Toggle margin-bottom based on focus to handle TabBar overlapping
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div style={styles.pageContainer}>
            <div style={styles.messageList}>
                {loading && <div style={{textAlign:'center', padding:'20px'}}>Caricamento...</div>}
                {!loading && messages.length === 0 && <div style={{textAlign:'center', color:'#999', marginTop:'30%'}}>Nessun messaggio</div>}
                
                {messages.map(msg => (
                    <div key={msg.id} style={styles.bubble(msg.sender)}>
                        {msg.sender === 'other' && <div style={{fontSize:'12px', fontWeight:'bold', marginBottom:'4px', color:'var(--color-primary)'}}>{msg.senderName}</div>}
                        <div style={{wordBreak:'break-word'}}>{msg.text}</div>
                        <div style={{fontSize:'10px', opacity:0.7, textAlign:'right', marginTop:'4px'}}>{msg.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div 
                style={{
                    ...styles.inputWrapper,
                    marginBottom: isFocused ? '0px' : '60px' // When focused (keyboard open), stick to bottom (0px). When closed, sit above TabBar (60px).
                }}
            >
                <input 
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Scrivi messaggio..."
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        setTimeout(scrollToBottom, 500);
                    }}
                    onBlur={() => {
                        // Delay blurring logic slightly to allow clicks on Send button
                        setTimeout(() => setIsFocused(false), 200);
                    }}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                />
                <button style={styles.sendBtn} onClick={handleSend} onMouseDown={e => e.preventDefault()}> {/* prevent blur on click */}
                   <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
