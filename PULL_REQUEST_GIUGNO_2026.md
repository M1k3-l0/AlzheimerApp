# Pull Request — Giugno 2026

**Branch:** `feature/giugno-2026-aggiornamento`  
**Fork:** [M1k3-l0/AlzheimerApp](https://github.com/M1k3-l0/AlzheimerApp)  
**Target:** [CosmoNetinfo/AlzheimerApp](https://github.com/CosmoNetinfo/AlzheimerApp) → `main`

---

## Aprire la PR verso CosmoNet (Daniele)

1. Vai al link compare (precompilato):
   **https://github.com/CosmoNetinfo/AlzheimerApp/compare/main...M1k3-l0:feature/giugno-2026-aggiornamento?expand=1**

   > Se compare mostra "There isn't anything to compare", il branch non condivide la storia con `main`. Il branch è stato riallineato il 16/06/2026 — ricarica la pagina.

2. Titolo suggerito:
   `Memora: audit sicurezza, pulizia codice e documentazione (Giugno 2026)`

3. Assegna la review a **Daniele Spalletti** / team CosmoNet.

4. Nel corpo della PR, indica a Daniele di leggere per primo:
   **`SICUREZZA_E_RACCOMANDAZIONI.md`**

---

## Contenuto principale

- Auth/logout hardened (sessione Supabase)
- Privacy pazienti (email/posizione sempre visibili)
- DebugConsole solo dev
- Pulizia codice e asset duplicati
- Changelog in `PROGETTO_RECAP.md`
- Bozza RLS: `sql_updates/security_rls_hardening.sql`

---

## Zip locale (backup)

File: `Memora/Memora-giugno-2026.zip` (senza `node_modules`, `.env`, `.git`)

Dopo estrazione: `npm install && npm run dev`

---

*Generato il 15 Giugno 2026*
