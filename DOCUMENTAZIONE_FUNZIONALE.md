# 📘 Documentazione Funzionale: Memora 🧠

Benvenuti nella documentazione dettagliata di **Memora**, l'ecosistema digitale progettato per supportare l'assistenza e la socialità nel mondo dell'Alzheimer.

---

## 👥 1. Ruoli e Permessi
L'applicazione è strutturata su quattro tipologie di utenti:

### **A. Il Paziente**
- **Agenda di Oggi**: Gestione attività (farmaci, pasti).
- **Mood Tracker**: Registrazione umore con un click.
- **SOS**: Accesso immediato ai soccorsi.
- **Messaggi Vocali**: Comunicazione audio semplificata.

### **B. Il Familiare (Caregiver)**
- **Monitoraggio Remoto**: Gestione agenda e umore del paziente.
- **Sincronizzazione Live**: Gli impegni aggiunti dal familiare appaiono subito al paziente.

### **C. Il Medico (Operatore Sanitario)**
- **Clinical Dashboard**: Monitoraggio grafico degli umori.
- **Registro Attività (NEW)**: Cronologia dettagliata (chi ha fatto cosa e a che ora).
- **Note Cliniche**: Archivio di osservazioni professionali.

### **D. L'Amministratore**
- **Moderazione**: Gestione utenti e contenuti social.

---

## 🛠️ 2. Moduli Principali

### 📅 Agenda Cloud (Real-time)
Sincronizzazione bidirezionale totale tra paziente e caregiver tramite Supabase Realtime.

### 📋 Registro Attività Dettagliato
Ogni azione rilevante viene salvata nel database:
- **Aggiunta Task**: Quando e da chi.
- **Completamento Task**: L'ora esatta in cui il paziente ha completato l'attività.
- **Cambio Umore**: Storico delle variazioni psicologiche.

### 🎙️ Sistema di Messaggistica "Vocal-First"
- **Audio Messaging**: Ideale per chi ha difficoltà a digitare.
- **Storage**: Caricamento sicuro su bucket Supabase dedicati.

### 🟢 Stato di Presenza
- **Online/Offline**: Monitoraggio live della connessione degli utenti.

---

## 🔐 3. Sicurezza e Resilienza
- **Auto-Healing**: Creazione automatica del profilo mancante al primo login.
- **Sessione Supabase**: le rotte protette richiedono sessione valida (non solo localStorage).
- **Logout**: centralizzato in `src/utils/logout.js` (signOut + pulizia storage).
- **DebugConsole**: disponibile solo in build di sviluppo.
- **RLS (Row Level Security)**: da rafforzare su Supabase — vedi `SICUREZZA_E_RACCOMANDAZIONI.md` e `sql_updates/security_rls_hardening.sql`.

---

## 📱 4. Tecnologia PWA
Installabile su Android e iOS come App nativa, con supporto per notifiche push.

---
*Documentazione aggiornata al: 15 Giugno 2026*
*Sviluppato da Daniele Spalletti e Michele Mosca per Cosmonet*
