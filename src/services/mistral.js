const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

/**
 * Funzione per pulire completamente il contenuto LLM:
 * - Rimuove TUTTA la formattazione markdown (**, _, *, ecc.)
 * - Rimuove code blocks
 * - Rimuove caratteri di controllo
 * - Fissa JSON troncato
 * - Sostituisce caratteri speciali italiani
 */
function cleanJsonString(str) {
    if (!str || typeof str !== 'string') {
        return ''
    }
    
    return str
        // 1. Rimuovi TUTTI i code blocks markdown (inclusi quelli nested)
        .replace(/```[\s\S]*?```/g, '')
        .trim()

        // 2. Rimuovi formattazione markdown INLINE
        .replace(/\*\*(.*?)\*\*/g, '$1')      // **grassetto** -> testo
        .replace(/\*(.*?)\*/g, '$1')          // *corsivo* -> testo
        .replace(/_(.*?)_/g, '$1')             // _corsivo_ -> testo
        .replace(/~~(.*?)~~/g, '$1')           // ~~barrato~~ -> testo

        // 3. Rimuovi caratteri di controllo
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '')

        // 4. Rimuovi BOM
        .replace(/\uFEFF/g, '')

        // 5. Fissa virgolette smart
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")

        // 6. Rimuovi spazi non-breaking
        .replace(/\u00A0/g, ' ')
        // 7. Sostituisci caratteri speciali italiani con versioni ASCII
        .replace(/[\u00E0\u00E1\u00E2\u00E4\u00E5]/g, 'a')  // àáâäå -> a
        .replace(/[\u00C0\u00C1\u00C2\u00C4\u00C5]/g, 'A')  // ÀÁÂÄÅ -> A
        .replace(/[\u00E8\u00E9\u00EA\u00EB]/g, 'e')  // èéêë -> e
        .replace(/[\u00C8\u00C9\u00CA\u00CB]/g, 'E')  // ÈÉÊË -> E
        .replace(/[\u00EC\u00ED\u00EE\u00EF]/g, 'i')  // ìíîï -> i
        .replace(/[\u00CC\u00CD\u00CE\u00CF]/g, 'I')  // ÌÍÎÏ -> I
        .replace(/[\u00F2\u00F3\u00F4\u00F6\u00F8]/g, 'o')  // òóôöø -> o
        .replace(/[\u00D2\u00D3\u00D4\u00D6\u00D8]/g, 'O')  // ÒÓÔÖØ -> O
        .replace(/[\u00F9\u00FA\u00FC\u00FD]/g, 'u')  // ùúûü -> u
        .replace(/[\u00D9\u00DA\u00DC\u00DD]/g, 'U')  // ÙÚÛÜ -> U
        .replace(/[\u00F1\u00D1]/g, 'n')  // ñÑ -> n
        .replace(/[\u00C7\u00E7]/g, 'c')  // Çç -> c
}

/**
 * Funzione per parsare in modo sicuro il JSON da LLM
 * Restituisce SEMPRE un oggetto valido, mai un errore
 */
function safeJsonParse(str, fallback = null) {
    if (!str || typeof str !== 'string') {
        return fallback || { risposta: "Risposta non valida", modifiche: {}, consigli: [] }
    }
    
    try {
        const cleaned = cleanJsonString(str)

        // Se la stringa pulita è vuota, restituisci fallback
        if (!cleaned || cleaned.trim() === '') {
            return fallback || { risposta: "Risposta non valida", modifiche: {}, consigli: [] }
        }

        // Verifica che inizi con {
        if (!cleaned.trim().startsWith('{')) {
            // Tentativo di trovare un oggetto JSON nella stringa
            const jsonMatch = cleaned.match(/\{[\s\S]*?\}/)
            if (jsonMatch) {
                try {
                    const parsed = JSON.parse(cleanJsonString(jsonMatch[0]))
                    // Assicurati che sia un oggetto
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        return parsed
                    }
                } catch {
                    // Fallthrough
                }
            }
            if (fallback) return fallback
            return { risposta: "Risposta non valida", modifiche: {}, consigli: [] }
        }

        // Prova a parsare tutto
        const parsed = JSON.parse(cleaned)
        
        // Assicurati che sia un oggetto
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed
        }
        
        // Se non è un oggetto, restituisci fallback
        return fallback || { risposta: "Risposta non valida", modifiche: {}, consigli: [] }
        
    } catch (e) {
        console.warn('[JSON Parser] Errore:', e.message)
        console.warn('[JSON Parser] Contenuto:', str.substring(0, 500))

        // Tentativo di recupero: estrai il primo oggetto JSON valido
        const jsonMatch = str.match(/\{[\s\S]*?\}/)
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(cleanJsonString(jsonMatch[0]))
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return parsed
                }
            } catch {
                // Fallthrough
            }
        }

        return fallback || { risposta: "Risposta non valida", modifiche: {}, consigli: [] }
    }
}

