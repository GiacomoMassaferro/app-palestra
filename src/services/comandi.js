/**
 * File: comandi.js
 * Descrizione: Contiene tutti i comandi disponibili per il chatbot per modificare il calendario,
 *             dieta, routine e gestione delle ferie.
 * 
 * Questo file viene usato dal chatbot per eseguire le modifiche richieste dall'utente.
 * Ogni funzione restituisce un oggetto con:
 * - successo: boolean (true/false)
 * - messaggio: string (descrizione del risultato)
 * - dati: object (dati modificati o generati)
 * - refresh: boolean (se e' necessario ricaricare la pagina)
 */

/**
 * Salva i dati modificati in localStorage
 */
function salvaDati(chiave, dati) {
    try {
        localStorage.setItem(chiave, JSON.stringify(dati))
        return true
    } catch (e) {
        console.error(`[comandi.js] Errore salvataggio ${chiave}:`, e)
        return false
    }
}
/**
 * Carica i dati da localStorage
 */
function caricaDati(chiave, defaultValue = null) {
    try {
        const dati = localStorage.getItem(chiave)
        return dati ? JSON.parse(dati) : defaultValue
    } catch (e) {
        console.error(`[comandi.js] Errore caricamento ${chiave}:`, e)
        return defaultValue
    }
}
/**
 * Data locale YYYY-MM-DD senza shift UTC (fix 2026-09-05: toISOString spostava al giorno prima con CEST)
 */
