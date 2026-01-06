import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatPage = () => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Ciao nonna! Come stai?", sender: "other", time: "10:30" },
        { id: 2, text: "Tutto bene caro, tu?", sender: "me", time: "10:32" },
        { id: 3, text: "Benissimo, stasera passo a trovarti!", sender: "other", time: "10:33" },
    ]);
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (!inputText.trim()) return;
        setMessages([...messages, {
            id: Date.now(),
            text: inputText,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setInputText("");
    };

    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: '#EFE7DE', // WhatsApp-like bg
        },
        messageList: {
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
        },
        messageBubble: (sender) => ({
            maxWidth: '80%',
            padding: '12px 16px',
            borderRadius: '16px',
            backgroundColor: sender === 'me' ? '#dcf8c6' : '#ffffff',
            alignSelf: sender === 'me' ? 'flex-end' : 'flex-start',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            position: 'relative',
        }),
        messageText: {
            fontSize: '17px',
            lineHeight: '1.4',
        },
        messageTime: {
            fontSize: '11px',
            color: '#999',
            textAlign: 'right',
            marginTop: '4px',
        },
        inputArea: {
            padding: '10px',
            backgroundColor: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            borderTop: '1px solid #ddd',
        },
        input: {
            flex: 1,
            padding: '12px',
            borderRadius: '24px',
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none',
        },
        sendButton: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#007aff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.messageList}>
                {messages.map(msg => (
                    <div key={msg.id} style={styles.messageBubble(msg.sender)}>
                        <div style={styles.messageText}>{msg.text}</div>
                        <div style={styles.messageTime}>{msg.time}</div>
                    </div>
                ))}
            </div>
            <div style={styles.inputArea}>
                <input
                    style={styles.input}
                    type="text"
                    placeholder="Scrivi un messaggio..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                />
                <button style={styles.sendButton} onClick={handleSend}>
                    <Send size={24} />
                </button>
            </div>
        </div>
    );
};

export default ChatPage;
