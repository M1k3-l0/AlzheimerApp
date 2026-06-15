import { supabase } from '../supabaseClient';

/** Logout completo: sessione Supabase + dati locali, poi redirect al login */
export async function logout() {
  localStorage.removeItem('alzheimer_user');
  localStorage.removeItem('simulated_role');

  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error('Errore logout:', e);
  }

  window.location.hash = '#/login';
  window.location.reload();
}
