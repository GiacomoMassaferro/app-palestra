const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

/**
 * Data locale YYYY-MM-DD senza shift UTC (fix 2026-09-05)
 */
function dataLocaleMistral(d = new Date()) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const giorno = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${giorno}`
}

/**
 * Funzione per pulire il contenuto LLM senza distruggere il JSON:
 * - NOTA 2026-09-05: estrae JSON da code-block invece di cancellarlo
 * - Preserva accenti italiani e newline/tab
 * - Rimuove solo caratteri di controllo pericolosi
 */
function cleanJsonString(str) {
    if (!str || typeof str !== 'string') {
        return ''
    }

    let base = str.trim()

    // 1. Se c'e' un code-block, estrai il contenuto interno invece di cancellarlo
    const codeBlockMatch = base.match(/```(?:json)?\s*([\s\S]*?)```/i)
    if (codeBlockMatch && codeBlockMatch[1] && codeBlockMatch[1].trim().startsWith('{')) {
        base = codeBlockMatch[1].trim()
    }

    return base
        // 2. Rimuovi BOM
        .replace(/\uFEFF/g, '')

        // 3. Fissa virgolette smart (preservano JSON valido)
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")

        // 4. Rimuovi spazi non-breaking
        .replace(/\u00A0/g, ' ')

        // 5. Rimuovi solo caratteri di controllo pericolosi, preserva \n \r \t
        // eslint-disable-next-line no-control-regex
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        .trim()
        // NOTA: accenti italiani preservati volutamente, JSON e UTF-8 li supportano
}

/**
 * Funzione per parsare in modo sicuro il JSON da LLM
 * Restituisce SEMPRE un oggetto valido, mai un errore
 */
function safeJsonParse(str, fallback = null) {
    if (!str || typeof str !== 'string') {
        return fallback || { risposta: "Risposta non valida", modifiche: {}, consigli: [], comandi: [], refresh: false }
    }
    
    try {
        const cleaned = cleanJsonString(str)

        // Se la stringa pulita è vuota, restituisci fallback
        if (!cleaned || cleaned.trim() === '') {
            return fallback || { risposta: "Risposta non valida", modifiche: {}, consigli: [], comandi: [], refresh: false }
        }

        // Verifica che inizi con {
        // NOTA 2026-09-05: match greedy per JSON nested (dieta/routine)
        if (!cleaned.trim().startsWith('{')) {
            // Tentativo di trovare un oggetto JSON nella stringa (primo { ... ultimo })
            const startIdx = cleaned.indexOf('{')
            const endIdx = cleaned.lastIndexOf('}')
            if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                try {
                    const parsed = JSON.parse(cleanJsonString(cleaned.slice(startIdx, endIdx + 1)))
                    // Assicurati che sia un oggetto
                    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                        return parsed
                    }
                } catch {
                    // Fallthrough
                }
            }
            if (fallback) return fallback
            return { risposta: "Risposta non valida", modifiche: {}, consigli: [], comandi: [], refresh: false }
        }

        // Prova a parsare tutto
        const parsed = JSON.parse(cleaned)
        
        // Assicurati che sia un oggetto
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed
        }
        
        // Se non è un oggetto, restituisci fallback
        return fallback || { risposta: "Risposta non valida", modifiche: {}, consigli: [], comandi: [], refresh: false }
        
    } catch (e) {
        console.warn('[JSON Parser] Errore:', e.message)
        console.warn('[JSON Parser] Contenuto:', str.substring(0, 500))

        // Tentativo di recupero: estrai dal primo { all'ultimo } (greedy per nested)
        const startIdx = str.indexOf('{')
        const endIdx = str.lastIndexOf('}')
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            try {
                const parsed = JSON.parse(cleanJsonString(str.slice(startIdx, endIdx + 1)))
                if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                    return parsed
                }
            } catch {
                // Fallthrough
            }
        }

        return fallback || { risposta: "Risposta non valida. La risposta potrebbe essere troncata o malformata.", modifiche: {}, consigli: [], comandi: [], refresh: false }
    }
}

const PROMPT_TEMPLATE = `
Sei un esperto di fitness e nutrizione. Basandoti su questi dati:
- Utente: {userInfo}
- Obiettivo: {obiettivo}
- Livello: {livello}
- Preferenze alimentari: {preferenzeAlimentari}
- Giorni di allenamento: {workoutDays}
- Durata allenamento: {durataAllenamento} minuti
- Orari pasti: {orariPasti}

