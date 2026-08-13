import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { loadMockData } from '../data/mockData'

export default function Home() {
    const navigate = useNavigate()
    const [days, setDays] = useState([])
    const [loading, setLoading] = useState(true)

    const handleLoadMockData = () => {
        loadMockData()
        window.location.reload()
    }

    useEffect(() => {
        const savedData = localStorage.getItem('palestra_data')
        const savedSuggestions = localStorage.getItem('palestra_suggestions')
        
        if (savedData) {
            const data = JSON.parse(savedData)
            const suggestions = savedSuggestions ? JSON.parse(savedSuggestions) : null
            setDays(generateCalendarDays(data, suggestions))
        }
        setLoading(false)
    }, [])

    const generateCalendarDays = (data, suggestions) => {
        const daysOfWeek = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica']
        return daysOfWeek.map(day => {
            const hasWorkout = data.workoutDays?.includes(day) || 
                (suggestions?.routine?.[day]?.esercizi?.length > 0)
            
            const meals = []
            if (data.orariPasti) {
                Object.keys(data.orariPasti).forEach(mealTime => {
                    if (data.orariPasti[mealTime]?.ora) {
                        meals.push(mealTime)
                    }
                })
            }
            if (suggestions?.dieta?.[day]?.pasti) {
                Object.keys(suggestions.dieta[day].pasti).forEach(mealTime => {
                    if (!meals.includes(mealTime)) {
                        meals.push(mealTime)
                    }
                })
            }
            
            const workoutName = suggestions?.routine?.[day]?.scheda || ''
            
            return {
                name: day,
                hasWorkout,
                meals,
                workoutName
            }
        })
    }

    const handleDayClick = (dayIndex) => {
        const daysOfWeek = ['Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato', 'Domenica']
        navigate(`/day/${daysOfWeek[dayIndex]}`)
    }

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        )
    }

    const hasData = days.some(d => d.hasWorkout || d.meals.length > 0)

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1">
                        <i className="bi bi-calendar-check me-2 text-primary"></i>
                        Il Mio Calendario
                    </h1>
                    <p className="text-muted mb-0">Gestione allenamenti e dieta personalizzata</p>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                        onClick={handleLoadMockData}
                        title="Carica dati di esempio"
                    >
                        <i className="bi bi-magic"></i> Dati demo
                    </button>
                    <button 
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                        onClick={() => navigate('/settings')}
                    >
                        <i className="bi bi-gear"></i> Impostazioni
                    </button>
                </div>
            </div>

            {/* Messaggio iniziale se non ci sono dati */}
            {!hasData && (
                <div className="alert alert-info alert-dismissible fade show mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Benvenuto!</strong> Inizia configurando la tua routine 
                    cliccando su "Impostazioni" o prova subito con i "Dati demo".
                    <button 
                        type="button" 
                        className="btn-close" 
                        data-bs-dismiss="alert" 
                        aria-label="Close"
                    ></button>
                </div>
            )}

            {/* Calendario */}
            <div className="row g-3">
                {days.map((day, index) => {
                    const isWorkoutDay = day.hasWorkout
                    const bgClass = isWorkoutDay 
                        ? 'bg-gradient bg-primary bg-opacity-10 border-primary' 
                        : 'bg-light border-secondary'
                    const textClass = isWorkoutDay ? 'text-primary' : 'text-secondary'
                    
                    return (
                        <div 
                            key={index}
                            className="col-md-3 col-sm-6 col-lg-2"
                            onClick={() => handleDayClick(index)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={`card h-100 ${bgClass} border-0 shadow-sm hover-shadow-lg transition-all`}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <h5 className={`mb-0 ${textClass} fw-bold`}>
                                            {day.name}
                                        </h5>
                                    </div>
                                    
                                    {day.workoutName && (
                                        <p className="mb-2 small text-muted">
                                            🏋️ {day.workoutName}
                                        </p>
                                    )}
                                    
                                    {day.meals.length > 0 && (
                                        <div className="mt-2">
                                            <div className="d-flex flex-wrap gap-1">
                                                {day.meals.slice(0, 3).map((meal, i) => (
                                                    <span key={i} className="badge bg-success bg-opacity-10 text-success">
                                                        🥤 {meal}
                                                    </span>
                                                ))}
                                                {day.meals.length > 3 && (
                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary">
                                                        +{day.meals.length - 3} pasti
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {!day.hasWorkout && day.meals.length === 0 && (
                                        <div className="text-center text-muted py-3">
                                            <i className="bi bi-emoji-smile fs-3"></i>
                                            <p className="mb-0 small">Riposo</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Suggerimenti rapidi */}
            {hasData && (
                <div className="mt-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className="bi bi-lightbulb text-warning fs-4"></i>
                                <h5 className="mb-0">Suggerimenti per te</h5>
                            </div>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                        <i className="bi bi-droplet text-primary fs-3"></i>
                                        <div>
                                            <h6 className="mb-0">Idratati</h6>
                                            <small className="text-muted">Bevi almeno 2-3 litri d'acqua al giorno</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                        <i className="bi bi-clock text-success fs-3"></i>
                                        <div>
                                            <h6 className="mb-0">Tempistica</h6>
                                            <small className="text-muted">Pasti ogni 2-3 ore per ottimizzare il metabolismo</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                        <i className="bi bi-heart text-danger fs-3"></i>
                                        <div>
                                            <h6 className="mb-0">Recupero</h6>
                                            <small className="text-muted">Dormi 7-8 ore per il recupero muscolare</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
