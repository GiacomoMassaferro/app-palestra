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
        .replace(/`(.*?)`/g, '$1')             // `code` -> testo

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
        .replace(/[\u00E0\u00E1\u00E2\u00E4\u00E5]/g, 'a')
        .replace(/[\u00C0\u00C1\u00C2\u00C4\u00C5]/g, 'A')
        .replace(/[\u00E8\u00E9\u00EA\u00EB]/g, 'e')
        .replace(/[\u00C8\u00C9\u00CA\u00CB]/g, 'E')
        .replace(/[\u00EC\u00ED\u00EE\u00EF]/g, 'i')
        .replace(/[\u00CC\u00CD\u00CE\u00CF]/g, 'I')
        .replace(/[\u00F2\u00F3\u00F4\u00F6\u00F8]/g, 'o')
        .replace(/[\u00D2\u00D3\u00D4\u00D6\u00D8]/g, 'O')
        .replace(/[\u00F9\u00FA\u00FC\u00FD]/g, 'u')
        .replace(/[\u00D9\u00DA\u00DC\u00DD]/g, 'U')
        .replace(/[\u00F1\u00D1]/g, 'n')
        .replace(/[\u00C7\u00E7]/g, 'c')
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

IMPORTANTE: Per modificare il calendario, usa UNICAMENTE i seguenti comandi:
- ferie: {startDate, endDate}
- pasto/mangiato: {description, date?, calories?}
- attivita: {description, date?, type?}
- fatto: {description, date?, type?}
- rientro/aggiorna_piano: {context?}
- dieta: {giorno, pasti}
- routine: {giorno, dati}
- modifiche: {modifiche}

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
    try {
        const user = localStorage.getItem('palestra_user')
        if (user) {
            const userData = JSON.parse(user)
            return {
                nome: userData.nome || '',
                cognome: userData.cognome || '',
                eta: userData.eta || userData.annoNascita ? new Date().getFullYear() - userData.annoNascita : 0,
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
    return saved ? JSON.parse(saved) : null
}

const CHAT_PROMPT_TEMPLATE = `
Sei un assistente AI esperto in fitness e nutrizione.

Dati utente: {userInfo}

Piano corrente: {context}

File caricati dall'utente:
- File Dieta: {dietaFile}
- File Scheda: {schedaFile}

IMPORTANTE:
- L'utente ha caricato file con dieta e scheda di allenamento.
- Se dietaFile e schedaFile contengono dati JSON, DEVI usare questi dati per rispondere alle domande.
- Se dietaFile o schedaFile contengono "File binario" o "CONTENUTO BINARIO", l'utente ha caricato un file non JSON.
  In questo caso, spiega all'utente che devi interpretare il file e generare una struttura adatta.
- Se l'utente chiede "cosa devo mangiare oggi?", rispondi basandoti sul file dieta.
- Se l'utente chiede "che allenamento devo fare oggi?", rispondi basandoti sul file scheda.
- NON generare piani da zero. Adatta solo i piani esistenti.
- Fornisci SOLO suggerimenti, modifiche momentanee e adattamenti.
- Se l'utente chiede consigli generali, forniscili basandoti sui suoi dati personali (eta, altezza, peso).

L'utente ti chiede: "{message}"

COMANDI DISPONIBILI:
- ferie: {startDate, endDate}
- pasto/mangiato: {description, date?, calories?}
- attivita: {description, date?, type?}
- fatto: {description, date?, type?}
- rientro/aggiorna_piano: {context?}
- dieta: {giorno, pasti}
- routine: {giorno, dati}
- modifiche: {modifiche}

DEVI restituire UNICAMENTE un oggetto JSON valido con questa struttura:
{
  "risposta": "string",
  "modifiche": {},
  "consigli": [],
  "comandi": [{"tipo": "nomeComando", "parametri": {}}],
  "refresh": false
}

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
    const mealMatch = message.match(/^\/(ho\s*mangiato|ate|meal)\s+(.+)$/i)
    const naturalMealMatch = message.match(/(?:ho\s+mangiato|ho\s+mangiato\s+|ho\s+mangiato\s+oggi|mangio|mangiato|ho\s+mangiato|ho\s+mangiato\s+oggi)(?:\s+oggi\s+)?(?:\s+|:|-)?\s*(.+)/i)
    
    if (mealMatch || naturalMealMatch) {
        const description = mealMatch ? mealMatch[2] : naturalMealMatch[1]
        
        // NON salvare direttamente - restituisci solo il comando da confermare
        return {
            risposta: `Ho capito che hai mangiato: "${description.trim()}". Vuoi che lo registri?`,
            modifiche: {},
            consigli: ["Il pasto verra registrato come cheat meal per il piano di rientro"],
            comandi: [
                {
                    tipo: "pasto",
                    parametri: { description: description.trim(), date: new Date().toISOString().split('T')[0] }
                }
            ],
            refresh: false
        }
    }

    // Comando /ho fatto yoga 30 min OPPURE "ho fatto yoga oggi"
    const workoutMatch = message.match(/^\/(ho\s*fatto|did|workout)\s+(.+)$/i)
    const naturalWorkoutMatch = message.match(/(?:ho\s+fatto|ho\s+fatto\s+|ho\s+fatto\s+oggi|fatto|allenato|ho\s+fatto|ho\s+fatto\s+oggi)(?:\s+oggi\s+)?(?:\s+|:|-)?\s*(.+)/i)
    
    if (workoutMatch || naturalWorkoutMatch) {
        const description = workoutMatch ? workoutMatch[2] : naturalWorkoutMatch[1]
        
        // NON salvare direttamente - restituisci solo il comando da confermare
        return {
            risposta: `Ho capito che hai fatto: "${description.trim()}". Vuoi che lo registri?`,
            modifiche: {},
            consigli: ["L'attivita verra registrata nel tuo calendario"],
            comandi: [
                {
                    tipo: "attivita",
                    parametri: { description: description.trim(), date: new Date().toISOString().split('T')[0], type: 'workout' }
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

    // Comando /piano rientro
    const returnMatch = message.match(/^\/(piano\s*rientro|return\s*plan|rientro)$/i)
    const naturalReturnMatch = message.match(/(?:piano\s+di\s+rientro|rientro|piano\s+rientro|voglio\s+rientrare)/i)
    
    if (returnMatch || naturalReturnMatch) {
        try {
            const activities = JSON.parse(localStorage.getItem('palestra_vacation_activities') || '[]')
            const doneWorkouts = activities.filter(a => a.type === 'workout' && a.done).length
            const cheatMeals = activities.filter(a => a.isCheatMeal).length
            
            // NON salvare direttamente - restituisci solo il comando da confermare
            return {
                risposta: `Vuoi che generi un piano di rientro basato su ${doneWorkouts} attivita eseguite e ${cheatMeals} sgarri?`,
                modifiche: {},
                consigli: ["Il piano di rientro verra generato dopo la conferma"],
                comandi: [
                    {
                        tipo: "rientro",
                        parametri: { context: { data: context } }
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

    // Chat normale
    const userInfo = getUserInfoString()
    
    // Estrai dietaFile e schedaFile dal contesto
    // Se sono file binari (iniziano con [FILE:), estrarrli per l'AI
    let dietaFileContent = 'nessun file dieta caricato'
    let schedaFileContent = 'nessun file scheda caricato'
    
    if (context?.dietaFile) {
        if (typeof context.dietaFile === 'string' && context.dietaFile.startsWith('[FILE:')) {
            // File binario - estrai tipo e nome
            const fileMatch = context.dietaFile.match(/^\[FILE:([^:]+):([^\]]+)\]:(.*)$/)
            if (fileMatch) {
                dietaFileContent = `File binario: tipo=${fileMatch[1]}, nome=${fileMatch[2]}, contenuto="[CONTENUTO BINARIO - ${fileMatch[1].split('/')[1].toUpperCase()}]"`
            } else {
                dietaFileContent = `File caricato: ${context.dietaFile.substring(0, 200)}...`
            }
        } else {
            dietaFileContent = JSON.stringify(context.dietaFile)
        }
    }
    
    if (context?.schedaFile) {
        if (typeof context.schedaFile === 'string' && context.schedaFile.startsWith('[FILE:')) {
            // File binario - estrai tipo e nome
            const fileMatch = context.schedaFile.match(/^\[FILE:([^:]+):([^\]]+)\]:(.*)$/)
            if (fileMatch) {
                schedaFileContent = `File binario: tipo=${fileMatch[1]}, nome=${fileMatch[2]}, contenuto="[CONTENUTO BINARIO - ${fileMatch[1].split('/')[1].toUpperCase()}]"`
            } else {
                schedaFileContent = `File caricato: ${context.schedaFile.substring(0, 200)}...`
            }
        } else {
            schedaFileContent = JSON.stringify(context.schedaFile)
        }
    }
    
    const prompt = CHAT_PROMPT_TEMPLATE
        .replace('{message}', message)
        .replace('{context}', ctxStr)
        .replace('{userInfo}', userInfo)
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

