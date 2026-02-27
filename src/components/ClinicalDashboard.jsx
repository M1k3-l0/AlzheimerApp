import React, { useMemo, useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getMoodHistory, getMoodColor } from '../utils/moodHistory';
import { AlertTriangle, Activity, FileText, TrendingUp, XCircle } from 'lucide-react';
import AppIcon from './AppIcon';

const MOOD_LABELS = { happy: 'Felice', neutral: 'Neutro', sad: 'Triste' };
const NOTES_STORAGE_KEY = 'alzheimer_clinical_notes';
const MAX_NOTES = 100;

function aggregateByDay(history) {
  const byDay = {};
  history.forEach(({ mood, timestamp }) => {
    const d = new Date(timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!byDay[key]) byDay[key] = { happy: 0, neutral: 0, sad: 0 };
    byDay[key][mood]++;
  });
  return byDay;
}

function prevalentMood(counts) {
  if (!counts) return null;
  const { happy, neutral, sad } = counts;
  if (happy >= neutral && happy >= sad) return 'happy';
  if (sad >= neutral && sad >= happy) return 'sad';
  return 'neutral';
}

/** Ritorna true se ci sono 2+ giorni consecutivi con umore prevalente "sad" */
function hasConsecutiveSadDays(history, maxDays = 14) {
  const byDay = aggregateByDay(history);
  const sortedKeys = Object.keys(byDay).sort();
  let consecutive = 0;
  for (const key of sortedKeys.slice(-maxDays)) {
    const mood = prevalentMood(byDay[key]);
    if (mood === 'sad') {
      consecutive++;
      if (consecutive >= 2) return true;
    } else {
      consecutive = 0;
    }
  }
  return false;
}

function getClinicalNotes() {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function timeToMinutes(timeStr) {
  if (!timeStr || timeStr === '--:--' || timeStr === '--') return Infinity;
  const parts = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!parts) return Infinity;
  return parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
}

function saveClinicalNote(content, authorRole = 'healthcare') {
  const list = getClinicalNotes();
  const note = {
    id: Date.now(),
    content: content.trim(),
    authorRole,
    createdAt: new Date().toISOString(),
  };
  list.unshift(note);
  const trimmed = list.slice(0, MAX_NOTES);
  localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(trimmed));
  return trimmed;
}

