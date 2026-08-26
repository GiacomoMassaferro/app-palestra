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

  // Funzioni ausiliarie per i file
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('pdf')) return 'pdf'
    if (mimeType.includes('image')) return 'image'
    if (mimeType.includes('word')) return 'text'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet'
    if (mimeType.includes('text')) return 'text'
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'zip'
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
          {workoutPlan.files.length === 0 ? (
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
                  {workoutPlan.files.map((file) => (
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
    </>
  )
}
