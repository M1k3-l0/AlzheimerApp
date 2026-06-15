/** Nomi maschili italiani/internazionali che terminano in -a */
const MALE_NAMES_ENDING_A = new Set([
  'andrea', 'luca', 'nicola', 'joshua', 'elia', 'mattia', 'battista', 'bonaventura',
  'crescente', 'sasha', 'mustafa', 'jaffa',
]);

/** Nomi femminili che non terminano in -a */
const FEMALE_NAMES = new Set([
  'alice', 'beatrice', 'carmen', 'christine', 'claire', 'ines', 'irene', 'joyce',
  'liliane', 'maddalena', 'marie', 'nicole', 'ruth', 'susanne', 'yvonne',
]);

function normalizeFirstName(name) {
  return (name || '').trim().split(/\s+/)[0].toLowerCase();
}

/** Stima M/F dal nome per avatar foto coerente */
export function inferGenderFromFirstName(name) {
  const first = normalizeFirstName(name);
  if (!first) return 'male';

  if (FEMALE_NAMES.has(first)) return 'female';
  if (MALE_NAMES_ENDING_A.has(first)) return 'male';
  if (first.endsWith('a')) return 'female';
  return 'male';
}

function buildAvatarSeed(profile) {
  return profile?.id || profile?.email || `${profile?.name || ''}-${profile?.surname || ''}` || 'memora-user';
}

function hashToIndex(str, max = 99) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % (max + 1);
}

/** Avatar foto (RandomUser) per la ricerca utenti — genere da nome, stesso volto per utente */
export function getSearchAvatarUrl(profile) {
  if (!profile) return null;
  const gender = inferGenderFromFirstName(profile.name);
  const folder = gender === 'female' ? 'women' : 'men';
  const index = hashToIndex(buildAvatarSeed(profile), 99);
  return `https://randomuser.me/api/portraits/med/${folder}/${index}.jpg`;
}

export function getAvatarUrl(profile) {
  if (!profile) return null;
  if (profile.photo_url) return profile.photo_url;
  if (profile.photo) return profile.photo;
  return getSearchAvatarUrl(profile);
}

export function getProfileInitials(profile) {
  const first = profile?.name?.[0] || '';
  const last = profile?.surname?.[0] || '';
  const initials = `${first}${last}`.toUpperCase();
  return initials || '?';
}

/** Es. "ELISA" → "Elisa", "DE ROSSI" → "De Rossi" */
export function formatPersonName(name) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

export function formatFullName(profile) {
  return [formatPersonName(profile?.name), formatPersonName(profile?.surname)].filter(Boolean).join(' ');
}

/** Etichette ruolo uniformi in tutta l'app (es. Social, Cerca Persone) */
export function getRoleLabel(role) {
  switch (role) {
    case 'patient': return 'Paziente';
    case 'caregiver': return 'Caregiver';
    case 'healthcare': return 'Medico';
    default: return 'Utente';
  }
}

export function getUserCardStyle(role) {
  switch (role) {
    case 'healthcare':
      return {
        backgroundColor: '#DDD0E8',
        borderLeft: '4px solid #4A304F',
      };
    case 'caregiver':
      return {
        backgroundColor: 'var(--color-header-bg)',
        borderLeft: '4px solid var(--color-primary)',
      };
    default:
      return {
        backgroundColor: '#FFFFFF',
        borderLeft: '4px solid transparent',
      };
  }
}

export function getRoleBadgeStyle() {
  return {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-on-primary)',
  };
}
