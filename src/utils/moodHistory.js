/**
 * Cronologia umore: persistenza in localStorage (patientMoods).
 * Formato storage: [{ date: ISOString, mood: 'happy'|'neutral'|'sad' }]
 * Formato restituito: [{ mood, timestamp: number }] per grafici/resoconti.
 */

const PATIENT_MOODS_KEY = 'patientMoods';
const LEGACY_KEY = 'alzheimer_mood_history';
const MAX_ENTRIES = 400;

export function getMoodHistory() {
  try {
    const raw = localStorage.getItem(PATIENT_MOODS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return [];
      return list
        .map((item) => ({
          mood: item.mood,
          timestamp: new Date(item.date).getTime(),
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const list = JSON.parse(legacy);
      return Array.isArray(list) ? list : [];
    }
    return [];
  } catch (e) {
    return [];
  }
}

/** Alias per uso in app: stesso storage della cronologia umore */
export const MOOD_HISTORY_KEY = PATIENT_MOODS_KEY;

export function addMoodEntry(mood) {
  const raw = localStorage.getItem(PATIENT_MOODS_KEY);
  const list = raw ? JSON.parse(raw) : [];
  const entry = { date: new Date().toISOString(), mood };
  list.unshift(entry);
  const trimmed = list.slice(0, MAX_ENTRIES);
  localStorage.setItem(PATIENT_MOODS_KEY, JSON.stringify(trimmed));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('patientMoodSaved'));
  }
  return getMoodHistory();
}

/** Ultimo umore salvato (per Resoconto / sync immediata) */
export function getLatestMood() {
  const history = getMoodHistory();
  return history.length ? history[0].mood : null;
}

/** Colori umore – felice = salvia/teal (armonizza con il viola Memora) */
export const MOOD_COLORS = {
  happy: '#52A88E',
  neutral: '#C9920A',
  sad: '#DC4545',
};

/** Colori emoticon: sx=verde (felice), centro=giallo (neutro), dx=rosso (triste) */
export function getMoodColor(mood) {
  return MOOD_COLORS[mood] ?? '#9CA3AF';
}
