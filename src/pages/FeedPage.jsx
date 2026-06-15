import React, { useState, useEffect, useRef } from 'react';
import { Heart, Share2, X, Edit2, Check, Maximize2, User } from 'lucide-react';
import AppIcon from '../components/AppIcon';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { getMoodColor } from '../utils/moodHistory';
import { getRoleBadgeStyle, getRoleLabel } from '../utils/avatarUtils';
import {
  withMockFeedPosts,
  getMockCommentsForPosts,
  buildMoodsFromProfiles,
  isMockFeedId,
} from '../utils/feedMockData';

const FeedPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const [editingText, setEditingText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [activeHashtag, setActiveHashtag] = useState(null);
    const [enlargedImage, setEnlargedImage] = useState(null);
    const [showCommentsFor, setShowCommentsFor] = useState(null);
    const [comments, setComments] = useState({});
    const [newCommentText, setNewCommentText] = useState('');
    const [userMoods, setUserMoods] = useState({}); // { author_id: { mood, role } }
    const fileInputRef = useRef(null);
    const postTextareaRef = useRef(null);
    const commentInputRefs = useRef({});

    const [likedPosts, setLikedPosts] = useState(() => {
        const saved = localStorage.getItem('alzheimer_liked_posts');
        return saved ? JSON.parse(saved) : [];
    });

    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{"name":"Utente"}');

    const getMoodEmoji = (mood) => {
        switch (mood) {
            case 'happy': return '😊';
            case 'neutral': return '😐';
            case 'sad': return '😢';
            default: return '';
        }
    };

    const renderTextWithLinks = (text) => {
        if (!text) return null;
        // Regex for URLs and Hashtags
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
        
        // Split by URLs first
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return <a key={`url-${i}`} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{part}</a>;
            }
            
            // Further split by hashtags
            const subParts = part.split(hashtagRegex);
            return subParts.map((subPart, j) => {
                if (subPart.match(hashtagRegex)) {
                    return (
                        <span 
                            key={`tag-${i}-${j}`} 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveHashtag(subPart);
                                setSearchQuery('');
                            }}
                            style={{ color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {subPart}
                        </span>
                    );
                }
                return subPart;
            });
        });
    };

    useEffect(() => {
        localStorage.setItem('alzheimer_liked_posts', JSON.stringify(likedPosts));
    }, [likedPosts]);

    useEffect(() => {
        fetchPosts();
        // Realtime Posts
        const postsChannel = supabase
            .channel('posts-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newPost = { ...payload.new, comment_count: 0 };
                    setPosts(prev => [newPost, ...prev]);
                    fetchUserMoods([newPost.author_id]);
                }
                else if (payload.eventType === 'UPDATE') setPosts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
                else if (payload.eventType === 'DELETE') setPosts(prev => prev.filter(p => p.id !== payload.old.id));
            })
            .subscribe();

        // Realtime Comments
        const commentsChannel = supabase
            .channel('comments-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newComment = payload.new;
                    setComments(prev => {
                        const existingComments = prev[newComment.post_id] || [];
                        if (existingComments.some(c => c.id === newComment.id)) return prev;
                        return { ...prev, [newComment.post_id]: [...existingComments, newComment] };
                    });
                    setPosts(prev => prev.map(p => p.id === newComment.post_id ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p));
                } else if (payload.eventType === 'UPDATE') {
                    setComments(prev => {
                        const postComments = prev[payload.new.post_id] || [];
                        return { ...prev, [payload.new.post_id]: postComments.map(c => c.id === payload.new.id ? payload.new : c) };
                    });
                } else if (payload.eventType === 'DELETE') {
                    // Note: delete payload.old contains only ID usually, but post_id might be needed to update count.
                    // Simplified: refresh all comments for that post or handle globally.
                    fetchAllComments();
                }
            })
            .subscribe();

        return () => { 
            supabase.removeChannel(postsChannel);
            supabase.removeChannel(commentsChannel);
        };
    }, []);

    const fetchUserMoods = async (authorIds) => {
        if (!authorIds || authorIds.length === 0) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, current_mood, role')
                .in('id', authorIds);
            
            if (!error && data) {
                const moodsMap = { ...userMoods };
                data.forEach(profile => {
                    moodsMap[profile.id] = { mood: profile.current_mood, role: profile.role };
                });
                setUserMoods(moodsMap);
            }
        } catch (e) {
            console.error("Error fetching user moods:", e);
        }
    };

    const fetchPosts = async () => {
        try {
            const [{ data, error }, { data: profiles }] = await Promise.all([
                supabase
                    .from('posts')
                    .select('*, comments(count)')
                    .order('created_at', { ascending: false }),
                supabase.from('profiles').select('*'),
            ]);

            if (error) {
                console.error("Errore fetch posts:", error);
                return;
            }

            const formattedPosts = (data || []).map(p => ({
                ...p,
                comment_count: p.comments?.[0]?.count || 0
            }));

            const mergedPosts = withMockFeedPosts(formattedPosts, profiles || []);
            setPosts(mergedPosts);

            const moodsMap = buildMoodsFromProfiles(profiles || []);
            setUserMoods(moodsMap);

            await fetchAllComments(mergedPosts.filter((p) => p.isMock));
        } catch (e) {
            console.error("Errore fetch posts", e);
        }
        setLoading(false);
    };

    const fetchAllComments = async (mockPosts) => {
        try {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .order('created_at', { ascending: true });

            setComments((prev) => {
                const commentsByPost = Array.isArray(mockPosts)
                    ? getMockCommentsForPosts(mockPosts)
                    : Object.fromEntries(
                        Object.entries(prev).filter(([postId]) => isMockFeedId(postId))
                    );

                if (!error && data) {
                    data.forEach((comment) => {
                        if (!commentsByPost[comment.post_id]) commentsByPost[comment.post_id] = [];
                        commentsByPost[comment.post_id].push(comment);
                    });
                }
                return commentsByPost;
            });
        } catch (e) {
            console.error("Errore fetch commenti:", e);
        }
    };

    const toggleComments = (postId) => {
        setShowCommentsFor((prev) => (prev === postId ? null : postId));
    };

    const addComment = async (postId) => {
        if (!newCommentText.trim()) return;
        const text = newCommentText.trim();

        if (isMockFeedId(postId)) {
            const commentObj = {
                id: `mock-comment-local-${Date.now()}`,
                post_id: postId,
                author_id: user.id || (user.name + (user.surname || '')),
                author_name: user.name + ' ' + (user.surname || ''),
                author_photo: user.photo,
                text,
                created_at: new Date().toISOString(),
                isMock: true,
            };
            setComments((prev) => ({
                ...prev,
                [postId]: [...(prev[postId] || []), commentObj],
            }));
            setPosts((prev) => prev.map((p) => (
                p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p
            )));
            setNewCommentText('');
            return;
        }

        const commentObj = {
            post_id: postId,
            author_id: user.id || (user.name + (user.surname || '')),
            author_name: user.name + ' ' + (user.surname || ''),
            author_photo: user.photo,
            text
        };

        const { error } = await supabase
            .from('comments')
            .insert([commentObj], { returning: 'representation' });

        if (error) {
            alert("Errore nel salvare il commento: " + error.message);
        } else {
            setNewCommentText('');
        }
    };

    const updateComment = async (commentId, postId) => {
        if (!editingCommentText.trim()) return;

        if (isMockFeedId(commentId) || isMockFeedId(postId)) {
            setComments((prev) => ({
                ...prev,
                [postId]: (prev[postId] || []).map((c) => (
                    c.id === commentId ? { ...c, text: editingCommentText.trim() } : c
                )),
            }));
            setEditingCommentId(null);
            setEditingCommentText('');
            return;
        }

        try {
            const { error } = await supabase
                .from('comments')
                .update({ text: editingCommentText.trim() })
                .eq('id', commentId);

            if (error) throw error;
            setEditingCommentId(null);
            setEditingCommentText('');
        } catch (e) {
            alert("Errore nell'aggiornamento.");
        }
    };

    const deleteComment = async (commentId, postId) => {
        if (!window.confirm("Eliminare il commento?")) return;

        if (isMockFeedId(commentId) || isMockFeedId(postId)) {
            setComments((prev) => ({
                ...prev,
                [postId]: (prev[postId] || []).filter((c) => c.id !== commentId),
            }));
            setPosts((prev) => prev.map((p) => (
                p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count || 1) - 1) } : p
            )));
            return;
        }

        try {
            await supabase.from('comments').delete().eq('id', commentId);
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: Math.max(0, (p.comment_count || 1) - 1) } : p));
            fetchAllComments();
        } catch (e) {}
    };

    const handleLike = async (postId, currentLikes) => {
        if (likedPosts.includes(postId)) return;

        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
        setLikedPosts(prev => [...prev, postId]);

        if (isMockFeedId(postId)) return;

        try {
            const { error } = await supabase
                .from('posts')
                .update({ likes: (currentLikes || 0) + 1 })
                .eq('id', postId);
            if (error) throw error;
        } catch (e) {
            setLikedPosts(prev => prev.filter(id => id !== postId));
            fetchPosts();
        }
    };

    const createPost = async () => {
        if (!newPostText.trim() && !selectedImage) return;
        const currentUserId = user.id || (user.name + (user.surname || ''));
        const newPostObj = { 
            author: user.name + ' ' + (user.surname || ''), 
            author_id: currentUserId,
            author_photo: user.photo, 
            text: newPostText, 
            image: selectedImage 
        };
        
        setNewPostText(''); 
        setSelectedImage(null);
        if (postTextareaRef.current) postTextareaRef.current.style.height = 'inherit';
        
        try { 
            const { error } = await supabase.from('posts').insert([newPostObj]); 
            if (error) alert("Errore nel salvataggio: " + error.message);
        } catch (e) {}
    };

    const updatePost = async (postId) => {
        if (!editingText.trim()) return;

        if (isMockFeedId(postId)) {
            setPosts((prev) => prev.map((p) => (
                p.id === postId ? { ...p, text: editingText.trim() } : p
            )));
            setEditingPostId(null);
            setEditingText('');
            return;
        }

        try {
            const { error } = await supabase
                .from('posts')
                .update({ text: editingText.trim() })
                .eq('id', postId);
            if (error) throw error;
            setEditingPostId(null);
            setEditingText('');
        } catch (e) {
            alert("Errore nell'aggiornamento.");
        }
    };

    const deletePost = async (postId) => {
        if (!window.confirm("Eliminare il post?")) return;

        if (isMockFeedId(postId)) {
            setPosts((prev) => prev.filter((p) => p.id !== postId));
            setComments((prev) => {
                const next = { ...prev };
                delete next[postId];
                return next;
            });
            return;
        }

        try { await supabase.from('posts').delete().eq('id', postId); } catch (e) {}
    };

    // Filter logic
    const filteredPosts = posts.filter(post => {
        const matchesSearch = !searchQuery || post.text.toLowerCase().includes(searchQuery.toLowerCase()) || post.author.toLowerCase().includes(searchQuery.toLowerCase());
        const authorRole = userMoods[post.author_id]?.role || 'user';
        const matchesRole = roleFilter === 'all' || authorRole === roleFilter;
        const matchesHashtag = !activeHashtag || post.text.toLowerCase().includes(activeHashtag.toLowerCase());
        return matchesSearch && matchesRole && matchesHashtag;
    });

    const styles = {
        container: { width: '100%', maxWidth: '100%', minWidth: 0, backgroundColor: 'var(--color-bg-primary)', minHeight: '100%', padding: '0 14px 100px 14px', boxSizing: 'border-box', overflowX: 'hidden' },
        stickyHeader: { position: 'relative', backgroundColor: 'var(--color-bg-primary)', padding: '12px 0 1px 0', maxWidth: '100%' },
        searchBar: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '8px 16px', borderRadius: '12px', boxShadow: 'var(--card-shadow)', marginBottom: '12px' },
        filterRow: { display: 'flex', gap: '8px', overflowX: 'auto', padding: '4px 0 16px 0', scrollbarWidth: 'none' },
        filterChip: (active) => ({ 
            padding: '6px 14px', 
            borderRadius: '20px', 
            backgroundColor: active ? 'var(--color-primary)' : 'white', 
            color: active ? 'var(--color-on-primary)' : '#666', 
            fontSize: '0.8125rem', 
            fontWeight: 'bold', 
            border: 'none', 
            cursor: 'pointer', 
            whiteSpace: 'nowrap',
            boxShadow: 'var(--card-shadow)'
        }),
        card: { backgroundColor: '#fff', margin: '0 0 var(--section-gap) 0', borderRadius: 'var(--card-radius)', padding: 'var(--content-padding-x)', boxShadow: 'var(--card-shadow)', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' },
        avatar: (mood) => ({ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden', border: `3px solid ${getMoodColor(mood)}`, boxShadow: `0 2px 8px ${getMoodColor(mood)}40`, transition: 'all 0.3s ease' }),
        avatarSmall: (mood) => ({ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden', fontSize: '0.75rem', border: `2px solid ${getMoodColor(mood)}`, boxShadow: `0 2px 6px ${getMoodColor(mood)}40`, transition: 'all 0.3s ease' }),
        avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
        input: { flex: 1, minWidth: 0, maxWidth: '100%', backgroundColor: '#F3F4F6', border: 'none', borderRadius: '22px', padding: '10px 16px', fontSize: '0.9375rem', outline: 'none' },
        btnPrimary: { backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },
        actionBtn: { background: 'none', border: 'none', color: 'var(--color-primary-dark)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', fontSize: '0.875rem' },
        commentBubble: { backgroundColor: '#F3F4F6', padding: '8px 12px', borderRadius: 'var(--card-radius)', flex: 1, minWidth: 0, wordBreak: 'break-word' },
        hashtagBadge: { backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content', marginBottom: '8px' },
        roleBadge: { fontSize: '0.625rem', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', lineHeight: 1.3, flexShrink: 0 },
    };

    return (
        <div style={styles.container} className="last-scroll-block">
            {enlargedImage && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, cursor: 'pointer', padding: '20px' }} onClick={() => setEnlargedImage(null)}>
                    <img src={enlargedImage} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Fullscreen" />
                </div>
            )}

            {/* Header: Search and Filters */}
            <div style={styles.stickyHeader}>
                <div style={styles.searchBar}>
                    <AppIcon name="search" size={18} color="#999" />
                    <input 
                        style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem' }} 
                        placeholder="Cerca post o autori..." 
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setActiveHashtag(null); }}
                    />
                    {searchQuery && <X size={16} color="#999" style={{cursor:'pointer'}} onClick={() => setSearchQuery('')} />}
                </div>

                <div style={styles.filterRow} className="no-scrollbar">
                    <button style={styles.filterChip(roleFilter === 'all')} onClick={() => setRoleFilter('all')}>Tutti</button>
                    <button style={styles.filterChip(roleFilter === 'healthcare')} onClick={() => setRoleFilter('healthcare')}>Medico</button>
                    <button style={styles.filterChip(roleFilter === 'patient')} onClick={() => setRoleFilter('patient')}>Pazienti</button>
                    <button style={styles.filterChip(roleFilter === 'caregiver')} onClick={() => setRoleFilter('caregiver')}>Caregiver</button>
                </div>

                {activeHashtag && (
                    <div style={styles.hashtagBadge}>
                        <span>Mostrando {activeHashtag}</span>
                        <X size={14} style={{cursor:'pointer'}} onClick={() => setActiveHashtag(null)} />
                    </div>
                )}

                {/* Creazione Post */}
                <div style={styles.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={styles.avatar(userMoods[user.id]?.mood)}>
                            {user.photo ? <img src={user.photo} style={styles.avatarImg} alt="Profilo" /> : user.name[0]}
                        </div>
                        <textarea 
                            ref={postTextareaRef}
                            style={{ ...styles.input, resize: 'none', overflow: 'hidden', minHeight: '42px', borderRadius: '15px', fontFamily: 'inherit' }} 
                            placeholder={`A che pensi, ${user.name}?`} 
                            value={newPostText} 
                            onChange={(e) => {
                                setNewPostText(e.target.value);
                                e.target.style.height = 'inherit';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }} 
                        />
                    </div>
                    {selectedImage && (
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                            <img src={selectedImage} style={{ width: '100%', borderRadius: '12px' }} alt="Preview" />
                            <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', padding: '4px' }}><X size={16}/></button>
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button style={styles.actionBtn} onClick={() => fileInputRef.current.click()}><AppIcon name="picture" size={20} color="primary"/> Foto</button>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={(e) => {
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
                        }} />
                        <button style={styles.btnPrimary} onClick={createPost}>Pubblica</button>
                    </div>
                </div>
            </div>

            {/* Ciclo Post */}
            {filteredPosts.map(post => {
                const authorData = userMoods[post.author_id] || {};
                return (
                <div key={post.id} style={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <Link to={`/profilo/${post.author_id}`} style={{ display: 'flex', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                            <div style={styles.avatar(authorData.mood)}>
                                {post.author_photo ? <img src={post.author_photo} style={styles.avatarImg} alt="Autore" /> : (post.author?.[0] || 'U')}
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', color: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    {post.author}
                                    <span style={{ ...styles.roleBadge, ...getRoleBadgeStyle() }}>
                                        {getRoleLabel(authorData.role)}
                                    </span>
                                    {authorData.mood && <span aria-label={`Umore: ${authorData.mood}`}>{getMoodEmoji(authorData.mood)}</span>}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#999' }}>{new Date(post.created_at).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </Link>
                        { (post.author_id === user.id || user.role === 'admin') && !editingPostId && !post.isMock && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button style={{ background: 'none', border: 'none' }} onClick={() => { setEditingPostId(post.id); setEditingText(post.text); }}><AppIcon name="pencil" size={18} color="primary" /></button>
                                <button style={{ background: 'none', border: 'none' }} onClick={() => deletePost(post.id)}><AppIcon name="trash" size={18} color="error" /></button>
                            </div>
                        )}
                    </div>

                    {editingPostId === post.id ? (
                        <div style={{ marginBottom: '12px' }}>
                            <textarea style={{ ...styles.input, width: '100%', minHeight: '60px' }} value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                                <button onClick={() => setEditingPostId(null)} style={{ background: 'none', border: 'none', color: '#999', fontWeight: 'bold' }}>Annulla</button>
                                <button onClick={() => updatePost(post.id)} style={styles.btnPrimary}>Salva</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ fontSize: '1rem', color: '#333', marginBottom: '8px', whiteSpace: 'pre-wrap' }}>{renderTextWithLinks(post.text)}</div>
                    )}
                    
                    {post.image && (
                        <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '12px', margin: '8px 0', cursor: 'zoom-in', backgroundColor: '#EDE6F3' }} onClick={() => setEnlargedImage(post.image)}>
                            <img
                                src={post.image}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                alt="Post"
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f9f9f9', fontSize: '0.8125rem', color: '#666' }}>
                        <span>{post.likes || 0} Like</span>
                        <span onClick={() => toggleComments(post.id)} style={{cursor:'pointer'}}>{post.comment_count || 0} Commenti</span>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                        <button style={styles.actionBtn} onClick={() => handleLike(post.id, post.likes)}>
                            <AppIcon name="thumbs-up" size={18} color={likedPosts.includes(post.id) ? 'primary' : 'textSecondary'} /> Mi piace
                        </button>
                        <button style={styles.actionBtn} onClick={() => toggleComments(post.id)}><AppIcon name="comments" size={18} color="primary"/> Commenta</button>
                    </div>

                    {showCommentsFor === post.id && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f0f0f0' }}>
                            {(comments[post.id] || []).map(comm => (
                                <div key={comm.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                    <div style={styles.avatarSmall()}>
                                        {comm.author_photo ? <img src={comm.author_photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="C" /> : comm.author_name[0]}
                                    </div>
                                    <div style={styles.commentBubble}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.8125rem' }}>{comm.author_name}</div>
                                            {(comm.author_id === user.id || user.role === 'admin') && (
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <button style={{ background: 'none', border: 'none', opacity: 0.5 }} onClick={() => { setEditingCommentId(comm.id); setEditingCommentText(comm.text); }}><AppIcon name="pencil" size={12} color="primary"/></button>
                                                    <button style={{ background: 'none', border: 'none', opacity: 0.5 }} onClick={() => deleteComment(comm.id, post.id)}><X size={12} color="#ef4444" /></button>
                                                </div>
                                            )}
                                        </div>
                                        {editingCommentId === comm.id ? (
                                            <div style={{ marginTop: '4px' }}>
                                                <textarea style={{ ...styles.input, width: '100%', fontSize: '0.8125rem' }} value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)} />
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
                                                    <button onClick={() => setEditingCommentId(null)} style={{ background: 'none', border: 'none', fontSize: '0.6875rem' }}>Annulla</button>
                                                    <button onClick={() => updateComment(comm.id, post.id)} style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: '10px', padding: '2px 8px', fontSize: '0.6875rem' }}>Salva</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.875rem', color: '#333' }}>{renderTextWithLinks(comm.text)}</div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                <textarea 
                                    style={{ ...styles.input, minHeight: '38px' }} 
                                    placeholder="Scrivi un commento..." 
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addComment(post.id); } }}
                                />
                                <button style={{ border: 'none', background: 'none' }} onClick={() => addComment(post.id)}><AppIcon name="paper-plane" size={20} color="primary"/></button>
                            </div>
                        </div>
                    )}
                </div>
                );
            })}
        </div>
    );
};

export default FeedPage;