function dataLocale(d = new Date()) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const giorno = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${giorno}`
}
/**
 * Normalizza nome giorno a canonico senza accenti (fix 2026-09-05: Home usa Lunedi con accento, AI/comandi senza)
 * Lunedi/Lunedì -> Lunedi, Martedi/Martedì -> Martedi, ecc.
 */
function normalizzaGiorno(giorno) {
    if (!giorno || typeof giorno !== 'string') return giorno
    const mappa = {
        lunedi: 'Lunedi', martedi: 'Martedi', mercoledi: 'Mercoledi', giovedi: 'Giovedi',
        venerdi: 'Venerdi', sabato: 'Sabato', domenica: 'Domenica'
    }
    const chiave = giorno.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
    return mappa[chiave] || giorno
}

// ============================================
// COMANDI FERIE
// ============================================

/**
 * Parsa date nel formato GG-MM o GG/MM o GG MM in YYYY-MM-DD
 * @param {string} dateStr - Data nel formato GG-MM, GG/MM, GG MM, o YYYY-MM-DD
 * @param {number} year - Anno da usare se non specificato (default: anno corrente)
 * @returns {string} Data in formato YYYY-MM-DD
 */
function parseDate(dateStr, year = new Date().getFullYear()) {
    if (!dateStr) return null
    
    // Se già in formato YYYY-MM-DD, restituisci così com'è
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // Valida la data
        const date = new Date(dateStr)
        if (!isNaN(date.getTime())) {
            return dateStr
        }
        return null
    }
    
    // Rimuovi spazi e sostituisci / con -
    const cleaned = dateStr.trim().replace(/\/|\s+/g, '-')
    
    // Formato GG-MM
    const match = cleaned.match(/^(\d{1,2})-(\d{1,2})$/)
    if (match) {
        const day = match[1].padStart(2, '0')
        const month = match[2].padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        // Valida che la data sia valida
        const date = new Date(dateStr)
        if (!isNaN(date.getTime()) && 
            date.getDate() == parseInt(day) && 
            date.getMonth() + 1 == parseInt(month)) {
            return dateStr
        }
        return null
    }
    
    // Formato GG-MM-YYYY o GG-MM-YY
    const matchFull = cleaned.match(/^(\d{1,2})-(\d{1,2})-(?:(\d{2})|(\d{4}))$/)
    if (matchFull) {
        const day = matchFull[1].padStart(2, '0')
        const month = matchFull[2].padStart(2, '0')
        const fullYear = matchFull[4] || (matchFull[3] ? `20${matchFull[3]}` : String(year))
        const dateStr = `${fullYear}-${month}-${day}`
        // Valida la data
        const date = new Date(dateStr)
        if (!isNaN(date.getTime()) && 
            date.getDate() == parseInt(day) && 
            date.getMonth() + 1 == parseInt(month) &&
            date.getFullYear() == parseInt(fullYear)) {
            return dateStr
        }
        return null
    }
    
    return null
}

/**
 * Parsa un range di date da stringa
 * Formati supportati:
 * - "GG-MM GG-MM" (es: "15-09 20-09")
 * - "GG/MM GG/MM" (es: "15/09 20/09")
 * - "GG MM GG MM" (es: "15 09 20 09")
 * - "GG-MM-YYYY GG-MM-YYYY" (es: "15-09-2026 20-09-2026")
 * @param {string} dateRange - Stringa con il range di date
 * @returns {object|null} Oggetto con startDate e endDate in formato YYYY-MM-DD
 */
function parseDateRange(dateRange) {
    if (!dateRange) return null
    
    const year = new Date().getFullYear()
    
    // Prova formato "GG-MM GG-MM" o "GG/MM GG/MM"
    const match1 = dateRange.match(/^(\d{1,2}[-/]\d{1,2})\s+(\d{1,2}[-/]\d{1,2})$/)
    if (match1) {
        const start = parseDate(match1[1], year)
        const end = parseDate(match1[2], year)
        if (start && end) return { startDate: start, endDate: end }
    }
    
    // Prova formato "GG MM GG MM"
    const parts = dateRange.split(/\s+/).filter(Boolean)
    if (parts.length === 4) {
        const start = parseDate(`${parts[0]}-${parts[1]}`, year)
        const end = parseDate(`${parts[2]}-${parts[3]}`, year)
        if (start && end) return { startDate: start, endDate: end }
    }
    
    // Prova formato "GG-MM-YYYY GG-MM-YYYY"
    const match2 = dateRange.match(/^(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\s+(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})$/)
    if (match2) {
        const start = parseDate(match2[1])
        const end = parseDate(match2[2])
        if (start && end) return { startDate: start, endDate: end }
    }
    
    return null
}

/**
 * Aggiunge un periodo di ferie
 * @param {string} startDate - Data inizio nel formato YYYY-MM-DD
 * @param {string} endDate - Data fine nel formato YYYY-MM-DD
 * @returns {object} Risultato dell'operazione
 */
export function aggiungiFerie(startDate, endDate) {
    try {
        // Validazione date
        if (!startDate || !endDate) {
            return {
                successo: false,
                messaggio: "Le date di inizio e fine ferie sono obbligatorie",
                dati: null,
                refresh: false
            }
        }

        // Parsa le date se non sono in formato YYYY-MM-DD
        const normalizedStart = parseDate(startDate) || startDate
        const normalizedEnd = parseDate(endDate) || endDate

        const start = new Date(normalizedStart)
        const end = new Date(normalizedEnd)

        if (start > end) {
            return {
                successo: false,
                messaggio: "La data di inizio deve essere prima della data di fine",
                dati: null,
                refresh: false
            }
        }

        // Carica ferie esistenti
        let existingVacation = caricaDati('palestra_vacation', { vacationPeriods: [], vacationSuggestions: {} })

        // Assicurati che la struttura sia valida
        if (!existingVacation || !Array.isArray(existingVacation.vacationPeriods)) {
            existingVacation = { vacationPeriods: [], vacationSuggestions: {} }
        }

        // Crea nuovo periodo di ferie
        // NOTA 2026-09-05: salva date normalizzate YYYY-MM-DD e mergia suggerimenti esistenti
        const newVacationPeriod = {
            id: `vac-${Date.now()}`,
            startDate: normalizedStart,
            endDate: normalizedEnd,
            confirmed: true,
            autoGenerated: false
        }

        // Aggiungi il nuovo periodo senza perdere i precedenti
        const newSuggestions = generazioneSuggerimentiVacanza(normalizedStart, normalizedEnd)
        const updatedVacation = {
            vacationPeriods: [...existingVacation.vacationPeriods, newVacationPeriod],
            vacationSuggestions: { ...(existingVacation.vacationSuggestions || {}), ...newSuggestions }
        }

        // Salva
        if (salvaDati('palestra_vacation', updatedVacation)) {
            return {
                successo: true,
                messaggio: `Ferie aggiunte: dal ${normalizedStart} al ${normalizedEnd}`,
                dati: updatedVacation,
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio delle ferie",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nell'aggiunta delle ferie: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Rimuove un periodo di ferie
 * @param {string} vacationId - ID del periodo di ferie da rimuovere
 * @returns {object} Risultato dell'operazione
 */
export function rimuoviFerie(vacationId) {
    try {
        let existingVacation = caricaDati('palestra_vacation', { vacationPeriods: [], vacationSuggestions: {} })

        if (!existingVacation || !Array.isArray(existingVacation.vacationPeriods)) {
            existingVacation = { vacationPeriods: [], vacationSuggestions: {} }
        }

        const updatedVacation = {
            vacationPeriods: existingVacation.vacationPeriods.filter(v => v.id !== vacationId),
            vacationSuggestions: existingVacation.vacationSuggestions
        }

        if (salvaDati('palestra_vacation', updatedVacation)) {
            return {
                successo: true,
                messaggio: `Ferie con ID ${vacationId} rimosse`,
                dati: updatedVacation,
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nella rimozione delle ferie: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Genera suggerimenti per il periodo di vacanza
 * @param {string} startDate - Data inizio
 * @param {string} endDate - Data fine
 * @returns {object} Suggerimenti generati
 */
function generazioneSuggerimentiVacanza(startDate, endDate) {
    const suggestions = {}
    const start = new Date(startDate + 'T12:00:00')
    const end = new Date(endDate + 'T12:00:00')

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = dataLocale(d)
        suggestions[dateStr] = {
            workout: {
                type: 'light',
                name: 'Attivita leggera',
                exercises: [
                    'Camminata 30-45 minuti',
                    'Stretching 10 minuti',
                    'Nuoto o bicicletta',
                    'Yoga 15 minuti'
                ],
                tips: 'Mantieni il movimento senza stress'
            },
            diet: {
                type: 'flexible',
                tips: '60% proteine/verdure, 30% carboidrati, 10% dolci',
                baseCalories: 1800
            }
        }
    }
    return suggestions
}

// ============================================
// COMANDI PASTI E ATTIVITA
// ============================================

/**
 * Registra un pasto mangiato (cheat meal)
 * @param {string} description - Descrizione del pasto
 * @param {string} date - Data nel formato YYYY-MM-DD (opzionale, default oggi)
 * @param {number} calories - Calorie (opzionale)
 * @returns {object} Risultato dell'operazione
 */
export function registraPasto(description, date = null, calories = null) {
    try {
        if (!description || !description.trim()) {
            return {
                successo: false,
                messaggio: "La descrizione del pasto e' obbligatoria",
                dati: null,
                refresh: false
            }
        }

        const mealDate = date || dataLocale(new Date())

        const meal = {
            id: `meal-${Date.now()}`,
            date: mealDate,
            description: description.trim(),
            isCheatMeal: true,
            calories: calories || null,
            done: true
        }

        const activities = caricaDati('palestra_vacation_activities', [])
        const updatedActivities = [...activities, meal]

        if (salvaDati('palestra_vacation_activities', updatedActivities)) {
            return {
                successo: true,
                messaggio: `Pasto registrato: "${description.trim()}"${calories ? ` (${calories} kcal)` : ''}`,
                dati: { meal, activities: updatedActivities },
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio del pasto",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nella registrazione del pasto: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Registra un'attivita' eseguita
 * @param {string} description - Descrizione dell'attivita'
 * @param {string} date - Data nel formato YYYY-MM-DD (opzionale, default oggi)
 * @param {string} type - Tipo di attivita' (opzionale, default 'workout')
 * @returns {object} Risultato dell'operazione
 */
export function registraAttivita(description, date = null, type = 'workout') {
    try {
        if (!description || !description.trim()) {
            return {
                successo: false,
                messaggio: "La descrizione dell'attivita' e' obbligatoria",
                dati: null,
                refresh: false
            }
        }

        const activityDate = date || dataLocale(new Date())

        const activity = {
            id: `act-${Date.now()}`,
            date: activityDate,
            type: type || 'workout',
            description: description.trim(),
            done: true
        }

        const activities = caricaDati('palestra_vacation_activities', [])
        const updatedActivities = [...activities, activity]

        if (salvaDati('palestra_vacation_activities', updatedActivities)) {
            return {
                successo: true,
                messaggio: `Attivita' registrata: "${description.trim()}"`,
                dati: { activity, activities: updatedActivities },
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio dell'attivita'",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nella registrazione dell'attivita': ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

