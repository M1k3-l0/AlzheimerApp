import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, Share2, Image as ImageIcon, ThumbsUp, Send, X, Edit2, Check, Trash2, Maximize2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const FeedPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [dbWorking, setDbWorking] = useState(true);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [enlargedImage, setEnlargedImage] = useState(null);
    const fileInputRef = useRef(null);

    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{"name":"Utente"}');

    // Dati di esempio
    const mockPosts = [
        {
            id: 'm1',
            author: 'Maria Rossi',
            text: 'Oggi ho fatto una bellissima passeggiata al parco. Il sole era caldissimo! ☀️',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            likes: 12,
            image: null
        },
        {
            id: 'm2',
            author: 'Giovanni Bianchi',
            text: 'Qualcuno sa quando sarà la prossima festa in centro? Mi piacerebbe molto andare.',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            likes: 5,
            image: null
        }
    ];

    useEffect(() => {
        fetchPosts();

        let channel;
        try {
            channel = supabase
                .channel('posts')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'posts' },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setPosts(prev => [payload.new, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
                        } else if (payload.eventType === 'DELETE') {
                            setPosts(prev => prev.filter(p => p.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();
        } catch (e) {
            console.warn("Supabase Realtime not available");
        }

        return () => {
            if (channel) supabase.removeChannel(channel);
        };
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error || !data || data.length === 0) {
                setPosts(mockPosts);
                if (error) setDbWorking(false);
            } else {
                setPosts(data);
                setDbWorking(true);
            }
        } catch (e) {
            setPosts(mockPosts);
            setDbWorking(false);
        }
        setLoading(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const max_size = 1024;

                    if (width > height) {
                        if (width > max_size) {
                            height *= max_size / width;
                            width = max_size;
                        }
                    } else {
                        if (height > max_size) {
                            width *= max_size / height;
                            height = max_size;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    setSelectedImage(resizedBase64);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const createPost = async () => {
        if (!newPostText.trim() && !selectedImage) return;

        const newPostObj = {
            author: user.name + ' ' + (user.surname || ''),
            text: newPostText,
            likes: 0,
            created_at: new Date().toISOString(),
            image: selectedImage
        };

        setPosts(prev => [newPostObj, ...prev]);
        setNewPostText('');
        setSelectedImage(null);

        try {
            const { error } = await supabase
                .from('posts')
                .insert([newPostObj]);
            if (error) console.error("Error saving to DB");
        } catch (e) {
            console.error("DB Error");
        }
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditingText(post.text);
    };

    const saveEdit = async (postId) => {
        if (!editingText.trim()) return;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, text: editingText } : p));
        setEditingPostId(null);
        try {
            await supabase.from('posts').update({ text: editingText }).eq('id', postId);
        } catch (e) {}
    };

    const deletePost = async (postId) => {
        if (!window.confirm("Vuoi davvero eliminare questo post?")) return;
        setPosts(prev => prev.filter(p => p.id !== postId));
        try {
            await supabase.from('posts').delete().eq('id', postId);
        } catch (e) {}
    };

    const styles = {
        container: {
            backgroundColor: '#F0F2F5',
            minHeight: '100%',
            padding: '12px 0 100px 0',
        },
        createPostCard: {
            backgroundColor: '#fff',
            margin: '0 12px 16px 12px',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
        },
        avatarSmall: {
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '18px', flexShrink: 0
        },
        input: {
            flex: 1, backgroundColor: '#F0F2F5', border: 'none', borderRadius: '20px',
            padding: '10px 16px', fontSize: '16px', outline: 'none', marginLeft: '12px'
        },
        previewContainer: {
            position: 'relative', margin: '10px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd'
        },
        previewImage: { width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' },
        postCard: { backgroundColor: '#fff', marginBottom: '12px', padding: '12px 0', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
        postImage: { 
            width: '100%', maxHeight: '400px', objectFit: 'cover', marginBottom: '12px', 
            backgroundColor: '#f0f2f5', cursor: 'zoom-in', transition: 'opacity 0.2s'
        },
        lightbox: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        },
        lightboxImg: { maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' },
        closeBtn: {
            position: 'absolute', top: '20px', right: '20px', color: 'white',
            background: 'rgba(255,255,255,0.2)', borderRadius: '50%', padding: '10px',
            border: 'none', cursor: 'pointer'
        },
        actionRow: { display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E4E6EB', paddingTop: '12px' },
        actionBtn: { display: 'flex', alignItems: 'center', gap: '8px', color: '#65676B', fontWeight: '600', fontSize: '14px', background: 'none', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' },
    };

    return (
        <div style={styles.container}>
            {/* Lightbox Modal */}
            {enlargedImage && (
                <div style={styles.lightbox} onClick={() => setEnlargedImage(null)}>
                    <button style={styles.closeBtn} onClick={() => setEnlargedImage(null)}>
                        <X size={28} />
                    </button>
                    <img src={enlargedImage} alt="Enlarged" style={styles.lightboxImg} />
                </div>
            )}

            {/* Inserimento Post */}
            <div style={styles.createPostCard}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={styles.avatarSmall}>{user.name[0]}</div>
                    <input
                        style={styles.input}
                        placeholder={`A cosa stai pensando, ${user.name}?`}
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && createPost()}
                    />
                </div>

                {selectedImage && (
                    <div style={styles.previewContainer}>
                        <img src={selectedImage} alt="Preview" style={styles.previewImage} />
                        <button 
                            style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', borderRadius: '50%', border: 'none', padding: '4px', cursor: 'pointer' }}
                            onClick={() => setSelectedImage(null)}
                        >
                            <X size={18} />
                        </button>
                        <div style={{ position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            Immagine ottimizzata ✨
                        </div>
                    </div>
                )}

                <div style={styles.actionRow}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} ref={fileInputRef} onChange={handleImageChange} />
                    <button style={styles.actionBtn} onClick={() => fileInputRef.current.click()}>
                        <ImageIcon color="#45BD62" size={20} /> Foto
                    </button>
                    <button 
                        style={{ ...styles.actionBtn, color: 'white', backgroundColor: (newPostText.trim() || selectedImage) ? 'var(--color-primary)' : '#ccc', padding: '6px 20px', borderRadius: '20px' }}
                        onClick={createPost}
                        disabled={!newPostText.trim() && !selectedImage}
                    >
                        Pubblica
                    </button>
                </div>
            </div>

            {/* Feed */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-primary)' }}>Caricamento...</div>
            ) : (
                posts.map((post, index) => (
                    <div key={post.id || index} style={styles.postCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 16px', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={styles.avatarSmall}>{post.author?.[0] || 'U'}</div>
                                <div>
                                    <div style={{ fontWeight: '700' }}>{post.author}</div>
                                    <div style={{ fontSize: '12px', color: '#65676B' }}>{new Date(post.created_at).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ background: 'none', border: 'none', color: '#65676B', cursor: 'pointer' }} onClick={() => startEditing(post)}><Edit2 size={18}/></button>
                                <button style={{ background: 'none', border: 'none', color: '#FF3B30', cursor: 'pointer' }} onClick={() => deletePost(post.id)}><Trash2 size={18}/></button>
                            </div>
                        </div>

                        {editingPostId === post.id ? (
                            <div style={{ padding: '0 16px 12px' }}>
                                <textarea style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-primary)' }} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <button style={{ backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px' }} onClick={() => saveEdit(post.id)}>Salva</button>
                                    <button style={{ background: '#eee', border: 'none', padding: '6px 16px', borderRadius: '8px' }} onClick={() => setEditingPostId(null)}>Annulla</button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '0 16px', fontSize: '17px', marginBottom: '12px' }}>{post.text}</div>
                        )}

                        {post.image && (
                            <div style={{ position: 'relative' }}>
                                <img 
                                    src={post.image} 
                                    alt="Post" 
                                    style={styles.postImage} 
                                    onClick={() => setEnlargedImage(post.image)}
                                    onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                    onMouseOut={(e) => e.target.style.opacity = '1'}
                                />
                                <div style={{ position: 'absolute', bottom: '20px', right: '20px', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', padding: '6px', borderRadius: '50%', pointerEvents: 'none' }}>
                                    <Maximize2 size={16} />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', borderTop: '1px solid #E4E6EB', margin: '0 16px', paddingTop: '4px' }}>
                            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', color: '#65676B', fontWeight: '600', background: 'none', border: 'none' }}><ThumbsUp size={20} /> Mi piace</button>
                            <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', color: '#65676B', fontWeight: '600', background: 'none', border: 'none' }}><MessageSquare size={20} /> Commenta</button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default FeedPage;
