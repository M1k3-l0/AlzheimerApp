# Memora — Sicurezza e raccomandazioni tecniche

**Destinatario:** Daniele Spalletti (CosmoNet)  
**Data:** 15 Giugno 2026  
**Autore revisione:** Michele Mosca (con assistenza AI)  
**Repository:** [CosmoNetinfo/AlzheimerApp](https://github.com/CosmoNetinfo/AlzheimerApp)

---

> Questo documento descrive i **problemi critici ancora aperti** e le **azioni consigliate** dopo l’audit di sicurezza e pulizia codice della sessione del 15/06/2026.  
> Le correzioni già applicate nel frontend sono documentate in `PROGETTO_RECAP.md` (Changelog).

---

## 1. Riepilogo esecutivo

L’app Memora è una SPA React + Supabase. La UI applica controlli su ruoli e autenticazione, ma **il vero confine di sicurezza deve essere Supabase (RLS + Auth)**, non il browser.

**Rischio principale:** policy RLS troppo permissive (`USING (true)`) su molte tabelle. Chiunque abbia la chiave anon (presente nel bundle client) può leggere/scrivere dati bypassando l’interfaccia.

**Priorità assoluta:** applicare le policy in `sql_updates/security_rls_hardening.sql` (adattandole ai tipi colonna reali) e verificare che non esista un RPC `exec_sql` invocabile con la chiave anon.

---

## 2. Problemi critici ancora aperti

### 2.1 Row Level Security (RLS) permissiva

| Tabella / area | Problema | Severità |
|----------------|----------|----------|
| `posts`, `comments`, `messages` | Policy `FOR ALL USING (true)` in script SQL esistenti | **Critico** |
| `tasks`, `mood_history`, `ai_chat_history` | Accesso totale autenticato senza vincolo `auth.uid()` | **Critico** |
| Storage bucket `avatars` | Upload/update/delete aperti a tutti | **Alto** |
| `activity_log`, note cliniche | Usate nel codice; RLS non documentata nel repo | **Alto** |

**Fix consigliato:** eseguire e adattare `sql_updates/security_rls_hardening.sql` nel SQL Editor Supabase. Testare ogni flusso (login paziente, caregiver, medico, admin) dopo l’applicazione.

---

### 2.2 Autorizzazione solo lato client

| Comportamento | Rischio | Severità |
|---------------|---------|----------|
| Ruolo admin verificato in UI (`localStorage`) | Bypassabile impostando JSON falso | **Critico** (se RLS non blocca) |
| Ruolo scelto in signup (`patient` / `caregiver` / `healthcare`) | Utente può auto-promuoversi medico | **Alto** |
| `FindPeoplePage` legge email di tutti i profili | Violazione privacy | **Alto** |
| Report umore per `userId` arbitrario in URL | Accesso dati altrui se RLS assente | **Alto** |

**Fix consigliato:**
- Ruolo assegnato **solo server-side** (default `patient`, promozione via admin o invite).
- RLS su `profiles`: nascondere `email` salvo proprietario o relazione caregiver↔paziente.
- RLS su `mood_history`: lettura solo proprio `user_id` o caregiver/medico collegato.

---

### 2.3 Dati sanitari in localStorage

| Dato | Dove | Severità |
|------|------|----------|
| Note cliniche mock/reali | `alzheimer_clinical_notes` in `ClinicalDashboard.jsx` | **Medio** |
| Storico umore locale | `patientMoods` in `moodHistory.js` | **Medio** |
| Sessione utente | `alzheimer_user` (id, email, ruolo) | **Medio** |

**Fix consigliato:** persistere PHI solo su Supabase con RLS; localStorage solo per preferenze UI (font grande, posizione FAB SOS).

---

### 2.4 RPC `exec_sql` (se presente in produzione)

Gli script Node (`setup-database.js`, `add-admin-policy.js`) usano `supabase.rpc('exec_sql', { sql })` con **service role**. Se lo stesso RPC fosse esposto all’anon key, sarebbe compromissione totale del DB.

**Azione:** verificare in Supabase → Database → Functions che `exec_sql` non sia invocabile da `anon` / `authenticated`.

---

## 3. Problemi medi / bassi

| Area | Nota |
|------|------|
| OneSignal App ID in `index.html` | Accettabile; proteggere dashboard OneSignal |
| `.env` con `VITE_SUPABASE_ANON_KEY` | Normale per SPA; non committare `.env`; ruotare chiave se esposta |
| Email admin in DebugConsole | **Risolto in prod:** DebugConsole non inclusa nel bundle production |
| XSS su messaggi d’errore | **Risolto:** `innerHTML` sostituito con `textContent` in `index.html` e `main.jsx` |
| Link `tel:` SOS | **Risolto:** validazione numeri in `src/utils/phone.js` |

---

## 4. Correzioni già applicate (frontend — sessione 15/06/2026)

Queste modifiche sono già nel codice; **non sostituiscono RLS** ma migliorano la robustezza client:

1. **Auth:** rotte protette basate su sessione Supabase (`getSession`), non solo `localStorage`.
2. **Logout:** `src/utils/logout.js` — `signOut()` + pulizia storage + redirect `#/login`.
3. **Account bannati:** controllo `is_banned` al sync profilo → logout forzato.
4. **DebugConsole / ErrorInterceptor:** caricati **solo in dev** (`import.meta.env.DEV`).
5. **Simulazione ruolo:** `simulated_role` attivo solo in dev.
6. **Admin `/users`:** verifica ruolo dal DB via sessione.
7. **Privacy pazienti:** impossibile nascondere email/posizione; sezione privacy nascosta.
8. **Pulizia:** rimossi file morti, duplicati asset, logo login fixato.

---

## 5. Roadmap consigliata (ordine di intervento)

### Fase 1 — Immediata (1–2 giorni)
- [ ] Applicare RLS da `sql_updates/security_rls_hardening.sql`
- [ ] Verificare / rimuovere `exec_sql` pubblico
- [ ] Bloccare scelta ruolo `healthcare` in signup (solo admin)
- [ ] Test manuale: paziente, caregiver, medico, admin

### Fase 2 — Breve termine (1 settimana)
- [ ] Migrare note cliniche e mood history da localStorage a Supabase
- [ ] Policy storage avatars per path `auth.uid()`
- [ ] Rispettare `privacy_settings` in query profili (caregiver/medico)

### Fase 3 — Medio termine
- [ ] Edge Functions per operazioni admin (ban, promozione ruolo)
- [ ] Code-splitting bundle (Recharts / Analytics)
- [ ] Test E2E su flussi auth e RLS

---

## 6. File utili nel repository

| File | Contenuto |
|------|-----------|
| `sql_updates/security_rls_hardening.sql` | Bozza policy RLS da applicare su Supabase |
| `PROGETTO_RECAP.md` | Stato progetto + changelog dettagliato |
| `DOCUMENTAZIONE_FUNZIONALE.md` | Funzionalità per ruolo |
| `src/utils/logout.js` | Logout centralizzato |
| `src/utils/phone.js` | Sanitizzazione numeri SOS |

---

## 7. Contatti

- **Daniele Spalletti** — sviluppo backend / Supabase  
- **Michele Mosca** — UI/UX e frontend  
- **CosmoNet:** info@cosmonet.info  

Per domande su questo documento, aprire una issue o rispondere alla Pull Request associata a questo aggiornamento.

---

*Documento generato a supporto della review tecnica — non sostituisce un penetration test formale.*