// ============================================
// COMANDI PIANO DI RIENTRO
// ============================================

/**
 * Genera un piano di rientro dopo le ferie
 * @param {object} context - Contesto con dati utente e piano corrente
 * @returns {object} Risultato dell'operazione
 */
export function generaPianoRientro(context = null) {
    try {
        const activities = caricaDati('palestra_vacation_activities', [])
        const doneWorkouts = activities.filter(a => a.type === 'workout' && a.done).length
        const cheatMeals = activities.filter(a => a.isCheatMeal).length

        // Determina l'obiettivo dalle preferenze o dal contesto
        let baseCalories = 1800
        let adjustment = -200
        let tips = 'Riduci carboidrati del 15% per compensare gli sgarri'

        if (context && context.data) {
            if (context.data.obiettivo === 'Massa Muscolare') {
                baseCalories = 2200
                tips = 'Aumenta proteine del 20% per recuperare'
            } else if (context.data.obiettivo === 'Dimagrimento') {
                baseCalories = 1600
                adjustment = -300
                tips = 'Riduci carboidrati del 25% per accelerare il dimagrimento'
            }
        }

        const returnPlan = {
            startDate: dataLocale(new Date()),
            duration: 7,
            phase: 'recovery',
            workout: {
                intensity: 'gradual',
                schedule: generaProgrammaRientro(doneWorkouts)
            },
            diet: {
                baseCalories,
                adjustment,
                tips
            },
            notes: `Piano basato su ${doneWorkouts} attivita' eseguite e ${cheatMeals} sgarri`
        }

        if (salvaDati('palestra_return_plan', returnPlan)) {
            return {
                successo: true,
                messaggio: "Piano di rientro generato per 7 giorni!",
                dati: returnPlan,
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio del piano di rientro",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nella generazione del piano di rientro: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Genera il programma di rientro basato sul numero di attivita' eseguite
 * @param {number} doneWorkouts - Numero di attivita' eseguite
 * @returns {array} Programma di rientro
 */
function generaProgrammaRientro(doneWorkouts) {
    return [
        { day: 1, type: 'cardio', duration: '30 min', intensity: 'light' },
        { day: 2, type: doneWorkouts < 2 ? 'rest' : 'full-body', description: doneWorkouts < 2 ? 'Recupero' : 'Allenamento completo' },
        { day: 3, type: 'cardio', duration: '35 min', intensity: 'moderate' },
        { day: 4, type: 'upper-body', duration: '45 min', intensity: 'moderate' },
        { day: 5, type: 'rest', description: 'Recupero attivo' },
        { day: 6, type: 'lower-body', duration: '50 min', intensity: 'moderate' },
        { day: 7, type: 'normal', description: 'Ritorno al piano normale' }
    ]
}

// ============================================
// COMANDI MODIFICA CALENDARIO (DIETA E ROUTINE)
// ============================================

/**
 * Modifica la dieta per un giorno specifico
 * @param {string} giorno - Nome del giorno (es. 'Lunedi')
 * @param {object} pasti - Oggetto con i pasti da modificare
 * @returns {object} Risultato dell'operazione
 */
export function modificaDieta(giorno, pasti) {
    try {
        if (!giorno) {
            return {
                successo: false,
                messaggio: "Il giorno e' obbligatorio",
                dati: null,
                refresh: false
            }
        }

        if (!pasti || typeof pasti !== 'object' || Object.keys(pasti).length === 0) {
            return {
                successo: false,
                messaggio: "I pasti da modificare sono obbligatori",
                dati: null,
                refresh: false
            }
        }

        // Carica suggerimenti correnti
        let currentSuggestions = caricaDati('palestra_suggestions', { dieta: {}, routine: {}, calendario: {} })

        if (!currentSuggestions.dieta) {
            currentSuggestions.dieta = {}
        }

        // Applica modifiche (merge per singolo pasto)
        // NOTA 2026-09-05: preserva pasti esistenti + normalizza giorno senza accenti
        const giornoNorm = normalizzaGiorno(giorno)
        const newDieta = { ...currentSuggestions.dieta }
        const pastiEsistenti = newDieta[giornoNorm]?.pasti || newDieta[giorno]?.pasti || {}
        const nuoviPasti = pasti.pasti ? { ...pasti.pasti } : { ...pasti }
        newDieta[giornoNorm] = {
            ...newDieta[giornoNorm],
            pasti: { ...pastiEsistenti, ...nuoviPasti }
        }

        // Salva
        const updatedSuggestions = {
            ...currentSuggestions,
            dieta: newDieta
        }

        if (salvaDati('palestra_suggestions', updatedSuggestions)) {
            return {
                successo: true,
                messaggio: `Dieta modificata per il ${giorno}`,
                dati: updatedSuggestions,
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio della dieta",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nella modifica della dieta: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Modifica la routine per un giorno specifico
 * @param {string} giorno - Nome del giorno (es. 'Lunedi')
 * @param {object} dati - Dati della routine da modificare
 * @returns {object} Risultato dell'operazione
 */
export function modificaRoutine(giorno, dati) {
    try {
        if (!giorno) {
            return {
                successo: false,
                messaggio: "Il giorno e' obbligatorio",
                dati: null,
                refresh: false
            }
        }

        if (!dati || typeof dati !== 'object' || Object.keys(dati).length === 0) {
            return {
                successo: false,
                messaggio: "I dati della routine sono obbligatori",
                dati: null,
                refresh: false
            }
        }

        // Carica suggerimenti correnti
        let currentSuggestions = caricaDati('palestra_suggestions', { dieta: {}, routine: {}, calendario: {} })

        if (!currentSuggestions.routine) {
            currentSuggestions.routine = {}
        }

        // Applica modifiche (merge + normalizza giorno)
        const giornoNorm = normalizzaGiorno(giorno)
        const newRoutine = { ...currentSuggestions.routine }
        newRoutine[giornoNorm] = { ...(newRoutine[giornoNorm] || {}), ...dati }

        // Salva
        const updatedSuggestions = {
            ...currentSuggestions,
            routine: newRoutine
        }

        if (salvaDati('palestra_suggestions', updatedSuggestions)) {
            return {
                successo: true,
                messaggio: `Routine modificata per il ${giorno}`,
                dati: updatedSuggestions,
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio della routine",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nella modifica della routine: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Sposta allenamento da un giorno a un altro:
 * - copia routine+calendario da `da` a `a` sovrascrivendo il giorno libero
 * - imposta `da` come Giorno libero (scheda Riposo, zero esercizi) e rimuove icone
 * - aggiorna workoutDays in palestra_data (toglie `da`, aggiunge `a`)
 * @param {string} da - Giorno origine (es. 'Lunedi')
 * @param {string} a - Giorno destinazione (es. 'Martedi')
 */
export function spostaAllenamento(da, a, dataDa = null, dataA = null) {
    try {
        // NOTA 2026-09-05: se date specifiche YYYY-MM-DD, sposta SOLO quelle 2 istanze via eccezioni
        const isData = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
        if (isData(dataDa) && isData(dataA) && dataDa !== dataA) {
            const current = caricaDati('palestra_suggestions', { dieta: {}, routine: {}, calendario: {}, eccezioni: {} })
            const eccezioni = { ...(current.eccezioni || {}) }
            // Ricava routine del giorno origine (da template settimanale o eccezione esistente)
            const dDa = new Date(dataDa + 'T12:00:00')
            const GIORNI = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato']
            const nomeDa = GIORNI[dDa.getDay()]
            const routineOrigine = eccezioni[dataDa]?.routine || current.routine?.[nomeDa] || current.routine?.[normalizzaGiorno(nomeDa)] || { scheda: 'Allenamento', durata: '', esercizi: [] }
            // Origine diventa Giorno libero solo per quella data
            eccezioni[dataDa] = { scheda: 'Giorno libero', durata: '', esercizi: [], libero: true }
            // Destinazione prende la routine spostata solo per quella data
            eccezioni[dataA] = { ...routineOrigine, libero: false }
            const updated = { ...current, eccezioni }
            if (!salvaDati('palestra_suggestions', updated)) {
                return { successo: false, messaggio: 'Errore nel salvataggio dello spostamento singolo', dati: null, refresh: false }
            }
            return { successo: true, messaggio: `Allenamento spostato solo da ${dataDa} a ${dataA}.`, dati: updated, refresh: false }
        }
        if (!da || !a) {
            return { successo: false, messaggio: 'Specifica giorno origine e destinazione (da, a)', dati: null, refresh: false }
        }
        const daNorm = normalizzaGiorno(da)
        const aNorm = normalizzaGiorno(a)
        if (!daNorm || !aNorm) {
            return { successo: false, messaggio: 'Giorni non validi', dati: null, refresh: false }
        }
        if (daNorm === aNorm) {
            return { successo: false, messaggio: 'Origine e destinazione coincidono', dati: null, refresh: false }
        }

        const currentSuggestions = caricaDati('palestra_suggestions', { dieta: {}, routine: {}, calendario: {} })
        const newRoutine = { ...(currentSuggestions.routine || {}) }
        const newCalendario = { ...(currentSuggestions.calendario || {}) }

        // Sorgente: se vuota, niente da spostare
        const routineDa = newRoutine[daNorm] || newRoutine[da]
        const hasEsercizi = routineDa && Array.isArray(routineDa.esercizi) && routineDa.esercizi.length > 0
        const hasScheda = routineDa && routineDa.scheda && routineDa.scheda !== 'Giorno libero' && routineDa.scheda !== 'Riposo'
        if (!routineDa || (!hasEsercizi && !hasScheda)) {
            // Prova comunque da workoutDays: se `da` non e giorno palestra, avvisa
            const checkData = caricaDati('palestra_data', { workoutDays: [] })
            const inDays = Array.isArray(checkData.workoutDays) && checkData.workoutDays.some((d) => normalizzaGiorno(d) === daNorm)
            if (!inDays) {
                return { successo: false, messaggio: `Nessun allenamento da spostare in ${daNorm}`, dati: null, refresh: false }
            }
        }

        // Destinazione: sovrascrivi giorno libero con routine spostata
        const routineSpostata = { ...(routineDa || { scheda: 'Allenamento', durata: '', esercizi: [] }) }
        newRoutine[aNorm] = routineSpostata
        if (newCalendario[daNorm] || newCalendario[da]) {
            newCalendario[aNorm] = newCalendario[daNorm] || newCalendario[da]
        }

        // Origine: Giorno libero, niente icone
        newRoutine[daNorm] = { scheda: 'Giorno libero', durata: '', esercizi: [] }
        if (newCalendario[daNorm]) {
            delete newCalendario[daNorm]
        }

        const updatedSuggestions = { ...currentSuggestions, routine: newRoutine, calendario: newCalendario }
        if (!salvaDati('palestra_suggestions', updatedSuggestions)) {
            return { successo: false, messaggio: 'Errore nel salvataggio dello spostamento', dati: null, refresh: false }
        }

        // Aggiorna workoutDays: togli `da`, aggiungi `a`
        try {
            const palestraData = caricaDati('palestra_data', { workoutDays: [] })
            let days = Array.isArray(palestraData.workoutDays) ? [...palestraData.workoutDays] : []
            days = days.filter((d) => normalizzaGiorno(d) !== daNorm)
            if (!days.some((d) => normalizzaGiorno(d) === aNorm)) {
                days.push(aNorm)
            }
            salvaDati('palestra_data', { ...palestraData, workoutDays: days })
        } catch {
            // suggerimenti gia salvati, workoutDays opzionale
        }

        return {
            successo: true,
            messaggio: `Allenamento spostato da ${daNorm} a ${aNorm}. ${daNorm} ora e Giorno libero.`,
            dati: updatedSuggestions,
            refresh: false
        }
    } catch (e) {
        return { successo: false, messaggio: `Errore nello spostamento: ${e.message}`, dati: null, refresh: false }
    }
}

/**
 * Ripristina allenamenti come da impostazioni (workoutDays in palestra_data):
 * - giorni in workoutDays: se mancanti o Giorno libero, crea scheda Allenamento generica (preserva esistente)
 * - giorni fuori workoutDays: imposta Giorno libero cosi spariscono le icone
 */
export function ripristinaAllenamenti() {
    try {
        const GIORNI = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica']
        const palestraData = caricaDati('palestra_data', { workoutDays: [] })
        const workoutDays = Array.isArray(palestraData.workoutDays) ? palestraData.workoutDays.map((d) => normalizzaGiorno(d)) : []
        if (workoutDays.length === 0) {
            return { successo: false, messaggio: 'Nessun giorno di allenamento nelle impostazioni', dati: null, refresh: false }
        }
        const currentSuggestions = caricaDati('palestra_suggestions', { dieta: {}, routine: {}, calendario: {} })
        const newRoutine = { ...(currentSuggestions.routine || {}) }
        const durataDefault = palestraData.durataAllenamento || ''
        GIORNI.forEach((g) => {
            const deveAllenarsi = workoutDays.includes(g)
            const attuale = newRoutine[g]
            const isLibero = !attuale || attuale.scheda === 'Giorno libero' || attuale.scheda === 'Riposo'
            if (deveAllenarsi) {
                if (isLibero) {
                    newRoutine[g] = { scheda: 'Allenamento', durata: durataDefault, esercizi: [] }
                }
            } else {
                newRoutine[g] = { scheda: 'Giorno libero', durata: '', esercizi: [] }
            }
        })
        const updatedSuggestions = { ...currentSuggestions, routine: newRoutine }
        if (!salvaDati('palestra_suggestions', updatedSuggestions)) {
            return { successo: false, messaggio: 'Errore nel salvataggio del ripristino', dati: null, refresh: false }
        }
        return {
            successo: true,
            messaggio: `Allenamenti ripristinati come da impostazioni: ${workoutDays.join(', ')}.`,
            dati: updatedSuggestions,
            refresh: false
        }
    } catch (e) {
        return { successo: false, messaggio: `Errore nel ripristino: ${e.message}`, dati: null, refresh: false }
    }
}

/**
 * Applica tutte le modifiche suggerite dal chatbot
 * @param {object} modifiche - Oggetto con dieta e routine da modificare
 * @returns {object} Risultato dell'operazione
 */
export function applicaModifiche(modifiche) {
    try {
        if (!modifiche || typeof modifiche !== 'object' || Object.keys(modifiche).length === 0) {
            return {
                successo: false,
                messaggio: "Nessuna modifica da applicare",
                dati: null,
                refresh: false
            }
        }

        // Carica suggerimenti correnti
        let currentSuggestions = caricaDati('palestra_suggestions', { dieta: {}, routine: {}, calendario: {} })

        // Applica modifiche alla dieta
        // NOTA 2026-09-05: merge per singolo pasto + normalizza giorno
        const newDieta = { ...currentSuggestions.dieta }
        if (modifiche.dieta && typeof modifiche.dieta === 'object') {
            Object.entries(modifiche.dieta || {}).forEach(([giorno, dati]) => {
                const giornoNorm = normalizzaGiorno(giorno)
                const pastiEsistenti = newDieta[giornoNorm]?.pasti || newDieta[giorno]?.pasti || {}
                const nuoviPasti = dati?.pasti || dati || {}
                newDieta[giornoNorm] = {
                    ...newDieta[giornoNorm],
                    pasti: { ...pastiEsistenti, ...nuoviPasti }
                }
            })
        }

        // Applica modifiche alla routine
        const newRoutine = { ...currentSuggestions.routine }
        if (modifiche.routine && typeof modifiche.routine === 'object') {
            Object.entries(modifiche.routine || {}).forEach(([giorno, dati]) => {
                const giornoNorm = normalizzaGiorno(giorno)
                newRoutine[giornoNorm] = { ...(newRoutine[giornoNorm] || newRoutine[giorno] || {}), ...dati }
            })
        }

        // Crea il nuovo oggetto suggerimenti
        const updatedSuggestions = {
            ...currentSuggestions,
            dieta: newDieta,
            routine: newRoutine
        }

        // Salva
        if (salvaDati('palestra_suggestions', updatedSuggestions)) {
            return {
                successo: true,
                messaggio: "Modifiche applicate con successo!",
                dati: updatedSuggestions,
                refresh: false
            }
        } else {
            return {
                successo: false,
                messaggio: "Errore nel salvataggio delle modifiche",
                dati: null,
                refresh: false
            }
        }

    } catch (e) {
        return {
            successo: false,
            messaggio: `Errore nell'applicazione delle modifiche: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Esegue un comando in base al tipo
 * @param {string} tipo - Tipo di comando (ferie, pasto, attivita, rientro, dieta, routine) o comando testuale completo
 * @param {object} parametri - Parametri del comando
 * @returns {object} Risultato dell'operazione
 */
export function eseguiComando(tipo, parametri = {}) {
    try {
        console.log(`[COMANDO] Eseguo: tipo="${tipo}", parametri=`, parametri)

        // Se tipo e' un comando testuale completo (es: "/ferie 15-01 20-01")
        // NOTA 2026-09-05: supporta anche spazi e slash nei nomi (es. "/piano rientro", "/sposta Lunedi Martedi", "/ripristina")
        if (typeof tipo === 'string' && tipo.startsWith('/')) {
            // Prova a parsare il comando testuale
            const commandMatch = tipo.match(/^\/(ferie|pasto|mangiato|ho\s*mangiato|attivita|fatto|ho\s*fatto|rientro|dieta|routine|modifiche|sposta|ripristina|piano[\s\-_]*rientro|aggiorna[\s\-_]*piano)\s*(.*)?$/i)
            if (commandMatch) {
                const cmdType = commandMatch[1].toLowerCase().replace(/[\s_-]/g, '').replace(/\//g, '')
                const cmdArgs = commandMatch[2] ? commandMatch[2].trim() : ''

                console.log(`[COMANDO] Parsing testuale: cmdType="${cmdType}", cmdArgs="${cmdArgs}"`)

                // Parsa i parametri dal comando testuale
                let parsedParametri = {}

                switch (cmdType) {
                    case 'ferie':
                    case 'aggiuniferie':
                    case 'aggiungiferie':
                        // Parsa il range di date
                        const dateRange = parseDateRange(cmdArgs)
                        if (dateRange && dateRange.startDate && dateRange.endDate) {
                            parsedParametri = dateRange
                            console.log(`[COMANDO] Ferie parsed: startDate="${parsedParametri.startDate}", endDate="${parsedParametri.endDate}"`)
                        } else {
                            console.warn(`[COMANDO] Formato date non valido per ferie: "${cmdArgs}"`)
                            return {
                                successo: false,
                                messaggio: `Formato date non valido. Usa: /ferie GG-MM GG-MM (es: /ferie 15-09 20-09) o /ferie 15 09 20 09`,
                                dati: null,
                                refresh: false
                            }
                        }
                        return aggiungiFerie(parsedParametri.startDate, parsedParametri.endDate)

                    case 'pasto':
                    case 'mangiato':
                    case 'homangiato':
                        parsedParametri = { description: cmdArgs || tipo }
                        console.log(`[COMANDO] Pasto: description="${parsedParametri.description}"`)
                        return registraPasto(parsedParametri.description)

                    case 'attivita':
                    case 'fatto':
                    case 'hofatto':
                        parsedParametri = { description: cmdArgs || tipo }
                        console.log(`[COMANDO] Attivita: description="${parsedParametri.description}"`)
                        return registraAttivita(parsedParametri.description)

                    case 'rientro':
                    case 'aggiornapiano':
                    case 'pianorientro':
                        console.log(`[COMANDO] Rientro: generando piano di rientro`)
                        return generaPianoRientro(null)

                    case 'sposta':
                    case 'spostaallenamento':
                    case 'spostaroutine': {
                        const m = cmdArgs.match(/([A-Za-zàèéìòù]+)\s+(?:a|su|->|in)\s+([A-Za-zàèéìòù]+)/i) || cmdArgs.match(/([A-Za-zàèéìòù]+)\s+([A-Za-zàèéìòù]+)/)
                        if (!m) {
                            return { successo: false, messaggio: 'Formato sposta non valido. Usa: /sposta Lunedi Martedi', dati: null, refresh: false }
                        }
                        return spostaAllenamento(m[1], m[2])
                    }

                    case 'ripristina':
                    case 'ripristinaallenamenti':
                        return ripristinaAllenamenti()

                    default:
                        console.warn(`[COMANDO] Comando testuale non supportato: ${tipo}`)
                        return {
                            successo: false,
                            messaggio: `Comando testuale non supportato: ${tipo}`,
                            dati: null,
                            refresh: false
                        }
                }
            }
        }

        // Comando come oggetto (tipo + parametri separati)
        // NOTA 2026-09-05: normalizza anche spazi e slash per retrocompatibilita con vecchi prompt
        if (typeof tipo !== 'string') {
            return {
                successo: false,
                messaggio: `Tipo comando non valido`,
                dati: null,
                refresh: false
            }
        }
        console.log(`[COMANDO] Switch: tipo="${tipo.toLowerCase()}"`)

        // Normalizza: minuscolo, rimuovi underscore, trattini, spazi e slash
        const tipoNormalizzato = tipo.toLowerCase().replace(/[_\-\s/]/g, '')
        console.log(`[COMANDO] Normalizzato: tipoNormalizzato="${tipoNormalizzato}"`)

        switch (tipoNormalizzato) {
            case 'ferie':
            case 'aggiuniferie':
            case 'aggiungiferie':
                console.log(`[COMANDO] Ferie: startDate="${parametri.startDate}", endDate="${parametri.endDate}"`)
                return aggiungiFerie(parametri.startDate, parametri.endDate)
            case 'pasto':
            case 'mangiato':
            case 'homangiato':
            case 'pastomangiato':
                console.log(`[COMANDO] Pasto: description="${parametri.description}", date="${parametri.date}", calories="${parametri.calories}"`)
                return registraPasto(parametri.description, parametri.date, parametri.calories)
            case 'attivita':
            case 'fatto':
            case 'hofatto':
            case 'attivitafatto':
                console.log(`[COMANDO] Attivita: description="${parametri.description}", type="${parametri.type}"`)
                return registraAttivita(parametri.description, parametri.date, parametri.type)
            case 'rientro':
            case 'pianorientro':
            case 'aggiornapiano':
            case 'rientroaggiornapiano':
                console.log(`[COMANDO] Rientro: context=`, parametri?.context)
                return generaPianoRientro(parametri?.context || null)
            case 'dieta':
                console.log(`[COMANDO] Dieta: giorno="${parametri.giorno}", pasti=`, parametri.pasti)
                return modificaDieta(parametri.giorno, parametri.pasti || {})
            case 'routine':
                console.log(`[COMANDO] Routine: giorno="${parametri.giorno}", dati=`, parametri.dati)
                return modificaRoutine(parametri.giorno, parametri.dati || {})
            case 'modifiche':
                console.log(`[COMANDO] Modifiche: modifiche=`, parametri.modifiche)
                return applicaModifiche(parametri.modifiche || {})
            case 'sposta':
            case 'spostaallenamento':
            case 'spostaroutine':
                return spostaAllenamento(parametri.da || parametri.from || parametri.origine, parametri.a || parametri.to || parametri.destinazione, parametri.dataDa || parametri.data_da, parametri.dataA || parametri.data_a)
            case 'ripristina':
            case 'ripristinaallenamenti':
                return ripristinaAllenamenti()
            default:
                console.warn(`[COMANDO] Comando sconosciuto: ${tipo} (normalizzato: ${tipoNormalizzato})`)
                return {
                    successo: false,
                    messaggio: `Comando sconosciuto: ${tipo}. Comandi validi: ferie, pasto, mangiato, attivita, fatto, rientro, dieta, routine, modifiche, sposta, ripristina`,
                    dati: null,
                    refresh: false
                }
        }
    } catch (e) {
        console.error(`[COMANDO] Errore in eseguiComando:`, e)
        return {
            successo: false,
            messaggio: `Errore nell'esecuzione del comando: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}

/**
 * Esegue piu' comandi in sequenza
 * @param {array} comandi - Array di comandi da eseguire [{ tipo, parametri }] o array di stringhe
 * @returns {object} Risultato dell'operazione
 */
export function eseguiComandi(comandi = []) {
    try {
        if (!Array.isArray(comandi) || comandi.length === 0) {
            return {
                successo: false,
                messaggio: "Nessun comando da eseguire",
                dati: null,
                refresh: false
            }
        }

        const risultati = []
        let necessitaRefresh = false
        let erroriDettagliati = []

        for (let i = 0; i < comandi.length; i++) {
            const comando = comandi[i]

            // Supporta sia oggetti {tipo, parametri} che stringhe dirette
            let tipo, parametri

            if (typeof comando === 'string') {
                // Comando come stringa (es: "/ferie 15-01 20-01")
                tipo = comando
                parametri = {}
            } else if (comando && typeof comando === 'object') {
                tipo = comando.tipo
                parametri = comando.parametri || {}
            } else {
                const errMsg = `Comando ${i + 1}/${comandi.length} non valido: tipo = ${typeof comando}`
                erroriDettagliati.push(errMsg)
                risultati.push({
                    successo: false,
                    messaggio: errMsg,
                    dati: null,
                    refresh: false
                })
                continue
            }

            console.log(`[COMANDI] Eseguo comando ${i + 1}/${comandi.length}: tipo="${tipo}", parametri=`, parametri)

            const risultato = eseguiComando(tipo, parametri)
            risultati.push(risultato)

            if (risultato.refresh) {
                necessitaRefresh = true
            }

            if (!risultato.successo) {
                erroriDettagliati.push(`Comando ${i + 1} (${tipo}): ${risultato.messaggio}`)
            }
        }

        // Verifica se tutti i comandi sono andati a buon fine
        const tuttiSuccesso = risultati.every(r => r.successo)

        const messaggio = tuttiSuccesso
            ? `Tutti i ${comandi.length} comandi eseguiti con successo`
            : `${risultati.filter(r => r.successo).length}/${comandi.length} comandi eseguiti. Errori: ${erroriDettagliati.join('; ')}`

        console.log(`[COMANDI] Risultato: ${messaggio}`)

        return {
            successo: tuttiSuccesso,
            messaggio: messaggio,
            dati: { risultati, erroriDettagliati },
            refresh: necessitaRefresh
        }

    } catch (e) {
        console.error('[COMANDI] Errore critico in eseguiComandi:', e)
        return {
            successo: false,
            messaggio: `Errore critico: ${e.message}`,
            dati: null,
            refresh: false
        }
    }
}
