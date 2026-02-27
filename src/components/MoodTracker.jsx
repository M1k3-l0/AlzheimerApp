import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppIcon from './AppIcon';

/** Colori faccine in ordine: verde, giallo, rosso (alto contrasto) */
const MOOD_ACTIVE_COLORS = {
  happy: '#16a34a',
  neutral: '#ca8a04',
  sad: '#dc2626',
};
/** Colore faccine non selezionate: grigio visibile su sfondo chiaro */
const MOOD_INACTIVE_COLOR = '#64748b';

/** Label per la sezione resoconto */
const moodPalette = {
  happy: 'Felice',
  neutral: 'Neutro',
  sad: 'Triste',
};

/** Ordine: grin (felice), face-expressionless (neutro), sad (triste) */
const moods = [
  { id: 'happy', iconName: 'grin', label: 'Felice' },
  { id: 'neutral', iconName: 'face-expressionless', label: 'Neutro' },
  { id: 'sad', iconName: 'sad', label: 'Triste' },
];

/**
 * Stato del Paziente: stato sollevato al padre (ListPage).
 * Props: mood (valore dal padre), setMood (funzione per aggiornare il padre).
 */
const MoodTracker = ({ userRole, mood, setMood, moodToast, reduceMotion = false }) => {
  const isNurse = userRole === 'healthcare';
  const isPatient = userRole === 'patient';

  const [selectedMood, setSelectedMood] = useState(null);

  useEffect(() => {
    setSelectedMood(mood ?? null);
  }, [mood]);

  const handleSaveMood = (id) => {
    if (isNurse) return;
    setSelectedMood(id);
    setMood?.(id);
  };

  useEffect(() => {
    console.log('Dato inviato alla sezione resoconto:', mood);
  }, [mood]);

  const styles = {
    card: {
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--card-radius-lg)',
      padding: 'var(--content-padding-y)',
      boxShadow: 'var(--card-shadow-outer)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      width: '100%',
      maxWidth: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
    },
    title: { fontWeight: 'bold', fontSize: '18px', color: 'var(--color-primary-dark)' },
    lastMood: {
      fontSize: '15px',
      fontWeight: '600',
      color: 'var(--color-primary)',
      marginTop: '12px',
      marginBottom: '4px',
    },
    toast: { fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600', marginTop: '8px', display: 'block' },
    hint: { fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '8px' },
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>
        {isPatient ? 'Come ti senti?' : 'Stato del Paziente'}
      </h3>

      <div className="mood-tracker-buttons" role="group" aria-label="Seleziona umore">
        {moods.map((m) => {
          const isSelected = (selectedMood ?? mood) === m.id;
          const activeColor = MOOD_ACTIVE_COLORS[m.id];
          return (
            <button
              key={m.id}
              type="button"
              className={`mood-btn ${isSelected ? 'active' : ''}`}
              data-mood={m.id}
              disabled={isNurse}
              onClick={() => handleSaveMood(m.id)}
              aria-label={m.label}
              aria-pressed={isSelected}
              style={{
                position: 'relative',
                zIndex: 100,
                pointerEvents: 'auto',
                opacity: isNurse && !isSelected && mood ? 0.5 : 1,
              }}
            >
              <AppIcon
                name={m.iconName}
                size={48}
                color={isSelected ? activeColor : MOOD_INACTIVE_COLOR}
                aria-hidden
              />
            </button>
          );
        })}
      </div>

      {/* Solo ultimo umore ricevuto */}
      <div style={styles.lastMood}>
        Ultimo umore ricevuto: {mood ? moodPalette[mood] : '—'}
      </div>

      {moodToast && (
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.toast}
        >
          {moodToast}
        </motion.span>
      )}
      <span style={styles.hint}>
        {isPatient ? "Tocca l'emozione che provi ora" : "L'ultimo umore registrato dal paziente"}
      </span>
    </div>
  );
};

export default MoodTracker;
