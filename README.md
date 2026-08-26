# App Palestra

Un'applicazione web embrionale per gestire dieta e routine di palestra. Versione base con calendario mensile e struttura pronta per future espansioni.

## Funzionalita Correnti

- **Calendario mensile interattivo**: Visualizza tutti i giorni del mese in una griglia 7xN
- **Navigazione tra mesi**: Freccie per passare al mese precedente/successivo
- **Evidenziazione giorno corrente**: sfondo blu per il giorno odierno
- **Indicatori visivi**: 🏋️ per giorni di allenamento, 🍽️ per giorni con pasti
- **Dati mock**: caricamento automatico dati di esempio al primo avvio

## Stack Tecnologico

- **Framework**: React 19 con Vite
- **Package Manager**: pnpm
- **Stile**: Bootstrap 5
- **Routing**: React Router 7
- **Linting**: OXLint
- **API Esterna**: Mistral AI (struttura pronta, non implementata)

## Struttura del Progetto

```
src/
    components/      # Componenti React riutilizzabili (vuoto)
    layouts/         # Layout dell'applicazione
        MainLayout.jsx # Layout principale con navbar
    data/            # Dati statici e mock
        mockData.js  # Dati mock per testing
    services/        # Funzioni per API Mistral (struttura base)
        mistral.js   # Servizio per integrazione Mistral
    contexts/        # Context React
        AuthContext.jsx # Contesto autenticazione (struttura base)
    pages/           # Pagine principali
        Home.jsx     # Calendario con design moderno
    assets/          # Risorse statiche
        styles/     # Stili personalizzati (vuoto)
```

## Requisiti

- Node.js 18+ (consigliato 20+)
- pnpm (installato globalmente)

## Installazione

1. Naviga nella cartella del progetto:
   ```bash
   cd app-palestra
   ```

2. Installa le dipendenze:
   ```bash
   pnpm install
   ```

3. (Opzionale) Configura la chiave API Mistral:
   - Crea un file `.env` nella radice del progetto
   - Aggiungi la tua chiave API:
     ```
     VITE_MISTRAL_API_KEY=la_tua_chiave_api
     ```
   - Puoi ottenere una chiave API gratuita da [Mistral AI](https://mistral.ai/)

## Avvio

```bash
pnpm dev
```

L'app sara disponibile all'indirizzo: [http://localhost:5173](http://localhost:5173)

## Script Disponibili

| Script | Descrizione |
|--------|-------------|
| `pnpm dev` | Avvia il server di sviluppo |
| `pnpm build` | Crea la build di produzione |
| `pnpm preview` | Anteprima della build |
| `pnpm lint` | Esegue il linting con OXLint |

## Dati Mock

L'app carica automaticamente dati di esempio al primo avvio. I dati includono:
- Obiettivo: Massa Muscolare
- Livello: Intermedio
- Giorni di allenamento: Lunedì, Martedì, Giovedì, Venerdì
- Orari pasti: 07:30, 13:00, 16:00, 20:00

## Prossimi Passi

1. Implementare form di configurazione in una pagina Settings
2. Aggiungere pagina DayDetails per dettagli del giorno
3. Implementare integrazione API Mistral per generazione suggerimenti
4. Aggiungere chatbot per modifiche al piano
5. Implementare gestione ferie e tracciamento attivita

## Note

Questa e' la versione embrionale del progetto. Tutte le funzionalita avanzate (bot AI, gestione ferie, tracciamento) sono state rimosse e la struttura e' stata semplificata per permettere uno sviluppo incrementale.
