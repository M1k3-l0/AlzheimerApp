import React, { useState } from 'react';
import { Heart, MessageSquare, Share2, Image as ImageIcon } from 'lucide-react';

const FeedPage = () => {
    const [posts] = useState([
        { id: 1, author: "Luigi Verdi", text: "Che bella giornata al parco!", time: "2 ore fa", likes: 12 },
        { id: 2, author: "Maria Rossi", text: "Guardate che torta ho preparato per domani!", time: "5 ore fa", likes: 24, hasImage: true },
    ]);

    const styles = {
        container: {
            backgroundColor: '#f2f2f7',
            paddingBottom: '20px',
        },
        createPost: {
            backgroundColor: '#fff',
            padding: '16px',
            marginBottom: '10px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            borderBottom: '1px solid #c6c6c8',
        },
        avatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#ccc',
        },
        fakeInput: {
            flex: 1,
            padding: '10px 16px',
            borderRadius: '20px',
            backgroundColor: '#f0f2f5',
            color: '#65676b',
            fontSize: '16px',
        },
        postCard: {
            backgroundColor: '#fff',
            marginBottom: '10px',
            padding: '12px',
            borderTop: '1px solid #e1e4e8',
            borderBottom: '1px solid #e1e4e8',
        },
        postHeader: {
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px',
        },
        authorName: {
            fontWeight: 'bold',
            fontSize: '16px',
        },
        postTime: {
            fontSize: '13px',
            color: '#65676b',
        },
        postContent: {
            fontSize: '18px',
            marginBottom: '12px',
            lineHeight: '1.4',
        },
        placeholderImage: {
            width: '100%',
            height: '250px',
            backgroundColor: '#f0f2f5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            borderRadius: '8px',
            color: '#65676b',
        },
        actions: {
            display: 'flex',
            justifyContent: 'space-around',
            borderTop: '1px solid #f0f2f5',
            paddingTop: '8px',
        },
        actionBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#65676b',
            fontSize: '14px',
            background: 'none',
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.createPost}>
                <div style={styles.avatar}></div>
                <div style={styles.fakeInput}>A cosa stai pensando?</div>
                <ImageIcon color="#45bd62" />
            </div>

            {posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                    <div style={styles.postHeader}>
                        <div style={{ ...styles.avatar, marginRight: '10px' }}></div>
                        <div>
                            <div style={styles.authorName}>{post.author}</div>
                            <div style={styles.postTime}>{post.time}</div>
                        </div>
                    </div>
                    <div style={styles.postContent}>{post.text}</div>
                    {post.hasImage && (
                        <div style={styles.placeholderImage}>
                            <ImageIcon size={48} />
                            <span style={{ marginLeft: '10px' }}>Immagine</span>
                        </div>
                    )}
                    <div style={styles.actions}>
                        <button style={styles.actionBtn}><Heart size={20} /> Mi piace</button>
                        <button style={styles.actionBtn}><MessageSquare size={20} /> Commenta</button>
                        <button style={styles.actionBtn}><Share2 size={20} /> Condividi</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeedPage;
