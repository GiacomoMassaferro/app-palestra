import { useState, useEffect, useRef } from 'react'
import { chatWithMistral } from '../services/mistral'
import { eseguiComandi, applicaModifiche as applicaModificheDaComandi } from '../services/comandi'

export default function ChatPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [inputValue, setInputValue] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const messagesEndRef = useRef(null)

    // Carica i dati correnti dell'utente per il contesto
    const [context, setContext] = useState(null)

    useEffect(() => {
        const savedData = localStorage.getItem('palestra_data')
        const savedSuggestions = localStorage.getItem('palestra_suggestions')
        const savedUser = localStorage.getItem('palestra_user')
        const savedDietaFile = localStorage.getItem('palestra_dieta_file')
        const savedSchedaFile = localStorage.getItem('palestra_scheda_file')
        
        const currentContext = {
            data: savedData ? JSON.parse(savedData) : null,
            suggestions: savedSuggestions ? JSON.parse(savedSuggestions) : null,
            user: savedUser ? JSON.parse(savedUser) : null,
            dietaFile: savedDietaFile ? JSON.parse(savedDietaFile) : null,
            schedaFile: savedSchedaFile ? JSON.parse(savedSchedaFile) : null
        }
        setContext(currentContext)
    }, [])

    // Scroller automatico verso il basso quando i messaggi cambiano
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || loading) return

        const userMessage = inputValue.trim()
        setInputValue('')
        setError(null)

        // Aggiungi il messaggio dell'utente
        setMessages(prev => [...prev, { 
            text: userMessage, 
            sender: 'user', 
            timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) 
        }])

        setLoading(true)

        try {
            console.log(`[ChatPopup] Invio messaggio:`, userMessage)
            
            // Chiama l'API Mistral con il messaggio e il contesto
            const response = await chatWithMistral(userMessage, context)
            
            console.log(`[ChatPopup] Risposta AI:`, response)
            
            // Formatta la risposta del bot
            const botMessage = {
                text: response.risposta || 'Grazie per la tua domanda. Ho elaborato alcune modifiche per il tuo piano.',
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                modifiche: response.modifiche || {},
                consigli: response.consigli || [],
                comandi: response.comandi || [],
                vacationData: response.vacationData,
                refreshPage: response.refreshPage || response.refresh || false
            }
            
            console.log(`[ChatPopup] Messaggio bot formattato:`, botMessage)
            
            setMessages(prev => [...prev, botMessage])
            
            // Se c'è la richiesta di refresh, ricarica la pagina dopo un breve delay
            if (response.refreshPage || response.refresh) {
                setTimeout(() => {
                    window.location.reload()
                }, 1500)
            }
            
        } catch (err) {
            console.error('Errore nell invio del messaggio:', err)
            setError('Impossibile connettersi al bot AI. Verifica che la chiave API sia configurata nel file .env')
            
            // Aggiungi un messaggio di errore del bot
            setMessages(prev => [...prev, {
                text: 'Mi dispiace, non sono riuscito a elaborare la tua richiesta. Potrebbe esserci un problema con la configurazione dell\'API.',
                sender: 'bot',
                timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const togglePopup = () => {
        setIsOpen(!isOpen)
    }

    const closePopup = () => {
        setIsOpen(false)
    }

    const clearChat = () => {
        setMessages([])
        setError(null)
    }

    /**
     * Esegue i comandi e applica le modifiche suggerite dal bot
     */
    const applyModifiche = (modifiche, messageIndex, comandi = []) => {
        console.log(`[applyModifiche] Chiamato con:`, { modifiche, comandi })
        
        // Assicurati che comandi sia un array
        const comandiArray = Array.isArray(comandi) ? comandi : []
        
        // Se non ci sono modifiche ne' comandi
        if (!modifiche && comandiArray.length === 0) {
            console.log(`[applyModifiche] Nessuna modifica o comando da applicare`)
            setMessages(prev => [...prev, {
                text: '❌ Nessuna modifica o comando da applicare.',
                sender: 'system',
                timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }])
            return
        }
        
        try {
            let needsRefresh = false
            
            // Se ci sono comandi da eseguire
            if (comandiArray.length > 0) {
                try {
                    const risultatoComandi = eseguiComandi(comandiArray)
                    
                    if (!risultatoComandi || typeof risultatoComandi !== 'object') {
                        setMessages(prev => [...prev, {
                            text: '❌ Risposta non valida dall esecuzione dei comandi',
                            sender: 'system',
                            timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                            isError: true
                        }])
                        return
                    }
                    
                    if (!risultatoComandi.successo) {
                        setMessages(prev => [...prev, {
                            text: `❌ Errore nell'esecuzione dei comandi: ${risultatoComandi.messaggio || 'Errore sconosciuto'}`,
                            sender: 'system',
                            timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                            isError: true
                        }])
                        return
                    }
                    
                    // Mostra notifica per comandi eseguiti
                    setMessages(prev => [...prev, {
                        text: `✅ ${risultatoComandi.messaggio || 'Comandi eseguiti'}`,
                        sender: 'system',
                        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                        isSuccess: true
                    }])
                    
                    if (risultatoComandi.refresh) {
                        needsRefresh = true
                    }
                } catch (comandiError) {
                    console.error('[ChatPopup] Errore in eseguiComandi:', comandiError)
                    setMessages(prev => [...prev, {
                        text: `❌ Errore critico: ${comandiError.message || String(comandiError)}`,
                        sender: 'system',
                        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                        isError: true
                    }])
                    return
                }
            }
            
            // Se ci sono modifiche alla dieta/routine da applicare
            if (modifiche && Object.keys(modifiche).length > 0) {
                // Usa la funzione da comandi.js per applicare le modifiche
                const risultato = applicaModificheDaComandi(modifiche)
                
                if (!risultato.successo) {
                    setMessages(prev => [...prev, {
                        text: `❌ Errore nell'applicazione delle modifiche: ${risultato.messaggio}`,
                        sender: 'system',
                        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                        isError: true
                    }])
                    return
                }

                // Aggiorna il contesto locale
                setContext(prev => ({
                    ...prev,
                    suggestions: risultato.dati
                }))

                // Aggiorna i messaggi per mostrare che le modifiche sono state applicate
                setMessages(prev => prev.map((msg, idx) => {
                    if (idx === messageIndex && msg.sender === 'bot') {
                        return {
                            ...msg,
                            applied: true
                        }
                    }
                    return msg
                }))

                // Mostra notifica
                setMessages(prev => [...prev, {
                    text: '✅ Modifiche applicate con successo!',
                    sender: 'system',
                    timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                    isSuccess: true
                }])
                
                if (risultato.refresh) {
                    needsRefresh = true
                }
            }
            
            // Ricarica la pagina SE e SOLO SE e' necessario
            if (needsRefresh) {
                setTimeout(() => {
                    window.location.reload()
                }, 1000)
            }

        } catch (err) {
            console.error('Errore nell applicazione delle modifiche:', err)
            setMessages(prev => [...prev, {
                text: '❌ Errore nell applicazione delle modifiche. Riprova.',
                sender: 'system',
                timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
                isError: true
            }])
        }
    }

    return (
        <>
            {/* Pulsante fisso per aprire la chat */}
            <button
                className="btn btn-primary btn-lg rounded-circle shadow-lg position-fixed bottom-0 end-0 m-4"
                onClick={togglePopup}
                style={{ 
                    width: '60px', 
                    height: '60px',
                    zIndex: 1050,
                    fontSize: '1.5rem'
                }}
                title="Apri Chat AI"
                aria-label="Apri Chat AI"
            >
                💬
            </button>

            {/* Popup Chat */}
            {isOpen && (
                <div 
                    className="position-fixed bottom-0 end-0 m-4"
                    style={{ 
                        zIndex: 1050,
                        maxWidth: '400px',
                        width: '100%'
                    }}
                >
                    <div className="card shadow-lg border-0">
                        {/* Header del popup */}
                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center p-2">
                            <div className="d-flex align-items-center gap-2">
                                <span className="fs-4">💬</span>
                                <h6 className="mb-0">FitPlan AI</h6>
                            </div>
                            <div className="d-flex gap-1">
                                <button 
                                    className="btn btn-sm btn-outline-light"
                                    onClick={clearChat}
                                    title="Pulisce chat"
                                >
                                    <span className="small">🗑️</span>
                                </button>
                                <button 
                                    className="btn btn-sm btn-outline-light"
                                    onClick={closePopup}
                                    title="Chiudi"
                                >
                                    <span className="small">✕</span>
                                </button>
                            </div>
                        </div>

                        {/* Body del popup - Area messaggi */}
                        <div 
                            className="card-body p-3"
                            style={{ 
                                maxHeight: '400px', 
                                overflowY: 'auto',
                                backgroundColor: '#f8f9fa'
                            }}
                        >
                            {messages.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    <div className="mb-2">
                                        <span style={{ fontSize: '2.5rem' }}>🏋️</span>
                                    </div>
                                    <small>Descrivi la tua situazione e ricevi suggerimenti!</small>
                                    <div className="mt-2">
                                        <small className="text-muted">Es: "Oggi non posso allenarmi"</small>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`d-flex ${msg.sender === 'user' ? 'justify-content-end' : msg.sender === 'system' ? 'justify-content-center' : 'justify-content-start'} mb-2`}
                                    >
                                        <div 
                                            className={`rounded p-2 ${msg.sender === 'user' ? 'bg-primary text-white' : msg.sender === 'system' ? 'bg-light text-center' : 'bg-white border'}`}
                                            style={{ 
                                                maxWidth: msg.sender === 'system' ? '100%' : '85%',
                                                wordWrap: 'break-word',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {msg.sender !== 'system' && (
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <small className={`text-muted ${msg.sender === 'user' ? 'text-white-50' : ''}`}>
                                                        {msg.sender === 'user' ? 'Tu' : 'FitPlan AI'}
                                                    </small>
                                                    <small className={`text-muted ${msg.sender === 'user' ? 'text-white-50' : ''}`}>
                                                        {msg.timestamp}
                                                    </small>
                                                </div>
                                            )}
                                            {msg.sender === 'system' ? (
                                                <p className="mb-0 small">{msg.text}</p>
                                            ) : (
                                                <p className="mb-1 small">{msg.text}</p>
                                            )}
                                            
                                            {/* Mostra modifiche e consigli se e un messaggio del bot */}
                                            {msg.sender === 'bot' && msg.modifiche && Object.keys(msg.modifiche || {}).length > 0 && (
                                                <div className="mt-1">
                                                    <div className="alert alert-info p-1 mb-2 small">
                                                        <strong>📋 Anteprima modifiche:</strong> Queste modifiche verranno applicate al tuo calendario.
                                                    </div>
                                                    {msg.modifiche.dieta && Object.keys(msg.modifiche.dieta || {}).length > 0 && (
                                                        <div className="mb-1">
                                                            <strong className="text-success small">🍽️ Dieta:</strong>
                                                            {Object.entries(msg.modifiche.dieta || {}).map(([giorno, dati]) => (
                                                                <div key={giorno} className="ms-2 mt-1">
                                                                    <small className="text-muted">{giorno}:</small>
                                                                    {dati.pasti && Object.entries(dati.pasti || {}).map(([pasto, dettagli]) => (
                                                                        <div key={pasto} className="ms-2">
                                                                            <span className="badge bg-success bg-opacity-10 text-success small p-1">
                                                                                {pasto}: {dettagli?.cibo || 'N/D'}{dettagli?.grammi ? ` (${dettagli.grammi})` : ''}{dettagli?.calorie ? ` - ${dettagli.calorie} kcal` : ''}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {msg.modifiche.routine && Object.keys(msg.modifiche.routine || {}).length > 0 && (
                                                        <div className="mb-1">
                                                            <strong className="text-primary small">🏋️ Routine:</strong>
                                                            {Object.entries(msg.modifiche.routine || {}).map(([giorno, dati]) => (
                                                                <div key={giorno} className="ms-2 mt-1">
                                                                    <small className="text-muted">{giorno}:</small>
                                                                    <div className="ms-2">
                                                                        <span className="badge bg-primary bg-opacity-10 text-primary small p-1">
                                                                            {dati?.scheda || 'N/D'} ({dati?.durata || '?'} min)
                                                                        </span>
                                                                        {dati?.esercizi && Array.isArray(dati.esercizi) && dati.esercizi.length > 0 && (
                                                                            <div className="mt-1">
                                                                                {dati.esercizi.map((esercizio, idx) => (
                                                                                    <span key={idx} className="badge bg-secondary bg-opacity-10 text-secondary small p-1 ms-1">
                                                                                        {esercizio}
                                                                                    </span>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {msg.consigli && Array.isArray(msg.consigli) && msg.consigli.length > 0 && (
                                                        <div className="mt-1">
                                                            <strong className="text-warning small">💡 Consigli:</strong>
                                                            <ul className="ms-2 mb-0 ps-3">
                                                                {msg.consigli.map((consiglio, idx) => {
                                                                    if (typeof consiglio === 'string') {
                                                                        return <li key={idx} className="small m-0 p-0">{consiglio}</li>
                                                                    }
                                                                    if (consiglio && typeof consiglio === 'object') {
                                                                        const text = consiglio.consiglio || consiglio.text || consiglio.risposta || (Object.values(consiglio) || []).join(' ')
                                                                        return <li key={idx} className="small m-0 p-0">{typeof text === 'string' ? text : JSON.stringify(consiglio)}</li>
                                                                    }
                                                                    return <li key={idx} className="small m-0 p-0">{String(consiglio)}</li>
                                                                })}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Pulsante Conferma - solo se ci sono modifiche o comandi */}
                                                    {(msg.modifiche && Object.keys(msg.modifiche || {}).length > 0) || (msg.comandi && msg.comandi.length > 0) ? (
                                                        <div className="mt-2 text-end">
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => {
                                                                    console.log(`[ChatPopup] Bottone Conferma cliccato per messaggio ${index}`)
                                                                    applyModifiche(msg.modifiche, index, msg.comandi)
                                                                }}
                                                                disabled={msg.applied}
                                                            >
                                                                {msg.applied ? '✅ Eseguito!' : '✓ Conferma'}
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            )}
                                            
                                            {msg.isError && (
                                                <div className="text-danger small mt-1">
                                                    ⚠️ Errore nell'elaborazione
                                                </div>
                                            )}
                                            {msg.isSuccess && (
                                                <div className="text-success small mt-1">
                                                    ✅ {msg.text}
                                                </div>
                                            )}
                                            {msg.refreshPage && (
                                                <div className="text-info small mt-1">
                                                    <i className="bi bi-arrow-clockwise me-1"></i> La pagina verrà ricaricata...
                                                </div>
                                            )}
                                            {msg.vacationData && (
                                                <div className="text-primary small mt-1">
                                                    <i className="bi bi-calendar-check me-1"></i> Ferie registrate con successo!
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer del popup - Input */}
                        <div className="card-footer p-2 border-top-0">
                            {error && (
                                <div className="alert alert-danger p-1 mb-2 small">
                                    {error}
                                </div>
                            )}
                            <div className="input-group input-group-sm">
                                <textarea
                                    className="form-control form-control-sm"
                                    placeholder={loading ? "Aspetta..." : "Descrivi la tua situazione..."}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    rows={1}
                                    disabled={loading}
                                    style={{ resize: 'none', fontSize: '0.9rem' }}
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    type="button"
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || loading}
                                    style={{ fontSize: '0.8rem' }}
                                >
                                    {loading ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        '📤'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Backdrop (opzionale per chiudere cliccando fuori) */}
            {isOpen && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100"
                    style={{ zIndex: 1040, backgroundColor: 'rgba(0,0,0,0.1)' }}
                    onClick={closePopup}
                ></div>
            )}
        </>
    )
}