const PROMPT_TEMPLATE = `
Sei un esperto di fitness e nutrizione. Basandoti su questi dati:
- Obiettivo: {obiettivo}
- Livello: {livello}
- Preferenze alimentari: {preferenzeAlimentari}
- Giorni di allenamento: {workoutDays}
- Durata allenamento: {durataAllenamento} minuti
- Orari pasti: {orariPasti}

Genera UNICAMENTE un oggetto JSON valido, SENZA:
- Testate di codice
- Spiegazioni
- Formattazione markdown (**, _, *, ecc.)
- Commenti

SOLO il JSON, nient'altro.
{
  "dieta": {
    "{giorno}": {
      "pasti": {
        "{nomePasto}": {
          "ora": "HH:MM",
          "cibo": "descrizione",
          "calorie": "numero"
        }
      }
    }
  },
  "routine": {
    "{giorno}": {
      "scheda": "nome scheda",
      "durata": "minuti",
      "esercizi": ["esercizio1", "esercizio2"]
    }
  },
  "calendario": {
    "{giorno}": {
      "suggerimenti": ["suggerimento1", "suggerimento2"]
    }
  }
}
`

/**
 * Genera suggerimenti personalizzati chiamando l'API Mistral
 */
export async function generateSuggestions(data) {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
    if (!apiKey) {
        return {
            risposta: "Chiave API Mistral non configurata. Aggiungi VITE_MISTRAL_API_KEY al file .env",
            modifiche: {},
            consigli: []
        }
    }

    const prompt = PROMPT_TEMPLATE
        .replace('{obiettivo}', data.obiettivo || 'Mantenimento')
        .replace('{livello}', data.livello || 'Intermedio')
        .replace('{preferenzeAlimentari}', data.preferenzeAlimentari || 'Onnivoro')
        .replace('{workoutDays}', data.workoutDays?.join(', ') || 'Lunedi, Mercoledi, Venerdi')
        .replace('{durataAllenamento}', data.durataAllenamento || '60')
        .replace('{orariPasti}', JSON.stringify(data.orariPasti || {}))

    const requestBody = {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.9,
        response_format: { type: 'json_object' }
    }

    try {
        const response = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                risposta: `Errore API: ${errorData.message || 'Errore sconosciuto'}`,
                modifiche: {},
                consigli: []
            }
        }

        const result = await response.json()
        const content = result.choices[0].message.content

        return safeJsonParse(content)

    } catch (error) {
        console.error('[Mistral API] Errore:', error)
        return {
            risposta: "Errore di connessione con l'AI",
            modifiche: {},
            consigli: []
        }
    }
}

export function saveSuggestions(suggestions) {
    localStorage.setItem('palestra_suggestions', JSON.stringify(suggestions))
}

export function loadSuggestions() {
    const saved = localStorage.getItem('palestra_suggestions')
    return saved ? JSON.parse(saved) : null
}

const CHAT_PROMPT_TEMPLATE = `
Sei un assistente AI esperto in fitness e nutrizione. L'utente ha il seguente piano:
Piano corrente: {context}
L utente ti chiede: "{message}"
Analizza la richiesta e fornisci suggerimenti in formato JSON:
{
  "risposta": "testo risposta",
  "modifiche": {"dieta": {}, "routine": {}},
  "consigli": ["consiglio1"]
}
IMPORTANTE: Restituisci SOLO JSON valido, SENZA formattazione markdown (**, _, *, ecc.) o testo aggiuntivo.
`

/**
 * Funzione principale chat con gestione comandi ferie
 */
