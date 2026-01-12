# 📱 Guida alla Creazione dell'App Mobile (Android & iOS)

Questa guida ti spiega come trasformare il codice di **Memora** in un'applicazione scaricabile e installabile sul telefono.

## 🔗 Link Strumenti necessari

1. **Android Studio** (per creare l'APK Android): [Scarica qui](https://developer.android.com/studio)
2. **Xcode** (per creare l'app iPhone): Disponibile solo su Mac tramite Apple App Store.

---

## 🤖 Guida per ANDROID (Crea il tuo APK)

**COSTO: 100% GRATUITO** - Nessun account richiesto.

Segui questi passaggi sul tuo PC Windows:

### 1. Preparazione

Assicurati di aver installato **Android Studio**. Durante l'installazione, accetta tutti i componenti predefiniti (SDK, Build Tools).

### 2. Sincronizza il codice

Ogni volta che fai modifiche al sito web e vuoi vederle nell'app, apri il terminale nella cartella del progetto e scrivi:

```bash
npm run build
npx cap sync
```

### 3. Apri in Android Studio

Esegui questo comando per aprire il progetto:

```bash
npm run android
```

*Si aprirà automaticamente Android Studio.*

### 4. Genera l'APK

Una volta che Android Studio ha finito di caricare (guarda la barra in basso):

1. In alto nel menu, clicca su **Build**.
2. Seleziona **Build Bundle(s) / APK(s)**.
3. Clicca su **Build APK(s)**.
4. Attendi qualche minuto. Quando appare un fumetto in basso a destra con scritto "APK(s) generated successfully", clicca su **locate**.
5. Troverai un file chiamato `app-debug.apk`.

**Fatto!** Invia questo file al tuo telefono tramite WhatsApp, Email o cavetto e installalo.

---

## 🍎 Guida per iOS (iPhone)

**Nota Importante:** Per creare l'app per iPhone è obbligatorio possedere un **Mac**.

### 1. Sincronizza il codice

Sul Mac, nel terminale del progetto:

```bash
npm run build
npx cap sync
```

### 2. Apri in Xcode

Esegui:

```bash
npm run ios
```

*Si aprirà Xcode.*

### 3. Configurazione Firma (Signing)

1. In Xcode, clicca sulla cartella blu **App** a sinistra.
2. Vai nella scheda **Signing & Capabilities**.
3. Se non hai un account a pagamento, clicca su **Add Account** e inserisci il tuo normale Apple ID.
4. Seleziona il tuo nome sotto la voce **Team** ("Personal Team").

**⚠️ NOTA IMPORTANTE PER IOS:**

* **Account Gratuito:** L'app installata su iPhone smetterà di funzionare dopo **7 giorni**. Dovrai ricollegarla al Mac e premere di nuovo Play per farla ripartire.
* **Account Developer ($99/anno):** L'app dura **1 anno** senza interruzioni.
* **Per evitare scadenze:** Se non vuoi pagare Apple, per gli utenti iPhone consigliamo di usare la versione WebApp e fare "Aggiungi a Home" (PWA), che non scade mai.

---

## ⚡ Comandi Rapidi (Terminal)

* `npm run build`: Prepara i file web.
* `npm run cap:sync`: Copia i file web nelle cartelle Android/iOS.
* `npx cap open android`: Apre Android Studio.
* `npx cap open ios`: Apre Xcode.
