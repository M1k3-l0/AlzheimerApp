/** Normalizza e valida un numero per link tel: */
export function sanitizePhoneNumber(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.length < 3 || cleaned.length > 20) return null;
  return cleaned;
}

export function dialPhoneNumber(raw) {
  const number = sanitizePhoneNumber(raw);
  if (!number) return false;
  window.location.href = `tel:${number}`;
  return true;
}