IMPORTANTE: NON generare piani da zero. L'utente ha già una dieta e una scheda di allenamento caricate.
Il tuo ruolo è SOLO quello di:
1. Fornire suggerimenti basati sui dati esistenti
2. Proporre modifiche momentanee (ad esempio per ferie, malattia, ecc.)
3. Adattare i piani esistenti alle nuove situazioni
4. Fornire consigli generali su allenamento e alimentazione

IMPORTANTE: Per modificare il calendario, usa UNICAMENTE i seguenti comandi (valori esatti di "tipo"):
- ferie: {startDate: YYYY-MM-DD, endDate: YYYY-MM-DD}
- pasto: {description, date?, calories?} (alias: mangiato)
- attivita: {description, date?, type?} (alias: fatto)
- rientro: {context?} (alias: piano_rientro, aggiorna_piano)
- dieta: {giorno: Lunedi|Martedi|Mercoledi|Giovedi|Venerdi|Sabato|Domenica, pasti}
- routine: {giorno: Lunedi|Martedi|Mercoledi|Giovedi|Venerdi|Sabato|Domenica, dati}
- modifiche: {modifiche}
NOTA: mai usare slash nei tipi (es. mai "pasto/mangiato"), "refresh" sempre false, mai reload pagina.

Se l'utente chiede di modificare qualcosa, restituisci UNICAMENTE un oggetto JSON valido con:
{
  "risposta": "testo risposta",
  "modifiche": {},
  "consigli": [],
  "comandi": [{"tipo": "nomeComando", "parametri": {}}]
}
NON generare codice, markdown o spiegazioni. SOLO JSON valido.

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
          "calorie": "numero",
          "grammi": "quantita"
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
 * Crea il contesto utente con dati personali
 */
function getUserContext() {
    // NOTA 2026-09-05: fix precedenza operatori (eta vs annoNascita)
    try {
        const user = localStorage.getItem('palestra_user')
        if (user) {
            const userData = JSON.parse(user)
            let eta = 0
            if (userData.eta) {
                eta = userData.eta
            } else if (userData.annoNascita) {
                eta = new Date().getFullYear() - userData.annoNascita
            }
            return {
                nome: userData.nome || '',
                cognome: userData.cognome || '',
                eta,
                altezza: userData.altezza || 0,
                peso: userData.peso || 0,
                sesso: userData.sesso || 'non specificato'
            }
        }
    } catch (e) {
        console.warn('Errore caricamento user context:', e)
    }
    return { nome: '', cognome: '', eta: 0, altezza: 0, peso: 0, sesso: 'non specificato' }
}

/**
 * Crea la stringa con i dati personali per l'IA
 */
function getUserInfoString() {
    const user = getUserContext()
    const parts = []
    
    if (user.nome) parts.push(`nome: ${user.nome}`)
    if (user.cognome) parts.push(`cognome: ${user.cognome}`)
    if (user.eta) parts.push(`età: ${user.eta} anni`)
    if (user.sesso && user.sesso !== 'non specificato') parts.push(`sesso: ${user.sesso}`)
    if (user.altezza) parts.push(`altezza: ${user.altezza} cm`)
    if (user.peso) parts.push(`peso: ${user.peso} kg`)
    
    return parts.length > 0 ? parts.join(', ') : 'Dati utente non disponibili'
}

/**
 * Genera suggerimenti personalizzati chiamando l'API Mistral
 */
