import { useContext, useState, useEffect, useRef } from 'react'
import { chatWithMistral, ACTION_TYPES, AVAILABLE_PAGES } from '../services/mistral'
import { SettingsContext } from '../contexts/SettingsContext'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ChatBot() {
  const navigate = useNavigate()
  const location = useLocation()
  const settingsContext = useContext(SettingsContext)

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const messagesEndRef = useRef(null)

  // Ottieni la pagina corrente dal path
  const getCurrentPage = () => {
    const path = location.pathname
    for (const [key, value] of Object.entries(AVAILABLE_PAGES)) {
      if (value === path) return key
    }
    return 'HOME'
  }

  // Salva messaggio in storico chat quando viene inviato
  const saveToHistory = () => {
    if (messages.length > 0) {
      const savedHistory = localStorage.getItem('palestra_chat_history')
      const history = savedHistory ? JSON.parse(savedHistory) : []
      
      const newChat = {
        id: `chat_${Date.now()}`,
        sessionId: 'current',
        title: messages[0]?.content?.substring(0, 50) || `Chat ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`,
        messages,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      let updatedHistory = history.filter(h => h.sessionId !== 'current')
      updatedHistory.unshift(newChat)
      
      localStorage.setItem('palestra_chat_history', JSON.stringify(updatedHistory.slice(0, 20)))
    }
  }

  // Scorri verso il basso quando i messaggi cambiano
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Funzione per eseguire azioni del bot
  const handleBotAction = async (botResponse) => {
    const { tipo, pagina, dati, modifiche, risposta } = botResponse

    switch (tipo) {
      case ACTION_TYPES.NAVIGA:
        if (pagina) {
          navigate(pagina)
          setShowChat(false)
          const pageName = Object.entries(AVAILABLE_PAGES).find(([, v]) => v === pagina)?.[0]
          addBotMessage(`Ok, sto aprendo la pagina ${pageName || pagina}`)
        }
        break

      case ACTION_TYPES.AGGIORNA_SETTINGS:
        if (settingsContext?.updateSettings && Object.keys(modifiche).length > 0) {
          settingsContext.updateSettings(modifiche)
          addBotMessage(`Impostazioni aggiornate: ${JSON.stringify(modifiche, null, 2)}`)
        }
        break

      case ACTION_TYPES.AGGIUNGI_ESERCIZIO:
        if (settingsContext?.addEsercizio && dati) {
          settingsContext.addEsercizio(dati)
          addBotMessage(`Esercizio aggiunto: ${dati.nome || JSON.stringify(dati)}`)
        }
        break

      case ACTION_TYPES.RIMUOVI_ESERCIZIO:
        if (settingsContext?.removeEsercizio && dati?.index !== undefined) {
          settingsContext.removeEsercizio(dati.index)
          addBotMessage(`Esercizio rimosso all'indice ${dati.index}`)
        }
        break

      case ACTION_TYPES.MODIFICA_ESERCIZIO:
        if (settingsContext?.updateEsercizio && dati?.index !== undefined) {
          settingsContext.updateEsercizio(dati.index, dati.data)
          addBotMessage(`Esercizio modificato: ${JSON.stringify(dati.data, null, 2)}`)
        }
        break

      case ACTION_TYPES.AGGIUNGI_PASTO:
        if (settingsContext?.addPasto && dati) {
          settingsContext.addPasto(dati)
          addBotMessage(`Pasto aggiunto: ${dati.descrizione || JSON.stringify(dati)}`)
        }
        break

      case ACTION_TYPES.RIMUOVI_PASTO:
        if (settingsContext?.removePasto && dati?.index !== undefined) {
          settingsContext.removePasto(dati.index)
          addBotMessage(`Pasto rimosso all'indice ${dati.index}`)
        }
        break

      case ACTION_TYPES.MODIFICA_PASTO:
        if (settingsContext?.updatePasto && dati?.index !== undefined) {
          settingsContext.updatePasto(dati.index, dati.data)
          addBotMessage(`Pasto modificato: ${JSON.stringify(dati.data, null, 2)}`)
        }
        break

      case ACTION_TYPES.ERRORE:
        setError(risposta)
        addBotMessage(`Errore: ${risposta}`)
        break

      default:
        // Messaggio normale
        if (risposta) {
          addBotMessage(risposta)
        }
    }
  }

  // Aggiungi messaggio del bot
  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { role: 'assistant', content: text }])
  }

  // Gestisci invio messaggio
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setError(null)

    // Aggiungi messaggio utente
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      // Prepara il contesto per il bot
      const context = {
        currentPage: getCurrentPage(),
        settings: settingsContext?.settings || {},
        workoutPlan: settingsContext?.workoutPlan || {},
        nutritionPlan: settingsContext?.nutritionPlan || {}
      }

      // Chiama il bot
      const botResponse = await chatWithMistral(userMessage, context)
      
      // Aggiungi risposta del bot
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse.risposta }])

      // Esegue azioni del bot
      await handleBotAction(botResponse)
      
      // Salva in storico dopo aver ricevuto la risposta
      saveToHistory()
    } catch (err) {
      setError(err.message)
      addBotMessage(`Si e' verificato un errore: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Chiudi chat
  const closeChat = () => {
    saveToHistory()
    setShowChat(false)
    setError(null)
  }

  // Apri chat
  const openChat = () => {
    setShowChat(true)
    setError(null)
  }

  return (
    <>
      {/* Pulsante per aprire chat */}
      <button 
        className="btn btn-outline-light ms-3"
        onClick={openChat}
        title="Apri Chat con AI"
      >
        <i className="bi bi-robot"></i> AI
      </button>

      {/* Modal Chat - Custom implementation senza Bootstrap JS */}
      {showChat && (
        <div 
          className="modal-backdrop fade show"
          onClick={closeChat}
          style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1040,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        ></div>
      )}
      
      <div 
        className={`modal fade ${showChat ? 'show d-block' : 'd-none'}`} 
        tabIndex="-1" 
        style={{
          position: 'fixed', 
          top: 0, 
          left: 0,
          zIndex: 1050,
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: '800px' }}>
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title d-flex align-items-center">
                <i className="bi bi-robot me-2"></i>
                Assistente AI
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={closeChat}
                aria-label="Chiudi"
              ></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-robot text-primary fs-1 mb-3"></i>
                  <h5>Ciao! Sono il tuo assistente AI</h5>
                  <p className="text-muted mb-4">
                    Posso aiutarti a gestire la tua routine di allenamento e dieta.
                  </p>
                  <div className="list-group list-group-flush">
                    <button 
                      className="list-group-item list-group-item-action"
                      onClick={() => setInputMessage('Cosa posso mangiare per la massa muscolare?')}
                    >
                      Suggerimenti dieta
                    </button>
                    <button 
                      className="list-group-item list-group-item-action"
                      onClick={() => setInputMessage('Quali esercizi devo fare per la forza?')}
                    >
                      Suggerimenti allenamento
                    </button>
                    <button 
                      className="list-group-item list-group-item-action"
                      onClick={() => setInputMessage('Vai a Impostazioni')}
                    >
                      Vai a Impostazioni
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`mb-3 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}
                    >
                      <div 
                        className={`d-inline-block p-3 rounded ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{ maxWidth: '80%', wordWrap: 'break-word' }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="text-start mb-3">
                      <div className="d-inline-block p-3 bg-light rounded">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Caricamento...</span>
                        </div>
                        <span className="ms-2">Sto pensando...</span>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="alert alert-danger">
                      {error}
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="modal-footer bg-light">
              <form onSubmit={handleSendMessage} className="w-100 d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Scrivi un messaggio..."
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  <i className="bi bi-send"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
