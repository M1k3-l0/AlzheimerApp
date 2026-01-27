import React, { useState, useEffect } from 'react';
import { 
    Bell, 
    Calendar, 
    Plus, 
    ChevronRight, 
    CloudSun, 
    Smile, 
    Meh, 
    Frown, 
    Heart,
    Trash2,
    CheckCircle2
} from 'lucide-react';

const initialTasks = [
    { id: 1, text: 'Prendere farmaci mattino', time: '08:30', completed: false },
    { id: 2, text: 'Chiudere la porta a chiave', time: '21:00', completed: false },
    { id: 3, text: 'Bere un bicchiere d\'acqua', time: '10:00', completed: true },
    { id: 4, text: 'Chiamare Maria', time: '11:45', completed: false },
];

const ListPage = () => {
    // Carica i task salvati o usa quelli di default
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('alzheimer_tasks');
        return saved ? JSON.parse(saved) : initialTasks;
    });
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskTime, setNewTaskTime] = useState("");
    const [showManage, setShowManage] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    // Salva ogni volta che i task cambiano
    useEffect(() => {
        localStorage.setItem('alzheimer_tasks', JSON.stringify(tasks));
    }, [tasks]);

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
        const timer = setTimeout(check, 2000);
        return () => clearTimeout(timer);
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
            backgroundColor: '#F9F9FB',
            minHeight: '100dvh',
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
        weather: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fff',
            padding: '8px 12px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            fontSize: '14px',
            fontWeight: 'bold',
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
            gridTemplateColumns: '1fr',
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
        moodBtn: {
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s',
        },
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
                    <div style={styles.greeting}>Ciao, lol!</div>
                    <div style={styles.subHeader}>
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                </div>
                <div style={styles.weather}>
                    <CloudSun size={20} color="#F59E0B" />
                    <span>22°C</span>
                </div>
            </div>

            {/* Notification Alert if disabled (keeping original functionality) */}
            {!notificationsEnabled && (
                <div onClick={() => {}} style={{ margin: '0 0 20px 0', padding: '16px', backgroundColor: '#FFF4E5', border: '1px solid #FFE58F', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
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

            {/* Add Task Area (Quick form if managing) */}
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
                        style={{ ...styles.manageBtn, backgroundColor: '#7C3AED', color: 'white', width: '100%' }}
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
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Come ti senti?</span>
                    <div style={styles.moodIconContainer}>
                        <div style={styles.moodBtn}><Smile size={32} color="#F59E0B" /></div>
                        <div style={styles.moodBtn}><Meh size={32} color="#9CA3AF" /></div>
                        <div style={styles.moodBtn}><Frown size={32} color="#EF4444" /></div>
                    </div>
                    <span style={{ fontSize: '12px', color: '#6B7280' }}>Monitora il tuo umore ogni giorno</span>
                </div>

                {/* Wisdom Pill Card */}
                <div style={styles.quoteCard}>
                    <span style={styles.quoteLabel}>Pillola di Benessere</span>
                    <p style={styles.quoteText}>
                        "Ricorda che ogni piccolo gesto di cura oggi è un seme che fiorirà nel cuore di chi ami."
                    </p>
                    <Heart size={80} style={styles.heartBg} />
                </div>
            </div>
        </div>
    );
};

export default ListPage;