export async function generateSuggestions(data) {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
    if (!apiKey) {
        return {
            risposta: "Chiave API Mistral non configurata. Aggiungi VITE_MISTRAL_API_KEY al file .env",
            modifiche: {},
            consigli: [],
            comandi: [],
            refresh: false
        }
    }

    const userInfo = getUserInfoString()

    const prompt = PROMPT_TEMPLATE
        .replace('{obiettivo}', data.obiettivo || 'Mantenimento')
        .replace('{livello}', data.livello || 'Intermedio')
        .replace('{preferenzeAlimentari}', data.preferenzeAlimentari || 'Onnivoro')
        .replace('{workoutDays}', data.workoutDays?.join(', ') || 'Lunedi, Mercoledi, Venerdi')
        .replace('{durataAllenamento}', data.durataAllenamento || '60')
        .replace('{orariPasti}', JSON.stringify(data.orariPasti || {}))
        .replace('{userInfo}', userInfo)

    const requestBody = {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 16384,
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
            consigli: [],
            comandi: [],
            refresh: false
        }
    }
}

export function saveSuggestions(suggestions) {
    localStorage.setItem('palestra_suggestions', JSON.stringify(suggestions))
}

export function loadSuggestions() {
    const saved = localStorage.getItem('palestra_suggestions')
    if (!saved) return null
    try {
        return JSON.parse(saved)
    } catch {
        return null
    }
}

