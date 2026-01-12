import React, { useState, useEffect, useRef } from 'react';
import { Camera, Edit2, MapPin, Calendar, Heart, MessageSquare, ThumbsUp, X, Check, Image as ImageIcon, Trash2 } from 'lucide-react';
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
        photo: user.photo || ''
    });
    const fileInputRef = useRef(null);
    const [stats, setStats] = useState({
        posts: 0,
        likes: 0,
        comments: 0
    });
    const [likedPosts, setLikedPosts] = useState(() => {
        const saved = localStorage.getItem('alzheimer_liked_posts');
        return saved ? JSON.parse(saved) : [];
    });
    const [enlargedImage, setEnlargedImage] = useState(null);

    useEffect(() => {
        fetchUserPosts();
        calculateStats();
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

    const saveProfile = () => {
        const updatedUser = {
            ...user,
            ...editForm
        };
        localStorage.setItem('alzheimer_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowEditModal(false);
        
        window.dispatchEvent(new Event('storage'));
        
        fetchUserPosts();
        calculateStats();
    };

    const handleLike = async (postId, currentLikes) => {
        if (likedPosts.includes(postId)) return;

        setUserPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p));
        setLikedPosts(prev => [...prev, postId]);

        try {
            const { error } = await supabase
                .from('posts')
                .update({ likes: (currentLikes || 0) + 1 })
                .eq('id', postId);
            
            if (error) throw error;
        } catch (e) {
            console.error("Errore nel mettere like", e);
            setLikedPosts(prev => prev.filter(id => id !== postId));
            fetchUserPosts();
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

    const styles = {
        container: {
            backgroundColor: '#F0F2F5',
            minHeight: '100%',
            paddingBottom: '100px'
        },
        coverPhoto: {
            height: '360px',
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
            position: 'relative',
            overflow: 'hidden'
        },
        coverPattern: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            opacity: 0.5
        },
        profileHeader: {
            backgroundColor: 'white',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        },
        profileHeaderInner: {
            maxWidth: '940px',
            margin: '0 auto',
            padding: '0 16px',
            position: 'relative',
            minHeight: '84px'
        },
        profilePicture: {
            width: '168px',
            height: '168px',
            borderRadius: '50%',
            border: '4px solid white',
            backgroundColor: 'var(--color-primary)',
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '64px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
        },
        avatarImg: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        profileInfoSection: {
            paddingLeft: '200px',
            paddingTop: '20px',
            paddingBottom: '16px'
        },
        name: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#050505',
            marginBottom: '4px'
        },
        bio: {
            fontSize: '15px',
            color: '#65676B',
            marginBottom: '12px'
        },
        metaInfo: {
            display: 'flex',
            gap: '8px',
            fontSize: '15px',
            color: '#65676B',
            marginBottom: '16px',
            flexWrap: 'wrap'
        },
        metaItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
        },
        editButton: {
            backgroundColor: '#E4E6EB',
            color: '#050505',
            border: 'none',
            padding: '9px 16px',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s ease'
        },
        tabsContainer: {
            borderTop: '1px solid #CED0D4',
            display: 'flex',
            gap: '8px',
            paddingLeft: '200px',
            paddingTop: '0'
        },
        tab: {
            padding: '16px 16px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#65676B',
            background: 'none',
            border: 'none',
            borderBottom: '3px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        tabActive: {
            color: 'var(--color-primary)',
            borderBottomColor: 'var(--color-primary)'
        },
        contentArea: {
            maxWidth: '940px',
            margin: '16px auto',
            padding: '0 16px',
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: '16px'
        },
        sidebar: {
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        card: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
        },
        cardTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: '#050505',
            marginBottom: '16px'
        },
        infoItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
            fontSize: '15px',
            color: '#050505'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
        },
        statCard: {
            textAlign: 'center',
            padding: '12px',
            backgroundColor: '#F7F3FA',
            borderRadius: '8px'
        },
        statNumber: {
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-primary)'
        },
        statLabel: {
            fontSize: '12px',
            color: '#65676B',
            marginTop: '4px'
        },
        postCard: {
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            marginBottom: '16px'
        },
        postHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
        },
        postAuthorSection: {
            display: 'flex',
            gap: '12px'
        },
        postAvatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            overflow: 'hidden'
        },
        postAuthorName: {
            fontWeight: '600',
            fontSize: '15px',
            color: '#050505'
        },
        postDate: {
            fontSize: '13px',
            color: '#65676B'
        },
        postText: {
            fontSize: '15px',
            color: '#050505',
            marginBottom: '12px',
            lineHeight: '1.5'
        },
        postImage: {
            width: '100%',
            maxHeight: '500px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '12px',
            cursor: 'zoom-in'
        },
        postStats: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid #E4E6EB',
            marginBottom: '8px',
            fontSize: '15px',
            color: '#65676B'
        },
        postActions: {
            display: 'flex',
            gap: '8px',
            paddingTop: '4px'
        },
        actionBtn: {
            flex: 1,
            background: 'none',
            border: 'none',
            color: '#65676B',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontWeight: '600',
            fontSize: '15px',
            padding: '8px',
            borderRadius: '6px',
            transition: 'background-color 0.2s ease'
        },
        photosGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '4px'
        },
        photoThumbnail: {
            aspectRatio: '1',
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer'
        },
        photoImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover'
        },
        lightbox: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            cursor: 'zoom-out'
        },
        modal: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modalContent: {
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto'
        },
        modalHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
        },
        modalTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-primary-dark)'
        },
        closeButton: {
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px'
        },
        formGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: 'var(--color-primary-dark)',
            marginBottom: '8px'
        },
        input: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '15px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
        },
        textarea: {
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #E5E7EB',
            borderRadius: '12px',
            fontSize: '15px',
            outline: 'none',
            minHeight: '100px',
            resize: 'vertical',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease'
        },
        photoPreview: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            margin: '0 auto 16px auto',
            backgroundColor: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '36px',
            fontWeight: 'bold'
        },
        uploadButton: {
            backgroundColor: '#F3F4F6',
            border: '2px dashed #D1D5DB',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
        },
        buttonGroup: {
            display: 'flex',
            gap: '12px',
            marginTop: '24px'
        },
        saveButton: {
            flex: 1,
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.2s ease'
        },
        cancelButton: {
            flex: 1,
            backgroundColor: '#F3F4F6',
            color: '#666',
            border: 'none',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: '600',
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
        }
    };

    const photoPosts = userPosts.filter(p => p.image);

    return (
        <div style={styles.container}>
            {/* Lightbox per immagini ingrandite */}
            {enlargedImage && (
                <div style={styles.lightbox} onClick={() => setEnlargedImage(null)}>
                    <img src={enlargedImage} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} alt="Fullscreen" />
                </div>
            )}

            {/* Cover Photo */}
            <div style={styles.coverPhoto}>
                <div style={styles.coverPattern}></div>
            </div>

            {/* Profile Header - Facebook Style */}
            <div style={styles.profileHeader}>
                <div style={styles.profileHeaderInner}>
                    {/* Profile Picture */}
                    <div 
                        style={styles.profilePicture}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        {user.photo ? (
                            <img src={user.photo} style={styles.avatarImg} alt="Profilo" />
                        ) : (
                            user.name?.[0] || 'U'
                        )}
                    </div>

                    {/* Profile Info */}
                    <div style={styles.profileInfoSection}>
                        <h1 style={styles.name}>
                            {user.name} {user.surname || ''}
                        </h1>
                        
                        {user.bio && (
                            <p style={styles.bio}>{user.bio}</p>
                        )}

                        <div style={styles.metaInfo}>
                            {user.location && (
                                <div style={styles.metaItem}>
                                    <MapPin size={14} />
                                    <span>{user.location}</span>
                                </div>
                            )}
                            <div style={styles.metaItem}>
                                <Calendar size={14} />
                                <span>Iscritto da {new Date(user.createdAt || Date.now()).toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>

                        <button 
                            style={styles.editButton}
                            onClick={() => setShowEditModal(true)}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D8DADF'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E4E6EB'}
                        >
                            <Edit2 size={16} />
                            Modifica profilo
                        </button>
                    </div>

                    {/* Tabs */}
                    <div style={styles.tabsContainer}>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'post' ? styles.tabActive : {})}}
                            onClick={() => setActiveTab('post')}
                        >
                            Post
                        </button>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'info' ? styles.tabActive : {})}}
                            onClick={() => setActiveTab('info')}
                        >
                            Informazioni
                        </button>
                        <button 
                            style={{...styles.tab, ...(activeTab === 'foto' ? styles.tabActive : {})}}
                            onClick={() => setActiveTab('foto')}
                        >
                            Foto
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div style={styles.contentArea}>
                {/* Sidebar */}
                <div style={styles.sidebar}>
                    {/* Intro Card */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Intro</h3>
                        {user.bio && (
                            <div style={styles.infoItem}>
                                <span>{user.bio}</span>
                            </div>
                        )}
                        {user.location && (
                            <div style={styles.infoItem}>
                                <MapPin size={20} color="#65676B" />
                                <span>Vive a <strong>{user.location}</strong></span>
                            </div>
                        )}
                        <div style={styles.infoItem}>
                            <Calendar size={20} color="#65676B" />
                            <span>Iscritto da {new Date(user.createdAt || Date.now()).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}</span>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}>Statistiche</h3>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{stats.posts}</div>
                                <div style={styles.statLabel}>Post</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{stats.likes}</div>
                                <div style={styles.statLabel}>Mi Piace</div>
                            </div>
                            <div style={styles.statCard}>
                                <div style={styles.statNumber}>{stats.comments}</div>
                                <div style={styles.statLabel}>Commenti</div>
                            </div>
                        </div>
                    </div>

                    {/* Photos Card */}
                    {photoPosts.length > 0 && (
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Foto</h3>
                            <div style={styles.photosGrid}>
                                {photoPosts.slice(0, 9).map(post => (
                                    <div 
                                        key={post.id} 
                                        style={styles.photoThumbnail}
                                        onClick={() => setEnlargedImage(post.image)}
                                    >
                                        <img src={post.image} style={styles.photoImage} alt="Foto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div>
                    {/* Tab: Post */}
                    {activeTab === 'post' && (
                        <>
                            {userPosts.length > 0 ? (
                                userPosts.map(post => (
                                    <div key={post.id} style={styles.postCard}>
                                        <div style={styles.postHeader}>
                                            <div style={styles.postAuthorSection}>
                                                <div style={styles.postAvatar}>
                                                    {post.author_photo ? (
                                                        <img src={post.author_photo} style={styles.avatarImg} alt="Autore" />
                                                    ) : (
                                                        post.author?.[0] || 'U'
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={styles.postAuthorName}>{post.author}</div>
                                                    <div style={styles.postDate}>
                                                        {new Date(post.created_at).toLocaleString('it-IT', { 
                                                            day: 'numeric', 
                                                            month: 'long', 
                                                            hour: '2-digit', 
                                                            minute: '2-digit' 
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                style={{ background: 'none', border: 'none', color: '#65676B', cursor: 'pointer' }} 
                                                onClick={() => deletePost(post.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        {post.text && <div style={styles.postText}>{post.text}</div>}
                                        {post.image && (
                                            <img 
                                                src={post.image} 
                                                style={styles.postImage} 
                                                onClick={() => setEnlargedImage(post.image)} 
                                                alt="Post" 
                                            />
                                        )}

                                        <div style={styles.postStats}>
                                            <span>{post.likes || 0} Mi piace</span>
                                            <span>{post.comment_count || 0} Commenti</span>
                                        </div>

                                        <div style={styles.postActions}>
                                            <button 
                                                style={styles.actionBtn}
                                                onClick={() => handleLike(post.id, post.likes)}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <ThumbsUp 
                                                    size={18} 
                                                    fill={likedPosts.includes(post.id) ? "var(--color-primary)" : "none"} 
                                                    color={likedPosts.includes(post.id) ? "var(--color-primary)" : "#65676B"}
                                                />
                                                Mi piace
                                            </button>
                                            <button 
                                                style={styles.actionBtn}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F2F5'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                            >
                                                <MessageSquare size={18} />
                                                Commenta
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={styles.card}>
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#65676B' }}>
                                        <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                        <p>Nessun post ancora</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Tab: Info */}
                    {activeTab === 'info' && (
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Informazioni</h3>
                            {user.bio && (
                                <div style={styles.infoItem}>
                                    <strong>Bio:</strong> {user.bio}
                                </div>
                            )}
                            {user.location && (
                                <div style={styles.infoItem}>
                                    <MapPin size={20} color="#65676B" />
                                    <span><strong>Località:</strong> {user.location}</span>
                                </div>
                            )}
                            <div style={styles.infoItem}>
                                <Calendar size={20} color="#65676B" />
                                <span><strong>Membro da:</strong> {new Date(user.createdAt || Date.now()).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    )}

                    {/* Tab: Foto */}
                    {activeTab === 'foto' && (
                        <div style={styles.card}>
                            <h3 style={styles.cardTitle}>Foto</h3>
                            {photoPosts.length > 0 ? (
                                <div style={styles.photosGrid}>
                                    {photoPosts.map(post => (
                                        <div 
                                            key={post.id} 
                                            style={styles.photoThumbnail}
                                            onClick={() => setEnlargedImage(post.image)}
                                        >
                                            <img src={post.image} style={styles.photoImage} alt="Foto" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#65676B' }}>
                                    <ImageIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                                    <p>Nessuna foto ancora</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div style={styles.modal} onClick={() => setShowEditModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>Modifica Profilo</h2>
                            <button style={styles.closeButton} onClick={() => setShowEditModal(false)}>
                                <X size={24} color="#999" />
                            </button>
                        </div>

                        <div style={styles.photoPreview}>
                            {editForm.photo ? (
                                <img src={editForm.photo} style={styles.avatarImg} alt="Preview" />
                            ) : (
                                editForm.name?.[0] || 'U'
                            )}
                        </div>

                        <div 
                            style={styles.uploadButton}
                            onClick={() => fileInputRef.current?.click()}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#E5E7EB';
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#F3F4F6';
                                e.currentTarget.style.borderColor = '#D1D5DB';
                            }}
                        >
                            <Camera size={24} color="var(--color-primary)" />
                            <span style={{ fontSize: '14px', color: '#666' }}>Carica Foto Profilo</span>
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            hidden 
                            accept="image/*" 
                            onChange={handleImageChange} 
                        />

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Nome</label>
                            <input 
                                type="text"
                                style={styles.input}
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Cognome</label>
                            <input 
                                type="text"
                                style={styles.input}
                                value={editForm.surname}
                                onChange={(e) => setEditForm(prev => ({ ...prev, surname: e.target.value }))}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Bio</label>
                            <textarea 
                                style={styles.textarea}
                                value={editForm.bio}
                                onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Racconta qualcosa di te..."
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Località</label>
                            <input 
                                type="text"
                                style={styles.input}
                                value={editForm.location}
                                onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                                placeholder="Es. Milano, Italia"
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                            />
                        </div>

                        <div style={styles.buttonGroup}>
                            <button 
                                style={styles.cancelButton}
                                onClick={() => setShowEditModal(false)}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Annulla
                            </button>
                            <button 
                                style={styles.saveButton}
                                onClick={saveProfile}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Check size={18} />
                                Salva
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
