# App Palestra

Un'applicazione web embrionale per gestire dieta e routine di palestra. Versione base con calendario mensile e struttura pronta per future espansioni.

## Funzionalita Correnti

- **Calendario mensile interattivo**: Visualizza tutti i giorni del mese in una griglia 7xN
- **Navigazione tra mesi**: Freccie per passare al mese precedente/successivo
- **Evidenziazione giorno corrente**: sfondo blu per il giorno odierno
- **Indicatori visivi**: 🏋️ per giorni di allenamento, 🍽️ per giorni con pasti
- **Impostazioni**: Gestione obiettivo, livello, preferenze alimentari, giorni allenamento, durata, orari pasti
- **Scheda Allenamento**: Aggiunta, modifica, eliminazione esercizi con serie, ripetizioni, riposo e note
- **Scheda Nutrizionale**: Aggiunta, modifica, eliminazione pasti con calorie, macro, orario e note
- **Totali nutrizionali**: Calcolo automatico calorie, proteine, carboidrati, grassi giornalieri
- **Gestione File**: 
  - Upload di qualsiasi tipo di file (PDF, immagini, documenti, ecc.)
  - Download e eliminazione file
  - Salvataggio come Base64 (limite 4MB per file)
  - Metadata AI-friendly per futuri bot AI
  - **Visualizzazione file nella pagina**: Immagini, PDF e file testuali visualizzabili in una modal di anteprima
- **Persistenza dati**: Salvataggio automatico in localStorage

## Stack Tecnologico

- **Framework**: React 19 con Vite
- **Package Manager**: pnpm
- **Stile**: Bootstrap 5
- **Routing**: React Router 7
- **Linting**: OXLint
- **API Esterna**: Mistral AI (implementata)

## Struttura del Progetto

```
.env                # Configurazione variabili d'ambiente (escluso da git)
.env.example       # Template per configurazione variabili d'ambiente

src/
    components/      # Componenti React riutilizzabili
        ChatBot.jsx         # Componente chat con bot AI
        ChatHistoryModal.jsx # Modal per visualizzare storico chat in sola lettura
    layouts/         # Layout dell'applicazione
        MainLayout.jsx # Layout principale con navbar, integrazione ChatBot e ChatHistoryModal
    data/            # Dati statici e mock
        mockData.js  # Dati mock per testing
    services/        # Funzioni per API Mistral
        mistral.js   # Servizio per integrazione Mistral con routing risposte
    contexts/        # Context React
        AuthContext.jsx    # Contesto autenticazione (struttura base)
        SettingsContext.jsx # Contesto per impostazioni, scheda allenamento e nutrizionale
    pages/           # Pagine principali
        Home.jsx         # Calendario con design moderno
        Settings.jsx     # Impostazioni base
        WorkoutPlan.jsx  # Scheda allenamento con gestione file
        NutritionPlan.jsx # Scheda nutrizionale con gestione file
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
   - Copia il file `.env.example` in `.env` nella radice del progetto
   - Aggiungi la tua chiave API:
     ```
     VITE_MISTRAL_API_KEY=la_tua_chiave_api
     ```
   - Puoi ottenere una chiave API gratuita da [Mistral AI](https://mistral.ai/)
   - **Nota**: Il file `.env` e' escluso da versionamento (.gitignore)

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

## Dati e Persistenza

L'app salva automaticamente i dati in localStorage:
- `palestra_settings`: Impostazioni base (obiettivo, livello, preferenze, giorni allenamento, durata, orari pasti)
- `palestra_workout_plan`: Scheda allenamento con esercizi e file allegati
- `palestra_nutrition_plan`: Scheda nutrizionale con pasti, valori nutrizionali e file allegati
- `palestra_chat_history`: Storico delle chat con il bot AI (sola lettura tramite menù)

I dati vengono caricati automaticamente al primo avvio con valori di esempio:

**Nota sui file:**
- I file vengono salvati come Base64 in localStorage
- Limite massimo per singolo file: **4MB**
- Tipi supportati: **tutti** (PDF, immagini, documenti, ecc.)
- I file hanno metadata AI-friendly per futuri bot AI
- Obiettivo: Massa Muscolare
- Livello: Intermedio
- Giorni di allenamento: Lunedì, Martedì, Giovedì, Venerdì
- Orari pasti: 07:30, 13:00, 16:00, 20:00

## Integrazione Bot AI

Il bot AI e' predisposto per interagire con le pagine dell'applicazione:

**Funzioni disponibili in `src/services/mistral.js`:**
- `chatWithMistral(message, context)`: Invia un messaggio a Mistral AI e riceve una risposta strutturata con routing
- `generateSuggestions(data)`: Genera suggerimenti per dieta e routine basati sui dati corrente
- `parseBotResponse(rawResponse, currentPage)`: Analizza la risposta testuale per estrarre comandi di navigazione e modifiche
- `executeBotCommand(command, context)`: Esegue un comando del bot (navigazione, modifiche dati, ecc.)
- `callMistralApi(messages, model)`: Chiamata diretta all'API Mistral

**Tipi di azione (ACTION_TYPES):**
- `NAVIGA`: Naviga a una pagina specifica
- `AGGIORNA_SETTINGS`: Modifica impostazioni
- `AGGIUNGI_ESERCIZIO/RIMUOVI_ESERCIZIO/MODIFICA_ESERCIZIO`: Gestione scheda allenamento
- `AGGIUNGI_PASTO/RIMUOVI_PASTO/MODIFICA_PASTO`: Gestione scheda nutrizionale
- `SUGGERIMENTO/MESSAGGIO`: Messaggi informativi
- `ERRORE`: Gestione errori

**Pagine disponibili (AVAILABLE_PAGES):**
- `HOME`: `/` - Calendario
- `SETTINGS`: `/settings` - Impostazioni
- `WORKOUT_PLAN`: `/workout-plan` - Scheda Allenamento
- `NUTRITION_PLAN`: `/nutrition-plan` - Scheda Nutrizionale

**Nota:** Il system prompt verra' creato in un secondo momento per personalizzare il comportamento del bot.

**Interfaccia Utente:**
- Pulsante **AI** nella navbar per aprire la chat
- **Menù a tendina "Menu"** con tutte le voci (Calendario, Impostazioni, Schede, Storico Chat)
- **Storico Chat** accessibile dal menù a tendina - **disponibile solo su desktop**
- Modal con interfaccia chat
- **Salvataggio automatico** delle conversazioni in localStorage
- Menu di navigazione responsive gestito da Bootstrap navbar-collapse (su mobile)
- Suggerimenti rapidi preimpostati
- Supporto per navigazione automatica tra pagine
- Supporto per modifiche automatiche ai dati (settings, esercizi, pasti)

## Prossimi Passi

1. Aggiungere pagina DayDetails per dettagli del giorno
2. Implementare interfaccia chatbot per interazione con Mistral AI
3. Creare system prompt personalizzato per il bot
4. Implementare gestione ferie e tracciamento attivita
5. Aggiungere grafici e statistiche

## Note

Questa e' la versione embrionale del progetto. Tutte le funzionalita avanzate (bot AI, gestione ferie, tracciamento) sono state rimosse e la struttura e' stata semplificata per permettere uno sviluppo incrementale.
