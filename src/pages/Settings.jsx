import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        obiettivo: '',
        livello: '',
        preferenzeAlimentari: '',
        workoutDays: [],
        durataAllenamento: '',
        orariPasti: {}
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const daysOfWeek = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica']
    const mealTimes = ['Colazione', 'Spuntino Mattina', 'Pranzo', 'Spuntino Pomeriggio', 'Cena', 'Spuntino Sera']
    const obiettivi = ['Dimagrimento', 'Massa Muscolare', 'Mantenimento', 'Forza', 'Resistenza']
    const livelli = ['Principiante', 'Intermedio', 'Avanzato']
    const preferenze = ['Onnivoro', 'Vegetariano', 'Vegano', 'Senza Glutine', 'Senza Lattosio']

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        
        if (type === 'checkbox') {
            setFormData(prev => {
                const newWorkoutDays = checked
                    ? [...prev.workoutDays, value]
                    : prev.workoutDays.filter(day => day !== value)
                return { ...prev, workoutDays: newWorkoutDays }
            })
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    const handleMealTimeChange = (mealTime, field, value) => {
        setFormData(prev => ({
            ...prev,
            orariPasti: {
                ...prev.orariPasti,
                [mealTime]: {
                    ...prev.orariPasti[mealTime],
                    [field]: value
                }
            }
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            localStorage.setItem('palestra_data', JSON.stringify(formData))
            setSuccess('Configurazione salvata con successo!')
            
            setTimeout(() => {
                navigate('/')
            }, 2000)
        } catch {
            setError('Errore nel salvataggio dei dati')
        } finally {
            setLoading(false)
        }
    }

    // Calcola progresso compilazione form
    const getFormProgress = () => {
        let completed = 0
        const total = 4 // obiettivo, livello, preferenze, durata
        
        if (formData.obiettivo) completed++
        if (formData.livello) completed++
        if (formData.preferenzeAlimentari) completed++
        if (formData.durataAllenamento) completed++
        
        return Math.round((completed / total) * 100)
    }

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-gear text-primary"></i>
                        Impostazioni
                    </h1>
                    <p className="text-muted mb-0">Personalizza la tua routine e dieta</p>
                </div>
                <button 
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    onClick={() => navigate('/')}
                >
                    <i className="bi bi-arrow-left"></i> Calendario
                </button>
            </div>

            {/* Progresso */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="d-flex align-items-center gap-3">
                        <i className="bi bi-check-circle text-success fs-4"></i>
                        <div className="flex-grow-1">
                            <h6 className="mb-1">Progresso configurazione</h6>
                            <div className="progress" style={{ height: '8px' }}>
                                <div 
                                    className="progress-bar bg-success"
                                    role="progressbar"
                                    style={{ width: `${getFormProgress()}%` }}
                                    aria-valuenow={getFormProgress()}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>
                        </div>
                        <span className="badge bg-light text-dark">{getFormProgress()}%</span>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show mb-4">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Informazioni Generali */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                            <i className="bi bi-person"></i> Informazioni Generali
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label htmlFor="obiettivo" className="form-label">
                                    <i className="bi bi-bullseye me-1 text-primary"></i> Obiettivo
                                </label>
                                <select 
                                    className="form-select" 
                                    id="obiettivo" 
                                    name="obiettivo" 
                                    value={formData.obiettivo}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleziona obiettivo</option>
                                    {obiettivi.map(ob => (
                                        <option key={ob} value={ob}>{ob}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6">
                                <label htmlFor="livello" className="form-label">
                                    <i className="bi bi-graph-up me-1 text-success"></i> Livello
                                </label>
                                <select 
                                    className="form-select" 
                                    id="livello" 
                                    name="livello" 
                                    value={formData.livello}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleziona livello</option>
                                    {livelli.map(liv => (
                                        <option key={liv} value={liv}>{liv}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6">
                                <label htmlFor="preferenzeAlimentari" className="form-label">
                                    <i className="bi bi-egg-fried me-1 text-warning"></i> Preferenze Alimentari
                                </label>
                                <select 
                                    className="form-select" 
                                    id="preferenzeAlimentari" 
                                    name="preferenzeAlimentari" 
                                    value={formData.preferenzeAlimentari}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Seleziona preferenze</option>
                                    {preferenze.map(pref => (
                                        <option key={pref} value={pref}>{pref}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label">
                                    <i className="bi bi-stopwatch me-1 text-info"></i> Durata Allenamento (minuti)
                                </label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    name="durataAllenamento" 
                                    value={formData.durataAllenamento}
                                    onChange={handleInputChange}
                                    placeholder="Es. 60"
                                    min="10"
                                    max="180"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Giorni di Allenamento */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                            <i className="bi bi-calendar-week"></i> Giorni di Allenamento
                        </h5>
                    </div>
                    <div className="card-body">
                        <p className="text-muted small mb-3">
                            Seleziona i giorni in cui vuoi allenarti
                        </p>
                        <div className="row g-2">
                            {daysOfWeek.map(day => {
                                const isChecked = formData.workoutDays.includes(day)
                                return (
                                    <div key={day} className="col-md-3 col-sm-6 col-lg-2">
                                        <div 
                                            className={`form-check p-3 bg-light rounded border ${isChecked ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                const newWorkoutDays = isChecked
                                                    ? formData.workoutDays.filter(d => d !== day)
                                                    : [...formData.workoutDays, day]
                                                setFormData(prev => ({ ...prev, workoutDays: newWorkoutDays }))
                                            }}
                                        >
                                            <input 
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`workout-${day}`}
                                                value={day}
                                                checked={isChecked}
                                                onChange={handleInputChange}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label className="form-check-label fw-medium" htmlFor={`workout-${day}`}>
                                                {day}
                                            </label>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Orari dei Pasti */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                            <i className="bi bi-alarm"></i> Orari dei Pasti
                        </h5>
                    </div>
                    <div className="card-body">
                        <p className="text-muted small mb-3">
                            Configura orari e descrizione per ogni pasto
                        </p>
                        {mealTimes.map((mealTime, idx) => (
                            <div key={mealTime} className={`row g-2 mb-3 ${idx > 0 ? 'border-top pt-3' : ''}`}>
                                <div className="col-12 col-md-4">
                                    <label className="form-label fw-medium">
                                        <i className="bi bi-cup-straw me-1 text-success"></i> {mealTime}
                                    </label>
                                </div>
                                <div className="col-12 col-md-4">
                                    <input 
                                        type="time" 
                                        className="form-control" 
                                        value={formData.orariPasti[mealTime]?.ora || ''}
                                        onChange={(e) => handleMealTimeChange(mealTime, 'ora', e.target.value)}
                                    />
                                </div>
                                <div className="col-12 col-md-4">
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Es. 3 uova + avena"
                                        value={formData.orariPasti[mealTime]?.cibo || ''}
                                        onChange={(e) => handleMealTimeChange(mealTime, 'cibo', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pulsante Salva */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center">
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg px-5 d-flex align-items-center gap-2 mx-auto"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    Salvataggio...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-check-lg"></i> Salva Configurazione
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
