import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import AppIcon from '../components/AppIcon';
import { supabase } from '../supabaseClient';
import { wellnessQuotes, getDayOfYear } from '../data/quotes';
import { addMoodEntry, getMoodHistory, getLatestMood } from '../utils/moodHistory';
import ClinicalDashboard from '../components/ClinicalDashboard';
import MoodTracker from '../components/MoodTracker';

const initialTasks = [
    { id: 1, text: 'Prendere medicine mattina', time: '08:00', completed: false },
    { id: 2, text: 'Riposo', time: '12:00', completed: false },
    { id: 3, text: 'Passeggiata', time: '15:30', completed: false },
    { id: 4, text: 'Bere un bicchiere d\'acqua', time: '10:00', completed: false },
    { id: 5, text: 'Chiudere la porta a chiave', time: '21:00', completed: false },
];

const QUOTE_ICON_COLOR = 'var(--color-primary)';

/** Converte "HH:MM" o "H:MM" in minuti dall'inizio del giorno per ordinare per orario */
function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === '--:--') return Infinity;
  const parts = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return Infinity;
  return parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
}

const ListPage = () => {
    const user = JSON.parse(localStorage.getItem('alzheimer_user') || '{}');
    const isPatient = user.role === 'patient';
    const isHealthcare = user.role === 'healthcare';
    const reduceMotion = useReducedMotion();
    
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [newTaskText, setNewTaskText] = useState("");
    const [newTaskTime, setNewTaskTime] = useState("");
    const [newTaskCategory, setNewTaskCategory] = useState("generic");
    const [newTaskRecurrence, setNewTaskRecurrence] = useState("none");
    const [showManage, setShowManage] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [currentMood, setCurrentMood] = useState(null);
    const [loadingMood, setLoadingMood] = useState(true);
    const [moodToast, setMoodToast] = useState(null);

    const categories = {
        generic: { icon: 'calendar-lines', label: 'Generale', iconColor: 'primaryDark' },
        meds: { icon: 'badge-check', label: 'Medicine', iconColor: '#059669' },
        food: { icon: 'shoe-prints', label: 'Pasto', iconColor: '#D97706' },
        rest: { icon: 'face-expressionless', label: 'Riposo', iconColor: '#6366F1' },
        walk: { icon: 'shoe-prints', label: 'Passeggiata', iconColor: 'primary' },
        appointment: { icon: 'calendar-lines', label: 'Visita', iconColor: '#DC2626' },
    };

    const completionStats = useMemo(() => {
        if (tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.completed).length;
        return Math.round((completed / tasks.length) * 100);
    }, [tasks]);

    // Frase del giorno: indice = giorno dell'anno (1-365)
    const dailyQuoteData = useMemo(() => {
        const dayOfYear = getDayOfYear();
        const index = Math.min(dayOfYear - 1, wellnessQuotes.length - 1);
        return wellnessQuotes[index];
    }, []);

    // Fetch Tasks from Supabase
    useEffect(() => {
        if (!user.id) return;
        fetchTasks();

        const channel = supabase
            .channel('realtime-tasks')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'tasks',
                filter: `user_id=eq.${user.id}`
            }, () => fetchTasks())
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user.id]);

    const fetchTasks = async () => {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (!error && data) {
            // Se non ci sono task, inizializza con quelli predefiniti la prima volta
            if (data.length === 0) {
                const defaults = initialTasks.map(t => {
                    const newTask = { ...t, user_id: user.id, category: 'generic', recurrence: 'none' };
                    delete newTask.id;
                    return newTask;
                });
                const { data: inserted } = await supabase.from('tasks').insert(defaults).select();
                if (inserted) setTasks(inserted);
            } else {
                setTasks(data);
            }
        }
        setLoadingTasks(false);
    };

    // Fetch Mood from Supabase
    useEffect(() => {
        const fetchMood = async () => {
            try {
                const profileId = isPatient ? (user.id || (user.name + (user.surname || ''))) : null;
                let query = supabase.from('profiles').select('current_mood');
                if (profileId) {
                    query = query.eq('id', profileId);
                } else {
                    query = query.eq('role', 'patient').limit(1);
                }
                const { data, error } = await query.maybeSingle();
                if (!error && data) setCurrentMood(data.current_mood);
            } catch (e) {
                console.error("error fetching mood", e);
            } finally {
                setLoadingMood(false);
            }
        };
        fetchMood();
    }, [isPatient, user.id, user.name, user.surname]);

    const handleMoodSelect = async (mood) => {
        setCurrentMood(mood);
        addMoodEntry(mood);
        const ora = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        setMoodToast(`Umore delle ${ora} registrato con successo!`);
        try {
            const profileId = user.id;
            if (profileId) {
                await supabase.from('profiles').update({ current_mood: mood }).eq('id', profileId);
                await supabase.from('mood_history').insert([{ user_id: profileId, mood: mood }]);
                await supabase.from('activity_log').insert([{ user_id: profileId, action: 'mood_updated', details: `Umore: ${mood}` }]);
            }
        } catch (e) { console.error("Error saving mood", e); }
    };

    useEffect(() => {
        if (!moodToast) return;
        const t = setTimeout(() => setMoodToast(null), 3000);
        return () => clearTimeout(t);
    }, [moodToast]);

    const toggleTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const newStatus = !task.completed;
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: newStatus } : t));
        const { error } = await supabase.from('tasks').update({ completed: newStatus }).eq('id', id);
        if (!error) {
            await supabase.from('activity_log').insert([{ user_id: user.id, action: newStatus ? 'task_completed' : 'task_uncompleted', details: task.text }]);
        }
    };

    const addTask = async () => {
        if (!newTaskText.trim()) return;
        if (!user || !user.id) {
            alert("Errore: Utente non autenticato correttamente. Riprova il login.");
            return;
        }
        
        const time = newTaskTime || new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
        
        const { data, error } = await supabase.from('tasks').insert([{
            user_id: user.id,
            text: newTaskText,
            time: time,
            category: newTaskCategory,
            recurrence: newTaskRecurrence,
            completed: false
        }]).select();

        if (error) {
            console.error("Errore aggiunta task:", error);
            alert(`Errore nell'aggiunta dell'attività: ${error.message || 'Controlla la connessione o il database'}`);
            return;
        }

        if (data && data.length > 0) {
            setTasks([data[0], ...tasks]);
            setNewTaskText("");
            setNewTaskTime("");
            setNewTaskCategory("generic");
            setNewTaskRecurrence("none");
            setShowManage(false);
            await supabase.from('activity_log').insert([{ user_id: user.id, action: 'task_added', details: newTaskText }]);
        }
    };

    const deleteTask = async (id) => {
        if (window.confirm("Vuoi cancellare questa attività?")) {
            setTasks(tasks.filter(t => t.id !== id));
            await supabase.from('tasks').delete().eq('id', id);
        }
    };

    const styles = {
        container: { padding: 'var(--content-padding-y) var(--content-padding-x) 100px', width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--section-gap)' },
        greeting: { fontSize: '1.75rem', fontWeight: 'bold', color: '#1A1A1A' },
        agendaCard: { background: 'var(--color-primary)', borderRadius: 'var(--card-radius-lg)', padding: 'var(--content-padding-y) 20px', color: 'white', marginBottom: 'var(--section-gap)', boxShadow: 'var(--card-shadow-outer)' },
        progressSection: { backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', padding: '12px', marginBottom: '20px' },
        progressBar: { width: '100%', height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' },
        progressFill: { height: '100%', backgroundColor: 'white', transition: 'width 0.5s ease-out' },
        taskItem: { backgroundColor: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', borderRadius: 'var(--card-radius)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.25)', cursor: 'pointer' },
        taskLeft: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 },
        taskIcon: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(74, 48, 79, 0.12)',
            flexShrink: 0,
        },
        taskText: { fontWeight: '600', fontSize: '1rem', wordBreak: 'break-word', minWidth: 0, color: 'white' },
        completedText: { textDecoration: 'line-through', opacity: 0.7 },
        taskTime: { fontSize: '0.875rem', opacity: 0.95, fontWeight: '600', color: 'white' },
        manageBtn: { backgroundColor: 'white', color: 'var(--color-primary-dark)', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9375rem', marginTop: '10px', width: 'fit-content', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
        inputArea: { backgroundColor: 'white', padding: 'var(--content-padding-y)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow-outer)', marginTop: 'var(--section-gap)', marginBottom: 'var(--section-gap)' },
        input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '10px', fontSize: '1rem', boxSizing: 'border-box' },
        select: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #E5E7EB', marginBottom: '10px', fontSize: '0.875rem', backgroundColor: '#F9FAFB' }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={styles.greeting}>Ciao, {user.name || 'lol'}!</div>
            </div>

            {!isHealthcare && (
            <div className="home-content-block">
            <div className="home-block-item home-agenda">
            <div style={styles.agendaCard}>
                <div style={styles.progressSection}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 'bold' }}>
                        <span>Progresso di Oggi</span>
                        <span>{completionStats}%</span>
                    </div>
                    <div style={styles.progressBar}>
                        <div style={{ ...styles.progressFill, width: `${completionStats}%` }} />
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px' }}>
                    <AppIcon name="calendar-lines" size={24} color="white" />
                    <span>Agenda di Oggi</span>
                </div>

                <AnimatePresence mode="popLayout">
                {[...tasks]
                  .filter(t => !t.completed || showManage)
                  .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                  .map((task, i) => (
                    <motion.div 
                        key={task.id} 
                        layout={!reduceMotion}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={styles.taskItem}
                        onClick={() => toggleTask(task.id)}
                    >
                        <div style={styles.taskLeft}>
                            <div style={styles.taskIcon}>
                                <AppIcon name={categories[task.category || 'generic'].icon} size={18} color={categories[task.category || 'generic'].iconColor} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ ...styles.taskText, ...(task.completed ? styles.completedText : {}) }}>{task.text}</div>
                                {task.recurrence !== 'none' && <div style={{ fontSize: '0.6875rem', opacity: 0.8 }}>{task.recurrence === 'daily' ? 'Ogni giorno' : 'Ogni settimana'}</div>}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={styles.taskTime}>{task.time || '--:--'}</div>
                            {showManage && <Trash2 size={18} color="#fff" onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} />}
                            {task.completed && <AppIcon name="badge-check" size={20} color="white" />}
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <div style={styles.manageBtn} onClick={() => setShowManage(!showManage)}>{showManage ? "Salva Modifiche" : "Gestisci Attività"}</div>
                </div>
            </div>

            <AnimatePresence>
            {showManage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={styles.inputArea}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Nuova Attività</h4>
                    <input style={styles.input} value={newTaskText} onChange={(e) => setNewTaskText(e.target.value)} placeholder="Cosa devi fare?" />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="time" style={{ ...styles.input, flex: 1 }} value={newTaskTime} onChange={(e) => setNewTaskTime(e.target.value)} />
                        <select style={{ ...styles.select, flex: 1 }} value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)}>
                            {Object.entries(categories).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                        </select>
                    </div>
                    <select style={styles.select} value={newTaskRecurrence} onChange={(e) => setNewTaskRecurrence(e.target.value)}>
                        <option value="none">Nessuna ricorrenza</option>
                        <option value="daily">Ogni giorno</option>
                        <option value="weekly">Ogni settimana</option>
                    </select>
                    <button style={{ ...styles.manageBtn, backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', width: '100%', marginTop: '10px' }} onClick={addTask}>Aggiungi</button>
                </motion.div>
            )}
            </AnimatePresence>
            </div>

            <div className="home-right-column">
                <div className="home-block-item home-stato-paziente">
                    <MoodTracker userRole={user.role} mood={currentMood} setMood={handleMoodSelect} moodToast={moodToast} reduceMotion={!!reduceMotion} />
                </div>
                <div className="home-block-item home-pillola last-scroll-block">
                    <motion.div style={{ backgroundColor: 'rgba(234, 172, 139, 0.25)', borderRadius: 'var(--card-radius-lg)', padding: 'var(--content-padding-y)', border: '1px solid rgba(234, 172, 139, 0.5)', boxShadow: 'var(--card-shadow-outer)' }}>
                        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '0.875rem', marginBottom: '8px', display: 'block' }}>Pillola di Benessere</span>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <AppIcon name="shoe-prints" size={24} color="var(--color-primary)" />
                            <p style={{ color: 'var(--color-primary)', fontSize: '1rem', fontStyle: 'italic', lineHeight: '1.6', margin: 0 }}>"{dailyQuoteData?.text ?? ''}"</p>
                        </div>
                    </motion.div>
                </div>
            </div>
            </div>
            )}

            {isHealthcare && <ClinicalDashboard />}
        </div>
    );
};

export default ListPage;
