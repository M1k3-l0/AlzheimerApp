/** Post fittizi per simulazione bacheca Memora — temi Alzheimer, caregiver, benessere */

import { formatFullName, getSearchAvatarUrl } from './avatarUtils';

const MOODS = ['happy', 'neutral', 'sad'];

const FEED_IMAGES = {
  garden: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
  family: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80',
  hospital: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
  walk: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  meal: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
  music: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
  puzzle: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80',
  hands: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=800&q=80',
  sunrise: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  tea: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
};

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickMood(profileId) {
  return MOODS[hash(String(profileId)) % MOODS.length];
}

function profilesByRole(profiles) {
  const byRole = { healthcare: [], caregiver: [], patient: [], user: [] };
  profiles.forEach((p) => {
    const role = p.role || 'user';
    if (byRole[role]) byRole[role].push(p);
    else byRole.user.push(p);
  });
  return byRole;
}

function pickAuthor(profiles, role, index) {
  const byRole = profilesByRole(profiles);
  const pool = byRole[role]?.length ? byRole[role] : profiles;
  if (!pool?.length) return null;
  return pool[index % pool.length];
}

const POST_TEMPLATES = [
  {
    role: 'healthcare',
    text: 'Ricordate di segnare l\'umore giornaliero su Memora: ci aiuta a individuare precocemente periodi di disagio. #Memora #Benessere',
    hoursAgo: 2,
    likes: 18,
  },
  {
    role: 'caregiver',
    text: 'Oggi papà ha completato tutte le attività in agenda, compresa la passeggiata del mattino. Piccoli passi, grande soddisfazione. #Routine #Caregiver',
    hoursAgo: 4,
    likes: 32,
    image: FEED_IMAGES.walk,
  },
  {
    role: 'patient',
    text: 'Stamattina ho ascoltato la mia musica preferita e mi sono sentito/a più sereno/a. Consiglio a tutti di provare! #Benessere',
    hoursAgo: 6,
    likes: 27,
    image: FEED_IMAGES.music,
  },
  {
    role: 'caregiver',
    text: 'Grazie a Memora riesco a sapere come sta mamma anche quando non posso passare di persona. La bacheca ci tiene tutti più uniti. #Memora',
    hoursAgo: 8,
    likes: 41,
  },
  {
    role: 'healthcare',
    text: 'Promemoria: l\'aderenza alla terapia farmacologica migliora se associata a routine fisse (colazione, pranzo, cena). Usate i task giornalieri dell\'app. #Salute',
    hoursAgo: 11,
    likes: 22,
  },
  {
    role: 'caregiver',
    text: 'Consiglio pratico: preparate la lista attività la sera prima. Riduce lo stress al mattino e aiuta il paziente a orientarsi. #Caregiver #Organizzazione',
    hoursAgo: 14,
    likes: 35,
    image: FEED_IMAGES.hospital,
  },
  {
    role: 'patient',
    text: 'Ieri abbiamo guardato insieme vecchie foto di famiglia. È stato un momento bellissimo. Condividete i vostri ricordi qui. #Ricordi',
    hoursAgo: 17,
    likes: 56,
    image: FEED_IMAGES.family,
  },
  {
    role: 'patient',
    text: 'Oggi ho fatto un giro in giardino con mio figlio. Il sole fa sempre bene all\'umore. #Passeggiata',
    hoursAgo: 20,
    likes: 19,
    image: FEED_IMAGES.garden,
  },
  {
    role: 'healthcare',
    text: 'Il monitoraggio dell\'umore per più giorni consecutivi "triste" attiva un alert per il team sanitario. È prevenzione, non un giudizio. #Memora #Alzheimer',
    hoursAgo: 23,
    likes: 29,
  },
  {
    role: 'caregiver',
    text: 'A volte è difficile, ma ogni giorno conta. Ringrazio la community Memora per il sostegno condiviso. #Supporto',
    hoursAgo: 26,
    likes: 48,
  },
  {
    role: 'caregiver',
    text: 'Abbiamo impostato promemoria per medicine e pasti: meno dimenticanze, più tranquillità per tutti. #Routine',
    hoursAgo: 30,
    likes: 15,
    image: FEED_IMAGES.meal,
  },
  {
    role: 'patient',
    text: 'Mi piace quando la famiglia commenta i miei post. Mi fa sentire meno solo/a. #Memora',
    hoursAgo: 34,
    likes: 38,
  },
  {
    role: 'healthcare',
    text: 'Prossima settimana: incontro informativo online su strategie di comunicazione con persone affette da demenza. #Formazione',
    hoursAgo: 38,
    likes: 21,
    image: FEED_IMAGES.hands,
  },
  {
    role: 'caregiver',
    text: 'La respirazione lenta (4 secondi in, 4 fuori) aiuta anche noi caregiver nei momenti di stanchezza. Provateci. #Autocura',
    hoursAgo: 42,
    likes: 44,
  },
  {
    role: 'patient',
    text: 'Oggi papà ha riconosciuto tutti i nipoti al pranzo. Una piccola grande vittoria! #GiornataPositiva',
    hoursAgo: 46,
    likes: 62,
    image: FEED_IMAGES.tea,
  },
  {
    role: 'caregiver',
    text: 'Attività pomeridiana: puzzle e musica soft. Lo vedo più tranquillo e concentrato. #Attività',
    hoursAgo: 50,
    likes: 33,
    image: FEED_IMAGES.puzzle,
  },
  {
    role: 'healthcare',
    text: 'Consiglio: tenete un diario breve delle reazioni ai farmaci su Memora. Aiuta molto nelle visite di controllo. #Salute',
    hoursAgo: 55,
    likes: 26,
  },
  {
    role: 'patient',
    text: 'Alba in terrazza con un tè caldo. Inizio la giornata con calma e gratitudine. #Benessere',
    hoursAgo: 60,
    likes: 51,
    image: FEED_IMAGES.sunrise,
  },
  {
    role: 'caregiver',
    text: 'Chi di voi usa la chat di gruppo Memora? Per noi è utilissima per coordinarci tra fratelli e sorelle. #Famiglia',
    hoursAgo: 65,
    likes: 37,
  },
  {
    role: 'patient',
    text: 'Ho segnato umore "felice" oggi. La passeggiata e la compagnia fanno la differenza. #Memora',
    hoursAgo: 70,
    likes: 29,
    image: FEED_IMAGES.walk,
  },
  {
    role: 'healthcare',
    text: 'Buona domenica a tutti. Ricordatevi di idratarsi e fare pause: vale per pazienti e caregiver. #Autocura',
    hoursAgo: 75,
    likes: 40,
    image: FEED_IMAGES.garden,
  },
  {
    role: 'caregiver',
    text: 'Condivido la nostra colazione di stamattina: routine fissa, stesso posto, stessa musica. Funziona. #Routine',
    hoursAgo: 80,
    likes: 45,
    image: FEED_IMAGES.meal,
  },
];

