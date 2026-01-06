# Guida Installazione Node.js

Sembra che sul tuo Mac manchi **Node.js**, che è il "motore" necessario per far girare l'applicazione (e usare il comando `npm`).

Ecco come installarlo facilmente:

## Opzione Consigliata: Installer Ufficiale

1. **Scarica**: Vai su questo link ufficiale:
   👉 [https://nodejs.org/dist/v20.10.0/node-v20.10.0.pkg](https://nodejs.org/dist/v20.10.0/node-v20.10.0.pkg)
   *(Questa è la versione LTS sicura e stabile)*

2. **Installa**:
   - Apri il file scaricato (`.pkg`).
   - Clicca su "Continua" e segui i passaggi (è sicuro, basta accettare tutto).

3. **Verifica**:
   - Una volta finito, chiudi il Terminale e aprine uno nuovo.
   - Prova a digitare:  
     `npm --version`
   - Se esce un numero (es. `10.2.3`), sei pronto!

## Dopo l'installazione

Torna nella cartella dell'app e riprova i comandi di prima:

```bash
cd /Volumes/PenCosmo/AlzheimerApp
npm install
npm run dev
```

Fammi sapere quando l'hai installato!
