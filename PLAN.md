# PLAN - App Palestra (Versione Embrionale)

## Obiettivo
Ricreare l'applicazione web da zero mantenendo l'idea base (gestione dieta e routine di palestra) con una struttura minima pronta per future espansioni. Il bot AI sara sviluppato in modo diverso rispetto alla versione precedente.

## Stack Tecnologico
- **Framework**: React con Vite
- **Package Manager**: pnpm
- **Stile**: Bootstrap 5
- **Routing**: React Router 7
- **Linting**: OXLint
- **API Esterna**: Mistral AI (struttura pronta)
- **Variabili d'ambiente**: `.env`

## Struttura del Progetto
```
src/
    components/      # Componenti React riutilizzabili
    layouts/         # Layout dell'applicazione
        MainLayout.jsx
    data/            # Dati statici e mock
        mockData.js
    services/        # Funzioni per API Mistral
        mistral.js
    contexts/        # Context React
        AuthContext.jsx
    pages/           # Pagine principali
        Home.jsx
    assets/          # Risorse statiche
        styles/
```

---

## Milestone

### Milestone 1: Scaffolding e Configurazione Iniziale
- [x] Creare struttura cartelle (components/, layouts/, pages/, services/, data/, contexts/, assets/)
- [x] Configurare pnpm, Bootstrap, React Router, OXLint
- [x] Creare file base (main.jsx, App.jsx, index.html)
- [x] Configurare `.env` e `.gitignore`
- [x] Configurare script in package.json
- [x] Configurare Bootstrap in main.jsx
- [x] Configurare React Router in App.jsx
- [x] Creare MainLayout con navbar
- [x] Verificare OXLint e build

### Milestone 2: Pagina Principale - Calendario
- [x] Creare pagina Home con calendario mensile
- [x] Implementare navigazione tra mesi (precedente/successivo)
- [x] Mostrare griglia 7xN con tutti i giorni del mese
- [x] Evidenziare giorno corrente (sfondo blu)
- [x] Mostrare indicatori visivi (🏋️ allenamento, 🍽️ pasti)
- [x] Caricare dati mock da localStorage
- [x] Gestire dati di esempio (mockData.js)
- [x] Verificare responsive design

### Milestone 3: Struttura Base per Future Espansioni
- [x] Creare AuthContext (struttura base per autenticazione)
- [x] Creare mistral.js (struttura base per API AI)
- [x] Mantenere struttura cartelle per componenti e servizi
- [x] Documentare prossimi passi in README.md

---

## Struttura Attuale

### Cosa e' stato mantenuto:
- Scaffolding React con Vite
- Bootstrap per styling
- React Router per navigazione
- OXLint per linting
- Struttura cartelle completa
- Calendario mensile funzionale
- Dati mock per testing
- Contesto autenticazione (struttura base)
- Servizio Mistral (struttura base)

### Cosa e' stato rimosso:
- ChatPopup e logica bot AI
- VacationTracker
- DayDetails page
- Settings page
- Comandi AI (comandi.js)
- ISTRUZIONI.md
- Login page
- Tutte le funzionalita avanzate (ferie, tracciamento, piano rientro)

---

## Prossimi Passi

### Priorita Alta:
1. Aggiungere pagina DayDetails per visualizzare dettagli del giorno

### Priorita Media:
1. Implementare interfaccia chatbot per interazione con Mistral AI
2. Creare system prompt personalizzato per il bot
3. Aggiungere logica per generazione dieta e routine

### Priorita Bassa:
1. Gestione ferie
2. Tracciamento attivita
3. Piano di rientro post-vacanza
4. Notifiche e animazioni avanzate

---

## Note per lo Sviluppo del Bot

Il bot AI sara sviluppato in modo diverso rispetto alla versione precedente:
- Approccio piu' semplice e modulare
- Separazione netta tra logica AI e interfaccia
- Comandi strutturati e facili da mantenere
- Integrazione graduale con l'API Mistral

## Milestone 4: Sezione Impostazioni e Schede
- [x] Creare SettingsContext per gestire dati impostazioni e schede
- [x] Aggiornare MainLayout con link a Settings, WorkoutPlan, NutritionPlan
- [x] Creare pagina Settings con form per dati base
- [x] Creare pagina WorkoutPlan con form per scheda allenamento
- [x] Creare pagina NutritionPlan con form per scheda nutrizionale
- [x] Aggiornare App.jsx con nuove route
- [x] Aggiornare Home.jsx per usare SettingsContext
- [x] Verificare salvataggio in localStorage
- [x] Verificare OXLint e build

