/** Chat fittizie per simulazione Memora — messaggi privati e chat di gruppo */

import { formatFullName, getSearchAvatarUrl } from './avatarUtils';

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pairKey(a, b) {
  return [String(a), String(b)].sort().join(':');
}

function roleScriptKey(roleA, roleB) {
  const roles = [roleA, roleB].sort();
  return `${roles[0]}-${roles[1]}`;
}

function pickPartners(currentUserId, profiles, count) {
  const others = (profiles || []).filter((p) => p.id !== currentUserId);
  if (!others.length) return [];

  const roleOrder = { healthcare: 0, caregiver: 1, family: 2, patient: 3, user: 4, admin: 5 };
  const sorted = [...others].sort((a, b) => {
    const ra = roleOrder[a.role] ?? 9;
    const rb = roleOrder[b.role] ?? 9;
    if (ra !== rb) return ra - rb;
    return hash(a.id) - hash(b.id);
  });

  return sorted.slice(0, count);
}

const SCRIPT_TEMPLATES = {
  'caregiver-healthcare': [
    { fromPartner: false, text: 'Buongiorno, come sta procedendo la settimana con le attività in agenda?' },
    { fromPartner: true, text: 'Buongiorno dottore! Abbastanza bene, ha completato medicine e passeggiata per 4 giorni su 5.' },
    { fromPartner: false, text: 'Ottimo. Continuate così e segnate l\'umore ogni giorno su Memora, ci aiuta nel monitoraggio.' },
    { fromPartner: true, text: 'Certo, lo facciamo regolarmente. L\'umore di ieri era neutro.' },
    { fromPartner: false, text: 'Perfetto. Se dovesse risultare triste per più di 2 giorni, riceverò un alert automatico.' },
    { fromPartner: true, text: 'Grazie, terrò d\'occhio anche io. A presto!' },
  ],
  'caregiver-family': [
    { fromPartner: true, text: 'Ciao! Riesci a passare domenica pomeriggio? Papà chiedeva di te.' },
    { fromPartner: false, text: 'Ciao! Sì, ci sono. Arrivo verso le 15.' },
    { fromPartner: true, text: 'Perfetto. Ho impostato un promemoria su Memora per il pranzo e le medicine.' },
    { fromPartner: false, text: 'Brava, così siamo tutti allineati. Porta anche quelle foto di quando eravamo al mare?' },
    { fromPartner: true, text: 'Sì, gli fanno sempre piacere. Ci vediamo domenica!' },
  ],
  'family-healthcare': [
    { fromPartner: false, text: 'Buonasera, le confermo l\'appuntamento di controllo di giovedì alle 10:30.' },
    { fromPartner: true, text: 'Grazie dottore. Dovremo portare l\'elenco dei farmaci attuale?' },
    { fromPartner: false, text: 'Sì, e se possibile un riepilogo dell\'umore degli ultimi 7 giorni da Memora.' },
    { fromPartner: true, text: 'Va bene, glielo preparo stasera. A giovedì!' },
  ],
  'family-patient': [
    { fromPartner: true, text: 'Ciao mamma, come stai oggi?' },
    { fromPartner: false, text: 'Ciao tesoro, sto bene. Ho fatto la passeggiata in giardino.' },
    { fromPartner: true, text: 'Che bello! Ho visto che hai messo umore felice su Memora, sono contenta.' },
    { fromPartner: false, text: 'Sì, il sole mi ha fatto stare meglio. Ti voglio bene.' },
    { fromPartner: true, text: 'Anch\'io ti voglio bene. Ci sentiamo stasera.' },
  ],
  'caregiver-patient': [
    { fromPartner: false, text: 'Buongiorno! Pronta/o per la colazione? La tavola è già apparecchiata.' },
    { fromPartner: true, text: 'Buongiorno, sì grazie. Che bella giornata oggi.' },
    { fromPartner: false, text: 'Dopo colazione facciamo una passeggiata leggera, come in agenda.' },
    { fromPartner: true, text: 'Va bene, mi piace uscire quando c\'è il sole.' },
  ],
  default: [
    { fromPartner: true, text: 'Ciao! Come va oggi su Memora?' },
    { fromPartner: false, text: 'Ciao! Tutto ok, ho completato le attività del mattino.' },
    { fromPartner: true, text: 'Ottimo, continua così. Se hai bisogno scrivimi.' },
    { fromPartner: false, text: 'Grazie, a presto!' },
  ],
};

const GROUP_MESSAGES = [
  { role: 'healthcare', text: 'Buongiorno a tutti. Ricordate di aggiornare l\'umore giornaliero: è uno strumento utile per tutta la famiglia.' },
  { role: 'caregiver', text: 'Buongiorno! Oggi mamma ha completato tutte le task in agenda, sono molto soddisfatta.' },
  { role: 'family', text: 'Qualcuno ha consigli per attività da fare in casa quando piove?' },
  { role: 'healthcare', text: 'Musica soft, puzzle, foto di famiglia: attività semplici che stimolano i ricordi senza stressare.' },
  { role: 'caregiver', text: 'Noi ascoltiamo spesso la playlist anni \'60 che ha creato su Memora. Funziona benissimo.' },
  { role: 'patient', text: 'Oggi mi sento bene, ho camminato un po\' in giardino.' },
  { role: 'family', text: 'Che bello! Continua così, papà.' },
  { role: 'caregiver', text: 'Promemoria: domani visita di controllo alle 10:30. Ho già inserito il task nell\'agenda.' },
  { role: 'healthcare', text: 'Perfetto. Portate l\'elenco farmaci aggiornato e, se possibile, il grafico umore della settimana.' },
  { role: 'family', text: 'Grazie a tutti per il supporto in bacheca. Questa community aiuta davvero.' },
  { role: 'caregiver', text: 'Concordo. Anche i messaggi privati con il medico sono comodissimi.' },
  { role: 'patient', text: 'Mi piace quando mi scrivete. Non mi sento solo.' },
];

