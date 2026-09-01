// Servizio per integrazione con API Mistral AI
// URL API Mistral
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat'

// Modello predefinito
export const MISTRAL_MODEL = 'mistral-tiny-2407'

export const VITE_MISTRAL_API_KEY = import.meta.env.VITE_MISTRAL_API_KEY

// Tipi di azione supportati dal bot
export const ACTION_TYPES = {
  NAVIGA: 'naviga',
  AGGIORNA_SETTINGS: 'aggiorna_settings',
  AGGIUNGI_ESERCIZIO: 'aggiungi_esercizio',
  RIMUOVI_ESERCIZIO: 'rimuovi_esercizio',
  MODIFICA_ESERCIZIO: 'modifica_esercizio',
  AGGIUNGI_PASTO: 'aggiungi_pasto',
  RIMUOVI_PASTO: 'rimuovi_pasto',
  MODIFICA_PASTO: 'modifica_pasto',
  SUGGERIMENTO: 'suggerimento',
  ERRORE: 'errore',
  MESSAGGIO: 'messaggio'
}

// Pagine disponibili per la navigazione
export const AVAILABLE_PAGES = {
  HOME: '/',
  SETTINGS: '/settings',
  WORKOUT_PLAN: '/workout-plan',
  NUTRITION_PLAN: '/nutrition-plan'
}

