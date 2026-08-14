# PLAN - App Palestra con AI Mistral

## Obiettivo
Sviluppare un'applicazione web che permetta agli utenti di gestire dieta e routine di palestra attraverso un'AI (Mistral). L'app deve fornire:
- Calendario con suggerimenti per pasti e allenamenti
- Gestione giorni di allenamento, schede e durata
- Orari consigliati per i pasti in funzione degli allenamenti
- Interazione con API Mistral per generare suggerimenti personalizzati

---

## Stack Tecnologico
- **Framework**: React con Vite
- **Package Manager**: pnpm
- **Stile**: Bootstrap (ultima versione)
- **Routing**: React Router
- **Linting**: OXLint
- **API Esterna**: Mistral AI
- **Variabili d'ambiente**: `.env` (esclusa da Git via `.gitignore`)

---

## Struttura del Progetto
```
src/
    components/      # Componenti React riutilizzabili
    layouts/         # Layout dell'applicazione
    data/            # Dati statici e mock
    services/        # Funzioni per API Mistral
    contexts/        # Context React (se necessario)
    pages/           # Pagine principali
        Home.jsx     # Calendario con sunto attivita
        DayDetails.jsx # Dettagli del giorno (allenamento, dieta)
        Settings.jsx # Impostazioni e form di configurazione
    assets/          # Risorse statiche
```

---

## Milestone

### Milestone 1: Scaffolding e Configurazione Iniziale
- [x] Creare progetto React con Vite
- [x] Configurare pnpm, Bootstrap, React Router, OXLint
- [x] Creare struttura cartelle (`components/`, `layouts/`, `pages/`, `services/`, `data/`, `contexts/`, `assets/`)
- [x] Configurare `.env` e `.gitignore`
- [x] Configurare script in `package.json` (dev, build, lint)
- [x] Creare `README.md` con istruzioni
- [x] Configurare Bootstrap in main.jsx
- [x] Configurare React Router in App.jsx
- [x] Creare pagine base (Home, DayDetails, Settings)
- [x] Creare servizio Mistral (services/mistral.js)

### Milestone 2: Pagine e Routing
- [x] Creare layout principale con React Router
- [x] Creare pagina `Home` con calendario (sunto attivita)
- [x] Creare pagina `DayDetails` per dettagli del giorno
- [x] Creare pagina `Settings` con form per configurazione iniziale
- [x] Configurare navigazione tra pagine

### Milestone 3: Form di Configurazione
- [x] Creare form in `Settings.jsx` con campi:
    - [x] Obiettivo (dimagrimento, massa, mantenimento, ecc.)
    - [x] Livello (principiante, intermedio, avanzato)
    - [x] Preferenze alimentari (vegetariano, vegano, onnivoro, ecc.)
    - [x] Giorni di allenamento (selezionabili)
    - [x] Durata allenamento (ore/minuti)
    - [x] Orari pasti (colazione, pranzo, cena, spuntini)
- [x] Gestire stato locale del form con `useState`
- [x] Validare input e mostrare errori
- [x] Salvare configurazione in `localStorage`

### Milestone 4: Integrazione API Mistral
- [x] Creare file `services/mistral.js` per chiamate API
- [x] Definire template prompt per Mistral (con placeholder per dati del form)
- [x] Implementare funzione `generateSuggestions(data)` che:
    - [x] Costruisce il prompt con i dati del form
    - [x] Chiama API Mistral con chiave da `.env`
    - [x] Gestisce loading, errore e successo
    - [x] Parsa la risposta in formato strutturato (dieta, routine, calendario)
- [x] Salvare suggerimenti generati in `localStorage`
- [ ] Integrare generazione suggerimenti nel flusso utente (richiede chiave API da fornire)

### Milestone 5: Calendario e Dettagli Giorno
- [x] Creare componente `Calendar` in `Home.jsx`
- [x] Mostrare sunto attivita per ogni giorno (allenamento, pasti)
- [x] Implementare navigazione al click sul giorno verso `DayDetails.jsx`
- [x] Creare pagina `DayDetails.jsx` con:
    - [x] Dettagli allenamento (scheda, durata)
    - [x] Dettagli dieta (pasti, orari, suggerimenti)
    - [x] Suggerimenti AI per quel giorno
- [x] Gestire dati dinamici dal `localStorage`

### Milestone 6: Stile e UX
- [x] Applicare Bootstrap per layout responsive
- [x] Stilizzare calendario e dettagli giorno
- [x] Aggiungere stati visivi (loading, errore, successo)
- [x] Ottimizzare UX per mobile e desktop