export default function ClinicalDashboard() {
  const history = useMemo(() => getMoodHistory(), []);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState(getClinicalNotes());
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('alzheimer_tasks');
    setTasks(saved ? JSON.parse(saved) : []);
  }, []);

  const alertSadConsecutive = useMemo(() => hasConsecutiveSadDays(history), [history]);

  const lineChartData = useMemo(() => {
    const byDay = aggregateByDay(history);
    const points = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const mood = prevalentMood(byDay[key]);
      const score = mood === 'happy' ? 2 : mood === 'neutral' ? 1 : 0;
      points.push({
        date: d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }),
        short: d.toLocaleDateString('it-IT', { weekday: 'narrow' }),
        benessere: score,
        mood,
      });
    }
    return points;
  }, [history]);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    saveClinicalNote(newNote);
    setNotes(getClinicalNotes());
    setNewNote('');
  };

  const styles = {
    container: {
      padding: '0 0 var(--content-padding-y)',
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
    },
    section: {
      marginBottom: 'var(--section-gap)',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 'var(--card-radius-lg)',
      padding: 'var(--content-padding-y)',
      boxShadow: 'var(--card-shadow)',
      marginBottom: '16px',
    },
    cardTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '16px',
      color: '#1A1A1A',
    },
    alertBox: {
      backgroundColor: '#FEF2F2',
      border: '1px solid #FECACA',
      borderRadius: 'var(--card-radius)',
      padding: '16px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '14px',
    },
    th: {
      textAlign: 'left',
      padding: '10px 8px',
      borderBottom: '2px solid #E5E7EB',
      color: '#6B7280',
      fontWeight: '600',
    },
    td: {
      padding: '10px 8px',
      borderBottom: '1px solid #F3F4F6',
    },
    noteItem: {
      padding: '12px',
      backgroundColor: '#F9FAFB',
      borderRadius: 'var(--card-radius)',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#374151',
    },
    noteMeta: {
      fontSize: '12px',
      color: '#9CA3AF',
      marginTop: '6px',
    },
    textarea: {
      width: '100%',
      minHeight: '80px',
      padding: '12px',
      borderRadius: 'var(--card-radius)',
      border: '1px solid #E5E7EB',
      fontSize: '15px',
      boxSizing: 'border-box',
      resize: 'vertical',
    },
    btn: {
      marginTop: '10px',
      padding: '12px 20px',
      borderRadius: 'var(--card-radius)',
      border: 'none',
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      fontWeight: '600',
      cursor: 'pointer',
    },
    empty: {
      textAlign: 'center',
      color: '#9CA3AF',
      padding: '20px',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Alert: 2+ giorni consecutivi tristi */}
      <div style={styles.section}>
        {alertSadConsecutive && (
          <div style={styles.alertBox}>
            <AlertTriangle size={24} color="#DC2626" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ color: '#991B1B', display: 'block', marginBottom: '4px' }}>
                Attenzione
              </strong>
              <span style={{ color: '#B91C1C', fontSize: '14px' }}>
                Lo stato del paziente è risultato &quot;Triste&quot; per più di 2 giorni consecutivi. Valutare un contatto o un controllo.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mood Tracker - Trend */}
      <div style={styles.section}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <TrendingUp size={22} color="var(--color-primary)" />
            <span>Mood Tracker (ultimi 7 giorni)</span>
          </div>
          {lineChartData.some((p) => p.mood != null) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineChartData} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="short" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 2]} ticks={[0, 1, 2]} tick={{ fontSize: 12 }} tickFormatter={(v) => (v === 2 ? 'Felice' : v === 1 ? 'Neutro' : 'Triste')} />
                <Tooltip
                  formatter={(value) => [value === 2 ? 'Felice' : value === 1 ? 'Neutro' : 'Triste', 'Umore']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date ?? label}
                />
                <Line type="monotone" dataKey="benessere" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4 }} name="Umore" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.empty}>Nessun dato umore negli ultimi 7 giorni.</div>
          )}
        </div>
      </div>

      {/* Registro Attività */}
      <div style={styles.section}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Activity size={22} color="var(--color-primary)" />
            <span>Registro Attività</span>
          </div>
          {tasks.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Attività / Farmaco</th>
                  <th style={styles.th}>Orario</th>
                  <th style={styles.th}>Stato</th>
                </tr>
              </thead>
              <tbody>
                {[...tasks]
                  .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                  .map((t) => (
                  <tr key={t.id}>
                    <td style={styles.td}>{t.text}</td>
                    <td style={styles.td}>{t.time || '--'}</td>
                    <td style={styles.td}>
                      {t.completed ? (
                        <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AppIcon name="badge-check" size={16} color="primary" /> Completato
                        </span>
                      ) : (
                        <span style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <XCircle size={16} /> Saltato
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={styles.empty}>Nessuna attività in agenda.</div>
          )}
        </div>
      </div>

      {/* Note Cliniche */}
      <div style={styles.section}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <FileText size={22} color="var(--color-primary)" />
            <span>Note Cliniche</span>
          </div>
          <div style={{ marginBottom: '16px' }}>
            {notes.length > 0 ? (
              notes.map((n) => (
                <div key={n.id} style={styles.noteItem}>
                  {n.content}
                  <div style={styles.noteMeta}>
                    {new Date(n.createdAt).toLocaleString('it-IT')}
                    {n.authorRole && ` · ${n.authorRole === 'healthcare' ? 'Operatore' : n.authorRole}`}
                  </div>
                </div>
              ))
            ) : (
              <div style={styles.empty}>Nessuna nota clinica.</div>
            )}
          </div>
          <textarea
            style={styles.textarea}
            placeholder="Scrivi una nuova nota clinica..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button type="button" style={styles.btn} onClick={handleAddNote}>
            Aggiungi nota
          </button>
        </div>
      </div>
    </div>
  );
}
