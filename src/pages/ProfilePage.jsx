import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, MapPin, Calendar, Heart, MessageSquare, ThumbsUp, X, Check, Image as ImageIcon, Trash2, User, Users, Stethoscope, Plus, MoreHorizontal, Share2, Send } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ProfilePage = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('alzheimer_user') || '{}'));
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState('post'); // post, info, foto
    const [editForm, setEditForm] = useState({
        name: user.name || '',
        surname: user.surname || '',
        bio: user.bio || '',
        location: user.location || '',
        photo: user.photo || '',
        role: user.role || 'patient'
    });
    const fileInputRef = useRef(null);
    const [stats, setStats] = useState({
        posts: 0,
        likes: 0,
        comments: 0
    });
    
    // Likes Post State
    const [likedPosts, setLikedPosts] = useState(() => {
        const saved = localStorage.getItem('alzheimer_liked_posts');
        return saved ? JSON.parse(saved) : [];
    });

    // Likes Comment State
    const [likedComments, setLikedComments] = useState(() => {
        const saved = localStorage.getItem('alzheimer_liked_comments');
        return saved ? JSON.parse(saved) : [];
    });

    const [enlargedImage, setEnlargedImage] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Commenti States
    const [showCommentsFor, setShowCommentsFor] = useState(null);
    const [comments, setComments] = useState({});
    const [newCommentText, setNewCommentText] = useState('');

    useEffect(() => {
        fetchUserPosts();
        calculateStats();

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUserPosts = async () => {
        try {
            const fullName = `${user.name} ${user.surname || ''}`.trim();
            const { data, error } = await supabase
                .from('posts')
                .select('*, comments(count)')
                .eq('author', fullName)
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                const formattedPosts = data.map(p => ({
                    ...p,
                    comment_count: p.comments?.[0]?.count || 0
                }));
                setUserPosts(formattedPosts);

                // PRE-FETCH COMMENTS (Ottimizzazione Velocità)
                const postIds = data.map(p => p.id);
                if (postIds.length > 0) {
                    const { data: allComments } = await supabase
                        .from('comments')
                        .select('*')
                        .in('post_id', postIds)
                        .order('created_at', { ascending: true });
                    
                    if (allComments) {
                        const commentsMap = {};
                        allComments.forEach(c => {
                            if (!commentsMap[c.post_id]) commentsMap[c.post_id] = [];
                            commentsMap[c.post_id].push(c);
                        });
                        setComments(commentsMap);
                    }
                }
            }
        } catch (e) {
            console.error("Errore fetch user posts:", e);
        }
        setLoading(false);
    };

    const calculateStats = async () => {
        try {
            const fullName = `${user.name} ${user.surname || ''}`.trim();
            const { data: posts } = await supabase
                .from('posts')
                .select('likes')
                .eq('author', fullName);
            
            const { count: commentsCount } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('author_name', fullName);

            const totalLikes = posts?.reduce((sum, post) => sum + (post.likes || 0), 0) || 0;

            setStats({
                posts: posts?.length || 0,
                likes: totalLikes,
                comments: commentsCount || 0
            });
        } catch (e) {
            console.error("Errore calcolo stats:", e);
        }
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
                    const max_size = 512;
                    
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
                    
                    setEditForm(prev => ({ ...prev, photo: canvas.toDataURL('image/jpeg', 0.8) }));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const saveProfile = async () => {
        const updatedUser = {
            ...user,
            ...editForm
        };
        
        localStorage.setItem('alzheimer_user', JSON.stringify(updatedUser));
        
        try {
            const userId = user.name + (user.surname || '');
            await supabase.from('profiles').upsert([{ 
                id: userId, 
                name: editForm.name, 
                surname: editForm.surname, 
                bio: editForm.bio,
                location: editForm.location,
                photo_url: editForm.photo,
                role: editForm.role
            }]);
        } catch (err) {
            console.error("Errore salvataggio DB:", err);
        }

        setUser(updatedUser);
        setShowEditModal(false);
        window.dispatchEvent(new Event('storage'));
        fetchUserPosts();
        calculateStats();
    };

    // --- Like Logic (Toggle) ---
    const handleLike = async (postId, currentLikes) => {
        const isLiked = likedPosts.includes(postId);
        const newLikes = isLiked ? (currentLikes - 1) : (currentLikes + 1);

        // Update Local State
        setLikedPosts(prev => {
            const newVal = isLiked ? prev.filter(id => id !== postId) : [...prev, postId];
            localStorage.setItem('alzheimer_liked_posts', JSON.stringify(newVal));
            return newVal;
        });

        // Optimistic UI Update
        setUserPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: newLikes } : p));

        try {
            await supabase
                .from('posts')
                .update({ likes: Math.max(0, newLikes) })
                .eq('id', postId);
        } catch (e) {
            console.error("Errore like:", e);
            fetchUserPosts(); // Revert on error
        }
    };

    const deletePost = async (postId) => {
        if (!window.confirm("Eliminare il post?")) return;
        try {
            await supabase.from('posts').delete().eq('id', postId);
            fetchUserPosts();
            calculateStats();
        } catch (e) {
            console.error("Errore eliminazione post:", e);
        }
    };

    // --- Comment Logic ---
    const toggleComments = async (postId) => {
        if (showCommentsFor === postId) {
            setShowCommentsFor(null);
        } else {
            setShowCommentsFor(postId);
            // I commenti sono già pre-aricati! Nessun fetch delay qui.
        }
    };

    const addComment = async (postId) => {
        if (!newCommentText.trim()) return;

        const commentObj = {
            post_id: postId,
            author_name: user.name + ' ' + (user.surname || ''),
            author_photo: user.photo,
            text: newCommentText,
            likes: 0
        };

        const { data, error } = await supabase.from('comments').insert([commentObj]).select();

        if (error) {
            console.error("Errore salvataggio commento:", error);
            alert("Errore: " + error.message);
        } else if (data) {
            setComments(prev => ({
                ...prev,
                [postId]: [...(prev[postId] || []), data[0]]
            }));
            setNewCommentText('');
            setUserPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p));
        }
    };

    // --- Like Comment Logic (Toggle) ---
    const handleCommentLike = async (commentId, currentLikes, postId) => {
        const isLiked = likedComments.includes(commentId);
        const safeLikes = currentLikes || 0; // Gestisce null/undefined
        const newLikes = isLiked ? (safeLikes - 1) : (safeLikes + 1);

        // Update Local State for tracking user likes
        setLikedComments(prev => {
            const newVal = isLiked ? prev.filter(id => id !== commentId) : [...prev, commentId];
            localStorage.setItem('alzheimer_liked_comments', JSON.stringify(newVal));
            return newVal;
        });

        // Update UI (Optimistic)
        setComments(prev => {
            const postComments = prev[postId] || [];
            const updatedComments = postComments.map(c => 
                c.id === commentId ? { ...c, likes: Math.max(0, newLikes) } : c
            );
            return { ...prev, [postId]: updatedComments };
        });

        // Update DB
        try {
            await supabase.from('comments').update({ likes: Math.max(0, newLikes) }).eq('id', commentId);
        } catch (e) {
            console.error("Errore like commento:", e);
        }
    };

    // --- Placeholders ---
    const handleAddStory = () => alert("Funzionalità 'Storia' in arrivo!");
    const handleDashboard = () => alert(`Dashboard:\nPost: ${stats.posts}\nLike: ${stats.likes}`);
    const handleOtherOptions = () => alert("Opzioni aggiuntive...");
    const handleSeeInfo = () => {
        setActiveTab('info');
        setTimeout(() => document.getElementById('info-tab-content')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    const handleCreatePost = () => alert("Vai alla sezione Social per creare un post!");

    const getRoleLabel = (r) => {
        switch(r) {
            case 'patient': return 'Paziente';
            case 'caregiver': return 'Caregiver';
            case 'healthcare': return 'Medico';
            default: return 'Utente';
        }
    };

    const styles = {
        container: { backgroundColor: 'white', minHeight: '100%', paddingBottom: '100px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' },
        coverPhoto: { height: isMobile ? '200px' : '350px', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)', position: 'relative', overflow: 'hidden' },
        coverPattern: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)', opacity: 0.5 },
        profileHeader: { maxWidth: '940px', margin: '0 auto', padding: '0 16px', position: 'relative' },
        profilePictureContainer: { position: 'relative', marginTop: '-90px', marginBottom: '12px', width: 'fit-content' },
        profilePicture: { width: '168px', height: '168px', borderRadius: '50%', border: '4px solid white', backgroundColor: 'var(--color-primary)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '64px', fontWeight: 'bold', color: 'white', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
        avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
        cameraIcon: { position: 'absolute', bottom: '10px', right: '10px', backgroundColor: '#E4E6EB', borderRadius: '50%', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' },
        nameSection: { marginBottom: '10px', textAlign: 'left' },
        name: { fontSize: '28px', fontWeight: '800', color: '#050505', marginBottom: '2px', lineHeight: '1.2' },
        roleText: { fontSize: '15px', color: '#65676B', fontWeight: '600' },
        followerStats: { display: 'flex', gap: '12px', fontSize: '15px', color: '#65676B', marginBottom: '20px', fontWeight: '500' },
        boldStat: { color: '#050505', fontWeight: '700' },
        actionButtons: { display: 'flex', gap: '8px', marginBottom: '20px' },
        btnPrimary: { flex: 1, backgroundColor: '#1877F2', color: 'white', border: 'none', borderRadius: '6px', height: '36px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
        btnSecondary: { flex: 1, backgroundColor: '#E4E6EB', color: '#050505', border: 'none', borderRadius: '6px', height: '36px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
        btnIcon: { width: '48px', backgroundColor: '#E4E6EB', color: '#050505', border: 'none', borderRadius: '6px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
        divider: { height: '1px', backgroundColor: '#CED0D4', margin: '0 -16px 4px -16px' },
        tabsContainer: { display: 'flex', overflowX: 'auto', gap: '4px', scrollbarWidth: 'none', margin: '0 -16px', padding: '0 8px' },
        tab: { padding: '12px 16px', fontSize: '15px', fontWeight: '600', color: '#65676B', background: 'none', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' },
        tabActive: { color: '#1877F2', borderBottomColor: '#1877F2' },
        sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#050505', marginBottom: '12px' },
        detailRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px', fontSize: '15px', color: '#050505' },
        detailsBtn: { width: '100%', backgroundColor: '#E7F3FF', color: '#1877F2', border: 'none', borderRadius: '6px', height: '36px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '4px', marginBottom: '16px' },
        createPostContainer: { padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center', borderTop: '8px solid #F0F2F5', borderBottom: '8px solid #F0F2F5', margin: '0 -16px' },
        createPostInput: { flex: 1, borderRadius: '20px', border: '1px solid #CCD0D5', padding: '8px 16px', fontSize: '15px', color: '#65676B', cursor: 'pointer', backgroundColor: 'white' },
        postCard: { padding: '12px 0', borderBottom: '8px solid #F0F2F5', margin: '0 -16px' },
        postHeader: { padding: '0 16px', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
        postAuthorInfo: { display: 'flex', gap: '10px' },
        postAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden' },
        postContent: { fontSize: '15px', color: '#050505', lineHeight: '1.4', padding: '0 16px', marginBottom: '10px' },
        postImage: { width: '100%', height: 'auto', display: 'block', marginBottom: '10px' },
        postStats: { display: 'flex', justifyContent: 'space-between', padding: '0 16px 10px 16px', fontSize: '14px', color: '#65676B' },
        postActions: { display: 'flex', borderTop: '1px solid #CED0D4', margin: '0 16px', paddingTop: '4px' },
        actionBtn: { flex: 1, background: 'none', border: 'none', color: '#65676B', fontWeight: '600', fontSize: '14px', padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer' },
        // Comment Styles
        commentSection: { backgroundColor: '#F0F2F5', padding: '12px 16px', marginTop: '8px' },
        comment: { display: 'flex', gap: '8px', marginBottom: '12px' },
        avatarSmall: { width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', backgroundColor: '#ccc' },
        commentBubble: { backgroundColor: 'white', padding: '8px 12px', borderRadius: '18px', flex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
        commentAuthor: { fontWeight: '700', fontSize: '13px', color: '#050505' },
        commentText: { fontSize: '14px', color: '#050505', lineHeight: '1.4' },
        commentActions: { marginLeft: '50px', display: 'flex', gap: '12px', fontSize: '12px', color: '#65676B', fontWeight: '600' },
        commentLikeBtn: { cursor: 'pointer', border: 'none', background: 'none', padding: 0, fontWeight: '600', fontSize: '12px' },
        commentInputContainer: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' },
        commentInput: { flex: 1, borderRadius: '20px', border: '1px solid #CCD0D5', padding: '8px 12px', fontSize: '14px', outline: 'none' },
        
        modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' },
        modalContent: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto' },
        lightbox: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }
    };

    return (
        <div style={styles.container}>
            {enlargedImage && (
                <div style={styles.lightbox} onClick={() => setEnlargedImage(null)}>
                    <img src={enlargedImage} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Fullscreen" />
                </div>
            )}

            <div style={styles.coverPhoto}>
                <div style={styles.coverPattern}></div>
            </div>

            <div style={styles.profileHeader}>
                <div style={styles.profilePictureContainer}>
                    <div style={styles.profilePicture} onClick={() => setShowEditModal(true)}>
                        {user.photo ? <img src={user.photo} style={styles.avatarImg} alt="Profilo" /> : user.name?.[0]}
                    </div>
                    <div style={styles.cameraIcon} onClick={() => setShowEditModal(true)}>
                        <Camera size={20} color="#050505" />
                    </div>
                </div>

                <div style={styles.nameSection}>
                    <h1 style={styles.name}>{user.name} {user.surname}</h1>
                    <div style={styles.roleText}>{user.bio || `Profilo • ${getRoleLabel(user.role)}`}</div>
                </div>

                <div style={styles.followerStats}>
                    <span><span style={styles.boldStat}>{stats.posts * 15 + 42}</span> Follower</span>
                    <span>•</span>
                    <span><span style={styles.boldStat}>{stats.likes * 8 + 15}</span> Seguiti</span>
                </div>

                <div style={styles.actionButtons}>
                    <button style={styles.btnPrimary} onClick={handleAddStory}>
                        <Plus size={18} strokeWidth={3} /> Aggiungi storia
                    </button>
                    <button style={styles.btnSecondary} onClick={() => setShowEditModal(true)}>
                        <Edit2 size={16} /> Modifica profilo
                    </button>
                    <button style={styles.btnIcon} onClick={handleOtherOptions}>
                        <MoreHorizontal size={20} />
                    </button>
                </div>

                <div style={styles.divider}></div>

                <div style={styles.tabsContainer}>
                    <button style={{...styles.tab, ...(activeTab === 'post' ? styles.tabActive : {})}} onClick={() => setActiveTab('post')}>Post</button>
                    <button style={{...styles.tab, ...(activeTab === 'info' ? styles.tabActive : {})}} onClick={() => setActiveTab('info')}>Informazioni</button>
                    <button style={{...styles.tab, ...(activeTab === 'foto' ? styles.tabActive : {})}} onClick={() => setActiveTab('foto')}>Foto</button>
                </div>
            </div>

            <div style={{maxWidth: '940px', margin: '0 auto', padding: '0 16px'}}>
                {activeTab === 'post' && (
                    <>
                        <div style={{paddingTop: '16px'}}>
                            <h3 style={styles.sectionTitle}>Dettagli</h3>
                            <div style={styles.detailRow}>
                                <User size={20} color="#8C939D" />
                                <span>Profilo • <strong>{getRoleLabel(user.role)}</strong></span>
                            </div>
                            {user.location && (
                                <div style={styles.detailRow}>
                                    <MapPin size={20} color="#8C939D" />
                                    <span>Vive a <strong>{user.location}</strong></span>
                                </div>
                            )}
                            <div style={styles.detailRow}>
                                <Calendar size={20} color="#8C939D" />
                                <span>Iscritto a {new Date(user.createdAt || Date.now()).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</span>
                            </div>
                            <button style={styles.detailsBtn} onClick={handleSeeInfo}>Vedi le tue informazioni</button>
                        </div>

                        <div style={styles.createPostContainer}>
                             <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden'}}>
                                {user.photo ? <img src={user.photo} style={styles.avatarImg} /> : null}
                             </div>
                             <div style={styles.createPostInput} onClick={handleCreatePost}>A cosa stai pensando?</div>
                             <ImageIcon color="#45BD62" size={24} />
                        </div>

                        <div>
                             <div style={{display:'flex', justifyContent:'space-between', padding:'12px 0 0 0'}}>
                                 <h3 style={styles.sectionTitle}>Post</h3>
                                 <span style={{color:'#65676B', fontSize:'15px'}}>Filtri</span>
                             </div>

                             {userPosts.map(post => (
                                <div key={post.id} style={styles.postCard}>
                                    <div style={styles.postHeader}>
                                        <div style={styles.postAuthorInfo}>
                                            <div style={styles.postAvatar}>
                                                {post.author_photo ? <img src={post.author_photo} style={styles.avatarImg} /> : null}
                                            </div>
                                            <div>
                                                <div style={{fontWeight:'600', color:'#050505', fontSize:'15px'}}>{post.author}</div>
                                                <div style={{fontSize:'13px', color:'#65676B'}}>
                                                    {new Date(post.created_at).getDate()} {new Date(post.created_at).toLocaleString('default', { month: 'short' })} · <Users size={12} style={{verticalAlign:'middle'}}/>
                                                </div>
                                            </div>
                                        </div>
                                        <button style={{background:'none', border:'none'}} onClick={() => deletePost(post.id)}>
                                            <Trash2 size={16} color="#65676B" />
                                        </button>
                                    </div>

                                    {post.text && <div style={styles.postContent}>{post.text}</div>}
                                    {post.image && <img src={post.image} style={styles.postImage} onClick={() => setEnlargedImage(post.image)} />}

                                    <div style={styles.postStats}>
                                        <div style={{display:'flex', alignItems:'center', gap:'4px'}}>
                                            <div style={{background:'#1877F2', borderRadius:'50%', padding:'3px', display:'flex'}}><ThumbsUp size={10} color="white" fill="white"/></div>
                                            <span>{post.likes || 0}</span>
                                        </div>
                                        <span onClick={() => toggleComments(post.id)} style={{cursor: 'pointer'}}>{post.comment_count || 0} commenti</span>
                                    </div>

                                    <div style={styles.postActions}>
                                        <button 
                                            style={{...styles.actionBtn, color: likedPosts.includes(post.id) ? '#1877F2' : '#65676B'}} 
                                            onClick={() => handleLike(post.id, post.likes)}
                                        >
                                            <ThumbsUp size={18} fill={likedPosts.includes(post.id) ? "#1877F2" : "none"} /> Mi piace
                                        </button>
                                        <button style={styles.actionBtn} onClick={() => toggleComments(post.id)}>
                                            <MessageSquare size={18} /> Commenta
                                        </button>
                                        <button style={styles.actionBtn}>
                                            <Share2 size={18} /> Condividi
                                        </button>
                                    </div>

                                    {/* Comment Section */}
                                    {showCommentsFor === post.id && (
                                        <div style={styles.commentSection}>
                                            {(comments[post.id] || []).map(comm => (
                                                <div key={comm.id} style={{marginBottom:'12px'}}>
                                                    <div style={styles.comment}>
                                                        <div style={styles.avatarSmall}>
                                                            {comm.author_photo ? <img src={comm.author_photo} style={styles.avatarImg} /> : null}
                                                        </div>
                                                        <div style={styles.commentBubble}>
                                                            <div style={styles.commentAuthor}>{comm.author_name}</div>
                                                            <div style={styles.commentText}>{comm.text}</div>
                                                        </div>
                                                    </div>
                                                    {/* Comment Interactions */}
                                                    <div style={styles.commentActions}>
                                                        <button 
                                                            style={{
                                                                ...styles.commentLikeBtn, 
                                                                color: likedComments.includes(comm.id) ? '#1877F2' : '#65676B'
                                                            }}
                                                            onClick={() => handleCommentLike(comm.id, comm.likes, post.id)}
                                                        >
                                                            Mi piace
                                                        </button>
                                                        {comm.likes > 0 && (
                                                            <div style={{display:'flex', alignItems:'center', gap:'4px', color:'#65676B'}}>
                                                                <div style={{backgroundColor:'#1877F2', borderRadius:'50%', width:'14px', height:'14px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                                     <ThumbsUp size={8} color="white" fill="white"/>
                                                                </div>
                                                                {comm.likes}
                                                            </div>
                                                        )}
                                                        <span>Rispondi</span>
                                                        <span>{new Date(comm.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            <div style={styles.commentInputContainer}>
                                                <div style={styles.avatarSmall}>
                                                    {user.photo ? <img src={user.photo} style={styles.avatarImg} /> : null}
                                                </div>
                                                <input 
                                                    style={styles.commentInput} 
                                                    placeholder="Scrivi un commento..." 
                                                    value={newCommentText}
                                                    onChange={(e) => setNewCommentText(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && addComment(post.id)}
                                                />
                                                <button style={{border:'none', background:'none', color:'#1877F2'}} onClick={() => addComment(post.id)}>
                                                    <Send size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                             ))}
                        </div>
                    </>
                )}

                {activeTab === 'info' && (
                    <div id="info-tab-content" style={{paddingTop: '20px'}}>
                        <h3 style={styles.sectionTitle}>Informazioni generali</h3>
                        <div style={styles.detailRow}><strong>Nome:</strong> {user.name} {user.surname}</div>
                        <div style={styles.detailRow}><strong>Bio:</strong> {user.bio}</div>
                        <div style={styles.detailRow}><strong>Ruolo:</strong> {getRoleLabel(user.role)}</div>
                    </div>
                )}
            </div>

            {showEditModal && (
                <div style={styles.modal} onClick={() => setShowEditModal(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                            <h2 style={{fontSize:'20px', fontWeight:'700'}}>Modifica Profilo</h2>
                            <button style={{background:'none', border:'none', cursor:'pointer'}} onClick={() => setShowEditModal(false)}><X size={24}/></button>
                        </div>
                        <div style={{marginBottom:'12px'}}>
                            <label style={{display:'block', fontWeight:'600', marginBottom:'4px'}}>Foto Profilo</label>
                            <button style={{color:'#1877F2', background:'none', border:'none', fontWeight:'600', fontSize:'15px', cursor:'pointer'}} onClick={() => fileInputRef.current.click()}>Modifica</button>
                        </div>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />
                        
                        <div style={{marginBottom:'16px'}}>
                             <label style={{display:'block', fontWeight:'600', marginBottom:'4px'}}>Ruolo</label>
                             <select 
                                 style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd', backgroundColor:'white'}}
                                 value={editForm.role}
                                 onChange={(e) => setEditForm(prev => ({...prev, role: e.target.value}))}
                             >
                                 <option value="patient">Paziente</option>
                                 <option value="caregiver">Familiare / Caregiver</option>
                                 <option value="healthcare">Operatore Sanitario</option>
                             </select>
                        </div>

                        <div style={{marginBottom:'16px'}}>
                            <label style={{display:'block', fontWeight:'600', marginBottom:'4px'}}>Bio</label>
                            <textarea 
                                style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd', minHeight:'80px'}}
                                value={editForm.bio}
                                onChange={e => setEditForm({...editForm, bio: e.target.value})}
                            />
                        </div>
                        <div style={{marginBottom:'16px'}}>
                             <label style={{display:'block', fontWeight:'600', marginBottom:'4px'}}>Località</label>
                             <input 
                                type="text"
                                style={{width:'100%', padding:'10px', borderRadius:'6px', border:'1px solid #ddd'}}
                                value={editForm.location}
                                onChange={e => setEditForm({...editForm, location: e.target.value})}
                             />
                        </div>
                        <button 
                            style={{width:'100%', backgroundColor:'#1877F2', color:'white', border:'none', padding:'12px', borderRadius:'6px', fontWeight:'600', fontSize:'15px', cursor:'pointer'}}
                            onClick={saveProfile}
                        >
                            Salva modifiche
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
