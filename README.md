# App Palestra con AI Mistral

Un'applicazione web per gestire dieta e routine di palestra con suggerimenti personalizzati generati da un'AI (Mistral).

## Funzionalita

- **Configurazione personalizzata**: Inserisci obiettivo, livello, preferenze alimentari, giorni di allenamento, durata e orari pasti
- **Calendario mensile interattivo**: Visualizza tutti i giorni del mese in una griglia 7xN con navigazione tra mesi (freccie), evidenziazione del giorno corrente, indicatori visivi per allenamento (🏋️) e pasti (🍽️), tooltip con dettagli al hover
- **Dettagli giornali**: Visualizza scheda allenamento, esercizi, dieta e suggerimenti AI per ogni giorno con tab e progress bar
- **Prossima attivita**: Mostra in tempo reale la prossima attivita della giornata (allenamento con consigli su cosa portare o pasto con ricetta consigliata e informazioni nutrizionali)
- **Gestione ferie**: Imposta periodi di ferie da Settings o tramite chat AI (/ferie 15-01 20-01), visualizzazione giorni ferie nel calendario (🏖️), generazione automatica piano vacanza con esercizi leggeri e dieta flessibile
- **Tracciamento attività vacanza**: Segna come eseguite le attività consigliate, registra pasti mangiati tramite form dedicato o chat AI (/ho mangiato pizza, /ho fatto yoga 30 min)
- **Piano di rientro**: Generazione automatica piano post-vacanza basato su attività eseguite e sgarri alimentari segnalati (comando /piano rientro o automatico al termine ferie)
- **Integrazione AI Mistral**: Genera suggerimenti personalizzati basati sui tuoi dati
- **Chat con Bot AI (popup)**: Conversa con l'assistente virtuale per modificare il piano in caso di imprevisti o necessità diverse - disponibile in tutte le pagine tramite pulsante fisso
- **Modifiche al calendario tramite chat**: Il bot AI puo' modificare direttamente dieta e routine, e il bottone "Conferma" esegue automaticamente i comandi suggeriti
- **Documentazione AI**: File `ISTRUZIONI.md` con tutti i comandi disponibili per il chatbot (da allegare al system prompt)
- **Design accattivante**: Layout moderno con navbar, card colorate, icone, animazioni e responsive design

## Stack Tecnologico

- **Framework**: React 19 con Vite
- **Package Manager**: pnpm
- **Stile**: Bootstrap 5
- **Routing**: React Router 7
- **Linting**: OXLint
- **API Esterna**: Mistral AI

## Struttura del Progetto

```
src/
    components/      # Componenti React riutilizzabili
    layouts/         # Layout dell'applicazione
    data/            # Dati statici e mock
        mockData.js  # Dati mock per testing
    services/        # Funzioni per API Mistral e comandi
        mistral.js   # Servizio per integrazione Mistral
        comandi.js   # Comandi per modificare il calendario
    contexts/        # Context React
    layouts/         # Layout dell'applicazione
        MainLayout.jsx # Layout principale con navbar e footer
    pages/           # Pagine principali
        Home.jsx     # Calendario con design moderno
        DayDetails.jsx # Dettagli del giorno con tab
        Settings.jsx  # Form di configurazione con progress bar
    components/       # Componenti riutilizzabili
        ChatPopup.jsx # Popup chat con bot AI
        VacationTracker.jsx # Tracciamento attivita in vacanza
    assets/          # Risorse statiche
        styles/     # Stili personalizzati
            global.css # Stili globali e animazioni
    App.jsx          # Configurazione routing
    main.jsx         # Punto di ingresso
ISTRUZIONI.md      # Istruzioni per l'AI (da allegare al system prompt)
```

## Requisiti

- Node.js 18+ (consigliato 20+)
- pnpm (installato globalmente)
- Chiave API Mistral (gratuita per testing)

## Installazione

