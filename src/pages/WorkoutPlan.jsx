import { useContext, useState } from 'react'
import { SettingsContext } from '../contexts/SettingsContext'

export default function WorkoutPlan() {
  const { workoutPlan, addEsercizio, removeEsercizio, updateEsercizio } = useContext(SettingsContext)
  
  const [newEsercizio, setNewEsercizio] = useState({
    nome: '',
    serie: 3,
    ripetizioni: 10,
    riposo: 60,
    note: ''
  })

  const [editingIndex, setEditingIndex] = useState(null)

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
        <div className="card">
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
    </>
  )
}
