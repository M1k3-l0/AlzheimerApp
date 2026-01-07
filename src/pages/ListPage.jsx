import React, { useState } from 'react';
import ListItem from '../components/ListItem';

const initialTasks = [
    { id: 1, text: 'Prendere le medicine', completed: false },
    { id: 2, text: 'Bere un bicchiere d\'acqua', completed: true },
    { id: 3, text: 'Chiamare Maria', completed: false },
    { id: 4, text: 'Fare una passeggiata', completed: false },
    { id: 5, text: 'Pranzo alle 13:00', completed: false },
];

const ListPage = () => {
    // Carica i task salvati o usa quelli di default
    const [tasks, setTasks] = useState(() => {
        const saved = localStorage.getItem('alzheimer_tasks');
        return saved ? JSON.parse(saved) : initialTasks;
    });
    const [newTaskText, setNewTaskText] = useState("");

    // Salva ogni volta che i task cambiano
    React.useEffect(() => {
        localStorage.setItem('alzheimer_tasks', JSON.stringify(tasks));
    }, [tasks]);

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
            completed: false
        };
        setTasks([newTask, ...tasks]);
        setNewTaskText("");
    };

    const deleteTask = (id) => {
        if (window.confirm("Vuoi cancellare questa attività?")) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const styles = {
        inputContainer: {
            padding: '16px',
            display: 'flex',
            gap: '10px',
            backgroundColor: 'white',
            margin: '0 16px 16px 16px',
            borderRadius: '16px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        },
        input: {
            flex: 1,
            padding: '12px',
            fontSize: '18px',
            border: '2px solid #ddd',
            borderRadius: '12px',
            outline: 'none'
        },
        addButton: {
            padding: '0 20px',
            backgroundColor: 'var(--color-primary)', 
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
        },
        deleteBtn: {
            marginLeft: '10px',
            padding: '8px',
            color: '#FF3B30', // Red
            background: 'none',
            border: 'none',
            cursor: 'pointer'
        }
    };

    return (
        <div style={{ paddingBottom: '20px' }}>
            <div style={{ padding: '16px', fontWeight: 'bold', color: 'var(--color-text-secondary)', fontSize: '20px' }}>
                Oggi, {new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>

            {/* Area di inserimento */}
            <div style={styles.inputContainer}>
                <input
                    style={styles.input}
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Vuoi aggiungere un'attività?"
                />
                <button style={styles.addButton} onClick={addTask}>
                    Aggiungi
                </button>
            </div>

            {tasks.map(task => (
                <div key={task.id} style={{ display: 'flex', alignItems: 'center', paddingRight: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <ListItem
                            text={task.text}
                            isCompleted={task.completed}
                            onToggle={() => toggleTask(task.id)}
                        />
                    </div>
                    {/* Tasto Cancella visibile solo se completato o sempre? Mettiamolo sempre per ora */}
                    <button
                        style={styles.deleteBtn}
                        onClick={() => deleteTask(task.id)}
                        aria-label="Cancella"
                    >
                        🗑️
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ListPage;