function enrichProfile(profile) {
  return {
    ...profile,
    photo_url: profile.photo_url || profile.photo || getSearchAvatarUrl(profile),
  };
}

function buildPrivateMessages(currentUserId, partner, currentUser) {
  const partnerId = partner.id;
  const key = pairKey(currentUserId, partnerId);
  const h = hash(key);
  const scriptKey = roleScriptKey(currentUser?.role || 'user', partner.role || 'user');
  const script = SCRIPT_TEMPLATES[scriptKey] || SCRIPT_TEMPLATES.default;
  const now = Date.now();

  return script.map((entry, i) => {
    const isFromPartner = entry.fromPartner;
    const minutesAgo = (script.length - i) * 45 + (h % 30);
    const createdAt = new Date(now - minutesAgo * 60000);

    return {
      id: `mock-msg-${key}-${i}`,
      content: entry.text,
      type: 'text',
      sender_id: isFromPartner ? partnerId : currentUserId,
      receiver_id: isFromPartner ? currentUserId : partnerId,
      created_at: createdAt.toISOString(),
      is_read: !isFromPartner || i < script.length - 1,
      isMock: true,
    };
  });
}

export function getMockPrivateMessages(currentUserId, partner, currentUser) {
  if (!partner?.id || !currentUserId) return [];
  return buildPrivateMessages(currentUserId, partner, currentUser);
}

export function getMockConversationSummaries(currentUserId, profiles, currentUser, count = 5) {
  const partners = pickPartners(currentUserId, profiles, count);
  const now = Date.now();

  return partners.map((partner, index) => {
    const messages = buildPrivateMessages(currentUserId, partner, currentUser);
    const last = messages[messages.length - 1];
    const enriched = enrichProfile(partner);
    const h = hash(pairKey(currentUserId, partner.id));
    const unread = h % 3 === 0 && last.sender_id === partner.id;

    return {
      user: enriched,
      lastMessage: last.content,
      time: new Date(last.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      date: new Date(last.created_at),
      unread,
      isMock: true,
      _mockIndex: index,
    };
  });
}

export function withMockConversations(dbConversations, currentUserId, profiles, currentUser) {
  const TARGET = 5;
  const real = dbConversations || [];
  if (real.length >= TARGET) return real;

  const needed = TARGET - real.length;
  const mock = getMockConversationSummaries(currentUserId, profiles, currentUser, needed);
  const existingIds = new Set(real.map((c) => c.user.id));

  return [
    ...real,
    ...mock.filter((c) => !existingIds.has(c.user.id)),
  ].sort((a, b) => b.date - a.date);
}

export function withMockPrivateMessages(dbMessages, currentUserId, partner, currentUser) {
  if (dbMessages?.length > 0) return dbMessages;
  return getMockPrivateMessages(currentUserId, partner, currentUser);
}

export function formatPrivateMessage(msg, currentUserId) {
  return {
    id: msg.id,
    text: msg.content,
    type: msg.type || 'text',
    sender: msg.sender_id === currentUserId ? 'me' : 'other',
    time: new Date(msg.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
    isMock: Boolean(msg.isMock),
  };
}

export function getMockGroupMessages(profiles, count = GROUP_MESSAGES.length) {
  const pool = (profiles || []).filter(Boolean);
  const fallbackAuthors = [
    { id: 'mock-hc-1', name: 'Laura', surname: 'Bianchi', role: 'healthcare' },
    { id: 'mock-cg-1', name: 'Marco', surname: 'Verdi', role: 'caregiver' },
    { id: 'mock-fam-1', name: 'Giulia', surname: 'Rossi', role: 'family' },
    { id: 'mock-pat-1', name: 'Anna', surname: 'Ferrari', role: 'patient' },
  ];
  const authors = pool.length ? pool : fallbackAuthors;
  const now = Date.now();

  return GROUP_MESSAGES.slice(0, count).map((entry, i) => {
    const roleMatches = authors.filter((p) => p.role === entry.role);
    const authorPool = roleMatches.length ? roleMatches : authors;
    const author = authorPool[(hash(String(i)) + i) % authorPool.length];
    const minutesAgo = (count - i) * 35 + (hash(entry.text) % 20);

    return {
      id: `mock-group-${i}`,
      text: entry.text,
      sender_id: author.id,
      sender_name: formatFullName(author),
      created_at: new Date(now - minutesAgo * 60000).toISOString(),
      isMock: true,
    };
  });
}

export function withMockGroupMessages(dbMessages, profiles) {
  const TARGET = 10;
  const real = dbMessages || [];
  if (real.length >= TARGET) return real;

  const needed = TARGET - real.length;
  const mock = getMockGroupMessages(profiles, needed);

  return [...real, ...mock].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
}

export function isMockChatId(id) {
  return typeof id === 'string' && id.startsWith('mock-');
}

export function appendLocalPrivateMessage(messages, currentUserId, receiverId, text) {
  const tempId = `mock-msg-local-${Date.now()}`;
  const now = new Date();
  return [
    ...messages,
    {
      id: tempId,
      text,
      type: 'text',
      sender: 'me',
      time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      isMock: true,
    },
  ];
}

export function appendLocalGroupMessage(messages, currentUserId, user, text) {
  const now = new Date();
  return [
    ...messages,
    {
      id: `mock-group-local-${Date.now()}`,
      text,
      sender: 'me',
      senderName: formatFullName(user) || user.name || 'Tu',
      time: now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      isMock: true,
    },
  ];
}
