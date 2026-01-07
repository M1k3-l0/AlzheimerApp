# Guida: Creare Token GitHub

GitHub non usa più la password normale per il terminale. Devi creare un "gettone" (Token).
È facile, segui qui:

1. **Vai su GitHub**: [Clicca qui per andare alle impostazioni Token](https://github.com/settings/tokens?type=beta)
   *(Se il link non va: Clicca sulla tua foto profilo in alto a destra -> Settings -> Developer settings -> Personal access tokens -> Tokens (classic))*

2. Clicca su **Generate new token (classic)**.
   - Nome (Note): Scrivi "MacMini" o "AlzheimerApp".
   - Scadenza (Expiration): Metti "No expiration" (o 90 giorni).
   - **IMPORTANTE**: Spunta la casella **`repo`** (quella in alto che seleziona tutto il controllo dei repository).

3. Scorri in fondo e clicca **Generate token**.

4. **COPIA SUBITO** quel codice lungo che inizia con `ghp_...`.
   ⚠️ Non lo vedrai mai più! Copialo.

---

### Ora riprova:
Torna al terminale e lancia di nuovo:
```bash
git push -u origin main
```
1. Username: `CosmoNetinfo`
2. Password: **Incolla il codice `ghp_...` che hai appena copiato**.

E magicamente funzionerà!
