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

    const mockPosts = [
        {
            id: 'm1',
            author: 'Maria Rossi',
            text: 'Oggi ho fatto una bellissima passeggiata al parco. Il sole era caldissimo! ☀️',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            likes: 12,
            image: null
        }
    ];

    useEffect(() => {
        fetchPosts();
        let channel;
        try {
            channel = supabase
                .channel('posts')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
                    if (payload.eventType === 'INSERT') setPosts(prev => [payload.new, ...prev]);
                    else if (payload.eventType === 'UPDATE') setPosts(prev => prev.map(p => p.id === payload.new.id ? payload.new : p));
                    else if (payload.eventType === 'DELETE') setPosts(prev => prev.filter(p => p.id !== payload.old.id));
                })
                .subscribe();
        } catch (e) {}
        return () => { if (channel) supabase.removeChannel(channel); };
    }, []);

    const fetchPosts = async () => {
        try {
            const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
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
                    let width = img.width; let height = img.height; const max_size = 1024;
                    if (width > height) { if (width > max_size) { height *= max_size / width; width = max_size; } }
                    else { if (height > max_size) { width *= max_size / height; height = max_size; } }
                    canvas.width = width; canvas.height = height;
                    const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
                    setSelectedImage(canvas.toDataURL('image/jpeg', 0.8));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const createPost = async () => {
        if (!newPostText.trim() && !selectedImage) return;
        const newPostObj = { author: user.name + ' ' + (user.surname || ''), text: newPostText, likes: 0, created_at: new Date().toISOString(), image: selectedImage };
        setPosts(prev => [newPostObj, ...prev]);
        setNewPostText(''); setSelectedImage(null);
        try { await supabase.from('posts').insert([newPostObj]); } catch (e) {}
    };

    const saveEdit = async (postId) => {
        if (!editingText.trim()) return;
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, text: editingText } : p));
        setEditingPostId(null);
        try { await supabase.from('posts').update({ text: editingText }).eq('id', postId); } catch (e) {}
    };

    const deletePost = async (postId) => {
        if (!window.confirm("Eliminare il post?")) return;
        setPosts(prev => prev.filter(p => p.id !== postId));
        try { await supabase.from('posts').delete().eq('id', postId); } catch (e) {}
    };

    const styles = {
        container: { backgroundColor: 'var(--color-bg-primary)', minHeight: '100%', padding: '12px 0 100px 0' },
        card: { backgroundColor: '#fff', margin: '0 12px 12px 12px', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
        avatar: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' },
        input: { flex: 1, backgroundColor: '#F3F4F6', border: 'none', borderRadius: '22px', padding: '12px 16px', fontSize: '16px', outline: 'none', marginLeft: '12px' },
        btnPrimary: { backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold' },
        postImage: { width: '100%', maxHeight: '450px', objectFit: 'cover', borderRadius: '12px', margin: '8px 0', cursor: 'pointer' },
        lightbox: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
        iconBtn: { background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }
    };

    return (
        <div style={styles.container}>
            {enlargedImage && (
                <div style={styles.lightbox} onClick={() => setEnlargedImage(null)}>
                    <img src={enlargedImage} alt="Enlarged" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    <button style={{ position: 'absolute', top: 20, right: 20, color: 'white', background: 'none', border: 'none' }}><X size={32}/></button>
                </div>
            )}

            <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={styles.avatar}>{user.name[0]}</div>
                    <input style={styles.input} placeholder={`A cosa stai pensando?`} value={newPostText} onChange={(e) => setNewPostText(e.target.value)} />
                </div>
                {selectedImage && (
                    <div style={{ position: 'relative', margin: '12px 0' }}>
                        <img src={selectedImage} style={{ width: '100%', borderRadius: '12px' }} />
                        <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', padding: '4px' }}><X size={20}/></button>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                    <button style={{ display: 'flex', gap: '8px', color: 'var(--color-primary)', background: 'none' }} onClick={() => fileInputRef.current.click()}>
                        <ImageIcon size={20}/> <span style={{ fontWeight: '600' }}>Foto</span>
                    </button>
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                    <button style={{ ...styles.btnPrimary, opacity: (newPostText || selectedImage) ? 1 : 0.5 }} onClick={createPost}>Pubblica</button>
                </div>
            </div>

            {posts.map((post, i) => (
                <div key={post.id || i} style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ ...styles.avatar, backgroundColor: 'var(--color-primary-dark)' }}>{post.author?.[0]}</div>
                            <div>
                                <div style={{ fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>{post.author}</div>
                                <div style={{ fontSize: '12px', color: '#888' }}>{new Date(post.created_at).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ color: '#888', background: 'none' }} onClick={() => { setEditingPostId(post.id); setEditingText(post.text); }}><Edit2 size={18}/></button>
                            <button style={{ color: 'var(--color-error)', background: 'none' }} onClick={() => deletePost(post.id)}><Trash2 size={18}/></button>
                        </div>
                    </div>

                    {editingPostId === post.id ? (
                        <div>
                            <textarea style={{ width: '100%', padding: '10px', borderRadius: '12px', border: '1px solid var(--color-primary)' }} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button style={styles.btnPrimary} onClick={() => saveEdit(post.id)}>Salva</button>
                                <button style={{ background: '#eee', padding: '8px 16px', borderRadius: '20px' }} onClick={() => setEditingPostId(null)}>Annulla</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontSize: '17px', color: 'var(--color-text-primary)' }}>{post.text}</div>
                    )}

                    {post.image && <img src={post.image} style={styles.postImage} onClick={() => setEnlargedImage(post.image)} />}

                    <div style={{ display: 'flex', gap: '20px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <button style={styles.iconBtn}><ThumbsUp size={20}/> Mi piace</button>
                        <button style={{ ...styles.iconBtn, color: 'var(--color-text-secondary)' }}><MessageSquare size={20}/> Commenta</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FeedPage;