1. Clona il repository o scarica i file:
   ```bash
   cd app-palestra
   ```

2. Installa le dipendenze:
   ```bash
   pnpm install
   ```

3. Configura la chiave API Mistral:
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

## Testing con Dati Mock

Per testare l'app **senza utilizzare l'API Mistral** e senza compilare il form manualmente:

### Metodo 1: Bottone "Carica dati demo"
1. Avvia l'app con `pnpm dev`
2. Vai alla pagina del calendario (`/`)
3. Clicca sul bottone **"Carica dati demo"** in alto a destra
4. La pagina si ricaricherà automaticamente con i dati mock caricati

### Metodo 2: Importare direttamente nei componenti
Puoi importare e usare direttamente i dati mock nel tuo codice:
```javascript
import { 
  mockPalestraData, 
  mockSuggestions, 
  mockFullData, 
  loadMockData, 
  clearMockData 
} from './src/data/mockData'

// Carica i dati mock
loadMockData()

// Pulisce i dati mock
clearMockData()
```

### Struttura dei dati mock
I dati mock includono:
- **Configurazione base**: obiettivo (Massa Muscolare), livello (Intermedio), preferenze (Onnivoro), giorni di allenamento (Lunedì, Martedì, Giovedì, Venerdì), durata (75 minuti)
- **Routine di allenamento**: Schede dettagliate per ogni giorno con esercizi, serie e ripetizioni
- **Dieta**: Pasti completi con orari, descrizione, **grammature** e calorie per ogni giorno
- **Suggerimenti**: Consigli personalizzati per ogni giorno della settimana

### Esempio dati dieta:
```javascript
{
  ora: '07:30',
  cibo: '3 uova intere + 50g avena + 1 banana',
  calorie: '550',
  grammi: '400g'  // Nuovo campo!
}
```

### Esempio di utilizzo
Dopo aver caricato i dati mock, puoi:
- Navigare al calendario (`/`) per vedere i giorni di allenamento e pasti
- Cliccare su un giorno per vedere i dettagli di allenamento e dieta
- I dati verranno mantenuti in localStorage fino a quando non verranno cancellati

## Script Disponibili

| Script | Descrizione |
|--------|-------------|
| `pnpm dev` | Avvia il server di sviluppo |
| `pnpm build` | Crea la build di produzione |
| `pnpm preview` | Anteprima della build |
| `pnpm lint` | Esegue il linting con OXLint |

## Configurazione Iniziale

1. Avvia l'app con `pnpm dev`
2. Clicca su "Impostazioni" o naviga a `/settings`
3. Compila il form con:
   - **Obiettivo**: Dimagrimento, Massa Muscolare, Mantenimento, Forza, Resistenza
   - **Livello**: Principiante, Intermedio, Avanzato
   - **Preferenze Alimentari**: Onnivoro, Vegetariano, Vegano, Senza Glutine, Senza Lattosio
   - **Giorni di Allenamento**: Seleziona i giorni della settimana
   - **Durata Allenamento**: Minuti di allenamento per sessione
   - **Orari Pasti**: Orari e descrizione per ogni pasto
4. Salva la configurazione

## Chat con Bot AI

La funzionalità di chat ti permette di:
- **Descrivere situazioni impreviste**: "Oggi non posso allenarmi", "Ho mal di stomaco", "Ho più tempo"
- **Ricevere suggerimenti personalizzati**: Il bot AI analizza il tuo piano corrente e propone modifiche a dieta e routine
- **Visualizzare le modifiche strutturate**: Le risposte includono modifiche alla dieta (con grammature e calorie) e alla routine di allenamento

### Come usare la chat:
1. In qualsiasi pagina dell'app, clicca sul pulsante **💬** in basso a destra
2. Si aprirà il popup della chat
3. Descrivi la tua situazione nell'area di testo
4. Invia il messaggio (con il pulsante o premendo Enter)
5. Il bot risponderà con:
   - Una risposta in linguaggio naturale
   - **Anteprima delle modifiche** al tuo calendario (dieta con grammature e calorie, routine con esercizi)
   - Consigli aggiuntivi
