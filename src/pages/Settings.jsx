import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadFullTestProfile, clearTestProfile } from '../data/mockData'

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
    const [vacationData, setVacationData] = useState({
        vacationPeriods: [],
        vacationSuggestions: {}
    })
    const [newVacation, setNewVacation] = useState({
        startDate: '',
        endDate: ''
    })
    const [dietaFile, setDietaFile] = useState(null)
    const [schedaFile, setSchedaFile] = useState(null)
    const [dietaFileName, setDietaFileName] = useState('')
    const [schedaFileName, setSchedaFileName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [generatingPlan, setGeneratingPlan] = useState(false)

    const daysOfWeek = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica']
    const mealTimes = ['Colazione', 'Spuntino Mattina', 'Pranzo', 'Spuntino Pomeriggio', 'Cena', 'Spuntino Sera']
    const obiettivi = ['Dimagrimento', 'Massa Muscolare', 'Mantenimento', 'Forza', 'Resistenza']
    const livelli = ['Principiante', 'Intermedio', 'Avanzato']
    const preferenze = ['Onnivoro', 'Vegetariano', 'Vegano', 'Senza Glutine', 'Senza Lattosio']

    // Funzione per leggere e processare un file
    const handleFileChange = async (e, setFile, setFileName, fileType) => {
        const file = e.target.files[0]
        if (!file) return
        
        // Controlla dimensione (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Il file è troppo grande. Max 5MB.')
            return
        }
        
        setError('')
        
        // Controlla se è un file di testo (che possiamo leggere direttamente)
        const validTextExtensions = ['.txt', '.json', '.csv', '.xml', '.yaml', '.yml', '.tsv', '.md']
        const fileName = file.name.toLowerCase()
        const isTextFile = validTextExtensions.some(ext => fileName.endsWith(ext)) || 
                          file.type.startsWith('text/') ||
                          file.name.match(/\.(txt|json|csv|xml|yaml|yml|tsv|md)$/i)
        
        if (isTextFile) {
            // Leggi come testo
            const reader = new FileReader()
            reader.onload = async (e) => {
                try {
                    const content = e.target.result
                    
                    // Prova a parsare come JSON
                    try {
                        JSON.parse(content)
                        setFile(content)
                        setFileName(file.name)
                    } catch {
                        // Non è JSON, chiediamo all'IA di interpretarlo
                        const result = await interpretFileWithAI(content, file.name, fileType)
                        if (result && (result.modifiche || result.risposta)) {
                            // Se l'IA ha interpretato il file, usiamo il risultato
                            const output = result.modifiche || result.risposta
                            setFile(typeof output === 'string' ? output : JSON.stringify(output))
                            setFileName(file.name)
                            setSuccess(`File interpretato con successo dall'IA!`)
                        } else {
                            // Salva il contenuto grezzo
                            setFile(content)
                            setFileName(file.name)
                        }
                    }
                } catch {
                    setError('Errore nella lettura del file.')
                }
            }
            reader.onerror = () => {
                setError('Errore nella lettura del file.')
            }
            reader.readAsText(file)
        } else {
            // Per altri formati (PDF, Excel, Word, immagini, ecc.)
            setFileName(file.name)
            setSuccess(`File caricato. L'IA lo interpreterà quando necessario.`)
            
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = e.target.result
                // Salva con prefisso per indicare che è un file binario
                setFile(`[FILE:${file.type}:${file.name}]:${content}`)
            }
            reader.onerror = () => {
                setError('Errore nella lettura del file.')
            }
            reader.readAsDataURL(file)
        }
    }

    // Gestione cambiamento file dieta
    const handleDietaFileChange = (e) => {
        handleFileChange(e, setDietaFile, setDietaFileName, 'dieta')
    }

    // Gestione cambiamento file scheda
    const handleSchedaFileChange = (e) => {
        handleFileChange(e, setSchedaFile, setSchedaFileName, 'scheda')
    }

    // Rimuovi file dieta
    const removeDietaFile = () => {
        setDietaFile(null)
        setDietaFileName('')
    }

    // Rimuovi file scheda
    const removeSchedaFile = () => {
        setSchedaFile(null)
        setSchedaFileName('')
    }
    
    // Funzione per chiedere all'IA di interpretare un file
    const interpretFileWithAI = async (fileContent, fileName, fileType = 'dieta') => {
        try {
            setLoading(true)
            setError('')
            
            // Importa la funzione chatWithMistral
            const { chatWithMistral } = await import('../services/mistral')
            
            // Costruisci il messaggio con il contenuto del file
            const message = `Analizza questo contenuto di un file ${fileType} chiamato "${fileName}" e convertilo nel formato JSON adatto all'app:

${fileContent}

Formato atteso per dieta:
{
  "giorno": {
    "pasti": {
      "nomePasto": {
        "ora": "HH:MM",
        "cibo": "descrizione",
        "calorie": "numero",
        "grammi": "quantita"
      }
    }
  }
}

Formato atteso per scheda:
{
  "giorno": {
    "scheda": "nome",
    "durata": "minuti",
    "esercizi": ["esercizio1", "esercizio2"]
  }
}

SOLO JSON valido, senza spiegazioni o markdown.`
            
            const context = {
                data: formData,
                suggestions: null
            }
            
            const response = await chatWithMistral(message, context)
            
            setLoading(false)
            return response
        } catch (err) {
            setLoading(false)
            setError(`Errore interpretazione file: ${err.message}`)
            return null
        }
    }
    


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

    // Carica dati al montaggio
    useEffect(() => {
        const savedData = localStorage.getItem('palestra_data')
        const savedVacation = localStorage.getItem('palestra_vacation')
        const savedDietaFile = localStorage.getItem('palestra_dieta_file')
        const savedSchedaFile = localStorage.getItem('palestra_scheda_file')
        
        if (savedData) {
            setFormData(JSON.parse(savedData))
        }
        if (savedVacation) {
            setVacationData(JSON.parse(savedVacation))
        }
        if (savedDietaFile) {
            try {
                // Se il file e' binario (inizia con [FILE:), non parsarlo
                if (savedDietaFile.startsWith('[FILE:')) {
                    setDietaFile(savedDietaFile)
                    setDietaFileName('dieta_file.bin')
                } else {
                    const parsed = JSON.parse(savedDietaFile)
                    setDietaFile(parsed)
                    setDietaFileName('dieta.json')
                }
            } catch (e) {
                console.error('Errore parsing dieta file:', e)
            }
        }
        if (savedSchedaFile) {
            try {
                // Se il file e' binario (inizia con [FILE:), non parsarlo
                if (savedSchedaFile.startsWith('[FILE:')) {
                    setSchedaFile(savedSchedaFile)
                    setSchedaFileName('scheda_file.bin')
                } else {
                    const parsed = JSON.parse(savedSchedaFile)
                    setSchedaFile(parsed)
                    setSchedaFileName('scheda.json')
                }
            } catch (e) {
                console.error('Errore parsing scheda file:', e)
            }
        }
    }, [])

    // Gestione nuovi periodi ferie
    const handleVacationInputChange = (e) => {
        const { name, value } = e.target
        setNewVacation(prev => ({ ...prev, [name]: value }))
    }

    const addVacationPeriod = () => {
        if (!newVacation.startDate || !newVacation.endDate) {
            setError('Inserisci sia la data di inizio che di fine')
            return
        }
        
        if (new Date(newVacation.startDate) > new Date(newVacation.endDate)) {
            setError('La data di inizio deve essere prima della data di fine')
            return
        }
        
        const newPeriod = {
            id: `vac-${Date.now()}`,
            startDate: newVacation.startDate,
            endDate: newVacation.endDate,
            confirmed: true,
            autoGenerated: false
        }
        
        const updatedVacationData = {
            ...vacationData,
            vacationPeriods: [...vacationData.vacationPeriods, newPeriod]
        }
        
        setVacationData(updatedVacationData)
        
        // Salva in localStorage
        try {
            localStorage.setItem('palestra_vacation', JSON.stringify(updatedVacationData))
        } catch (e) {
            console.error('Errore salvataggio ferie:', e)
            setError('Errore nel salvataggio delle ferie')
        }
        
        setNewVacation({ startDate: '', endDate: '' })
        setError('')
        setSuccess('Periodo di ferie aggiunto!')
    }

    const removeVacationPeriod = (id) => {
        const updatedVacationData = {
            ...vacationData,
            vacationPeriods: vacationData.vacationPeriods.filter(p => p.id !== id)
        }
        
        setVacationData(updatedVacationData)
        
        // Salva in localStorage
        try {
            localStorage.setItem('palestra_vacation', JSON.stringify(updatedVacationData))
        } catch (e) {
            console.error('Errore rimozione ferie:', e)
            setError('Errore nella rimozione delle ferie')
        }
    }

    // Genera piano vacanza automaticamente
    const generateVacationPlan = () => {
        if (vacationData.vacationPeriods.length === 0) {
            setError('Aggiungi almeno un periodo di ferie')
            return
        }
        
        setGeneratingPlan(true)
        setError('')
        
        // Simulo generazione automatica (in futuro chiamera' API Mistral)
        setTimeout(() => {
            const newSuggestions = {}
            
            vacationData.vacationPeriods.forEach(period => {
                const start = new Date(period.startDate)
                const end = new Date(period.endDate)
                
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0]
                    newSuggestions[dateStr] = {
                        workout: {
                            type: 'light',
                            name: 'Attività leggera vacanza',
                            exercises: [
                                'Camminata 30-45 minuti al mattino',
                                'Stretching 10 minuti',
                                'Nuoto o bicicletta (opzionale)',
                                'Yoga 15 minuti'
                            ],
                            tips: 'Mantieni il movimento senza stress. Idratati costantemente.'
                        },
                        diet: {
                            type: 'flexible',
                            tips: 'Mantieni equilibrio: 60% proteine/verdure, 30% carboidrati, 10% dolci.',
                            baseCalories: 1800
                        }
                    }
                }
            })
            
            const updatedVacationData = {
                ...vacationData,
                vacationSuggestions: newSuggestions
            }
            
            setVacationData(updatedVacationData)
            
            // Salva in localStorage
            try {
                localStorage.setItem('palestra_vacation', JSON.stringify(updatedVacationData))
            } catch (e) {
                console.error('Errore salvataggio piano vacanza:', e)
                setError('Errore nel salvataggio del piano vacanza')
            }
            
            setGeneratingPlan(false)
            setSuccess('Piano vacanza generato automaticamente!')
        }, 1000)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            // Salva configurazione base
            localStorage.setItem('palestra_data', JSON.stringify(formData))
            localStorage.setItem('palestra_vacation', JSON.stringify(vacationData))
            
            // Salva file dieta e scheda se presenti
            if (dietaFile) {
                localStorage.setItem('palestra_dieta_file', dietaFile)
            }
            if (schedaFile) {
                localStorage.setItem('palestra_scheda_file', schedaFile)
            }
            
            setSuccess('Configurazione e file salvati con successo!')
            
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

    // Funzioni per profili test
    const handleLoadFullTestProfile = () => {
        loadFullTestProfile()
        setSuccess('Profilo test completo caricato! Ricarica la pagina per vedere i dati.')
        setTimeout(() => setSuccess(''), 3000)
    }

    const handleClearTestProfile = () => {
        clearTestProfile()
        setSuccess('Dati svuotati! Ora hai un profilo vuoto per i test.')
        setTimeout(() => setSuccess(''), 3000)
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

                {/* Gestione Ferie */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                            <i className="bi bi-airplane"></i> Gestione Ferie
                        </h5>
                    </div>
                    <div className="card-body">
                        <p className="text-muted small mb-3">
                            Aggiungi i periodi in cui sarai in ferie. L'IA genererà automaticamente un piano adattato con esercizi leggeri e una dieta flessibile.
                        </p>
                        
                        {/* Form per aggiungere nuovo periodo */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-5">
                                <label className="form-label">
                                    <i className="bi bi-calendar-plus me-1"></i> Data Inizio
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="startDate"
                                    value={newVacation.startDate}
                                    onChange={handleVacationInputChange}
                                    required
                                />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label">
                                    <i className="bi bi-calendar-minus me-1"></i> Data Fine
                                </label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="endDate"
                                    value={newVacation.endDate}
                                    onChange={handleVacationInputChange}
                                    min={newVacation.startDate}
                                    required
                                />
                            </div>
                            <div className="col-md-2 d-flex align-items-end">
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={addVacationPeriod}
                                    disabled={!newVacation.startDate || !newVacation.endDate}
                                    title="Aggiungi periodo ferie"
                                >
                                    <i className="bi bi-plus-lg"></i>
                                </button>
                            </div>
                        </div>
                        
                        {/* Genera piano vacanza */}
                        {vacationData.vacationPeriods.length > 0 && (
                            <div className="d-flex gap-2 mb-4">
                                <button
                                    className="btn btn-success btn-sm d-flex align-items-center gap-1"
                                    onClick={generateVacationPlan}
                                    disabled={generatingPlan}
                                >
                                    {generatingPlan ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                            Generazione...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-robot"></i> Genera Piano Vacanza
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        
                        {/* Lista periodi ferie salvati */}
                        {vacationData.vacationPeriods.length > 0 && (
                            <div className="mb-3">
                                <h6 className="mb-2">Periodi di Ferie Salvati:</h6>
                                <div className="list-group list-group-flush">
                                    {vacationData.vacationPeriods.map(period => (
                                        <div 
                                            key={period.id}
                                            className="list-group-item d-flex justify-content-between align-items-center"
                                        >
                                            <div>
                                                <strong>{new Date(period.startDate).toLocaleDateString('it-IT')}</strong>
                                                {' -> '}
                                                <strong>{new Date(period.endDate).toLocaleDateString('it-IT')}</strong>
                                                {period.autoGenerated && (
                                                    <span className="badge bg-info ms-2">Auto</span>
                                                )}
                                            </div>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => removeVacationPeriod(period.id)}
                                                title="Rimuovi"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Info piano vacanza */}
                        {vacationData.vacationPeriods.length > 0 && Object.keys(vacationData.vacationSuggestions).length > 0 && (
                            <div className="alert alert-info">
                                <i className="bi bi-check-circle me-2"></i>
                                Piano vacanza generato! Gli esercizi consigliati sono facoltativi. Puoi segnarli come eseguiti nel calendario.
                            </div>
                        )}
                    </div>
                </div>

                {/* Caricamento File Dieta e Scheda */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center gap-2">
                            <i className="bi bi-file-earmark-arrow-up"></i> Carica File Personali
                        </h5>
                    </div>
                    <div className="card-body">
                        <p className="text-muted small mb-4">
                            Carica i tuoi file per dieta e scheda di allenamento in <strong>qualsiasi formato</strong>. L'IA li interpreterà automaticamente.
                        </p>
                        
                        <div className="row g-4">
                            {/* File Dieta */}
                            <div className="col-md-6">
                                <div className="card bg-light border-0 h-100">
                                    <div className="card-body">
                                        <h6 className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-file-earmark-text text-success"></i> File Dieta
                                        </h6>
                                        
                                        {!dietaFile ? (
                                            <div className="d-grid gap-2">
                                                <input
                                                    type="file"
                                                    id="dietaFileInput"
                                                    accept="*/*"
                                                    onChange={handleDietaFileChange}
                                                    className="d-none"
                                                />
                                                <label 
                                                    htmlFor="dietaFileInput"
                                                    className="btn btn-outline-success d-flex align-items-center justify-content-center gap-2 py-3"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="bi bi-upload"></i>
                                                    Seleziona File Dieta
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="alert alert-success mb-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <i className="bi bi-check-circle me-2"></i>
                                                        <strong>File caricato:</strong> {dietaFileName}
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={removeDietaFile}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* File Scheda Allenamento */}
                            <div className="col-md-6">
                                <div className="card bg-light border-0 h-100">
                                    <div className="card-body">
                                        <h6 className="d-flex align-items-center gap-2 mb-3">
                                            <i className="bi bi-file-earmark-bar-graph text-primary"></i> File Scheda Allenamento
                                        </h6>
                                        
                                        {!schedaFile ? (
                                            <div className="d-grid gap-2">
                                                <input
                                                    type="file"
                                                    id="schedaFileInput"
                                                    accept="*/*"
                                                    onChange={handleSchedaFileChange}
                                                    className="d-none"
                                                />
                                                <label 
                                                    htmlFor="schedaFileInput"
                                                    className="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-3"
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <i className="bi bi-upload"></i>
                                                    Seleziona File Scheda
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="alert alert-primary mb-0">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <i className="bi bi-check-circle me-2"></i>
                                                        <strong>File caricato:</strong> {schedaFileName}
                                                    </div>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={removeSchedaFile}
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {(dietaFile || schedaFile) && (
                            <div className="alert alert-info mt-3 mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                L'IA userà questi file come base per i suggerimenti. Se sono in formato non JSON, l'IA li interpreterà automaticamente.
                            </div>
                        )}
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

                {/* Sezione Test - Profili per testing */}
                <div className="card border-0 shadow-sm mt-3">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 text-muted">
                            <i className="bi bi-bug me-2"></i>Profili Test
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            <button
                                type="button"
                                className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                                onClick={handleLoadFullTestProfile}
                                title="Carica profilo completo con dati mock per testing"
                            >
                                <i className="bi bi-person-check"></i> Carica profilo test completo
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                                onClick={handleClearTestProfile}
                                title="Svuota tutti i dati per test senza dati"
                            >
                                <i className="bi bi-trash"></i> Svuota profilo test
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
