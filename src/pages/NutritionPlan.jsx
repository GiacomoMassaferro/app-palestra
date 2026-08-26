import { useContext, useState } from 'react'
import { SettingsContext } from '../contexts/SettingsContext'

export default function NutritionPlan() {
  const { 
    nutritionPlan, 
    addPasto, 
    removePasto, 
    updatePasto,
    addNutritionFile,
    removeNutritionFile 
  } = useContext(SettingsContext)
  
  const [newPasto, setNewPasto] = useState({
    nome: '',
    calorie: 0,
    proteine: 0,
    carboidrati: 0,
    grassi: 0,
    orario: '',
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
        await addNutritionFile(file)
      }
      e.target.value = ''
    } catch (error) {
      alert(error.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    setNewPasto({
      ...newPasto,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newPasto.nome.trim() === '') return
    
    if (editingIndex !== null) {
      updatePasto(editingIndex, newPasto)
      setEditingIndex(null)
    } else {
      addPasto(newPasto)
    }
    setNewPasto({ nome: '', calorie: 0, proteine: 0, carboidrati: 0, grassi: 0, orario: '', note: '' })
  }

  const startEdit = (index) => {
    setEditingIndex(index)
    setNewPasto(nutritionPlan.pasti[index])
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setNewPasto({ nome: '', calorie: 0, proteine: 0, carboidrati: 0, grassi: 0, orario: '', note: '' })
  }

  const calculateTotals = () => {
    return nutritionPlan.pasti.reduce((acc, pasto) => ({
      calorie: acc.calorie + pasto.calorie,
      proteine: acc.proteine + pasto.proteine,
      carboidrati: acc.carboidrati + pasto.carboidrati,
      grassi: acc.grassi + pasto.grassi
    }), { calorie: 0, proteine: 0, carboidrati: 0, grassi: 0 })
  }

  const totals = calculateTotals()

  return (
    <>
      <h1 className="mb-4">Scheda Nutrizionale</h1>
      
      {nutritionPlan.pasti.length > 0 && (
        <div className="card mb-4">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Totale Giornaliero</h5>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-6 col-md-3 mb-2">
                <div className="fw-bold">Calorie</div>
                <div className="h4 text-success">{totals.calorie.toFixed(0)} kcal</div>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="fw-bold">Proteine</div>
                <div className="h4 text-primary">{totals.proteine.toFixed(1)} g</div>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="fw-bold">Carboidrati</div>
                <div className="h4 text-warning">{totals.carboidrati.toFixed(1)} g</div>
              </div>
              <div className="col-6 col-md-3 mb-2">
                <div className="fw-bold">Grassi</div>
                <div className="h4 text-danger">{totals.grassi.toFixed(1)} g</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">{editingIndex !== null ? 'Modifica Pasto' : 'Aggiungi Nuovo Pasto'}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-3">
                <label htmlFor="nome" className="form-label">Nome Pasto *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="nome" 
                  name="nome" 
                  value={newPasto.nome} 
                  onChange={handleInputChange}
                  required
                  placeholder="Es. Colazione"
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="orario" className="form-label">Orario</label>
                <input 
                  type="time" 
                  className="form-control" 
                  id="orario" 
                  name="orario" 
                  value={newPasto.orario} 
                  onChange={handleInputChange}
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="calorie" className="form-label">Calorie (kcal)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="calorie" 
                  name="calorie" 
                  value={newPasto.calorie} 
                  onChange={handleInputChange}
                  min="0"
                  step="10"
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="proteine" className="form-label">Proteine (g)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="proteine" 
                  name="proteine" 
                  value={newPasto.proteine} 
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="col-md-2">
                <label htmlFor="carboidrati" className="form-label">Carboidrati (g)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="carboidrati" 
                  name="carboidrati" 
                  value={newPasto.carboidrati} 
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="col-md-1 d-flex align-items-end">
                {editingIndex !== null ? (
                  <>
                    <button type="submit" className="btn btn-success btn-sm me-1">
                      <i className="bi bi-check"></i>
                    </button>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>
                      <i className="bi bi-x"></i>
                    </button>
                  </>
                ) : (
                  <button type="submit" className="btn btn-primary btn-sm">
                    <i className="bi bi-plus"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-3">
                <label htmlFor="grassi" className="form-label">Grassi (g)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  id="grassi" 
                  name="grassi" 
                  value={newPasto.grassi} 
                  onChange={handleInputChange}
                  min="0"
                  step="0.1"
                />
              </div>
              <div className="col-md-9">
                <label htmlFor="note" className="form-label">Note</label>
                <textarea 
                  className="form-control" 
                  id="note" 
                  name="note" 
                  value={newPasto.note} 
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Es. 3 uova, 50g avena, 1 banana"
                ></textarea>
              </div>
            </div>
          </form>
        </div>
      </div>

      {nutritionPlan.pasti.length === 0 ? (
        <div className="alert alert-info">
          Nessun pasto aggiunto. Inizia ad aggiungere pasti alla tua scheda nutrizionale.
        </div>
      ) : (
        <div className="card mb-4">
          <div className="card-header bg-dark text-white">
            <h5 className="mb-0">Pasti Attuali ({nutritionPlan.pasti.length})</h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Pasto</th>
                    <th>Orario</th>
                    <th className="text-center">Calorie</th>
                    <th className="text-center">P (g)</th>
                    <th className="text-center">C (g)</th>
                    <th className="text-center">G (g)</th>
                    <th>Note</th>
                    <th className="text-center">Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {nutritionPlan.pasti.map((pasto, index) => (
                    <tr key={index}>
                      <td className="fw-bold">{pasto.nome}</td>
                      <td>{pasto.orario || '-'}</td>
                      <td className="text-center">{pasto.calorie}</td>
                      <td className="text-center text-primary">{pasto.proteine}</td>
                      <td className="text-center text-warning">{pasto.carboidrati}</td>
                      <td className="text-center text-danger">{pasto.grassi}</td>
                      <td>{pasto.note || '-'}</td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-warning me-2" 
                          onClick={() => startEdit(index)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-danger" 
                          onClick={() => removePasto(index)}
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
          {(nutritionPlan.files?.length || 0) === 0 ? (
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
                  {(nutritionPlan.files || []).map((file) => (
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
                          onClick={() => removeNutritionFile(file.id)}
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
