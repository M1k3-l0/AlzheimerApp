import { supabase } from './supabaseClient';

async function debugSchema() {
    console.log("--- DEBUG SCHEMA PROFILES ---");
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
        console.error("Errore lettura profiles:", error);
    } else {
        console.log("Colonne trovate:", Object.keys(data[0] || {}));
    }
}

debugSchema();
