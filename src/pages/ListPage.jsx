import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
    Bell, 
    Calendar, 
    Plus, 
    Smile, 
    Meh, 
    Frown, 
    Heart,
    Trash2,
    CheckCircle2,
    Settings
} from 'lucide-react';
import { supabase } from '../supabaseClient';

const initialTasks = [
    { id: 1, text: 'Prendere farmaci mattino', time: '08:30', completed: false },
    { id: 2, text: 'Chiudere la porta a chiave', time: '21:00', completed: false },
    { id: 3, text: 'Bere un bicchiere d\'acqua', time: '10:00', completed: true },
    { id: 4, text: 'Chiamare Maria', time: '11:45', completed: false },
];

const wellnessQuotes = [
    "Ricorda che ogni piccolo gesto di cura oggi è un seme che fiorirà nel cuore di chi ami.",
    "Il respiro è il ponte che collega la vita alla coscienza, che unisce il corpo ai tuoi pensieri.",
    "Non contare i giorni, fai in modo che i giorni contino.",
    "La gentilezza è la lingua che il sordo può sentire e il cieco può vedere.",
    "Circondati di persone che ti fanno sentire la versione migliore di te stesso.",
    "Ogni giorno è una nuova opportunità per fare la differenza, anche se piccola.",
    "La mente è come un giardino: coltiva pensieri d'amore e raccoglierai bellezza.",
    "Ascolta il tuo cuore, è lì che risiedono le tue verità più profonde.",
    "La pazienza è la chiave che apre tutte le porte del benessere interiore.",
    "Un sorriso è il modo più rapido per cambiare la tua giornata e quella degli altri."
];