export async function chatWithMistral(message, context) {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
    if (!apiKey) {
        return {
            risposta: "Chiave API Mistral non configurata. Aggiungi VITE_MISTRAL_API_KEY al file .env",
            modifiche: {},
            consigli: []
        }
    }

    const ctxStr = JSON.stringify(context)

    // Comando /ferie 15-01 20-01 OPPURE "voglio inserire ferie dal 14 al 25 agosto"
    const vacationMatch = message.match(/^\/(ferie|vacation|holiday)\s+(.+)$/i)
    
    // Pattern per riconoscere richieste naturali di ferie
    const naturalVacationPatterns = [
        // "ferie dal 14 al 25 agosto"
        /(?:ferie|vacanza|vacation|holiday|inserisci\s+ferie|voglio\s+(?:andare\s+in\s+)?ferie|aggiungi\s+ferie|sarò\s+in\s+ferie)[\s\S]*?(\d{1,2})[\s-](\d{1,2})[\s-](?:al|a|\s+)[\s-]?(\d{1,2})[\s-](\d{1,2})/i,
        // "ferie 14 agosto al 25 agosto 2026"
        /(?:ferie|vacanza|vacation|holiday|inserisci\s+ferie|voglio\s+(?:andare\s+in\s+)?ferie|aggiungi\s+ferie|sarò\s+in\s+ferie)[\s\S]*?(\d{1,2})\s+([a-zA-Z]+)\s+(?:al|a|\s+)\s*(\d{1,2})\s+([a-zA-Z]+)(?:\s+\d{4})?/i,
        // "dal 14 al 25 agosto ferie"
        /(?:dal|dal\s+|da\s+)(\d{1,2})[\s-](\d{1,2})[\s-](?:al|a|\s+)[\s-]?(\d{1,2})[\s-](\d{1,2})[\s\S]*?(?:ferie|vacanza|vacation)/i,
        // "14 agosto al 25 agosto"
        /(\d{1,2})\s+([a-zA-Z]+)\s+(?:al|a|\s+)\s*(\d{1,2})\s+([a-zA-Z]+)[\s\S]*?(?:ferie|vacanza|vacation|sarò\s+in)/i
    ]
    
    let vacationDates = null
    
    if (vacationMatch) {
        vacationDates = vacationMatch[2]
    } else {
        for (const pattern of naturalVacationPatterns) {
            const match = message.match(pattern)
            if (match) {
                vacationDates = match.slice(1).join('-')
                break
            }
        }
    }
    
    if (vacationDates) {
        let startDate, endDate
        const year = new Date().getFullYear()
        
        // Prova a parsare date nel formato GG-MM GG-MM
        const match1 = vacationDates.match(/(\d{1,2})-(\d{1,2})[\s-]+(\d{1,2})-(\d{1,2})/)
        if (match1) {
            startDate = `${year}-${match1[2].padStart(2,'0')}-${match1[1].padStart(2,'0')}`
            endDate = `${year}-${match1[4].padStart(2,'0')}-${match1[3].padStart(2,'0')}`
        } else {
            // Prova formato con nomi mesi: "14 agosto 25 agosto"
            const monthNames = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 
                              'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
            const match2 = vacationDates.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{1,2})\s+([a-zA-Z]+)/i)
            if (match2) {
                const month1 = monthNames.findIndex(m => m.startsWith(match2[2].toLowerCase())) + 1
                const month2 = monthNames.findIndex(m => m.startsWith(match2[4].toLowerCase())) + 1
                if (month1 > 0 && month2 > 0) {
                    startDate = `${year}-${month1.toString().padStart(2,'0')}-${match2[1].padStart(2,'0')}`
                    endDate = `${year}-${month2.toString().padStart(2,'0')}-${match2[3].padStart(2,'0')}`
                }
            }
        }
        
        if (!startDate || !endDate) {
            return { 
                risposta: "Formati accettati: '/ferie 15-08 25-08' OPPURE 'voglio ferie dal 14 al 25 agosto' OPPURE 'ferie 14 agosto 25 agosto'", 
                modifiche: {}, 
                consigli: [] 
            }
        }
        
        // Salva le ferie in localStorage
        const newVacationPeriod = { id: `vac-${Date.now()}`, startDate, endDate, confirmed: true, autoGenerated: false }
        
        // Carica eventuali ferie esistenti
        let existingVacation = null
        try {
            const saved = localStorage.getItem('palestra_vacation')
            existingVacation = saved ? JSON.parse(saved) : { vacationPeriods: [], vacationSuggestions: {} }
        } catch (e) {
            // Errore nel parsing JSON, usa valori di default
            console.warn('Errore parsing vacation data:', e)
            existingVacation = { vacationPeriods: [], vacationSuggestions: {} }
        }
        
        // Aggiungi il nuovo periodo
        const updatedVacation = {
            vacationPeriods: [...existingVacation.vacationPeriods, newVacationPeriod],
            vacationSuggestions: generateLocalSuggestions(startDate, endDate, context)
        }
        
        localStorage.setItem('palestra_vacation', JSON.stringify(updatedVacation))
        
        return {
            risposta: `Ferie aggiunte: dal ${startDate} al ${endDate}. Piano generato automaticamente!`,
            modifiche: {},
            consigli: ["Traccia attivita e pasti nella sezione Vacanza. La pagina si aggiornerà..."],
            vacationData: updatedVacation
        }
    }

    // Comando /ho mangiato pizza OPPURE "ho mangiato una pizza"
    const mealMatch = message.match(/^\/(ho\s*mangiato|ate|meal)\s+(.+)$/i)
    const naturalMealMatch = message.match(/(?:ho\s+mangiato|ho\s+mangiato\s+|ho\s+mangiato\s+oggi|mangio|mangiato|ho\s+mangiato|ho\s+mangiato\s+oggi)(?:\s+oggi\s+)?(?:\s+|:|-)?\s*(.+)/i)
    
    if (mealMatch || naturalMealMatch) {
        const description = mealMatch ? mealMatch[2] : naturalMealMatch[1]
        
        try {
            const meal = {
                id: `meal-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                description: description.trim(),
                isCheatMeal: true,
                done: true
            }
            const activities = JSON.parse(localStorage.getItem('palestra_vacation_activities') || '[]')
            localStorage.setItem('palestra_vacation_activities', JSON.stringify([...activities, meal]))
            return {
                risposta: `Pasto registrato: "${description.trim()}"`,
                modifiche: {},
                consigli: ["L'IA terra conto di questo per il piano di rientro"]
            }
        } catch (e) {
            return {
                risposta: `Errore nel registrare il pasto: ${e.message}`,
                modifiche: {},
                consigli: []
            }
        }
    }

    // Comando /ho fatto yoga 30 min OPPURE "ho fatto yoga oggi"
    const workoutMatch = message.match(/^\/(ho\s*fatto|did|workout)\s+(.+)$/i)
    const naturalWorkoutMatch = message.match(/(?:ho\s+fatto|ho\s+fatto\s+|ho\s+fatto\s+oggi|fatto|allenato|ho\s+fatto|ho\s+fatto\s+oggi)(?:\s+oggi\s+)?(?:\s+|:|-)?\s*(.+)/i)
    
    if (workoutMatch || naturalWorkoutMatch) {
        const description = workoutMatch ? workoutMatch[2] : naturalWorkoutMatch[1]
        
        try {
            const activity = {
                id: `act-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'workout',
                description: description.trim(),
                done: true
            }
            const activities = JSON.parse(localStorage.getItem('palestra_vacation_activities') || '[]')
            localStorage.setItem('palestra_vacation_activities', JSON.stringify([...activities, activity]))
            return {
                risposta: `Attivita registrata: "${description.trim()}"`,
                modifiche: {},
                consigli: ["Ottimo lavoro! Continua cosi"]
            }
        } catch (e) {
            return {
                risposta: `Errore nel registrare l'attivita: ${e.message}`,
                modifiche: {},
                consigli: []
            }
        }
    }

    // Comando /piano rientro
    const returnMatch = message.match(/^\/(piano\s*rientro|return\s*plan|rientro)$/i)
    const naturalReturnMatch = message.match(/(?:piano\s+di\s+rientro|rientro|piano\s+rientro|voglio\s+rientrare)/i)
    
    if (returnMatch || naturalReturnMatch) {
        try {
            const activities = JSON.parse(localStorage.getItem('palestra_vacation_activities') || '[]')
            const doneWorkouts = activities.filter(a => a.type === 'workout' && a.done).length
            const cheatMeals = activities.filter(a => a.isCheatMeal).length
            
            const returnPlan = {
                startDate: new Date().toISOString().split('T')[0],
                duration: 7,
                phase: 'recovery',
                workout: {
                    intensity: 'gradual',
                    schedule: generateReturnSchedule(doneWorkouts)
                },
                diet: {
                    baseCalories: context?.data?.obiettivo === 'Massa Muscolare' ? 2200 : 1800,
                    adjustment: -200,
                    tips: 'Riduci carboidrati del 15% per compensare gli sgarri'
                },
                notes: `Piano basato su ${doneWorkouts} attivita eseguite e ${cheatMeals} sgarri`
            }
            localStorage.setItem('palestra_return_plan', JSON.stringify(returnPlan))
            return {
                risposta: `Piano di rientro generato per 7 giorni!`,
                modifiche: {},
                consigli: [returnPlan.notes],
                returnPlan
            }
        } catch (e) {
            return {
                risposta: `Errore nel generare il piano di rientro: ${e.message}`,
                modifiche: {},
                consigli: []
            }
        }
    }

    // Chat normale
    const prompt = CHAT_PROMPT_TEMPLATE
        .replace('{message}', message)
        .replace('{context}', ctxStr)

    const requestBody = {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 8192,
        top_p: 0.9,
        response_format: { type: 'json_object' }
    }

    try {
        const response = await fetch(MISTRAL_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(requestBody)
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return {
                risposta: `Errore: ${errorData.message || 'Impossibile contattare l AI'}`,
                modifiche: {},
                consigli: []
            }
        }

        const result = await response.json()
        const content = result.choices[0].message.content

        return safeJsonParse(content)

    } catch (error) {
        console.error('[Mistral Chat] Errore:', error)
        return {
            risposta: "Impossibile connettersi all'AI",
            modifiche: {},
            consigli: []
        }
    }
}

function generateLocalSuggestions(startDate, endDate) {
    const suggestions = {}
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0]
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

function generateReturnSchedule(doneWorkouts) {
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