## Milestone 5: Gestione File per Schede
- [x] Aggiungere gestione file a SettingsContext (addWorkoutFile, removeWorkoutFile, addNutritionFile, removeNutritionFile)
- [x] Aggiungere sezione file a WorkoutPlan con upload, download, eliminazione
- [x] Aggiungere sezione file a NutritionPlan con upload, download, eliminazione
- [x] Struttura dati AI-friendly con metadata per futuri bot AI
- [x] Gestione Base64 per file fino a 4MB
- [x] Icone specifiche per tipo di file (PDF, immagini, ecc.)
- [x] Aggiungere modal di anteprima file per WorkoutPlan
- [x] Aggiungere modal di anteprima file per NutritionPlan
- [x] Visualizzazione immagini, PDF e file testuali nella modal
- [x] Pulsante "Visualizza" per file previewable
- [x] Verificare OXLint: 0 warnings, 0 errors
- [x] Verificare build: success

---

## Changelog Giornaliero

### 2025-10-29
- [x] Sostituite voci di navigazione in testata con menù a tendina responsive
- [x] Implementazione API Mistral in services/mistral.js
- [x] Aggiunti .env e .env.example per configurazione chiave API
- [x] Predisposto routing delle risposte con ACTION_TYPES e AVAILABLE_PAGES
- [x] Aggiunte funzioni: callMistralApi, parseBotResponse, chatWithMistral, generateSuggestions, executeBotCommand
- [x] Creato componente ChatBot in components/ChatBot.jsx
- [x] Integrazione ChatBot in MainLayout con pulsante e modal
- [x] Aggiunte funzionalità: navigazione, modifiche dati tramite bot
- [x] Rimosso pulsante cestino dal modal ChatBot
- [x] Creato componente ChatHistoryModal in components/ChatHistoryModal.jsx
- [x] Aggiunta voce "Storico Chat" nel menù (solo desktop, d-none d-lg-inline)
- [x] ChatBot salva automaticamente le conversazioni in localStorage
- [x] ChatHistoryModal permette di visualizzare e leggere le chat storiche
- [x] Semplificato MainLayout: voci menu dirette (non più dropdown personalizzato)
- [x] Bootstrap navbar-collapse gestisce automaticamente la visualizzazione mobile
- [x] Verificato OXLint: 0 errors (1 warning ottimizzazione)
- [x] Verificato build: success

### 2025-10-28
- [x] Creazione SettingsContext
- [x] Aggiornamento MainLayout e App.jsx
- [x] Creazione pagine Settings, WorkoutPlan, NutritionPlan
- [x] Aggiornamento Home.jsx per usare SettingsContext
- [x] Aggiunta gestione file con upload Base64
- [x] Aggiunta sezione file a WorkoutPlan e NutritionPlan
- [x] Struttura dati AI-friendly per futuri bot
- [x] Aggiunta modal di anteprima per visualizzazione file
- [x] Visualizzazione immagini, PDF, file testuali nella pagina
- [x] Verifica OXLint: 0 warnings, 0 errors
- [x] Verifica build: success

### 2026-08-26
- [x] Ricreato progetto da zero con versione embrionale
- [x] Mantenuta solo pagina Home con calendario base
- [x] Struttura cartelle e file pronta per espansioni
- [x] Aggiornati README.md e PLAN.md
- [x] Verificato OXLint: 0 warnings, 0 errors
- [x] Verificato build: success

### 2025-10-28
- [x] Creazione SettingsContext
- [x] Aggiornamento MainLayout e App.jsx
- [x] Creazione pagine Settings, WorkoutPlan, NutritionPlan
- [x] Aggiornamento Home.jsx per usare SettingsContext
- [x] Aggiunta gestione file con upload Base64
- [x] Aggiunta sezione file a WorkoutPlan e NutritionPlan
- [x] Struttura dati AI-friendly per futuri bot
- [x] Aggiunta modal di anteprima per visualizzazione file
- [x] Visualizzazione immagini, PDF, file testuali nella pagina
- [x] Verifica OXLint: 0 warnings, 0 errors
- [x] Verifica build: success