// Funzione per chiamata API generica
export async function callMistralApi(messages, model = MISTRAL_MODEL) {
  if (!VITE_MISTRAL_API_KEY) {
    return {
      errore: 'Chiave API Mistral non configurata. Aggiungi VITE_MISTRAL_API_KEY nel file .env',
      tipo: ACTION_TYPES.ERRORE
    }
  }

  try {
    const response = await fetch(MISTRAL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VITE_MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        errore: `Errore API Mistral: ${response.status} - ${errorData.message || response.statusText}`,
        tipo: ACTION_TYPES.ERRORE
      }
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch (error) {
    return {
      errore: `Errore di connessione: ${error.message}`,
      tipo: ACTION_TYPES.ERRORE
    }
  }
}

// Funzione per parseare la risposta e estrarre azione e dati
export function parseBotResponse(rawResponse, currentPage = '') {
  const response = {
    risposta: rawResponse,
    tipo: ACTION_TYPES.MESSAGGIO,
    pagina: currentPage || null,
    dati: null,
    modifiche: {},
    consigli: [],
    comandi: []
  }

  // Se c'è un errore, restituisci direttamente
  if (typeof rawResponse === 'object' && rawResponse.errore) {
    return {
      ...response,
      risposta: rawResponse.errore,
      tipo: ACTION_TYPES.ERRORE
    }
  }

  // Analizza la risposta testuale per estrarre comandi
  if (typeof rawResponse === 'string') {
    const lowerResponse = rawResponse.toLowerCase()

    // Rileva navigazione
    const pageKeywords = {
      'calendario': AVAILABLE_PAGES.HOME,
      'home': AVAILABLE_PAGES.HOME,
      'impostazioni': AVAILABLE_PAGES.SETTINGS,
      'settings': AVAILABLE_PAGES.SETTINGS,
      'scheda allenamento': AVAILABLE_PAGES.WORKOUT_PLAN,
      'workout': AVAILABLE_PAGES.WORKOUT_PLAN,
      'allenamento': AVAILABLE_PAGES.WORKOUT_PLAN,
      'scheda nutrizionale': AVAILABLE_PAGES.NUTRITION_PLAN,
      'nutrition': AVAILABLE_PAGES.NUTRITION_PLAN,
      'dieta': AVAILABLE_PAGES.NUTRITION_PLAN,
      'alimentazione': AVAILABLE_PAGES.NUTRITION_PLAN
    }

    for (const [keyword, page] of Object.entries(pageKeywords)) {
      if (lowerResponse.includes(keyword)) {
        response.pagina = page
        response.tipo = ACTION_TYPES.NAVIGA
        break
      }
    }

    // Rileva modifiche alle impostazioni
    const settingsKeywords = [
      'cambia obiettivo',
      'modifica obiettivo',
      'imposta obiettivo',
      'cambia livello',
      'modifica livello',
      'imposta livello',
      'cambia preferenze',
      'modifica preferenze'
    ]

    if (settingsKeywords.some(kw => lowerResponse.includes(kw))) {
      response.tipo = ACTION_TYPES.AGGIORNA_SETTINGS
    }

    // Rileva modifiche alla scheda allenamento
    const workoutKeywords = [
      'aggiungi esercizio',
      'nuovo esercizio',
      'rimuovi esercizio',
      'elimina esercizio',
      'cancella esercizio',
      'modifica esercizio',
      'cambia esercizio'
    ]

    if (workoutKeywords.some(kw => lowerResponse.includes(kw))) {
      response.tipo = ACTION_TYPES.AGGIUNGI_ESERCIZIO
    }

    // Rileva modifiche alla scheda nutrizionale
    const nutritionKeywords = [
      'aggiungi pasto',
      'nuovo pasto',
      'rimuovi pasto',
      'elimina pasto',
      'cancella pasto',
      'modifica pasto',
      'cambia pasto'
    ]

    if (nutritionKeywords.some(kw => lowerResponse.includes(kw))) {
      response.tipo = ACTION_TYPES.AGGIUNGI_PASTO
    }
  }

  return response
}

// Funzione per chat con Mistral
// Restituisce un oggetto strutturato per l'interazione con l'app
export async function chatWithMistral(message, context = {}) {
  const {
    currentPage = '',
    settings = {},
    workoutPlan = {},
    nutritionPlan = {}
  } = context

  if (!VITE_MISTRAL_API_KEY) {
    return {
      risposta: 'API Mistral non configurata. Aggiungi VITE_MISTRAL_API_KEY nel file .env',
      tipo: ACTION_TYPES.ERRORE,
      pagina: null,
      dati: null,
      modifiche: {},
      consigli: [],
      comandi: []
    }
  }

  try {
    // Costruisci il contesto per il bot
    const systemPrompt = `Sei un assistente esperto per la gestione di dieta e routine di palestra.
Ti fornirò il contesto dell'applicazione e tu dovrai rispondere in modo utile.

CONTESTO:
- Pagina corrente: ${currentPage || 'sconosciuta'}
- Obiettivo: ${settings.obiettivo || 'non impostato'}
- Livello: ${settings.livello || 'non impostato'}
- Giorni allenamento: ${settings.giorniAllenamento?.join(', ') || 'non impostati'}
- Numero esercizi: ${workoutPlan.esercizi?.length || 0}
- Numero pasti: ${nutritionPlan.pasti?.length || 0}

ISTRUZIONI:
1. Se l'utente chiede di navigare a una pagina, indica chiaramente la pagina (es: "Vai a Calendario", "Apri Impostazioni")
2. Se l'utente chiede modifiche ai dati, spiega cosa serve fare e fornisci i dati strutturati
3. Per le modifiche, usa un formato chiaro che possa essere interpretato automaticamente
4. Mantieni le risposte brevi e dirette
5. Se non puoi soddisfare la richiesta, spiegalo chiaramente

Formato risposta:
- Testo libero per l'utente
- Se serve navigare: includi "Vai a [Nome Pagina]"
- Se serve modificare dati: includi i dettagli in formato testuale`

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: message
      }
    ]

    const rawResponse = await callMistralApi(messages)

    if (typeof rawResponse === 'string') {
      return parseBotResponse(rawResponse, currentPage)
    }

    return {
      risposta: rawResponse.errore || 'Errore sconosciuto',
      tipo: ACTION_TYPES.ERRORE,
      pagina: null,
      dati: null,
      modifiche: {},
      consigli: [],
      comandi: []
    }
  } catch (error) {
    return {
      risposta: `Errore: ${error.message}`,
      tipo: ACTION_TYPES.ERRORE,
      pagina: null,
      dati: null,
      modifiche: {},
      consigli: [],
      comandi: []
    }
  }
}

