# 📋 MEMORA - Registro Sviluppo e Checklist

**Progetto**: Memora - App per supporto Alzheimer  
**Sviluppatori**: Daniele Spalletti & Michele Mosca (CosmoNet.info)  
**Cliente**: Airalzh  
**Ultimo Aggiornamento**: 15 Giugno 2026

---

> [!IMPORTANT]
> ### 🛑 REGOLA PER I COLLABORATORI
> Ogni volta che viene effettuata una modifica al codice o alla configurazione, **È OBBLIGATORIO**:
> 1. Aggiornare la sezione **CHANGELOG** in fondo a questo file con la data e il dettaglio dei cambiamenti.
> 2. Se viene aggiunta una nuova funzionalità, creare la relativa sezione o spuntare le checklist sopra.
> 3. Documentare eventuali nuove variabili d'ambiente o script SQL necessari.

---

## 🎯 Obiettivo del Progetto

Creare una Progressive Web App (PWA) per supportare pazienti affetti da Alzheimer e i loro caregiver, fornendo strumenti per:
- Gestione attività quotidiane
- Monitoraggio dello stato emotivo con indicatori visivi
- Comunicazione tra paziente e rete di supporto
- Social network dedicato per condivisione esperienze

---

## ✅ FUNZIONALITÀ COMPLETATE

### 1. **Architettura Base** ✓
- [x] Setup React + Vite
- [x] Routing con React Router
- [x] Integrazione Supabase (Database + Auth)
- [x] PWA configurata (manifest.json, service worker)
- [x] Deploy automatico su Vercel
- [x] Repository GitHub configurato

### 2. **Sistema di Autenticazione** ✓
- [x] Pagina Login/Registrazione
- [x] Gestione ruoli utente (Paziente, Caregiver, Familiare, Operatore Sanitario)
- [x] Persistenza sessione con localStorage
- [x] Logout funzionante

