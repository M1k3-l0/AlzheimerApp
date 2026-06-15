import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import AppIcon from '../components/AppIcon';

const AIChatPage = () => {
    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{}');
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        if (!user.id) return;
        const { data, error } = await supabase
            .from('ai_chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
        
        if (!error && data) {
            setMessages(data);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputText.trim() || isTyping) return;
        
        const userMsg = {
            user_id: user.id,
            role: 'user',
            content: inputText.trim()
        };

        setMessages(prev => [...prev, { ...userMsg, created_at: new Date().toISOString() }]);
        setInputText("");
        setIsTyping(true);

        try {
            // 1. Salva messaggio utente nel DB
            await supabase.from('ai_chat_history').insert([userMsg]);

            // 2. Simula risposta AI (o chiama API se disponibile)
            setTimeout(async () => {
                const aiResponse = generateAIResponse(userMsg.content);
                const aiMsg = {
                    user_id: user.id,
                    role: 'assistant',
                    content: aiResponse
                };

                // Salva risposta AI nel DB
                await supabase.from('ai_chat_history').insert([aiMsg]);

                setMessages(prev => [...prev, { ...aiMsg, created_at: new Date().toISOString() }]);
                setIsTyping(false);
            }, 1500);

        } catch (e) {
            console.error(e);
            setIsTyping(false);
        }
    };

    const generateAIResponse = (input) => {
        const text = input.toLowerCase();
        if (text.includes('ciao') || text.includes('salve')) return `Ciao ${user.name}! Come posso aiutarti oggi?`;
        if (text.includes('medicin') || text.includes('farmac')) return "Ti ricordo di controllare sempre l'agenda per l'orario esatto delle tue medicine. Hai già preso quelle di stamattina?";
        if (text.includes('umore') || text.includes('triste')) return "Mi dispiace che tu ti senta così. Vuoi parlarne o preferisci ascoltare della musica rilassante?";
        return "Grazie per aver condiviso questo con me. Sono qui per supportarti in ogni momento.";
    };

    const handleExport = () => {
        const content = messages.map(m => `${m.role === 'user' ? 'IO' : 'ASSISTENTE'} (${new Date(m.created_at).toLocaleString()}): ${m.content}`).join('\n\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Memora_Chat_AI_${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
    };

    const styles = {
        container: { display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F9FAFB' },
        header: { padding: '16px 20px', backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        chatArea: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
        bubble: (role) => ({
            alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: '16px',
            backgroundColor: role === 'user' ? 'var(--color-primary)' : 'white',
            color: role === 'user' ? 'var(--color-on-primary)' : '#1F2937',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            border: role === 'assistant' ? '1px solid #E5E7EB' : 'none',
            fontSize: '0.9375rem',
            lineHeight: '1.5'
        }),
        inputArea: { padding: '16px 20px', backgroundColor: 'white', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '12px', alignItems: 'center' },
        input: { flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid #D1D5DB', fontSize: '0.9375rem', outline: 'none' },
        sendBtn: { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
        typing: { fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '8px' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AppIcon name="brain" size={24} color="primary" />
                    </div>
                    <div>
                        <div style={{ fontWeight: 'bold' }}>Assistente Memora</div>
                        <div style={{ fontSize: '0.75rem', color: '#10B981' }}>Sempre attivo</div>
                    </div>
                </div>
                <button onClick={handleExport} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8125rem' }}>
                    Esporta Chat
                </button>
            </div>

            <div style={styles.chatArea}>
                {messages.map((m, i) => (
                    <div key={i} style={styles.bubble(m.role)}>
                        {m.content}
                        <div style={{ fontSize: '0.625rem', opacity: 0.6, marginTop: '4px', textAlign: 'right' }}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={styles.typing}>L'assistente sta scrivendo...</div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div style={styles.inputArea}>
                <input 
                    style={styles.input} 
                    value={inputText} 
                    onChange={e => setInputText(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Chiedimi qualcosa..."
                />
                <button style={styles.sendBtn} onClick={handleSend}>
                    <AppIcon name="paper-plane" size={18} color="white" />
                </button>
            </div>
        </div>
    );
};

export default AIChatPage;
