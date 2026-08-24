/**
 * File: comandiRouter.js
 * Descrizione: Router centralizzato per l'instradamento automatico delle risposte dell'AI
 *              verso le funzioni appropriate in comandi.js
 * 
 * Questo file fornisce una funzione routeResponse che:
 * 1. Analizza la risposta dell'AI (con comandi, modifiche, consigli)
 * 2. Esegue automaticamente i comandi tramite eseguiComandi
 * 3. Applica automaticamente le modifiche tramite applicaModifiche
 * 4. Restituisce un risultato standardizzato
 */

import { eseguiComandi, applicaModifiche } from './comandi'

/**
 * Funzione principale per instradare le risposte dell'AI
 * 
 * @param {object} aiResponse - Risposta dell'AI nel formato:
 *   {
 *     risposta: string,        // Risposta testuale
 *     modifiche: object,       // Modifiche da applicare al calendario
 *     consigli: array,         // Array di consigli
 *     comandi: array,          // Array di comandi da eseguire
 *     refresh: boolean,        // Se serve refresh della pagina
 *     vacationData: object     // Dati specifici per le ferie
 *   }
 * @param {object} context - Contesto opzionale da passare ai comandi
 * @returns {object} Risultato dell'instradamento:
 *   {
 *     successo: boolean,      // True se tutto e' andato a buon fine
 *     messaggi: array,        // Array di messaggi di risultato
 *     dati: object,           // Dati modificati/ritornati
 *     necessitaRefresh: boolean // True se serve refresh della pagina
 *   }
 */
export function routeResponse(aiResponse, _context = null) {
    const risultati = []
    let necessitaRefresh = false
    let datiCombinati = {}
    let tuttiSuccesso = true

    if (!aiResponse || typeof aiResponse !== 'object') {
        return {
            successo: false,
            messaggi: ['Risposta non valida: atteso un oggetto'],
            dati: null,
            necessitaRefresh: false
        }
    }

    // 1. Gestione dei comandi (se presenti)
    if (aiResponse.comandi && Array.isArray(aiResponse.comandi) && aiResponse.comandi.length > 0) {
        const risultatoComandi = eseguiComandi(aiResponse.comandi)
        
        risultati.push({
            tipo: 'comandi',
            successo: risultatoComandi.successo,
            messaggio: risultatoComandi.messaggio,
            dati: risultatoComandi.dati
        })
        
        if (risultatoComandi.refresh) {
            necessitaRefresh = true
        }
        
        if (!risultatoComandi.successo) {
            tuttiSuccesso = false
        }
        
        if (risultatoComandi.dati) {
            datiCombinati.comandi = risultatoComandi.dati
        }
    }

    // 2. Gestione delle modifiche (se presenti)
    if (aiResponse.modifiche && typeof aiResponse.modifiche === 'object' && Object.keys(aiResponse.modifiche).length > 0) {
        const risultatoModifiche = applicaModifiche(aiResponse.modifiche)
        
        risultati.push({
            tipo: 'modifiche',
            successo: risultatoModifiche.successo,
            messaggio: risultatoModifiche.messaggio,
            dati: risultatoModifiche.dati
        })
        
        if (risultatoModifiche.refresh) {
            necessitaRefresh = true
        }
        
        if (!risultatoModifiche.successo) {
            tuttiSuccesso = false
        }
        
        if (risultatoModifiche.dati) {
            datiCombinati.modifiche = risultatoModifiche.dati
        }
    }

    // 3. Se non ci sono comandi ne' modifiche, consideralo come una semplice risposta
    if (aiResponse.comandi === undefined && aiResponse.modifiche === undefined) {
        return {
            successo: true,
            messaggi: [aiResponse.risposta || 'Risposta ricevuta'],
            dati: aiResponse,
            necessitaRefresh: aiResponse.refresh || false
        }
    }

    // 4. Costruisci i messaggi di risultato
    const messaggi = []
    
    // Aggiungi la risposta originale dell'AI se presente
    if (aiResponse.risposta) {
        messaggi.push(aiResponse.risposta)
    }
    
    // Aggiungi i messaggi dai risultati
    risultati.forEach(r => {
        if (r.messaggio) {
            messaggi.push(r.messaggio)
        }
    })
    
    // Aggiungi i consigli se presenti
    if (aiResponse.consigli && Array.isArray(aiResponse.consigli) && aiResponse.consigli.length > 0) {
        aiResponse.consigli.forEach(consiglio => {
            if (typeof consiglio === 'string') {
                messaggi.push(`Consiglio: ${consiglio}`)
            }
        })
    }

    // 5. Determina il messaggio finale
    if (tuttiSuccesso) {
        if (messaggi.length === 0) {
            messaggi.push('Operazione completata con successo')
        }
    } else {
        const errori = risultati
            .filter(r => !r.successo)
            .map(r => r.messaggio || 'Errore sconosciuto')
        
        if (errori.length > 0) {
            messaggi.push(`⚠️ Alcune operazioni non sono riuscite: ${errori.join('; ')}`)
        }
    }

    return {
        successo: tuttiSuccesso,
        messaggi: messaggi,
        dati: Object.keys(datiCombinati).length > 0 ? datiCombinati : aiResponse,
        necessitaRefresh: necessitaRefresh
    }
}

