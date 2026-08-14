import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function DayDetails() {
    const { date } = useParams()
    const navigate = useNavigate()
    const [dayData, setDayData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('allenamento')

    useEffect(() => {
        const savedData = localStorage.getItem('palestra_data')
        const savedSuggestions = localStorage.getItem('palestra_suggestions')
        const savedVacation = localStorage.getItem('palestra_vacation')
        
        const data = savedData ? JSON.parse(savedData) : null
        const suggestions = savedSuggestions ? JSON.parse(savedSuggestions) : null
        const vacationData = savedVacation ? JSON.parse(savedVacation) : null
        
        // Prova prima con il nome del giorno (es. Lunedi)
        let workoutInfo = data?.workoutDetails?.[date]
        let mealInfo = data?.mealDetails?.[date]
        let calendarSuggestions = data?.calendario?.[date]?.suggerimenti || suggestions?.calendario?.[date]?.suggerimenti || []
        
        if (!workoutInfo && suggestions?.routine?.[date]) {
            workoutInfo = suggestions.routine[date]
        }
        
        if (!mealInfo && suggestions?.dieta?.[date]?.pasti) {
            mealInfo = suggestions.dieta[date].pasti
        }
        
        // Se non trova nulla con il nome del giorno, prova a convertirlo in formato data
        // Es. se date è "Lunedi", prova a trovare il prossimo Lunedi
        if (!workoutInfo && !mealInfo && calendarSuggestions.length === 0) {
            const daysOfWeek = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato']
            const dayIndex = daysOfWeek.findIndex(d => d === date)
            
            if (dayIndex !== -1) {
                // Cerca nel suggestions usando il nome del giorno
                workoutInfo = suggestions?.routine?.[date]
                mealInfo = suggestions?.dieta?.[date]?.pasti
                calendarSuggestions = suggestions?.calendario?.[date]?.suggerimenti || []
            }
        }
        
        // Verifica se è un giorno di ferie
        const isVacationDay = vacationData?.vacationPeriods?.some(period => {
            const periodStart = new Date(period.startDate)
            const periodEnd = new Date(period.endDate)
            // Se date è una data ISO (YYYY-MM-DD)
            if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const dateObj = new Date(date)
                return dateObj >= periodStart && dateObj <= periodEnd
            }
            return false
        })
        
        const vacationSuggestion = isVacationDay ? (vacationData?.vacationSuggestions || {})[date] : null
        
        setDayData({ workoutInfo, mealInfo, calendarSuggestions, isVacationDay, vacationSuggestion })
        setLoading(false)
    }, [date])

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Caricamento...</span>
                </div>
            </div>
        )
    }

    if (!dayData) {
        return (
            <div className="container py-4 text-center">
                <i className="bi bi-exclamation-triangle text-warning fs-1 mb-3"></i>
                <h2>{date}</h2>
                <p className="text-muted mb-4">Nessun dato disponibile per questo giorno.</p>
                <button className="btn btn-primary btn-lg d-flex align-items-center gap-2 mx-auto">
                    <i className="bi bi-gear"></i> Configura ora
                </button>
            </div>
        )
    }

    // Calcola calorie e grammi totali per la dieta
    const totalCalories = dayData.mealInfo ? 
        Object.values(dayData.mealInfo).reduce((sum, meal) => 
            sum + (parseInt(meal.calorie) || 0), 0
        ) : 0
    
    const totalGrammi = dayData.mealInfo ? 
        Object.values(dayData.mealInfo).reduce((sum, meal) => 
            sum + (parseInt(meal.grammi) || 0), 0
        ) : 0

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-calendar-day text-primary"></i>
                        {date}
                    </h1>
                    <p className="text-muted mb-0">Dettagli allenamento e dieta</p>
                </div>
                <button 
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                    onClick={() => navigate('/')}
                >
                    <i className="bi bi-arrow-left"></i> Calendario
                </button>
            </div>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'allenamento' ? 'active' : ''}`}
                        onClick={() => setActiveTab('allenamento')}
                    >
                        <i className="bi bi-dumbbell me-1"></i> Allenamento
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'dieta' ? 'active' : ''}`}
                        onClick={() => setActiveTab('dieta')}
                    >
                        <i className="bi bi-cup-straw me-1"></i> Dieta
                    </button>
                </li>
                {dayData.calendarSuggestions?.length > 0 && (
                    <li className="nav-item">
                        <button 
                            className={`nav-link ${activeTab === 'suggerimenti' ? 'active' : ''}`}
                            onClick={() => setActiveTab('suggerimenti')}
                        >
                            <i className="bi bi-lightbulb me-1"></i> Suggerimenti
                        </button>
                    </li>
                )}
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Allenamento */}
                {activeTab === 'allenamento' && (
                    <div className="tab-pane fade show active">
                        {dayData.workoutInfo ? (
                            <div className="row g-3">
                                {/* Card Info Allenamento */}
                                <div className="col-md-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-journal-text text-primary fs-4"></i>
                                                        <div>
                                                            <h5 className="mb-0">Scheda</h5>
                                                            <p className="mb-0 text-muted">{dayData.workoutInfo.scheda || 'Non specificato'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="d-flex align-items-center gap-2 mb-3">
                                                        <i className="bi bi-stopwatch text-success fs-4"></i>
                                                        <div>
                                                            <h5 className="mb-0">Durata</h5>
                                                            <p className="mb-0 text-muted">{dayData.workoutInfo.durata || 'Non specificato'} minuti</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Esercizi */}
                                <div className="col-md-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-header bg-light">
                                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                                <i className="bi bi-list-task"></i> Esercizi
                                            </h5>
                                        </div>
                                        <div className="card-body">
                                            {dayData.workoutInfo.esercizi?.length > 0 ? (
                                                <ol className="list-group list-group-flush">
                                                    {dayData.workoutInfo.esercizi.map((esercizio, index) => (
                                                        <li key={index} className="list-group-item border-0 px-0">
                                                            <div className="d-flex align-items-center gap-2">
                                                                <i className="bi bi-check-circle-fill text-success"></i>
                                                                <span>{esercizio}</span>
                                                            </div>
                                                        </li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <p className="text-muted text-center py-3">Nessun esercizio programmato</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm text-center py-5">
                                <div className="card-body">
                                    <i className="bi bi-emoji-smile text-success fs-1 mb-3"></i>
                                    <h4>Giorno di riposo</h4>
                                    <p className="text-muted">Oggi non ci sono allenamenti programmati</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Dieta */}
                {activeTab === 'dieta' && (
                    <div className="tab-pane fade show active">
                        {dayData.mealInfo && Object.keys(dayData.mealInfo).length > 0 ? (
                            <div className="row g-3">
                                {/* Calorie e Grammi totali */}
                                <div className="col-md-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body text-center py-4">
                                            <div className="row g-3">
                                                <div className="col-6">
                                                    <div className="p-3 bg-light rounded">
                                                        <i className="bi bi-fire text-danger fs-4 mb-2"></i>
                                                        <h4 className="mb-0">{totalCalories} kcal</h4>
                                                        <p className="text-muted small mb-0">
                                                            {totalCalories > 2500 ? 'Superi la media!' : totalCalories < 1800 ? 'Leggeri' : 'Bilanciato'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-3 bg-light rounded">
                                                        <i className="bi bi-weight text-info fs-4 mb-2"></i>
                                                        <h4 className="mb-0">{totalGrammi}g</h4>
                                                        <p className="text-muted small mb-0">
                                                            {totalGrammi > 1500 ? 'Pasto abbondante!' : totalGrammi < 800 ? 'Leggero' : 'Perfetto'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="progress mx-auto mt-3" style={{ height: '8px', width: '200px' }}>
                                                <div 
                                                    className="progress-bar bg-success"
                                                    role="progressbar"
                                                    style={{ width: `${Math.min(totalCalories / 2500 * 100, 100)}%` }}
                                                    aria-valuenow={Math.min(totalCalories / 2500 * 100, 100)}
                                                    aria-valuemin="0"
                                                    aria-valuemax="100"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pasti */}
                                {Object.entries(dayData.mealInfo).map(([mealTime, details]) => (
                                    <div key={mealTime} className="col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex align-items-center gap-2 mb-3">
                                                    <i className="bi bi-alarm text-warning fs-4"></i>
                                                    <div>
                                                        <h5 className="mb-0">{mealTime}</h5>
                                                        <p className="mb-0 text-muted">{details.ora || 'Non specificato'}</p>
                                                    </div>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="mb-1"><strong>Cibo:</strong></p>
                                                    <p className="text-muted">{details.cibo || 'Non specificato'}</p>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center gap-2">
                                                    <span className="badge bg-info bg-opacity-10 text-info">
                                                        <i className="bi bi-weight me-1"></i> {details.grammi || '?'}g
                                                    </span>
                                                    <span className="badge bg-danger bg-opacity-10 text-danger">
                                                        <i className="bi bi-fire me-1"></i> {details.calorie || '?'} kcal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm text-center py-5">
                                <div className="card-body">
                                    <i className="bi bi-emoji-neutral text-warning fs-1 mb-3"></i>
                                    <h4>Nessuna dieta programmata</h4>
                                    <p className="text-muted">Nessun pasto configurato per questo giorno</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Suggerimenti */}
                {activeTab === 'suggerimenti' && (
                    <div className="tab-pane fade show active">
                        {dayData.calendarSuggestions?.length > 0 ? (
                            <div className="row g-3">
                                {dayData.calendarSuggestions.map((suggerimento, index) => (
                                    <div key={index} className="col-md-6">
                                        <div className="card border-0 shadow-sm border-start border-4 border-primary">
                                            <div className="card-body">
                                                <div className="d-flex align-items-start gap-2">
                                                    <i className="bi bi-star text-warning fs-4 mt-1"></i>
                                                    <div>
                                                        <p className="mb-0">{suggerimento}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm text-center py-5">
                                <div className="card-body">
                                    <i className="bi bi-lightbulb-off text-secondary fs-1 mb-3"></i>
                                    <h4>Nessun suggerimento</h4>
                                    <p className="text-muted">Nessun suggerimento disponibile per questo giorno</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