const CHAT_PROMPT_TEMPLATE = `
Sei un assistente AI esperto in fitness e nutrizione.

Profilo utente (da Login): {userInfo}

Impostazioni profilo (da Impostazioni, usa SEMPRE questi valori):
- Obiettivo: {obiettivo}
- Livello: {livello}
- Preferenze alimentari: {preferenzeAlimentari}
- Giorni allenamento: {workoutDays}
- Durata allenamento: {durataAllenamento} minuti
- Orari pasti: {orariPasti}

Piano corrente JSON: {context}

File caricati dall'utente (fonte primaria per dieta/scheda):
- File Dieta: {dietaFile}
- File Scheda: {schedaFile}

IMPORTANTE:
- Usa PRIMA i file dieta/scheda se presenti, poi le impostazioni profilo, poi il piano corrente.
- Se dietaFile e schedaFile contengono JSON, DEVI usarli per "cosa mangio oggi?" e "che allenamento faccio oggi?".
- Se dietaFile o schedaFile dicono "contenuto non leggibile" o "solo anteprima", NON inventare il contenuto: dillo all'utente e chiedi di incollare il testo o usare Impostazioni.
- NON generare piani da zero. Adatta solo i piani esistenti.
- Fornisci SOLO suggerimenti, modifiche momentanee e adattamenti.
- Consigli generali sempre personalizzati su eta, sesso, altezza, peso, obiettivo e livello.

L'utente ti chiede: "{message}"

COMANDI DISPONIBILI (usa ESATTAMENTE questi valori in "tipo", mai con slash o spazi):
- ferie: {startDate: YYYY-MM-DD, endDate: YYYY-MM-DD}
- pasto: {description, date?, calories?} (alias validi: mangiato)
- attivita: {description, date?, type?} (alias validi: fatto)
- rientro: {context?} (alias validi: piano_rientro, aggiorna_piano)
- dieta: {giorno: Lunedi|Martedi|Mercoledi|Giovedi|Venerdi|Sabato|Domenica, pasti: {...}}
- routine: {giorno: Lunedi|Martedi|Mercoledi|Giovedi|Venerdi|Sabato|Domenica, dati: {...}}
- modifiche: {modifiche: {dieta: {...}, routine: {...}}}
- sposta: {da: Lunedi|..., a: Lunedi|...} per spostare UN solo allenamento (libera origine come Giorno libero e sovrascrive destinazione)
- ripristina: {} per ripristinare tutti gli allenamenti come da workoutDays nelle impostazioni

REGOLE:
- Mai usare "pasto/mangiato" o "rientro/aggiorna_piano" come tipo, sono due alias separati.
- Se l'utente dice "sposta allenamento da X a Y" (nomi settimana), usa SEMPRE solo {"tipo":"sposta","parametri":{"da":"X","a":"Y"}} per tutta la settimana.
- Se dice "oggi", "domani", "domenica prossima" o date precise, usa {"tipo":"sposta","parametri":{"da":"X","a":"Y","dataDa":"YYYY-MM-DD","dataA":"YYYY-MM-DD"}} per spostare SOLO quelle 2 date, altri giorni invariati.
- Lo sposta singolo muove SOLO quei 2 giorni: libera origine e sovrascrive destinazione. Non toccare altri giorni, non mandare modifiche extra, un solo comando sposta per risposta.
- Se l'utente dice "ripristina come da impostazioni", usa SEMPRE solo {"tipo":"ripristina","parametri":{}}.
- Se modifichi dieta/routine puoi usare sia "modifiche" sia singoli comandi "dieta"/"routine", non duplicarli.
- "refresh" deve essere SEMPRE false: la pagina non si ricarica mai, le modifiche si applicano al click su Conferma.
- Nomi giorni senza accenti, date sempre YYYY-MM-DD.

DEVI restituire UNICAMENTE un oggetto JSON valido con questa struttura, senza markdown ne testo extra:
{
  "risposta": "string",
  "modifiche": {},
  "consigli": [],
  "comandi": [{"tipo": "nomeComando", "parametri": {}}],
  "refresh": false
}
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
            consigli: [],
            comandi: [],
            refresh: false
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
                consigli: [],
                comandi: [],
                refresh: false
            }
        }
        
        // NON salvare direttamente in localStorage - restituisci solo il comando da confermare
        return {
            risposta: `Ho compreso che vuoi aggiungere ferie dal ${startDate} al ${endDate}. Vuoi che le aggiunga?`,
            modifiche: {},
            consigli: ["Le ferie verranno aggiunte al tuo calendario dopo la conferma."],
            comandi: [
                {
                    tipo: "ferie",
                    parametri: { startDate, endDate }
                }
            ],
            refresh: false
        }
    }

    // Comando /ho mangiato pizza OPPURE "ho mangiato una pizza"
    // NOTA 2026-09-05: solo passato prossimo + no domande, anti falsi positivi
    const isQuestionMeal = /\?\s*$/.test(message) || /^(cosa|che|dove|quando|come|quale|quanto)\b/i.test(message.trim())
    const mealMatch = message.match(/^\/(ho\s*mangiato|ate|meal)\s+(.+)$/i)
    const naturalMealMatch = !isQuestionMeal ? message.match(/ho\s+mangiato(?:\s+oggi)?\s*(?:\:|\-)?\s*(.+)/i) : null

    if (mealMatch || (naturalMealMatch && naturalMealMatch[1] && naturalMealMatch[1].trim().length > 2)) {
        const description = mealMatch ? mealMatch[2] : naturalMealMatch[1]
        
        // NON salvare direttamente - restituisci solo il comando da confermare
        return {
            risposta: `Ho capito che hai mangiato: "${description.trim()}". Vuoi che lo registri?`,
            modifiche: {},
            consigli: ["Il pasto verra registrato come cheat meal per il piano di rientro"],
            comandi: [
                {
                    tipo: "pasto",
                    parametri: { description: description.trim(), date: dataLocaleMistral(new Date()) }
                }
            ],
            refresh: false
        }
    }

    // Comando /ho fatto yoga 30 min OPPURE "ho fatto yoga oggi"
    // NOTA 2026-09-05: solo "ho fatto X" con X lungo, no domande/dolori, anti falsi positivi
    const isQuestionWorkout = /\?\s*$/.test(message) || /^(cosa|che|dove|quando|come|quale|quanto)\b/i.test(message.trim())
    const workoutMatch = message.match(/^\/(ho\s*fatto|did|workout)\s+(.+)$/i)
    const naturalWorkoutMatch = !isQuestionWorkout ? message.match(/ho\s+fatto(?:\s+oggi)?\s*(?:\:|\-)?\s*(.+)/i) : null
    const workoutDescOk = (d) => d && d.trim().length > 2 && !/^(male|male al|male alla|male allo|un sogno|colazione|paura)\b/i.test(d.trim())

    if (workoutMatch || (naturalWorkoutMatch && workoutDescOk(naturalWorkoutMatch[1]))) {
        const description = workoutMatch ? workoutMatch[2] : naturalWorkoutMatch[1]
        
        // NON salvare direttamente - restituisci solo il comando da confermare
        return {
            risposta: `Ho capito che hai fatto: "${description.trim()}". Vuoi che lo registri?`,
            modifiche: {},
            consigli: ["L'attivita verra registrata nel tuo calendario"],
            comandi: [
                {
                    tipo: "attivita",
                    parametri: { description: description.trim(), date: dataLocaleMistral(new Date()), type: 'workout' }
                }
            ],
            refresh: false
        }
    }

    // Comando /interpreta file
    const interpretMatch = message.match(/^\/(interpreta|interpret|parse)\s+(dieta|scheda|file)\s+da\s+file:\s*(.+)$/i)
    const naturalInterpretMatch = message.match(/(?:interpreta|interpreta\s+il|analizza|leggi)\s+(?:il\s+)?(dieta|scheda|file|documento|allegato)/i)
    
    if (interpretMatch || naturalInterpretMatch) {
        const fileType = interpretMatch ? interpretMatch[2] : naturalInterpretMatch[1]
        // Il contenuto del file dovrebbe essere passaggio come terzo parametro
        // ma in chatWithMistral non abbiamo accesso diretto ai file
        // Quindi restituiamo un messaggio che spiega come fare
        return {
            risposta: `Per interpretare un file ${fileType}, caricalo prima nella sezione Impostazioni. L'IA lo analizzerà automaticamente e lo convertirà nel formato adatto all'app.`,
            modifiche: {},
            consigli: [`I formati supportati sono: JSON, TXT, CSV, XML, YAML, PDF, Excel, Word, ecc.`],
            comandi: [],
            refresh: false
        }
    }

    // Comando /piano rientro - solo con verbo d'azione, anti falsi positivi
    const returnMatch = message.match(/^\/(piano\s*rientro|return\s*plan|rientro)$/i)
    const naturalReturnMatch = message.match(/(genera|crea|fammi|voglio|vorrei|prepara).*piano.*rientro|voglio\s+rientrare/i)

    if (returnMatch || naturalReturnMatch) {
        let activities = []
        try {
            activities = JSON.parse(localStorage.getItem('palestra_vacation_activities') || '[]')
            if (!Array.isArray(activities)) activities = []
        } catch {
            activities = []
        }
        try {
            const doneWorkouts = activities.filter((a) => a.type === 'workout' && a.done).length
            const cheatMeals = activities.filter((a) => a.isCheatMeal).length

            // NOTA 2026-09-05: passa data reale, non context annidato
            const pianoData = context?.data || null
            return {
                risposta: `Vuoi che generi un piano di rientro basato su ${doneWorkouts} attivita eseguite e ${cheatMeals} sgarri?`,
                modifiche: {},
                consigli: ['Il piano di rientro verra generato dopo la conferma'],
                comandi: [
                    {
                        tipo: 'rientro',
                        parametri: { context: { data: pianoData } }
                    }
                ],
                refresh: false
            }
        } catch (e) {
            return {
                risposta: `Errore nella preparazione del piano di rientro: ${e.message}`,
                modifiche: {},
                consigli: [],
                comandi: [],
                refresh: false
            }
        }
    }

    // Comando ripristina allenamenti come da impostazioni
    if (/^\/(ripristina)/i.test(message) || /ripristina.*allenamenti.*impostazioni|ripristina.*come.*da.*impostazioni/i.test(message)) {
        return {
            risposta: 'Vuoi ripristinare gli allenamenti come da impostazioni? I giorni in workoutDays torneranno attivi, gli altri diventeranno Giorno libero.',
            modifiche: {},
            consigli: ['Conferma per applicare senza ricaricare la pagina'],
            comandi: [{ tipo: 'ripristina', parametri: {} }],
            refresh: false
        }
    }

    // Comando sposta allenamento: "/sposta Lunedi Martedi", "sposta da Lunedi a Martedi",
    // "sposta allenamento di oggi a domenica prossima" (singola data, non tutta la settimana)
    // NOTA 2026-09-05: gestione locale deterministica, poi Conferma senza reload
    const normGiorno = (g) => {
        const mappa = { lunedi: 'Lunedi', martedi: 'Martedi', mercoledi: 'Mercoledi', giovedi: 'Giovedi', venerdi: 'Venerdi', sabato: 'Sabato', domenica: 'Domenica' }
        const k = String(g).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
        return mappa[k] || g
    }
    const toDataStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const prossimaWeekday = (weekdayIdx) => {
        const oggi = new Date()
        const diff = (weekdayIdx - oggi.getDay() + 7) % 7 || 7
        const d = new Date(oggi)
        d.setDate(oggi.getDate() + diff)
        return d
    }
    const risolviData = (txt) => {
        const t = String(txt).toLowerCase().trim()
        const oggi = new Date()
        if (t === 'oggi') return toDataStr(oggi)
        if (t === 'domani') {
            const d = new Date(oggi)
            d.setDate(oggi.getDate() + 1)
            return toDataStr(d)
        }
        const mProssima = t.match(/(lunedi|martedi|mercoledi|giovedi|venerdi|sabato|domenica)\s+prossim[oa]/)
        if (mProssima) {
            const idx = ['domenica', 'lunedi', 'martedi', 'mercoledi', 'giovedi', 'venerdi', 'sabato'].indexOf(mProssima[1])
            return toDataStr(prossimaWeekday(idx))
        }
        const mData = t.match(/(\d{4})-(\d{2})-(\d{2})/)
        if (mData) return `${mData[1]}-${mData[2]}-${mData[3]}`
        return null
    }
    const spostaSlash = message.match(/^\/(sposta)\s+([A-Za-zàèéìòù]+)\s+(?:a|su|->|in\s+)?\s*([A-Za-zàèéìòù]+)\s*$/i)
    const spostaNaturale = message.match(/sposta(?:re)?\s+(?:l['’]?allenamento\s+)?(?:di\s+oggi\s+|di\s+([A-Za-zàèéìòù\s]+?)\s+)?(?:da\s+)?([A-Za-zàèéìòù\s]+?)\s+(?:a|su|al|nel|in)\s+([A-Za-zàèéìòù\s]+?)\s*$/i)
    if (spostaSlash || spostaNaturale) {
        const rawDa = spostaSlash ? spostaSlash[2] : (spostaNaturale[2] || spostaNaturale[1] || '')
        const rawA = spostaSlash ? spostaSlash[3] : spostaNaturale[3]
        const daNorm = normGiorno(rawDa)
        const aNorm = normGiorno(rawA)
        // Se frasi con oggi/prossima/data specifica: sposta SOLO quelle 2 date
        const isSingolo = /oggi|domani|prossim|prossimo|\d{4}-\d{2}-\d{2}/i.test(message)
        if (isSingolo) {
            const dataDa = risolviData(rawDa) || (/oggi/i.test(message) ? toDataStr(new Date()) : null)
            const dataA = risolviData(rawA) || null
            if (dataDa && dataA && dataDa !== dataA) {
                return {
                    risposta: `Vuoi spostare SOLO l'allenamento del ${dataDa} al ${dataA}? Gli altri giorni restano invariati.`,
                    modifiche: {},
                    consigli: ['Conferma per applicare senza ricaricare la pagina'],
                    comandi: [{ tipo: 'sposta', parametri: { da: daNorm, a: aNorm, dataDa, dataA } }],
                    refresh: false
                }
            }
        }
        return {
            risposta: `Vuoi spostare l'allenamento da ${daNorm} a ${aNorm}? ${daNorm} diventera Giorno libero e ${aNorm} verra sovrascritto.`,
            modifiche: {},
            consigli: ['Conferma per applicare senza ricaricare la pagina'],
            comandi: [{ tipo: 'sposta', parametri: { da: daNorm, a: aNorm } }],
            refresh: false
        }
    }

    // Chat normale
    // NOTA 2026-09-05: profilo+impostazioni espliciti + file senza doppio encoding ne crash
    const userInfo = getUserInfoString()
    const impostazioni = context?.data || {}
    const obiettivo = impostazioni.obiettivo || 'non specificato'
    const livello = impostazioni.livello || 'non specificato'
    const preferenzeAlimentari = impostazioni.preferenzeAlimentari || 'non specificate'
    const workoutDays = Array.isArray(impostazioni.workoutDays) && impostazioni.workoutDays.length > 0 ? impostazioni.workoutDays.join(', ') : 'non specificati'
    const durataAllenamento = impostazioni.durataAllenamento || 'non specificata'
    const orariPasti = impostazioni.orariPasti ? JSON.stringify(impostazioni.orariPasti).slice(0, 2000) : 'non specificati'

    const formattaFilePerAI = (rawFile, tipoFile) => {
        if (!rawFile) return `nessun file ${tipoFile} caricato`
        // Oggetto gia parsato: stringify diretto, niente doppio encoding
        if (typeof rawFile === 'object') {
            try {
                return JSON.stringify(rawFile).slice(0, 6000)
            } catch {
                return `file ${tipoFile} non leggibile`
            }
        }
        if (typeof rawFile === 'string') {
            // Binario [FILE:mime:nome]:dataURL -> manda anteprima sicura, mai tutto il base64
            if (rawFile.startsWith('[FILE:')) {
                const fileMatch = rawFile.match(/^\[FILE:([^:]*):([^\]]+)\]:(.*)$/)
                if (fileMatch) {
                    const mime = fileMatch[1] || 'sconosciuto'
                    const nome = fileMatch[2] || 'sconosciuto'
                    const contenuto = fileMatch[3] || ''
                    const estensione = mime.includes('/') ? mime.split('/')[1].toUpperCase() : mime.toUpperCase()
                    // Se dataURL testuale, prova a includere un estratto leggibile
                    let anteprima = ''
                    if (contenuto.startsWith('data:text') || contenuto.length < 5000) {
                        anteprima = contenuto.slice(0, 2000)
                    } else {
                        anteprima = contenuto.slice(0, 500) + '... [troncato per dimensioni]'
                    }
                    return `File binario ${tipoFile}: tipo=${mime}, nome=${nome}, formato=${estensione}, contenuto non leggibile direttamente dall'AI. Anteprima: ${anteprima}. Chiedi all'utente di incollare il testo se serve il dettaglio.`
                }
                return `File ${tipoFile} caricato ma non interpretabile: ${rawFile.slice(0, 500)}`
            }
            // Stringa che contiene gia JSON: evita doppio encoding
            const trimmed = rawFile.trim()
            if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                try {
                    JSON.parse(trimmed)
                    return trimmed.slice(0, 6000)
                } catch {
                    // non JSON valido, prosegui sotto
                }
            }
            return rawFile.slice(0, 6000)
        }
        return `file ${tipoFile} non leggibile`
    }

    const dietaFileContent = formattaFilePerAI(context?.dietaFile, 'dieta')
    const schedaFileContent = formattaFilePerAI(context?.schedaFile, 'scheda')

    const prompt = CHAT_PROMPT_TEMPLATE
        .replace('{message}', message)
        .replace('{context}', ctxStr.slice(0, 8000))
        .replace('{userInfo}', userInfo)
        .replace('{obiettivo}', String(obiettivo))
        .replace('{livello}', String(livello))
        .replace('{preferenzeAlimentari}', String(preferenzeAlimentari))
        .replace('{workoutDays}', String(workoutDays))
        .replace('{durataAllenamento}', String(durataAllenamento))
        .replace('{orariPasti}', String(orariPasti))
        .replace('{dietaFile}', dietaFileContent)
        .replace('{schedaFile}', schedaFileContent)

    const requestBody = {
        model: 'mistral-tiny',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 16384,
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
                consigli: [],
                comandi: [],
                refresh: false
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
            consigli: [],
            comandi: [],
            refresh: false
        }
    }
}