6. **Conferma le modifiche**: Clicca su "✓ Applica modifiche" per salvare le modifiche suggerite
7. Il calendario verrà aggiornato automaticamente con le nuove modifiche

### Comandi Speciali per Ferie e Tracciamento:
La chat supporta comandi rapidi per gestire le ferie:

| Comando | Descrizione | Esempio |
|---------|-------------|---------|
| `/ferie` | Aggiunge un periodo di ferie | `/ferie 15-01 20-01` |
| `/ho mangiato` | Registra un pasto mangiato in vacanza | `/ho mangiato pizza margherita + birra` |
| `/ho fatto` | Registra un'attività eseguita in vacanza | `/ho fatto yoga 30 minuti` |
| `/piano rientro` | Genera piano di rientro post-vacanza | `/piano rientro` |

**Note:**
- I comandi `/ho mangiato` e `/ho fatto` registrano automaticamente in localStorage
- Il comando `/piano rientro` genera un piano di 7 giorni per recuperare dopo le ferie
- Tutti i dati vengono salvati e usati per personalizzare il piano di rientro

### Modifiche al Calendario tramite Chatbot

Il chatbot puo' modificare direttamente il calendario (dieta e routine) in base alle richieste dell'utente.

**Flusso:**
1. L'utente descrive la modifica desiderata (es: "Modifica la cena di domani con pasta al pomodoro")
2. Il chatbot analizza la richiesta e restituisce un oggetto JSON con:
   - `risposta`: spiegazione umana
   - `modifiche`: dati da applicare al calendario
   - `consigli`: consigli aggiuntivi
   - `comandi`: array di comandi da eseguire
3. L'utente clicca sul bottone **"Conferma"** nel popup della chat
4. Il sistema esegue automaticamente i comandi e applica le modifiche

**Esempi:**
- "Oggi non posso allenarmi, modificami la routine"
- "Voglio pasti piu' leggeri per domani"
- "Ho mal di stomaco, adattami la dieta"

**Documentazione completa:**
- I comandi disponibili sono documentati in `ISTRUZIONI.md`
- Le funzioni di eseguzione sono in `src/services/comandi.js`
- Il system prompt include l'invito a usare `ISTRUZIONI.md` per referenza

**Nota**: Per usare la chat con l'API Mistral, devi configurare la chiave API nel file `.env`. Senza la chiave, puoi comunque vedere l'interfaccia e testare con i dati mock caricati tramite "Carica dati demo" nel calendario.

**Nota per lo sviluppatore:**
- Il file `ISTRUZIONI.md` **deve essere allegato al system prompt** dell'AI
- Il system prompt in `src/services/mistral.js` include già l'invito a usare `ISTRUZIONI.md` come riferimento
- L'AI deve restituire risposte in formato JSON con i campi: `risposta`, `modifiche`, `consigli`, `comandi`, `refresh`

## Generazione Suggerimenti AI

I suggerimenti vengono generati automaticamente quando:
1. Salvi la configurazione in "Impostazioni"
2. L'app chiama l'API Mistral con i tuoi dati
3. I suggerimenti vengono salvati e visualizzati nel calendario

**Nota**: La generazione dei suggerimenti richiede una chiave API Mistral valida e con crediti sufficienti.

## Variabili d'Ambiente

| Variabile | Descrizione | Obbligatoria |
|-----------|-------------|--------------|
| `VITE_MISTRAL_API_KEY` | Chiave API per Mistral AI | Si |

## Accessibilita

L'app e progettata per essere accessibile:
- Navigazione da tastiera supportata
- Contrasto adeguato
- HTML semantico
- Label associate ai controlli dei form

## Responsive Design

L'app e ottimizzata per:
- Desktop
- Tablet
- Smartphone
