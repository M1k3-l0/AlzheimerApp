/** Dati fittizi per simulazione dashboard medico — deterministici per paziente */

const MOODS = ['happy', 'neutral', 'sad'];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getMockMoodHistory(patientId) {
  const h = hash(String(patientId));
  const showSadAlert = h % 3 === 0;
  const history = [];
  const now = Date.now();

  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now - i * 86400000);
    d.setHours(9, 30, 0, 0);

    let mood;
    if (showSadAlert && i <= 2) {
      mood = 'sad';
    } else {
      mood = MOODS[(h + i * 5) % MOODS.length];
    }

    history.push({ mood, timestamp: d.toISOString() });
  }

  return history;
}

const TASK_TEMPLATES = [
  { text: 'Prendere medicine mattina', time: '08:00', category: 'meds' },
  { text: 'Colazione', time: '09:00', category: 'food' },
  { text: 'Passeggiata nel parco', time: '10:30', category: 'walk' },
  { text: 'Pranzo leggero', time: '13:00', category: 'food' },
  { text: 'Riposo pomeridiano', time: '15:00', category: 'rest' },
  { text: 'Medicine sera', time: '20:00', category: 'meds' },
  { text: 'Chiudere la porta a chiave', time: '21:30', category: 'generic' },
];

export function getMockTasks(patientId) {
  const h = hash(String(patientId));
  const count = 5 + (h % 3);

  return TASK_TEMPLATES.slice(0, count).map((task, i) => ({
    id: `mock-task-${patientId}-${i}`,
    user_id: patientId,
    ...task,
    completed: ((h >> i) & 1) === 1 || i < 2,
    recurrence: i === 0 || i === 5 ? 'daily' : 'none',
  }));
}

export function getMockActivityLogs(patientId) {
  const h = hash(String(patientId));
  const now = Date.now();
  const mood = MOODS[h % MOODS.length];

  const items = [
    { action: 'mood_updated', details: `Umore: ${mood}`, hoursAgo: 2 },
    { action: 'task_completed', details: 'Prendere medicine mattina', hoursAgo: 5 },
    { action: 'task_completed', details: 'Passeggiata nel parco', hoursAgo: 28 },
    { action: 'mood_updated', details: 'Umore: neutral', hoursAgo: 30 },
    { action: 'task_added', details: 'Visita controllo periodico', hoursAgo: 52 },
    { action: 'task_completed', details: 'Colazione', hoursAgo: 54 },
    { action: 'mood_updated', details: 'Umore: happy', hoursAgo: 80 },
    { action: 'task_uncompleted', details: 'Riposo pomeridiano', hoursAgo: 96 },
  ];

  return items.map((item, i) => {
    const d = new Date(now - item.hoursAgo * 3600000);
    return {
      id: `mock-log-${patientId}-${i}`,
      user_id: patientId,
      action: item.action,
      details: item.details,
      created_at: d.toISOString(),
    };
  });
}

export function getMockClinicalNotes(patientId, patientLabel = 'Il paziente') {
  const h = hash(String(patientId));
  const notes = [
    {
      id: `mock-note-${patientId}-1`,
      patient_id: patientId,
      content: `${patientLabel} collabora alle attività quotidiane. Umore generalmente stabile, continua il monitoraggio.`,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      author_id: 'mock',
    },
    {
      id: `mock-note-${patientId}-2`,
      patient_id: patientId,
      content: 'Familiare informato sull\'aderenza alla terapia farmacologica. Prossimo controllo confermato.',
      created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
      author_id: 'mock',
    },
  ];

  if (h % 3 === 0) {
    notes.unshift({
      id: `mock-note-${patientId}-alert`,
      patient_id: patientId,
      content: 'Attenzione: umore basso negli ultimi giorni. Valutare contatto telefonico e verifica assunzione farmaci.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      author_id: 'mock',
    });
  }

  return notes;
}

/** Usa mock se il DB non ha abbastanza dati (simulazione demo) */
export function withMockMoodHistory(patientId, dbHistory) {
  return dbHistory?.length >= 3 ? dbHistory : getMockMoodHistory(patientId);
}

export function withMockTasks(patientId, dbTasks) {
  return dbTasks?.length > 0 ? dbTasks : getMockTasks(patientId);
}

export function withMockLogs(patientId, dbLogs) {
  return dbLogs?.length > 0 ? dbLogs : getMockActivityLogs(patientId);
}

export function withMockNotes(patientId, dbNotes, patientLabel) {
  return dbNotes?.length > 0 ? dbNotes : getMockClinicalNotes(patientId, patientLabel);
}
