const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

const PROMPT_TEMPLATE = `
Sei un esperto di fitness e nutrizione. Basandoti su questi dati:
- Obiettivo: {obiettivo}
- Livello: {livello}
- Preferenze alimentari: {preferenzeAlimentari}
- Giorni di allenamento: {workoutDays}
- Durata allenamento: {durataAllenamento} minuti
- Orari pasti: {orariPasti}

Genera un piano dettagliato in formato JSON con questa struttura:
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

Non includere testate di codice o spiegazioni, solo il JSON valido.
`

/**
 * Genera suggerimenti personalizzati chiamando l'API Mistral
 * @param {Object} data - Dati del form utente
 * @returns {Promise<Object>} - Oggetto con dieta, routine e calendario
 */
export async function generateSuggestions(data) {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
    
    if (!apiKey) {
        throw new Error('Chiave API Mistral non configurata. Aggiungi VITE_MISTRAL_API_KEY al file .env')
    }

    // Costruisci il prompt con i dati
    const prompt = PROMPT_TEMPLATE
        .replace('{obiettivo}', data.obiettivo || 'Mantenimento')
        .replace('{livello}', data.livello || 'Intermedio')
        .replace('{preferenzeAlimentari}', data.preferenzeAlimentari || 'Onnivoro')
        .replace('{workoutDays}', data.workoutDays?.join(', ') || 'Lunedi, Mercoledi, Venerdi')
        .replace('{durataAllenamento}', data.durataAllenamento || '60')
        .replace('{orariPasti}', JSON.stringify(data.orariPasti || {}))

    const requestBody = {
        model: 'mistral-tiny',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
            const errorData = await response.json()
            throw new Error(errorData.message || 'Errore nella chiamata API Mistral')
        }

        const result = await response.json()
        const content = result.choices[0].message.content

        // Parsa la risposta (dovrebbe essere JSON)
        try {
            // Rimuovi eventuali backtick e formattazione markdown
            const cleanedContent = content.replace(/```json|```/g, '').trim()
            return JSON.parse(cleanedContent)
        } catch (parseError) {
            console.error('Errore nel parsing della risposta:', parseError)
            // Restituisci un oggetto vuoto se il parsing fallisce
            return {
                dieta: {},
                routine: {},
                calendario: {}
            }
        }
    } catch (error) {
        console.error('Errore nella chiamata API Mistral:', error)
        throw error
    }
}

/**
 * Salva i suggerimenti generati da Mistral
 * @param {Object} suggestions - Suggerimenti da salvare
 */
export function saveSuggestions(suggestions) {
    localStorage.setItem('palestra_suggestions', JSON.stringify(suggestions))
}

/**
 * Carica i suggerimenti salvati
 * @returns {Object|null} - Suggerimenti salvati o null
 */
export function loadSuggestions() {
    const saved = localStorage.getItem('palestra_suggestions')
    return saved ? JSON.parse(saved) : null
}

const CHAT_PROMPT_TEMPLATE = `
Sei un assistente AI esperto in fitness e nutrizione. L'utente ha il seguente piano:

Piano corrente:
{context}

L'utente ti chiede: "{message}"

Analizza la richiesta e fornisci suggerimenti pratici e specifici per modificare dieta e/o routine in base alla situazione. 
Rispondi in formato JSON con questa struttura:
{
  "risposta": "testo della risposta in linguaggio naturale",
  "modifiche": {
    "dieta": {
      "{giorno}": {
        "pasti": {
          "{nomePasto}": {
            "ora": "HH:MM",
            "cibo": "descrizione",
            "calorie": "numero",
            "grammi": "peso"
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
    }
  },
  "consigli": ["consiglio1", "consiglio2"]
}

Non includere testate di codice o spiegazioni, solo il JSON valido.
`

/**
 * Invía un messaggio al bot AI per ricevere suggerimenti su modifiche al piano
 * @param {string} message - Messaggio dell'utente
 * @param {Object} context - Contesto (dati corrente dell'utente)
 * @returns {Promise<Object>} - Risposta del bot con suggerimenti
 */
export async function chatWithMistral(message, context) {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY
    
    if (!apiKey) {
        throw new Error('Chiave API Mistral non configurata. Aggiungi VITE_MISTRAL_API_KEY al file .env')
    }

    const contextString = JSON.stringify(context)
    const prompt = CHAT_PROMPT_TEMPLATE
        .replace('{message}', message)
        .replace('{context}', contextString)

    const requestBody = {
        model: 'mistral-tiny',
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: 0.7,
        max_tokens: 2000
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
            const errorData = await response.json()
            throw new Error(errorData.message || 'Errore nella chiamata API Mistral')
        }

        const result = await response.json()
        const content = result.choices[0].message.content

        try {
            const cleanedContent = content.replace(/```json|```/g, '').trim()
            return JSON.parse(cleanedContent)
        } catch (parseError) {
            console.error('Errore nel parsing della risposta:', parseError)
            return {
                risposta: content,
                modifiche: { dieta: {}, routine: {} },
                consigli: []
            }
        }
    } catch (error) {
        console.error('Errore nella chiamata API Mistral:', error)
        throw error
    }
}
