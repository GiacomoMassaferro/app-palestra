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
1. Creare pagina Settings con form di configurazione
2. Salvare configurazione in localStorage
3. Aggiungere pagina DayDetails per visualizzare dettagli del giorno
4. Implementare navigazione tra pagine

### Priorita Media:
1. Implementare integrazione API Mistral per suggerimenti
2. Aggiungere logica per generazione dieta e routine
3. Implementare chatbot base per interazione utente

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

## Changelog Giornaliero

### 2026-08-26
- [x] Ricreato progetto da zero con versione embrionale
- [x] Mantenuta solo pagina Home con calendario base
- [x] Struttura cartelle e file pronta per espansioni
- [x] Aggiornati README.md e PLAN.md
- [x] Verificato OXLint: 0 warnings, 0 errors
- [x] Verificato build: success