// Funzione per generare suggerimenti basati sui dati corrente
export async function generateSuggestions(data) {
  const { settings = {}, workoutPlan = {}, nutritionPlan = {} } = data

  if (!VITE_MISTRAL_API_KEY) {
    return {
      dieta: [],
      routine: [],
      suggerimenti: [],
      errore: 'Chiave API Mistral non configurata'
    }
  }

  try {
    const prompt = `Analizza questi dati e fornisci suggerimenti specifici:

DATI CORRENTI:
- Obiettivo: ${settings.obiettivo || 'non impostato'}
- Livello: ${settings.livello || 'non impostato'}
- Giorni allenamento: ${settings.giorniAllenamento?.join(', ') || 'non impostati'}
- Orari pasti: ${settings.orariPasti?.map(p => `${p.ora} - ${p.descrizione}`).join(', ') || 'non impostati'}

SCHEDA ALLENAMENTO:
- Numero esercizi: ${workoutPlan.esercizi?.length || 0}
${workoutPlan.esercizi?.map((e, i) => `- Esercizio ${i + 1}: ${e.nome || 'non specificato'} - ${e.serie || '?'}x${e.ripetizioni || '?'} - Riposo: ${e.riposo || '?'}s`).join('\n') || 'Nessun esercizio'}

SCHEDA NUTRIZIONALE:
- Numero pasti: ${nutritionPlan.pasti?.length || 0}
${nutritionPlan.pasti?.map((p, i) => `- Pasto ${i + 1}: ${p.descrizione || 'non specificato'} - Calorie: ${p.calorie || '?'}kcal - ${p.ora || 'ora non specificata'}`).join('\n') || 'Nessun pasto'}

FORNISCI SUGGERIMENTI IN FORMATO JSON:
{
  "dieta": ["suggerimento 1 per dieta", "suggerimento 2 per dieta"],
  "routine": ["suggerimento 1 per routine", "suggerimento 2 per routine"],
  "suggerimenti": ["suggerimento generale 1", "suggerimento generale 2"]
}`

    const messages = [
      {
        role: 'system',
        content: 'Sei un esperto di fitness e nutrizionista. Analizza i dati forniti e fornisci suggerimenti strutturati in JSON come specificato. Non aggiungere altro testo, solo il JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const rawResponse = await callMistralApi(messages)

    if (typeof rawResponse === 'string') {
      // Prova a parseare il JSON dalla risposta
      try {
        // Pulisci la risposta per estrarre solo il JSON
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          return {
            dieta: parsed.dieta || [],
            routine: parsed.routine || [],
            suggerimenti: parsed.suggerimenti || [],
            errore: null
          }
        }
      } catch {
        // Se il parsing fallisce, restituisci la risposta grezza
        return {
          dieta: [],
          routine: [],
          suggerimenti: [rawResponse],
          errore: null
        }
      }
    }

    return {
      dieta: [],
      routine: [],
      suggerimenti: [],
      errore: rawResponse.errore || 'Errore sconosciuto'
    }
  } catch (error) {
    return {
      dieta: [],
      routine: [],
      suggerimenti: [],
      errore: error.message
    }
  }
}

// Funzione per eseguire un comando specifico
export async function executeBotCommand(command, _context) {
  const { tipo, dati, pagina, modifiche } = command

  switch (tipo) {
    case ACTION_TYPES.NAVIGA:
      return { action: 'navigate', page: pagina }

    case ACTION_TYPES.AGGIORNA_SETTINGS:
      return { action: 'updateSettings', data: modifiche }

    case ACTION_TYPES.AGGIUNGI_ESERCIZIO:
      return { action: 'addEsercizio', data: dati }

    case ACTION_TYPES.RIMUOVI_ESERCIZIO:
      return { action: 'removeEsercizio', data: dati }

    case ACTION_TYPES.MODIFICA_ESERCIZIO:
      return { action: 'updateEsercizio', data: dati }

    case ACTION_TYPES.AGGIUNGI_PASTO:
      return { action: 'addPasto', data: dati }

    case ACTION_TYPES.RIMUOVI_PASTO:
      return { action: 'removePasto', data: dati }

    case ACTION_TYPES.MODIFICA_PASTO:
      return { action: 'updatePasto', data: dati }

    case ACTION_TYPES.SUGGERIMENTO:
    case ACTION_TYPES.MESSAGGIO:
      return { action: 'showMessage', data: { message: command.risposta } }

    case ACTION_TYPES.ERRORE:
      return { action: 'showError', data: { error: command.risposta } }

    default:
      return { action: 'unknown' }
  }
}