const COMMENT_TEMPLATES = [
  'Grazie per la condivisione, molto utile!',
  'Anche noi stiamo provando la stessa routine. Funziona.',
  'Ti abbraccio virtualmente, non sei solo/a.',
  'Bellissimo messaggio, condivido pienamente.',
  'Ottimo consiglio, lo metto in pratica da domani.',
  'Grazie dottore/dottoressa, chiarissimo.',
  'Che bello leggere cose positive oggi.',
];

function buildPost(template, author, index) {
  const authorId = author.id || `mock-author-${index}`;
  const h = hash(`${authorId}-${index}`);
  const likes = template.likes + (h % 12);
  const createdAt = new Date(Date.now() - template.hoursAgo * 3600000).toISOString();

  return {
    id: `mock-post-${authorId}-${index}`,
    author: formatFullName(author),
    author_id: authorId,
    author_photo: getSearchAvatarUrl(author),
    text: template.text,
    image: template.image || null,
    likes,
    created_at: createdAt,
    comment_count: 1 + (h % 3),
    isMock: true,
  };
}

export function getMockFeedPosts(profiles = [], count = POST_TEMPLATES.length) {
  const fallbackAuthors = [
    { id: 'mock-hc-1', name: 'Laura', surname: 'Bianchi', role: 'healthcare' },
    { id: 'mock-cg-1', name: 'Marco', surname: 'Verdi', role: 'caregiver' },
    { id: 'mock-cg-2', name: 'Giulia', surname: 'Rossi', role: 'caregiver' },
    { id: 'mock-pat-1', name: 'Anna', surname: 'Ferrari', role: 'patient' },
    { id: 'mock-pat-2', name: 'Carlo', surname: 'Neri', role: 'patient' },
  ];

  const pool = profiles.length ? profiles : fallbackAuthors;
  const templates = POST_TEMPLATES.slice(0, Math.min(count, POST_TEMPLATES.length));

  return templates.map((template, i) => {
    const author = pickAuthor(pool, template.role, i) || pool[i % pool.length];
    return buildPost(template, author, i);
  });
}

export function getMockCommentsForPosts(mockPosts, profiles = []) {
  const commentsByPost = {};
  const pool = profiles.length ? profiles : [];

  mockPosts.forEach((post) => {
    if (!post.isMock) return;
    const count = post.comment_count || 1;
    commentsByPost[post.id] = [];

    for (let i = 0; i < count; i += 1) {
      const replier = pool[(hash(post.id) + i) % pool.length] || {
        id: `mock-replier-${i}`,
        name: 'Utente',
        surname: 'Memora',
      };
      const h = hash(`${post.id}-comment-${i}`);
      commentsByPost[post.id].push({
        id: `mock-comment-${post.id}-${i}`,
        post_id: post.id,
        author_id: replier.id,
        author_name: formatFullName(replier),
        author_photo: getSearchAvatarUrl(replier),
        text: COMMENT_TEMPLATES[h % COMMENT_TEMPLATES.length],
        created_at: new Date(new Date(post.created_at).getTime() + (i + 1) * 3600000).toISOString(),
        isMock: true,
      });
    }
  });

  return commentsByPost;
}

export function buildMoodsFromProfiles(profiles) {
  const moodsMap = {};
  profiles.forEach((p) => {
    moodsMap[p.id] = {
      mood: p.current_mood || pickMood(p.id),
      role: p.role || 'user',
    };
  });
  return moodsMap;
}

/** Integra post mock se la bacheca ha pochi contenuti (simulazione demo) */
export function withMockFeedPosts(dbPosts, profiles) {
  const TARGET = 20;
  const real = dbPosts || [];
  if (real.length >= TARGET) return real;

  const needed = TARGET - real.length;
  const mock = getMockFeedPosts(profiles, needed);
  const realIds = new Set(real.map((p) => p.id));

  const merged = [
    ...real,
    ...mock.filter((m) => !realIds.has(m.id)),
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return merged;
}

export function isMockFeedId(id) {
  return typeof id === 'string' && id.startsWith('mock-');
}
