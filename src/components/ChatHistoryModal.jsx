import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function ChatHistoryModal() {
  const [showHistory, setShowHistory] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)

  // Carica storico chat da localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('palestra_chat_history')
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory)
        setChatHistory(history)
      } catch (e) {
        console.error('Errore nel caricamento storico chat:', e)
      }
    }
  }, [showHistory])

  // Funzione per generare titolo da messaggi
  const getChatTitle = (msgs) => {
    if (!msgs || msgs.length === 0) return 'Chat senza titolo'
    const firstUserMessage = msgs.find(m => m.role === 'user')
    if (firstUserMessage) {
      const content = firstUserMessage.content
      if (content.length > 50) {
        return `${content.substring(0, 47)}...`
      }
      return content
    }
    return `Chat ${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
  }

  // Formatta data
  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Apri modal storico
  const openHistory = () => {
    setShowHistory(true)
    setSelectedChat(null)
  }

  // Chiudi modal
  const closeHistory = () => {
    setShowHistory(false)
    setSelectedChat(null)
  }

  // Seleziona chat per visualizzarne i messaggi
  const viewChat = (chat) => {
    setSelectedChat(chat)
  }

  // Torna all'elenco
  const backToList = () => {
    setSelectedChat(null)
  }

  return (
    <>
      {/* Voce nel menu per aprire lo storico - visibile solo su desktop */}
      <Link 
        className="nav-link d-none d-lg-inline"
        to="#"
        onClick={(e) => {
          e.preventDefault()
          openHistory()
        }}
      >
        <i className="bi bi-clock-history me-1"></i>Storico Chat
      </Link>

      {/* Modal Storico Chat */}
      {showHistory && (
        <div 
          className="modal-backdrop fade show"
          onClick={closeHistory}
          style={{
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            zIndex: 1060,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
        ></div>
      )}
      
      <div 
        className={`modal fade ${showHistory ? 'show d-block' : 'd-none'}`} 
        tabIndex="-1" 
        style={{
          position: 'fixed', 
          top: 0, 
          left: 0,
          zIndex: 1070,
          width: '100%',
          height: '100%',
          overflowX: 'hidden',
          overflowY: 'auto'
        }}
      >
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header bg-secondary text-white">
              {selectedChat ? (
                <>
                  <h5 className="modal-title">
                    <i className="bi bi-chat-left-text me-2"></i>
                    {getChatTitle(selectedChat.messages)}
                  </h5>
                  <button 
                    type="button" 
                    className="btn btn-outline-light btn-sm me-2"
                    onClick={backToList}
                  >
                    <i className="bi bi-arrow-left"></i> Indietro
                  </button>
                </>
              ) : (
                <h5 className="modal-title">
                  <i className="bi bi-clock-history me-2"></i>
                  Storico Chat
                </h5>
              )}
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={closeHistory}
                aria-label="Chiudi"
              ></button>
            </div>
            
            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {selectedChat ? (
                <div className="chat-messages">
                  {selectedChat.messages.map((msg, index) => (
                    <div 
                      key={index}
                      className={`mb-3 ${msg.role === 'user' ? 'text-end' : 'text-start'}`}
                    >
                      <div 
                        className={`d-inline-block p-3 rounded ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{ maxWidth: '80%', wordWrap: 'break-word' }}
                      >
                        <small className="d-block text-muted opacity-75">
                          {msg.role === 'user' ? 'Tu' : 'Assistente AI'}
                        </small>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-inbox text-muted fs-1 mb-3"></i>
                      <h5>Nessuna chat salvata</h5>
                      <p className="text-muted">
                        Le chat verranno salvate automaticamente qui dopo averle utilizzate.
                      </p>
                    </div>
                  ) : (
                    chatHistory
                      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
                      .map(chat => (
                        <button
                          key={chat.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => viewChat(chat)}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-0">{getChatTitle(chat.messages)}</h6>
                              <small className="text-muted">
                                {formatDate(chat.updatedAt || chat.createdAt)}
                              </small>
                            </div>
                            <div>
                              <span className="badge bg-secondary">
                                {chat.messages.filter(m => m.role === 'user').length + chat.messages.filter(m => m.role === 'assistant').length} msg
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer bg-light">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={closeHistory}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
