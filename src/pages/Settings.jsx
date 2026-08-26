import { useContext, useState } from 'react'
import { SettingsContext } from '../contexts/SettingsContext'

export default function Settings() {
  const { settings, updateSettings } = useContext(SettingsContext)
  
  const [formData, setFormData] = useState({
    obiettivo: settings.obiettivo,
    livello: settings.livello,
    preferenzeAlimentari: settings.preferenzeAlimentari,
    giorniAllenamento: settings.giorniAllenamento,
    durataAllenamento: settings.durataAllenamento,
    orariPasti: settings.orariPasti
  })

  const obiettivi = ['Massa Muscolare', 'Dimagrimento', 'Mantenimento', 'Forza', 'Resistenza']
  const livelli = ['Principiante', 'Intermedio', 'Avanzato']
  const preferenze = ['Onnivoro', 'Vegetariano', 'Vegano', 'Senza Glutine', 'Senza Lattosio']
  const giorniSettimana = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleGiornoToggle = (giorno) => {
    const newGiorni = formData.giorniAllenamento.includes(giorno)
      ? formData.giorniAllenamento.filter(g => g !== giorno)
      : [...formData.giorniAllenamento, giorno]
    setFormData({ ...formData, giorniAllenamento: newGiorni })
  }

  const handleOrarioChange = (index, field, value) => {
    const newOrari = [...formData.orariPasti]
    newOrari[index][field] = value
    setFormData({ ...formData, orariPasti: newOrari })
  }

  const addOrario = () => {
    setFormData({
      ...formData,
      orariPasti: [...formData.orariPasti, { ora: '', descrizione: '' }]
    })
  }

  const removeOrario = (index) => {
    const newOrari = [...formData.orariPasti]
    newOrari.splice(index, 1)
    setFormData({ ...formData, orariPasti: newOrari })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateSettings(formData)
    alert('Impostazioni salvate con successo!')
  }

  return (
    <>
      <h1 className="mb-4">Impostazioni</h1>
      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Informazioni Personali</h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="obiettivo" className="form-label">Obiettivo</label>
                <select 
                  className="form-select" 
                  id="obiettivo" 
                  name="obiettivo" 
                  value={formData.obiettivo} 
                  onChange={handleChange}
                >
                  {obiettivi.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="livello" className="form-label">Livello</label>
                <select 
                  className="form-select" 
                  id="livello" 
                  name="livello" 
                  value={formData.livello} 
                  onChange={handleChange}
                >
                  {livelli.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="preferenzeAlimentari" className="form-label">Preferenze Alimentari</label>
              <select 
                className="form-select" 
                id="preferenzeAlimentari" 
                name="preferenzeAlimentari" 
                value={formData.preferenzeAlimentari} 
                onChange={handleChange}
              >
                {preferenze.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Allenamento</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Giorni di Allenamento</label>
              <div className="d-flex flex-wrap gap-2">
                {giorniSettimana.map(giorno => (
                  <div key={giorno} className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id={`giorno-${giorno}`}
                      checked={formData.giorniAllenamento.includes(giorno)}
                      onChange={() => handleGiornoToggle(giorno)}
                    />
                    <label className="form-check-label" htmlFor={`giorno-${giorno}`}>
                      {giorno}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <label htmlFor="durataAllenamento" className="form-label">Durata Allenamento (minuti)</label>
              <input 
                type="number" 
                className="form-control" 
                id="durataAllenamento" 
                name="durataAllenamento" 
                value={formData.durataAllenamento} 
                onChange={handleChange}
                min="10"
                max="180"
              />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Orari Pasti</h5>
            <button type="button" className="btn btn-sm btn-light" onClick={addOrario}>
              + Aggiungi
            </button>
          </div>
          <div className="card-body">
            {formData.orariPasti.length === 0 ? (
              <p className="text-muted">Nessun orario configurato</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Ora</th>
                      <th>Descrizione</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.orariPasti.map((orario, index) => (
                      <tr key={index}>
                        <td>
                          <input 
                            type="time" 
                            className="form-control form-control-sm" 
                            value={orario.ora} 
                            onChange={(e) => handleOrarioChange(index, 'ora', e.target.value)}
                          />
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            value={orario.descrizione} 
                            onChange={(e) => handleOrarioChange(index, 'descrizione', e.target.value)}
                            placeholder="Es. Colazione"
                          />
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-danger" 
                            onClick={() => removeOrario(index)}
                          >
                            &times;
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

        <div className="d-flex justify-content-end gap-2">
          <button type="reset" className="btn btn-outline-secondary" onClick={() => setFormData(settings)}>
            Annulla
          </button>
          <button type="submit" className="btn btn-primary">
            Salva Impostazioni
          </button>
        </div>
      </form>
    </>
  )
}