### Milestone 7: Testing e Validazione
- [x] Verificare funzionamento form e salvataggio dati
- [ ] Testare integrazione API Mistral (con chiave fornita dall'utente)
- [x] Validare navigazione tra pagine
- [x] Eseguire OXLint e correggere errori
- [x] Eseguire build e verificare assenza di errori
- [x] Creare dati mock in `src/data/mockData.js` per testing senza API

### Milestone 8: Documentazione Finale
- [x] Aggiornare `README.md` con:
    - [x] Istruzioni per configurare `.env` con chiave Mistral
    - [x] Istruzioni per avviare l'app
    - [x] Istruzioni per eseguire lint e build
    - [x] Descrizione funzionalita
- [x] Aggiornare `PLAN.md` con stato finale

### Milestone 9: Chat con Bot AI per Modifiche al Piano
- [x] Creare funzione `chatWithMistral(message, context)` in `services/mistral.js`
- [x] Aggiungere prompt specifico per modifiche al piano (dieta/routine)
- [x] Creare componente `ChatPopup.jsx` con interfaccia di chat
- [x] Aggiungere pulsante fixed per aprire il popup in `MainLayout.jsx`
- [x] Integrare invio messaggi e visualizzazione risposte
- [x] Gestire stato loading durante chiamate API
- [x] Rimuovere route `/chat` e pagina `Chat.jsx`
- [x] **Aggiungere funzionalità Applica Modifiche**: anteprima + conferma per riscrivere piano settimanale
- [x] Aggiunto pulsante "Applica modifiche" con anteprima delle modifiche
- [x] Funzione `applyModifiche` per salvare in localStorage
- [x] Notifiche di successo/errore dopo l'applicazione
- [x] Aggiornare README.md con istruzioni popup
- [x] Verificare OXLint e build (tutto OK)

---

# Changelog Giornaliero

## 2025-08-13
- [x] Creazione dati mock in `src/data/mockData.js`
- [x] Aggiornamento `DayDetails.jsx` per usare suggerimenti da localStorage
- [x] Aggiornamento `Home.jsx` per usare suggerimenti da localStorage
- [x] Aggiunto bottone "Carica dati demo" in Home.jsx
- [x] Installazione Bootstrap Icons
- [x] Creazione layout principale con navbar e footer in `src/layouts/MainLayout.jsx`
- [x] Ridisegnato `Home.jsx` con calendario moderno, card colorate, icone e suggerimenti
- [x] Rimosso badge "Allenamento" dai giorni del calendario
- [x] Ridisegnato `DayDetails.jsx` con tab, design moderno, progress bar calorie
- [x] Ridisegnato `Settings.jsx` con progress bar, card, icone e selezioni visive
- [x] Creato `src/assets/styles/global.css` con stili personalizzati
- [x] Aggiunte grammature a tutti i pasti in mockData.js
- [x] Aggiornato DayDetails.jsx per visualizzare grammature per pasto e totale
- [x] Sostituito icone Bootstrap con emoji in Home.jsx per evitare caratteri strani
- [x] Aggiornamento PLAN.md e README.md con istruzioni testing
- [x] Verifica OXLint e build

## 2025-08-14
- [x] Aggiunta funzione `chatWithMistral` in `services/mistral.js` per chat con bot AI
- [x] Creazione componente `ChatPopup.jsx` con interfaccia di messaggistica
- [x] Aggiunto pulsante fixed per aprire il popup in `MainLayout.jsx`
- [x] Rimossa route `/chat` e pagina `Chat.jsx`
- [x] Integrazione completa chat popup con API Mistral
- [x] Aggiunta funzionalità "Applica modifiche" con anteprima e conferma
- [x] Salvataggio modifiche in localStorage per aggiornare calendario

## 2025-01-17
- [x] Calendario mensile completo con navigazione tra mesi
- [x] Griglia 7xN con tutti i giorni del mese
- [x] Evidenziazione giorno corrente in blu
- [x] Indicatori 🏋️ per allenamento e 🍽️ per pasti
- [x] Tooltip con dettagli al hover su ogni giorno
- [x] Aggiunta sezione "Prossima attivita" sotto calendario
- [x] Logica per determinare prossima attivita (pasto o allenamento) in base all'ora corrente
- [x] Visualizzazione consigli IA/ricette per prossima attivita
- [x] Struttura dati ferie in mockData.js e localStorage
- [x] Sezione gestione ferie in Settings.jsx
- [x] Visualizzazione giorni ferie (🏖️) nel calendario
- [x] Componente VacationTracker per tracciare attività e pasti
- [x] Comandi chat AI: /ferie, /ho mangiato, /ho fatto, /piano rientro
- [x] Generazione piano vacanza e rientro automatica
- [x] Verifica OXLint e build

## 2025-06-25
- [x] Creazione PLAN.md
- [x] Configurazione iniziale progetto (Vite, React)
- [x] Installazione Bootstrap e React Router
- [x] Creazione struttura cartelle
- [x] Configurazione `.env` e `.gitignore`
- [x] Configurazione script in `package.json`
- [x] Configurazione Bootstrap in main.jsx
- [x] Configurazione React Router in App.jsx
- [x] Creazione pagine base (Home, DayDetails, Settings)
- [x] Creazione servizio Mistral (services/mistral.js)
- [x] Integrazione API Mistral in Settings.jsx (da completare con chiave API)
- [x] Correzione warning OXLint
- [x] Test e validazione (OXLint, build)
- [x] Creazione README.md

## 2025-06-24
- [x] Scaffolding e configurazione iniziale

## 2025-10-28
- [x] Aggiunta sezione "Oggi è [Giorno, data completa]" in cima alla pagina Home
- [x] Implementate funzioni per generare suggerimenti di ricetta in base al tipo di pasto
- [x] Implementate funzioni per generare consigli su cosa portare in base al tipo di allenamento
- [x] Aggiunto suggerimento IA specifico per ricette nella visualizzazione pasti
- [x] Aggiunto consiglio IA specifico su cosa portare per allenamento
- [x] Verificata assenza di scrollbar orizzontale nel calendario
- [x] Eseguito OXLint e build con successo
- [x] **Rimosso dati mock per ferie**: eliminati mockVacationData, mockVacationActivities, mockReturnPlan
- [x] **Aggiornata loadMockData()**: ora carica solo dati base senza ferie
- [x] **Aggiornato Home.jsx**: usa loadMockData() invece di loadFullMockDataWithVacation()
- [x] Verifica OXLint e build dopo modifiche
- [x] **Risolto errore JSON in mistral.js**: sostituiti caratteri speciali italiani (à, è, ì) con versioni ASCII
- [x] **Risolto errore JSON in ChatPopup.jsx**: sostituito carattere 'à' in "applicate" con 'a'
- [x] **Aggiunta funzione cleanJsonString()** in mistral.js per pulire caratteri di controllo e formattazione markdown
- [x] **Aggiunta funzione safeJsonParse()** per parsing robusto con fallback
- [x] **Aggiunta response_format: { type: 'json_object' }** per forzare JSON valido da API
- [x] **Aumentato max_tokens a 8192** per evitare troncamento
- [x] **Aggiunte istruzioni anti-markdown** nei prompt
- [x] **Tutte le funzioni restituiscono oggetti** invece di lanciare errori
- [x] **Risolto TypeError in ChatPopup.jsx**: aggiunto controllo dati.pasti && prima di Object.entries()
- [x] **Risolto TypeError in ChatPopup.jsx:331**: gestione consigli come oggetti o stringhe
- [x] **Migliorata chatWithMistral()**: riconoscimento comandi in linguaggio naturale
- [x] Supporto per "voglio ferie dal 14 al 25 agosto", "ho mangiato pizza", "ho fatto yoga"
- [x] Supporto per formati multipli: GG-MM, nomi mesi, con/senza anno
- [x] Verifica finale OXLint e build

## 2025-12-28
- [x] **Risolti errori JSON persistenti in mistral.js**: 
  - Migliorata funzione cleanJsonString() con sostituzione caratteri speciali italiani (à, è, ì, ò, ù, etc.)
  - Migliorata funzione safeJsonParse() con controlli più robusti su stringhe vuote e oggetti non validi
  - Aggiunto commento // eslint-disable-next-line no-control-regex per regex che rimuove caratteri di controllo
- [x] **Fixato salvataggio ferie in chatWithMistral()**: 
  - Rimossa dipendenza da API Mistral per comandi di ferie
  - Generazione diretta della risposta senza chiamare l'API
  - Salvataggio corretto in localStorage con merge dei periodi esistenti
  - Rimosso setTimeout per reload automatico (ora gestito dal frontend)
- [x] **Fixati errori in ChatPopup.jsx**:
  - Aggiunto controllo Object.keys(msg.modifiche).length > 0 prima di renderizzare modifiche
  - Gestione robusta di consigli che sono oggetti (estrazione di consiglio.text o consiglio.risposta)
  - Fixato pulsante "Applica modifiche" per mostrare solo quando ci sono modifiche
  - Aggiunto controllo if (!modifiche) in applyModifiche()
  - Fixato pasti.pasti && in applyModifiche()
- [x] **Fixato Home.jsx**:
  - Aggiunto stato vacationActivities e caricamento da localStorage
  - Passato vacationActivities a VacationTracker
- [x] **Fixato VacationTracker.jsx**:
  - Rimosso import inutilizzato useEffect
  - Rimossa funzione non usata getActivitiesForDate
  - Aggiunte funzioni getMealsForDate() e getWorkoutsForDate()
  - Aggiunta visualizzazione pasti e attivita registrate
- [x] **Fixati comandi chat AI in mistral.js**:
  - Aggiunto supporto per "sarò in ferie" e "piano di rientro"
  - Migliorato riconoscimento formati data (GG-MM, nomi mesi, etc.)
  - Aggiunto try-catch per /ho mangiato e /ho fatto
  - Fixato context?.data?.obiettivo per evitare errori
- [x] Verifica OXLint: 0 warnings, 0 errors
- [x] Verifica build: success

---

### Milestone 10: Calendario Mensile Completo
- [x] Sostituire calendario settimanale con calendario mensile completo
- [x] Aggiungere navigazione tra mesi (precedente/successivo)
- [x] Mostrare tutti i giorni del mese in griglia 7xN
- [x] Evidenziare il giorno corrente nel calendario
- [x] Mostrare indicatori visivi per giorni con allenamento (🏋️) e/o pasti (🍽️)
- [x] Mantenere tooltip con dettagli allenamento/pasti al hover
- [x] Aggiungere sezione "Prossima attivita" sotto il calendario
- [x] Implementare logica per determinare prossima attivita (pasto o allenamento) in base all'ora corrente
- [x] Mostrare consigli IA per allenamento o suggerimento ricetta per pasto
- [x] Verificare responsive design del nuovo layout
- [x] Eseguire OXLint e build

### Milestone 11: Gestione Ferie e Piano Adattato
- [x] Aggiungere struttura dati per periodi ferie in localStorage
- [x] Creare sezione in Settings.jsx per impostare date inizio/fine ferie
- [x] Visualizzare giorni di ferie nel calendario con sfondo arancione (🏖️)
- [x] Generazione automatica piano vacanza con esercizi leggeri e dieta flessibile
- [x] Creare componente VacationTracker per tracciare attività e pasti mangiati
- [x] Salvataggio attività/pasti in localStorage
- [x] Integrare chat AI con comandi: /ferie, /ho mangiato, /ho fatto, /piano rientro
- [x] Generazione piano di rientro post-vacanza basato su attività eseguite e sgarri
- [x] Aggiornare mistral.js con gestione comandi ferie
- [x] Verificare OXLint e build

---

## Note Finali

### Cosa e stato completato:
- [x] Progetto React con Vite configurato
- [x] Stack tecnologico completo (Bootstrap, React Router, OXLint)
- [x] Struttura cartelle e file organizzata
- [x] Pagine principali create (Home, DayDetails, Settings)
- [x] Form di configurazione funzionale con salvataggio in localStorage
- [x] Calendario interattivo con navigazione ai dettagli
- [x] Servizio Mistral pronto per l'integrazione
- [x] Bootstrap applicato per styling responsive
- [x] Documentazione completa (README.md, PLAN.md)
- [x] Lint e build verificati

### Cosa richiede la chiave API:
- [ ] L'integrazione completa con Mistral richiede che l'utente fornisca la chiave API nel file `.env`
- [ ] Una volta fornita la chiave, e possibile chiamare `generateSuggestions(data)` da `Settings.jsx` per generare suggerimenti personalizzati
- [ ] I suggerimenti verranno salvati in `localStorage` e visualizzati nel calendario

### Come integrare l'API Mistral:
1. Aggiungi la chiave API nel file `.env`: `VITE_MISTRAL_API_KEY=la_tua_chiave`
2. In `Settings.jsx`, importa `generateSuggestions` da `../services/mistral.js`
3. Chiama la funzione nell'event handler `handleSubmit` dopo aver salvato i dati in localStorage:
   ```javascript
   const suggestions = await generateSuggestions(formData)
   saveSuggestions(suggestions)
   ```
4. Aggiorna le pagine per visualizzare i suggerimenti generati

### Prossimi passi consigliati:
1. Fornire la chiave API Mistral nel file `.env`
2. Testare l'integrazione con Mistral
3. Eventualmente estendere le funzionalita con:
   - Autenticazione utente
   - Salvataggio su backend
   - Esportazione/importazione dati
   - Notifiche push
