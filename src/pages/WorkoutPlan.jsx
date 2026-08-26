import { useContext, useState } from 'react'
import { SettingsContext } from '../contexts/SettingsContext'

export default function WorkoutPlan() {
  const { 
    workoutPlan, 
    addEsercizio, 
    removeEsercizio, 
    updateEsercizio,
    addWorkoutFile,
    removeWorkoutFile 
  } = useContext(SettingsContext)
  
  const [newEsercizio, setNewEsercizio] = useState({
    nome: '',
    serie: 3,
    ripetizioni: 10,
    riposo: 60,
    note: ''
  })

  const [editingIndex, setEditingIndex] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // Funzioni ausiliarie per i file
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (mimeType) => {
    if (!mimeType) return 'fill'
    const mime = mimeType.toLowerCase()
    if (mime.includes('pdf')) return 'pdf'
    if (mime.includes('image')) return 'image'
    if (mime.includes('word')) return 'text'
    if (mime.includes('excel') || mime.includes('spreadsheet')) return 'spreadsheet'
    if (mime.includes('text')) return 'text'
    if (mime.includes('zip') || mime.includes('compressed')) return 'zip'
    return 'fill'
  }

  const downloadFile = (file) => {
    const link = document.createElement('a')
    link.href = file.data
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Funzione per aprire la modal di anteprima
  const openPreview = (file) => {
    setPreviewFile(file)
    setShowPreviewModal(true)
  }

  // Funzione per chiudere la modal
  const closePreview = () => {
    setShowPreviewModal(false)
    setPreviewFile(null)
  }

  // Funzione per rendere l'anteprima del file
  const renderPreview = (file) => {
    if (!file || !file.data) return null
    const type = (file.type || '').toLowerCase()

    // Immagini
    if (type.includes('image')) {
      return (
        <img 
          src={file.data} 
          alt={file.name || 'File'} 
          className="img-fluid rounded"
          style={{ maxHeight: '70vh', maxWidth: '100%' }}
        />
      )
    }

    // PDF
    if (type.includes('pdf')) {
      return (
        <div className="ratio ratio-16x9">
          <iframe 
            src={file.data} 
            title={file.name || 'File'}
            className="w-100 h-100 border-0"
          />
        </div>
      )
    }

    // Testo (TXT, CSV, JSON, ecc.)
    if (type.includes('text') || 
        file.name.endsWith('.txt') || 
        file.name.endsWith('.csv') || 
        file.name.endsWith('.json')) {
      return (
        <div 
          className="bg-light p-3 rounded" 
          style={{ 
            maxHeight: '70vh', 
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: '0.8rem'
          }}
        >
          <p className="text-muted small mb-2">
            Anteprima testuale - Contenuto parziale per file di grandi dimensioni
          </p>
          <p>
            Questo file ({type || file.type || 'sconosciuto'}) può essere visualizzato come testo. 
            Per vedere il contenuto completo, scarica il file.
          </p>
        </div>
      )
    }

    // Altri tipi
    return (
      <div className="text-center py-5">
        <i className={`bi bi-file-earmark-${getFileIcon(type)} fs-1 text-primary mb-3`}></i>
        <h5>{file.name || 'File sconosciuto'}</h5>
        <p className="text-muted">Anteprima non disponibile per questo tipo di file</p>
        <button className="btn btn-primary" onClick={() => downloadFile(file)}>
          <i className="bi bi-download me-2"></i>Scarica File
        </button>
      </div>
    )
  }

  // Funzione per verificare se un file è visualizzabile
  const isPreviewable = (file) => {
    if (!file) return false
    const type = (file.type || '').toLowerCase()
    return type.includes('image') || 
           type.includes('pdf') || 
           type.includes('text') ||
           ['.txt', '.csv', '.json'].some(ext => file.name.endsWith(ext))
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.value ? e.target.files : [])
    if (files.length === 0) return

    try {
      for (const file of files) {
        await addWorkoutFile(file)
      }
      // Reset input per permettere di selezionare gli stessi file di nuovo
      e.target.value = ''
    } catch (error) {
      alert(error.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setNewEsercizio({
      ...newEsercizio,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newEsercizio.nome.trim() === '') return
    
    if (editingIndex !== null) {
      updateEsercizio(editingIndex, newEsercizio)
      setEditingIndex(null)
    } else {
      addEsercizio(newEsercizio)
    }
    setNewEsercizio({ nome: '', serie: 3, ripetizioni: 10, riposo: 60, note: '' })
  }

  const startEdit = (index) => {
    setEditingIndex(index)
    setNewEsercizio(workoutPlan.esercizi[index])
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setNewEsercizio({ nome: '', serie: 3, ripetizioni: 10, riposo: 60, note: '' })
  }

  return (
    <>
      <h1 className="mb-4">Scheda Allenamento</h1>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">{editingIndex !== null ? 'Modifica Esercizio' : 'Aggiungi Nuovo Esercizio'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label htmlFor="nome" className="form-label">Nome Esercizio *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="nome" 
                  name="nome" 
                  value={newEsercizio.nome} 
                  onChange={handleInputChange}
                  required
                  placeholder="Es. Panca piana"
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="serie" className="form-label">Serie</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="serie" 
                  name="serie" 
                  value={newEsercizio.serie} 
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="ripetizioni" className="form-label">Ripetizioni</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="ripetizioni" 
                  name="ripetizioni" 
                  value={newEsercizio.ripetizioni} 
                  onChange={handleInputChange}
                  min="1"
                  max="100"
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="riposo" className="form-label">Riposo (sec)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="riposo" 
                  name="riposo" 
                  value={newEsercizio.riposo} 
                  onChange={handleInputChange}
                  min="0"
                  max="300"
                />
              </div>
              <div className="col-md-2 d-flex align-items-end">
                {editingIndex !== null ? (
                  <>
                    <button type="submit" className="btn btn-success btn-sm me-2">
                      <i className="bi bi-check"></i> Salva
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                      <i className="bi bi-x"></i> Annulla
                    </button>
                  </>
                ) : (
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-plus"></i> Aggiungi
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="note" className="form-label">Note</label>
              <textarea 
                className="form-control" 
                id="note" 
                name="note" 
                value={newEsercizio.note} 
                onChange={handleInputChange}
                rows="2"
                placeholder="Es. 4x12 per ipertrofia"
              ></textarea>
            </div>
          </form>
        </div>
      </div>

      {workoutPlan.esercizi.length === 0 ? (
        <div className="alert alert-info">
          Nessun esercizio aggiunto. Inizia ad aggiungere esercizi alla tua scheda di allenamento.
        </div>
      ) : (
        <div className="card mb-4">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Esercizi Attuali ({workoutPlan.esercizi.length})</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Esercizio</th>
                    <th className="text-center">Serie</th>
                    <th className="text-center">Ripetizioni</th>
                    <th className="text-center">Riposo (sec)</th>
                    <th>Note</th>
                    <th className="text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {workoutPlan.esercizi.map((esercizio, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{esercizio.nome}</td>
                      <td className="text-center">{esercizio.serie}</td>
                      <td className="text-center">{esercizio.ripetizioni}</td>
                      <td className="text-center">{esercizio.riposo}</td>
                      <td>{esercizio.note || '-'}</td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-warning me-2" 
                          onClick={() => startEdit(index)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => removeEsercizio(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Sezione File */}
      <div className="card">
        <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">File Allegati</h5>
          <label className="btn btn-light btn-sm m-0">
            <i className="bi bi-upload me-1"></i>
            Aggiungi File
            <input 
              type="file" 
              className="d-none"
              onChange={handleFileUpload}
              accept="*"
              multiple
            />
          </label>
        </div>
        <div className="card-body">
          {(workoutPlan.files?.length || 0) === 0 ? (
            <div className="alert alert-info mb-0">
              Nessun file allegato. Carica PDF, immagini o altri documenti.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th className="text-center">Dimensione</th>
                    <th>Caricato il</th>
                    <th className="text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {(workoutPlan.files || []).map((file) => (
                    <tr key={file.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`bi bi-file-earmark-${getFileIcon(file.type)} me-2 text-primary`}></i>
                          {file.name}
                          {file.description && (
                            <small className="d-block text-muted">{file.description}</small>
                          )}
                        </div>
                      </td>
                      <td>{file.type || 'Sconosciuto'}</td>
                      <td className="text-center">{formatFileSize(file.size)}</td>
                      <td>{new Date(file.uploadedAt).toLocaleDateString('it-IT')}</td>
                      <td className="text-center">
                        {isPreviewable(file) && (
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => openPreview(file)}
                            title="Visualizza anteprima"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                        )}
                        <button 
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => downloadFile(file)}
                        >
                          <i className="bi bi-download"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => removeWorkoutFile(file.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Anteprima File - Custom implementation senza Bootstrap JS */}
      {showPreviewModal && (
        <div 
          className="modal-backdrop fade show"
          onClick={closePreview}
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
        className={`modal fade ${showPreviewModal ? 'show d-block' : 'd-none'}`} 
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
        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi bi-file-earmark-${getFileIcon(previewFile?.type)} me-2`}></i>
                {previewFile?.name || 'File'}
              </h5>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={closePreview}
                aria-label="Chiudi"
              ></button>
            </div>
            <div className="modal-body">
              {previewFile ? renderPreview(previewFile) : (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer bg-light">
              <div className="d-flex justify-content-between align-items-center w-100">
                <div>
                  <span className="text-muted me-3">
                    <i className="bi bi-filetype-text me-1"></i>
                    {previewFile?.type || 'Sconosciuto'}
                  </span>
                  <span className="text-muted">
                    <i className="bi bi-hdd me-1"></i>
                    {previewFile ? formatFileSize(previewFile.size) : ''}
                  </span>
                </div>
                <div>
                  <button className="btn btn-secondary me-2" onClick={closePreview}>
                    <i className="bi bi-x-circle me-1"></i>Chiudi
                  </button>
                  {previewFile && (
                    <button className="btn btn-primary" onClick={() => downloadFile(previewFile)}>
                      <i className="bi bi-download me-1"></i>Scarica
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