/**
 * Funzione per eseguire e instradare una singola risposta
 * (wrapper di routeResponse che gestisce anche l'errore)
 * 
 * @param {object} aiResponse - Risposta dell'AI
 * @param {object} context - Contesto opzionale
 * @returns {object} Risultato
 */
export function eseguiRisposta(aiResponse, _context = null) {
    try {
        return routeResponse(aiResponse, _context)
    } catch (e) {
        console.error('[comandiRouter] Errore in eseguiRisposta:', e)
        return {
            successo: false,
            messaggi: [`Errore critico: ${e.message || String(e)}`],
            dati: null,
            necessitaRefresh: false
        }
    }
}

/**
 * Funzione per validare il formato di una risposta AI
 * 
 * @param {object} response - Risposta da validare
 * @returns {object} Risultato della validazione
 */
export function validaFormatoRisposta(response) {
    if (!response || typeof response !== 'object') {
        return {
            valido: false,
            errori: ['La risposta deve essere un oggetto'],
            suggerimenti: []
        }
    }

    const errori = []
    const campiMancanti = []
    const campiPresenti = Object.keys(response)

    // Campi opzionali ma consigliati
    const campiConsigliati = ['risposta', 'modifiche', 'consigli', 'comandi', 'refresh']
    
    campiConsigliati.forEach(campo => {
        if (!(campo in response)) {
            campiMancanti.push(campo)
        }
    })

    // Validazione tipi
    if ('risposta' in response && typeof response.risposta !== 'string') {
        errori.push('Il campo "risposta" deve essere una stringa')
    }

    if ('modifiche' in response && (typeof response.modifiche !== 'object' || Array.isArray(response.modifiche))) {
        errori.push('Il campo "modifiche" deve essere un oggetto')
    }

    if ('consigli' in response && !Array.isArray(response.consigli)) {
        errori.push('Il campo "consigli" deve essere un array')
    }

    if ('comandi' in response && !Array.isArray(response.comandi)) {
        errori.push('Il campo "comandi" deve essere un array')
    }

    if ('refresh' in response && typeof response.refresh !== 'boolean') {
        errori.push('Il campo "refresh" deve essere un booleano')
    }

    // Validazione comandi
    if (response.comandi && Array.isArray(response.comandi)) {
        response.comandi.forEach((comando, index) => {
            if (!comando || typeof comando !== 'object') {
                errori.push(`Il comando all'indice ${index} deve essere un oggetto`)
            } else if (!comando.tipo) {
                errori.push(`Il comando all'indice ${index} deve avere un campo "tipo"`)
            }
        })
    }

    return {
        valido: errori.length === 0,
        errori: errori,
        campiMancanti: campiMancanti,
        campiPresenti: campiPresenti
    }
}
