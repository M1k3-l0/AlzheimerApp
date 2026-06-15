# Guida per Mantenere Attivo Supabase tramite Cron-job.org

Supabase mette automaticamente in "Pausa" i progetti gratuiti se non rilevano attività sulle API o nella Dashboard per più di 7 giorni.
Per aggirare questa limitazione, possiamo impostare un servizio gratuito come **cron-job.org** che invia una richiesta al database a intervalli regolari (es. ogni 1-2 giorni).

## Prerequisiti
Avrai bisogno di:
1.  **L'URL del tuo Supabase**: `https://naqwhpgtawbsdhuogrgp.supabase.co`
2.  **La tua `anon key`** (quella usata in `.env`).

## Passaggi su Cron-Job.org

1.  Crea un account gratuito su [cron-job.org](https://cron-job.org/).
2.  Vai alla sezione **Cronjobs** e clicca su **Create Cronjob**.
3.  Imposta il pannello come segue:
    -   **Title**: `Memora Supabase Keep-Alive`
    -   **URL**: `https://naqwhpgtawbsdhuogrgp.supabase.co/rest/v1/profiles?select=id&limit=1`
    -   **Execution schedule**: Modalità *User-defined*. Scegli di eseguirlo ad esempio ogni lunedì, mercoledì e sabato (basta una volta ogni 2 o 3 giorni) ad un certo orario. Inserire `0` nei minuti e selezionare un'ora o due, poi giorni specifici della settimana da eseguire `Specific days of week`. Un ping ogni 3 giorni (es. ogni mezzogiorno nei giorni impostati) è sufficiente. (Nota: non impostarlo a caso "every minute" perché spreca la banda gratuita del piano Supabase!).
4.  Scorri in basso, espandi la sezione **Advanced Settings** e cerca la sotto-sezione **HTTP Headers** o **Request Headers**.
5.  Aggiungi le seguenti due intestazioni (Header):
    -   Header 1: 
        -   Name: `apikey`
        -   Value: `INCOLLA_QUI_LA_TUA_ANON_KEY`
    -   Header 2:
        -   Name: `Authorization`
        -   Value: `Bearer INCOLLA_QUI_LA_TUA_ANON_KEY` (non dimenticare la parola "Bearer " all'inizio)
6.  (Opzionale) Nella sezione *Save Responses*, scegli di ignorare le risposte o di disattivare i log permanenti per restare puliti.
7.  Clicca su **Create**.

## Verifica
Subito dopo aver creato il Cronjob, puoi testarlo cliccando sul tasto "Test" o "Edit > Check run". Se va a buon fine, restituirà lo status code HTTP `200 OK` (il quale conferma che ha ricevuto i dati) e il tuo progetto Supabase registrerà attività regolare e non andrà più in pausa in automatico.
