# Memora 🧠✨

Un'applicazione mobile **Premium** progettata per supportare i pazienti affetti da Alzheimer, i loro caregiver e il personale medico. Memora offre strumenti intelligenti per la gestione quotidiana, la memoria e la socialità, unendo un'estetica raffinata a una tecnologia all'avanguardia.

## 🚀 Innovazioni & Funzionalità Killer

### 🎙️ Messaggi Vocali "Premium Voice"
Abbiamo reinventato la comunicazione vocale per renderla umana e accessibile.
- **Interfaccia WhatsApp Style**: Player audio personalizzato con **waveform dinamica** e foto profilo integrata nel fumetto.
- **Micro-interazioni**: Pulsanti Play/Pause fluidi e feedback visivo del progresso.
- **Cloud Delivery**: Audio gestiti via Supabase Storage per una velocità di riproduzione immediata.

### 📈 Report Benessere & Mood Tracker 2.0
Il monitoraggio non è mai stato così chiaro.
- **Grafici Dinamici**: Visualizzazione storica dell'umore con dati scaricati in tempo reale dal database.
- **Accesso Caregiver/Medico**: Possibilità di visualizzare i report di utenti specifici direttamente dal profilo del paziente.
- **Analisi Prevalente**: Algoritmi che calcolano lo stato d'animo dominante per periodo.

### 📔 Diario Attività & Monitoraggio Remoto
- **Activity Log**: Un registro cronologico di ogni task completato, visualizzabile direttamente sul profilo dell'utente.
- **Real-time Status**: Sistema di heartbeat per segnalare lo stato "Online" e l'ultimo accesso in tempo reale.

### 🪲 Scarafaggio Diagnostico (Debug Console)
Un sistema di telemetria avanzato integrato nell'app (**solo in modalità sviluppo**).
- **Global Error Catching**: Cattura automatica di errori JavaScript e fallimenti di rete.
- **Report Rapido**: Tasto dedicato per inviare i log tecnici via email all'amministratore.

### 🔐 Logout e privacy
- **Disconnetti** disponibile dal profilo personale (logout Supabase completo).
- I **pazienti** non possono nascondere email e posizione (policy di sicurezza assistita).

### ✉️ Notifiche Istantanee
- **Badge Reattivo**: Un pallino rosso dinamico sulla bustina dei messaggi avvisa istantaneamente dell'arrivo di nuovi contenuti non letti.

## 🎨 Design & Branding
L'applicazione segue l'identità visiva ufficiale di **Airalzh Onlus** con un tocco moderno.
- **Palette**: Viola Vibrante (`#9C69A7`), Prugna Scuro (`#4A304F`) e Lilla Chiarissimo (`#F7F3FA`).
- **User Experience**: Design "Safe & Calm", icone grandi e chiare (AppIcon Custom System) e navigazione a prova di errore.

## 🛠️ Stack Tecnologico
- **Frontend**: React + Vite + Framer Motion (per animazioni fluide).
- **Backend**: Supabase (PostgreSQL + Real-time + Auth + Storage).
- **Mobile Foundation**: Architettura ottimizzata per Capacitor per deployment nativo iOS/Android.

## 📦 Installazione Locale

```bash
# Clona il repository
git clone https://github.com/CosmoNetinfo/AlzheimerApp.git

# Entra nella cartella
cd AlzheimerApp

# Installa le dipendenze
npm install

# Avvia l'app in modalità sviluppo
npm run dev
```

---

## 👥 Per i Collaboratori
Se stai lavorando a questo progetto, è **fondamentale** seguire queste regole:
1. Leggi sempre il file **[PROGETTO_RECAP.md](PROGETTO_RECAP.md)** per conoscere lo stato attuale dei lavori.
2. Ogni volta che fai un push, aggiorna la sezione **Changelog** in fondo a `PROGETTO_RECAP.md`.
3. Per **sicurezza e RLS Supabase**, consulta **[SICUREZZA_E_RACCOMANDAZIONI.md](SICUREZZA_E_RACCOMANDAZIONI.md)** (documento per Daniele / backend).

*Sviluppato con dedizione da **Daniele Spalletti** (sviluppatore) e **Michele Mosca** (web designer) per **cosmonet.info**.*
---

## 📄 License & Credits

**AlzheimerApp** is developed and maintained by **[Cosmonet](https://www.cosmonet.info)**.

© 2026 Cosmonet (https://www.cosmonet.info) — All rights reserved.

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.