const ListPage = () => {
    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{}');
    const isPatient = user.role === 'patient';
    
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('alzheimer_tasks');
        return saved ? JSON.parse(saved) : initialTasks;
    });
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskTime, setNewTaskTime] = useState("");
    const [showManage, setShowManage] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [currentMood, setCurrentMood] = useState(null); // 'happy', 'neutral', 'sad'
    const [loadingMood, setLoadingMood] = useState(true);

    // Get Daily Quote based on the day of the year
    const dailyQuote = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now - start;
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        return wellnessQuotes[dayOfYear % wellnessQuotes.length];
    }, []);

    // Salva ogni volta che i task cambiano
    useEffect(() => {
        localStorage.setItem('alzheimer_tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Fetch Mood from Supabase
    useEffect(() => {
        const fetchMood = async () => {
            try {
                // Fetch the patient's profile to get the mood. 
                // If current user is patient, we use their ID. 
                // If not, we search for the first patient (demo-logic) or we'd need a multi-user association.
                const profileId = isPatient ? (user.id || (user.name + (user.surname || ''))) : null;
                
                let query = supabase.from('profiles').select('current_mood');
                if (profileId) {
                    query = query.eq('id', profileId);
                } else {
                    // If caregiver, find any patient's mood (simplified for this app structure)
                    query = query.eq('role', 'patient').limit(1);
                }

                const { data, error } = await query.single();
                if (!error && data) {
                    setCurrentMood(data.current_mood);
                }
            } catch (e) {
                console.error("error fetching mood", e);
            } finally {
                setLoadingMood(false);
            }
        };
        fetchMood();
    }, [isPatient, user.id, user.name, user.surname]);

    const handleMoodSelect = async (mood) => {
        if (!isPatient) return;
        
        setCurrentMood(mood);
        try {
            const profileId = user.id || (user.name + (user.surname || ''));
            await supabase.from('profiles').upsert([{ 
                id: profileId, 
                current_mood: mood,
                name: user.name,
                surname: user.surname,
                role: user.role
            }]);
        } catch (e) {
            console.error("Error saving mood", e);
        }
    };

    useEffect(() => {
        const check = () => {
            let hasPerm = false;
            if (window.OneSignal && window.OneSignal.Notifications) {
                hasPerm = window.OneSignal.Notifications.permission === true;
            } else if (window.Notification) {
                hasPerm = window.Notification.permission === 'granted';
            }
            setNotificationsEnabled(hasPerm);
        };
        check();
    }, []);

    const toggleTask = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const addTask = () => {
        if (!newTaskText.trim()) return;
        const newTask = {
            id: Date.now(),
            text: newTaskText,
            time: newTaskTime || new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            completed: false
        };
        setTasks([newTask, ...tasks]);
        setNewTaskText("");
        setNewTaskTime("");
        setShowManage(false);
    };

    const deleteTask = (id) => {
        if (window.confirm("Vuoi cancellare questa attività?")) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const styles = {
        container: {
            padding: '24px',
            width: '100%',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '24px',
        },
        greeting: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1A1A1A',
        },
        subHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#7C3AED',
            fontSize: '14px',
            marginTop: '4px',
            fontWeight: '600',
        },
        settingsLink: {
            color: '#9CA3AF',
            padding: '8px',
            backgroundColor: 'white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        },
        agendaCard: {
            background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: 'white',
            marginBottom: '20px',
            boxShadow: '0 10px 25px rgba(124, 58, 237, 0.3)',
        },
        cardTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
            marginBottom: '20px',
        },
        taskItem: {
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            cursor: 'pointer',
        },
        taskLeft: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
        },
        taskIcon: {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        },
        taskText: {
            fontWeight: '600',
            fontSize: '16px',
        },
        completedText: {
            textDecoration: 'line-through',
            opacity: 0.7,
        },
        taskTime: {
            fontSize: '14px',
            opacity: 0.9,
            fontWeight: '500',
        },
        manageBtn: {
            backgroundColor: 'white',
            color: '#7C3AED',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '15px',
            marginTop: '10px',
            width: 'fit-content',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
        },
        secondaryCards: {
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr)',
            gap: '20px',
            marginBottom: '20px',
        },
        whiteCard: {
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
        },
        moodIconContainer: {
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
            marginBottom: '12px',
        },
        moodBtn: (mood) => ({
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            backgroundColor: currentMood === mood ? 'rgba(124, 58, 237, 0.1)' : '#F3F4F6',
            border: currentMood === mood ? '2px solid #7C3AED' : '2px solid transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isPatient ? 'pointer' : 'default',
            pointerEvents: isPatient ? 'auto' : 'none',
            transition: 'all 0.2s ease',
            opacity: (!isPatient && currentMood !== mood && currentMood !== null) ? 0.4 : 1,
            transform: currentMood === mood ? 'scale(1.05)' : 'scale(1)',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent',
        }),
        quoteCard: {
            backgroundColor: '#FFFBEB',
            borderRadius: '24px',
            padding: '24px',
            border: '1px solid #FEF3C7',
            position: 'relative',
            overflow: 'hidden',
        },
        quoteText: {
            color: '#92400E',
            fontSize: '16px',
            fontStyle: 'italic',
            lineHeight: '1.6',
            position: 'relative',
            zIndex: 1,
        },
        quoteLabel: {
            color: '#D97706',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '8px',
            display: 'block',
        },
        heartBg: {
            position: 'absolute',
            right: '-10px',
            bottom: '-10px',
            color: '#FEF3C7',
            opacity: 0.5,
        },
        inputArea: {
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            marginTop: '20px',
            marginBottom: '20px',
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid #E5E7EB',
            marginBottom: '10px',
            fontSize: '16px',
        }
    };

    return (
        <div style={styles.container}>
            {/* Header / Guest Greeting */}
            <div style={styles.header}>
                <div>
                    <div style={styles.greeting}>Ciao, {user.name || 'lol'}!</div>
                    <div style={styles.subHeader}>
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                </div>
                <Link to="/impostazioni" style={styles.settingsLink} aria-label="Impostazioni">
                    <Settings size={20} />
                </Link>
            </div>

            {/* Notification Alert */}
            {!notificationsEnabled && (
                <div style={{ margin: '0 0 20px 0', padding: '16px', backgroundColor: '#FFF4E5', border: '1px solid #FFE58F', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Bell style={{ color: '#E67E22' }} size={24} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', color: '#856404', fontSize: '15px' }}>Avvisi Disattivati</div>
                    </div>
                </div>
            )}

            {/* Agenda Card */}
            <div style={styles.agendaCard}>
                <div style={styles.cardTitle}>
                    <CheckCircle2 size={24} />
                    <span>Agenda di Oggi</span>
                </div>

                {tasks.filter(t => !t.completed || showManage).map(task => (
                    <div 
                        key={task.id} 
                        style={styles.taskItem}
                        onClick={() => toggleTask(task.id)}
                    >
                        <div style={styles.taskLeft}>
                            <div style={styles.taskIcon}>
                                {task.completed ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                            </div>
                            <span style={{
                                ...styles.taskText,
                                ...(task.completed ? styles.completedText : {})
                            }}>
                                {task.text}
                            </span>
                        </div>
                        <div style={styles.taskTime}>{task.time || '--:--'}</div>
                        {showManage && (
                            <Trash2 
                                size={18} 
                                color="#fff" 
                                style={{ marginLeft: '10px' }} 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                }} 
                            />
                        )}
                    </div>
                ))}

                <div 
                    style={styles.manageBtn} 
                    onClick={() => setShowManage(!showManage)}
                >
                    {showManage ? "Salva Modifiche" : "Gestisci Attività"}
                </div>
            </div>

            {/* Add Task Area */}
            {showManage && (
                <div style={styles.inputArea}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Nuova Attività</h4>
                    <input
                        style={styles.input}
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Cosa devi fare?"
                    />
                    <input
                        type="time"
                        style={styles.input}
                        value={newTaskTime}
                        onChange={(e) => setNewTaskTime(e.target.value)}
                    />
                    <button 
                        style={{ ...styles.manageBtn, backgroundColor: '#7C3AED', color: 'white', width: '100%', marginTop: '10px' }}
                        onClick={addTask}
                    >
                        Aggiungi
                    </button>
                </div>
            )}

            {/* Secondary Cards Row */}
            <div style={styles.secondaryCards}>
                {/* Mood Card */}
                <div style={styles.whiteCard}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                        {isPatient ? "Come ti senti?" : "Stato del Paziente"}
                    </span>
                    <div style={styles.moodIconContainer}>
                        <div style={styles.moodBtn('happy')} onClick={() => handleMoodSelect('happy')}>
                            <Smile size={36} color={currentMood === 'happy' ? "#7C3AED" : "#F59E0B"} />
                        </div>
                        <div style={styles.moodBtn('neutral')} onClick={() => handleMoodSelect('neutral')}>
                            <Meh size={36} color={currentMood === 'neutral' ? "#7C3AED" : "#9CA3AF"} />
                        </div>
                        <div style={styles.moodBtn('sad')} onClick={() => handleMoodSelect('sad')}>
                            <Frown size={36} color={currentMood === 'sad' ? "#7C3AED" : "#EF4444"} />
                        </div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>
                        {isPatient ? "Tocca l'emozione che provi ora" : "L'ultimo umore registrato dal paziente"}
                    </span>
                </div>

                {/* Wisdom Pill Card */}
                <div style={styles.quoteCard}>
                    <span style={styles.quoteLabel}>Pillola di Benessere</span>
                    <p style={styles.quoteText}>
                        "{dailyQuote}"
                    </p>
                    <Heart size={80} style={styles.heartBg} />
                </div>
            </div>
        </div>
    );
};

export default ListPage;