### 3. **Design System Premium** ✓
- [x] Palette colori vibrant (Purple #7C3AED + Amber #F59E0B)
- [x] Design card-based moderno
- [x] Glassmorphism effects
- [x] Micro-animazioni e transizioni smooth
- [x] Typography professionale (system fonts)
- [x] Responsive layout mobile-first

### 4. **Homepage - Gestione Attività** ✓
- [x] Saluto personalizzato con nome utente
- [x] Data corrente in italiano
- [x] Card Agenda con gradient viola
- [x] Lista attività con checkbox interattivi
- [x] Aggiunta/eliminazione task
- [x] Orari per ogni attività
- [x] Persistenza task in localStorage
- [x] Link impostazioni in header (icona ingranaggio)

### 5. **Mood Tracker (Tracciamento Umore) - COMPLETO** ✅
- [x] Tre stati emotivi: Felice, Neutro, Triste
- [x] Icone colorate (Smile, Meh, Frown)
- [x] **Logica basata su ruolo**:
  - Paziente: può selezionare il proprio umore (cliccabile)
  - Altri ruoli: vedono l'umore del paziente (read-only)
- [x] **Persistenza in Supabase** (tabella `profiles`)
- [x] Sincronizzazione real-time
- [x] **Homepage**: Pulsanti interattivi per selezione mood
- [x] **Profilo**:
  - **Bordo colorato avatar** (🟢 Verde = Felice, 🟡 Giallo = Neutro, 🔴 Rosso = Triste)
  - **Emoji accanto al nome** (😊😐😢)
  - ~~Selettore mood per pazienti (3 pulsanti)~~ → rimosso dal profilo (solo Home)
  - Visualizzazione mood per caregiver
- [x] **Feed (MemoraBook)**:
  - Bordo colorato su avatar di ogni post
  - Emoji accanto al nome autore
  - Fetch automatico mood da tabella profiles
  - **Persistenza tra pagine** (non si perde cambiando schermata)

### 6. **Pillola di Benessere** ✓
- [x] 10 citazioni motivazionali
- [x] Rotazione automatica giornaliera (basata su giorno dell'anno)
- [x] Card con design warm (giallo/ambra)
- [x] Icona cuore decorativa

### 7. **Chat AI (Memora Assistant)** ✓
- [x] Interfaccia chat moderna
- [x] Integrazione Google Gemini AI
- [x] Risposte contestuali e empatiche
- [x] Bubble messages con avatar
- [x] Auto-scroll ai nuovi messaggi
- [x] Persistenza conversazioni in localStorage
- [x] **Layout responsive** (fix per sidebar PC)
- [x] **Design migliorato** con bordi arrotondati e ombre
- [x] Focus state su input (bordo viola)
- [x] Animazione press su pulsante send

### 8. **Social Feed (MemoraBook)** ✓
- [x] Feed stile Facebook/Instagram
- [x] Creazione post con testo e immagini
- [x] Sistema like con persistenza
- [x] Commenti con thread
- [x] Like ai commenti
- [x] Upload immagini con compressione automatica
- [x] Lightbox per visualizzazione immagini
- [x] Timestamp relativi ("2 ore fa")
- [x] Persistenza completa in Supabase
- [x] **Indicatori mood su avatar** (bordo colorato + emoji)
- [x] **Fetch mood da profiles** per tutti gli autori
- [x] **author_id** salvato nei post per tracking mood

### 9. **Profilo Utente** ✓
- [x] **Design minimale card-based**
- [x] Avatar con iniziale o foto
- [x] **Avatar con bordo colorato dinamico** basato su mood
- [x] **Emoji mood accanto al nome**
- [x] Badge ruolo
- [x] **Mood selector** per pazienti (3 pulsanti interattivi cliccabili)
- [x] Card informazioni (email, ruolo, data iscrizione)
- [x] Card azioni rapide (Impostazioni, Post)
- [x] Footer con credits

### 10. **Geolocalizzazione (Safety & Location)** ✓
- [x] Integrazione `@capacitor/geolocation`.
- [x] Permessi nativi configurati (Android & iOS).
- [x] Servizio `locationService.js` con Reverse Geocoding (da coordinate a indirizzo).
- [x] Tasto "Aggiorna Posizione" nel profilo utente.
- [x] Salvataggio posizione in Supabase (tabella `profiles`).
- [x] Gestione permessi e fallback per Web App (PWA).

### 11. **Manutenzione & Keep-Alive** ✓
- [x] Configurazione **UptimeRobot** per evitare la pausa del database Supabase (Free Tier).
- [x] Istruzioni dettagliate in `GUIDA_SUPABASE.md` per monitoraggio Porta 443.
- [x] Script SQL per configurazione Storage bucket `avatars` con policy pubbliche.

### 10. **Impostazioni** ✓
- [x] Gestione notifiche push (OneSignal + Fallback nativo)
- [x] Toggle caratteri grandi (accessibilità)
- [x] Numero SOS configurabile
- [x] Link rapido Pronto Alzheimer
- [x] Istruzioni per attivazione notifiche (iOS/Android)
- [x] Gestione permessi denied
- [x] **Link accessibile da ogni pagina** (icona ingranaggio in header homepage)

### 11. **Notifiche Push** ✓
- [x] Integrazione OneSignal
- [x] Richiesta permessi intelligente
- [x] Supporto iOS (con istruzioni PWA)
- [x] Supporto Android
- [x] Fallback browser nativo
- [x] Gestione stati (granted/denied/default)

### 12. **Responsive Design** ✓
- [x] **Mobile**: Layout full-screen, barra inferiore
- [x] **Tablet**: Contenuto centrato (max 600px)
- [x] **Desktop**: 
  - Sidebar laterale sinistra (80px)
  - Contenuto centrato con effetto floating
  - Hover effects su navigazione
  - Background grigio esterno
- [x] Safe area insets per notch/home indicator
- [x] Transizioni smooth tra breakpoints

### 13. **Navigazione** ✓
- [x] Tab bar inferiore (mobile)
- [x] Sidebar laterale (desktop >600px)
- [x] 4 sezioni: Inizio, Chat, Social, Profilo
- [x] Icone Lucide React
- [x] Active state evidenziato
- [x] Animazioni di transizione

### 14. **Simulazione Ruoli (Admin)** ✓
- [x] Accesso protetto via email whitelist (Daniele & Michele)
- [x] Switcher ruoli istantaneo (Paziente, Medico, Caregiver, Familiare)
- [x] Persistenza locale del ruolo simulato
- [x] Badge informativo globale `SIMULAZIONE: [RUOLO]`
- [x] Accesso garantito alla console anche in modalità simulata
- [x] Reset rapido al ruolo originale

---

## 🚧 DA COMPLETARE / MIGLIORARE

### Priorità Alta 🔴
- [ ] **Testing completo su dispositivi reali**
  - [ ] Test iOS (Safari, PWA installata)
  - [ ] Test Android (Chrome, PWA installata)
  - [ ] Test notifiche push su tutti i device
  - [ ] Test mood tracking cross-device
- [x] **Gestione errori robusta**
  - [ ] Offline mode (service worker)
  - [ ] Retry automatico chiamate API
  - [x] Toast notifications per feedback utente
- [ ] **Sicurezza**
  - [ ] Validazione input lato client
  - [ ] Sanitizzazione contenuti post/commenti
  - [ ] Rate limiting chiamate AI
  - [ ] HTTPS obbligatorio

### Priorità Media 🟡 - COMPLETATO ✅
- [x] **Funzionalità Social**
  - [x] Modifica/eliminazione post propri
  - [x] Modifica/eliminazione commenti propri
  - [x] Filtri feed (per ruolo)
  - [x] Ricerca post e autori
  - [x] Hashtag cliccabili
- [x] **Profilo Utente**
  - [x] Modifica foto profilo
  - [x] Modifica bio
  - [x] Modifica nome/cognome
  - [x] Privacy settings (nascondi email/posizione)
- [x] **Attività**
  - [x] Notifiche promemoria (OneSignal)
  - [x] Ricorrenza attività (giornaliera, settimanale)
  - [x] Categorie attività (farmaci, appuntamenti, ecc.)
  - [x] Statistiche completamento (barra di progresso)
- [x] **Chat AI**
  - [x] Cronologia conversazioni (ai_chat_history)
  - [x] Esportazione conversazioni (TXT)
  - [x] Design premium e responsivo

### Priorità Bassa 🟢
- [ ] **Gamification**
  - [ ] Badge achievements
  - [ ] Streak giornalieri
  - [ ] Punti per completamento attività
- [x] **Analytics**
  - [x] Dashboard statistiche per caregiver
  - [x] Grafici andamento umore (AreaChart)
  - [x] Statistiche attività (BarChart)
  - [x] Insights automatici
- [ ] **Integrations**
  - [ ] Calendario Google/Apple
  - [ ] Contatti telefono
  - [ ] Foto gallery
- [ ] **Accessibilità**
  - [ ] Screen reader optimization
  - [x] Contrasto alto
  - [ ] Navigazione tastiera completa
  - [ ] Voice commands

---

## 🎨 INDICATORI MOOD - SISTEMA COLORI

### Colori Mood
- **🟢 Verde (#10B981)** = Felice (happy) 😊
- **🟡 Giallo/Ambra (#F59E0B)** = Neutro (neutral) 😐
- **🔴 Rosso (#EF4444)** = Triste (sad) 😢
- **⚪ Grigio (#E5E7EB)** = Nessuno stato (default)

### Applicazione Visiva
1. **Bordo Avatar**: 3-4px solid con colore mood + ombra colorata
2. **Emoji**: Mostrata accanto al nome (18-28px)
3. **Transizioni**: Smooth 0.3s ease per cambio stato

---

## 🗂️ STRUTTURA PROGETTO

```
AlzheimerApp/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── service-worker.js      # Service worker per offline
│   └── icons/                 # App icons (varie dimensioni)
├── src/
│   ├── components/
│   │   ├── Header.jsx         # Header con titolo pagina
│   │   ├── TabBar.jsx         # Barra navigazione (responsive)
│   │   ├── TabBar.module.css  # Stili navigazione
│   │   └── Layout.jsx         # Layout wrapper
│   ├── pages/
│   │   ├── LoginPage.jsx      # Login/Registrazione
│   │   ├── ListPage.jsx       # Homepage - Attività + Mood
│   │   ├── ChatPage.jsx       # Chat AI (fix responsive)
│   │   ├── FeedPage.jsx       # Social feed + Mood indicators
│   │   ├── ProfilePage.jsx    # Profilo + Mood selector/badge
│   │   └── SettingsPage.jsx   # Impostazioni
│   ├── supabaseClient.js      # Config Supabase
│   ├── App.jsx                # Router principale
│   ├── index.css              # Stili globali + design system
│   └── main.jsx               # Entry point
├── .env                       # Variabili ambiente
├── vite.config.js             # Config Vite
├── PROGETTO_RECAP.md          # Questo file
└── package.json               # Dipendenze
```

---

## 📊 DATABASE SCHEMA (Supabase)

### Tabella: `profiles`
```sql
- id (text, PK)
- name (text)
- surname (text)
- email (text)
- role (text) -- 'patient', 'caregiver', 'healthcare', 'family'
- bio (text)
- location (text)
- photo (text) -- base64 o URL
- current_mood (text) -- 'happy', 'neutral', 'sad' ⭐ NUOVO
- created_at (timestamp)
```

### Tabella: `posts`
```sql
- id (bigint, PK, auto)
- author (text)
- author_id (text) ⭐ NUOVO (per fetch mood)
- author_photo (text)
- text (text)
- image (text) -- base64
- likes (integer)
- created_at (timestamp)
```

### Tabella: `comments`
```sql
- id (bigint, PK, auto)
- post_id (bigint, FK -> posts)
- author_name (text)
- author_id (text)
- author_photo (text)
- text (text)
- likes (integer)
- created_at (timestamp)
```

---

## 🚀 DEPLOYMENT

### Vercel
- **URL Produzione**: https://alzheimerapp-chi.vercel.app
- **Auto-deploy**: Push su branch `main` → deploy automatico
- **Environment Variables**: Configurate su Vercel dashboard

### GitHub
- **Repository**: CosmoNetinfo/AlzheimerApp
- **Branch principale**: `main`
- **Commit messages**: Descrittivi e in italiano

---

## 📝 NOTE TECNICHE

### Gestione Stato
- **localStorage**: Tasks, user session, liked posts/comments
- **Supabase**: Posts, comments, profiles, **mood** (persistente)
- **React State**: UI temporaneo, form inputs, userMoods mapping

### Performance
- Immagini compresse a max 1024px (post) e 512px (avatar)
- Lazy loading componenti (da implementare)
- Memoization con useMemo per calcoli pesanti (dailyQuote)
- Fetch mood batch per tutti gli autori (evita N+1 queries)

### Accessibilità
- Font size base: 18px (leggibilità)
- Toggle caratteri grandi disponibile
- Contrasti colori WCAG AA compliant
- Icone sempre accompagnate da testo
- Pulsanti mood con `pointer-events` e `userSelect` ottimizzati

---

## 🐛 BUG NOTI

- [ ] Notifiche iOS richiedono PWA installata (limitazione Safari)
- [ ] Mood sync potrebbe avere lag su connessioni lente
- [ ] Immagini molto grandi potrebbero causare crash (da testare)

---

## 💡 IDEE FUTURE

- **Modalità Notte**: Dark mode per ridurre affaticamento visivo
- **Multi-lingua**: Supporto inglese, spagnolo
- **Video chiamate**: Integrazione Jitsi/Zoom per videochiamate famiglia
- **Geolocalizzazione**: Tracking posizione paziente (con consenso)
- **Wearable Integration**: Smartwatch per monitoraggio parametri vitali
- **Voice Assistant**: Comandi vocali per pazienti con difficoltà motorie
- **Mood History**: Grafico andamento umore nel tempo
- **Mood Alerts**: Notifica caregiver se paziente è triste per troppo tempo

---

## 📞 CONTATTI

**Sviluppatori**: Daniele Spalletti & Michele Mosca  
**Azienda**: CosmoNet.info  
**Email**: info@cosmonet.info  
**Cliente**: Airalzh  

---

## 📅 CHANGELOG ULTIMA SESSIONE (15 Giugno 2026)

### Audit, sicurezza client e pulizia codice
- ✅ **Logout centralizzato** (`src/utils/logout.js`): Supabase `signOut`, pulizia storage, redirect `#/login`. Pulsante **Disconnetti** solo in Profilo.
- ✅ **Auth hardened**: sessione Supabase obbligatoria; account bannati → logout; admin `/users` verifica ruolo da DB.
- ✅ **DebugConsole dev-only**: non inclusa nel bundle production.
- ✅ **Privacy pazienti**: impossibile nascondere email/posizione; sezione privacy nascosta in Profilo e Impostazioni.
- ✅ **SOS FAB**: pulsante flottante caregiver/paziente con validazione `tel:` (`src/utils/phone.js`).
- ✅ **UI/Branding**: badge ruolo viola, filtri feed, mock feed/chat/clinica, fix scroll, icona map-marker profilo.
- ✅ **Pulizia**: rimossi `ListItem.jsx`, `debug_schema.js`, duplicati `assets/new_icon/`, logo login fix (`logo.svg`).
- ✅ **Documento sicurezza**: `SICUREZZA_E_RACCOMANDAZIONI.md` per Daniele (RLS e roadmap backend).
- 📄 **SQL**: bozza RLS in `sql_updates/security_rls_hardening.sql` (da applicare su Supabase).

### Ore 14:00 - 15:30 (Sviluppo v2 — 11 Maggio 2026)
- ✅ **Social Expansion**: Ricerca, hashtag, editing e cancellazione post/commenti.
- ✅ **Profile & Privacy**: Modifica info personali e toggle privacy per email/posizione.
- ✅ **Activity Upgrade**: Categorie, ricorrenza e progress bar dinamica in home.
- ✅ **Analytics & AI**: Creazione `AnalyticsPage` con grafici Recharts e `AIChatPage` con persistenza e export.
- ✅ **Iconografia**: Aggiunta nuove icone premium (brain, search, crown).
- ✅ **Admin Simulation**: Implementato Role Switcher per Daniele e Michele con badge informativo globale.

**Ultimo aggiornamento**: 15 Giugno 2026
