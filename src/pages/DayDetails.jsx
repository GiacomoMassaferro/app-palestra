import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function DayDetails() {
    const { date } = useParams()
    const navigate = useNavigate()
    const [dayData, setDayData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('allenamento')

    useEffect(() => {
        // NOTA 2026-09-05: guard se manca param data
        if (!date) {
            setDayData(null)
            setLoading(false)
            return
        }
        // NOTA 2026-09-05: parse sicuro, mai crash su localStorage corrotto
        const safeParse = (v, fallback = null) => {
            if (!v) return fallback
            try {
                const p = JSON.parse(v)
                return p ?? fallback
            } catch {
                return fallback
            }
        }
        const savedData = localStorage.getItem('palestra_data')
        const savedSuggestions = localStorage.getItem('palestra_suggestions')
        const savedVacation = localStorage.getItem('palestra_vacation')

        const data = safeParse(savedData, null)
        const suggestions = safeParse(savedSuggestions, null)
        const vacationData = safeParse(savedVacation, null)

        // Normalizza giorno senza accenti (Lunedi con accento -> Lunedi)
        const normalizza = (g) => {
            if (!g || typeof g !== 'string') return g
            const mappa = {
                lunedi: 'Lunedi', martedi: 'Martedi', mercoledi: 'Mercoledi', giovedi: 'Giovedi',
                venerdi: 'Venerdi', sabato: 'Sabato', domenica: 'Domenica'
            }
            const chiave = g.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
            return mappa[chiave] || g
        }
        const cercaPerGiorno = (contenitore, nomeGiorno) => {
            if (!contenitore || !nomeGiorno) return null
            return contenitore[nomeGiorno] || contenitore[normalizza(nomeGiorno)] || null
        }

        // Risolvi nome giorno: se date e YYYY-MM-DD converti in weekday, se e nome usalo diretto
        const giorniCanonici = ['Domenica', 'Lunedi', 'Martedi', 'Mercoledi', 'Giovedi', 'Venerdi', 'Sabato']
        let dayName = null
        if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const d = new Date(date + 'T12:00:00')
            dayName = giorniCanonici[d.getDay()]
        } else {
            dayName = normalizza(date)
        }

        // Verifica se è un giorno di ferie (le ferie sovrascrivono tutto)
        // NOTA 2026-09-05: confronto stringhe YYYY-MM-DD + guard date assente
        const isVacationDay = vacationData?.vacationPeriods?.some(period => {
            if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return date >= period.startDate && date <= period.endDate
            }
            return false
        })

        const vacationSuggestion = isVacationDay ? (vacationData?.vacationSuggestions || {})[date] : null

        let workoutInfo = null
        let mealInfo = null
        let calendarSuggestions = []
        let isFallbackDiet = false
        let isEccezioneSingola = false

        // Eccezione singola data ha priorita sul template settimanale
        const eccezioneData = (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) ? suggestions?.eccezioni?.[date] : null
        if (!isVacationDay && eccezioneData) {
            isEccezioneSingola = true
            const isLibero = eccezioneData.libero || eccezioneData.scheda === 'Giorno libero' || eccezioneData.scheda === 'Riposo'
            workoutInfo = isLibero ? { scheda: 'Giorno libero', durata: '', esercizi: [] } : { ...eccezioneData }
            // Dieta resta quella del weekday per le eccezioni workout
            const dietaGiorno = cercaPerGiorno(suggestions?.dieta, dayName)
            if (dietaGiorno?.pasti) {
                mealInfo = dietaGiorno.pasti
            } else if (data?.orariPasti && Object.keys(data.orariPasti).length > 0) {
                mealInfo = data.orariPasti
            }
        }

        if (!isVacationDay && !isEccezioneSingola && dayName) {
            // Routine da suggestions (prova con e senza accenti)
            workoutInfo = cercaPerGiorno(suggestions?.routine, dayName) || cercaPerGiorno(suggestions?.routine, date)
            // Se giorno in workoutDays ma senza scheda dettaglio, crea info minima per non mostrare Riposo
            const workoutDays = data?.workoutDays || []
            const isWorkoutDay = workoutDays.some((d) => d === dayName || normalizza(d) === normalizza(dayName))
            if (!workoutInfo && isWorkoutDay) {
                workoutInfo = { scheda: 'Allenamento', durata: data?.durataAllenamento || '', esercizi: [] }
            }
            // Dieta da suggestions
            const dietaGiorno = cercaPerGiorno(suggestions?.dieta, dayName) || cercaPerGiorno(suggestions?.dieta, date)
            if (dietaGiorno?.pasti) {
                mealInfo = dietaGiorno.pasti
            }
            // Orari pasti da impostazioni come fallback (Settings salva orariPasti, non mealDetails)
            if (!mealInfo && data?.orariPasti && Object.keys(data.orariPasti).length > 0) {
                mealInfo = data.orariPasti
            }
            // NOTA 2026-09-05: dieta sempre visibile, fallback a primo piano disponibile
            if (!mealInfo && suggestions?.dieta && Object.keys(suggestions.dieta).length > 0) {
                const primoGiornoConPasti = Object.values(suggestions.dieta).find((d) => d?.pasti && Object.keys(d.pasti).length > 0)
                if (primoGiornoConPasti?.pasti) {
                    mealInfo = primoGiornoConPasti.pasti
                    isFallbackDiet = true
                }
            }
            calendarSuggestions = cercaPerGiorno(suggestions?.calendario, dayName)?.suggerimenti || cercaPerGiorno(suggestions?.calendario, date)?.suggerimenti || []
        }

        setDayData({ workoutInfo, mealInfo, calendarSuggestions, isVacationDay, vacationSuggestion, dayName, isFallbackDiet, isEccezioneSingola })
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

            {/* Ferie sovrascrivono tutto: solo simboli vacanza */}
            {dayData.isVacationDay && (
                <div className="alert alert-warning d-flex align-items-center gap-2 mb-4">
                    <span className="fs-3">🏖️</span>
                    <div>
                        <strong>Giorno di ferie{dayData.dayName ? ` (${dayData.dayName})` : ''}</strong>
                        <div className="small">Piano palestra e dieta sospesi. Vale solo il piano vacanza leggero.</div>
                    </div>
                </div>
            )}
            {dayData.isVacationDay && dayData.vacationSuggestion && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                        <h5 className="mb-3">🏖️ Piano vacanza</h5>
                        {dayData.vacationSuggestion.workout && (
                            <div className="mb-3">
                                <strong>Attivita leggera:</strong>
                                <ul className="mb-1">
                                    {(dayData.vacationSuggestion.workout.exercises || []).map((ex, idx) => (
                                        <li key={idx}>{ex}</li>
                                    ))}
                                </ul>
                                <div className="small text-muted">{dayData.vacationSuggestion.workout.tips}</div>
                            </div>
                        )}
                        {dayData.vacationSuggestion.diet && (
                            <div>
                                <strong>Dieta flessibile:</strong>
                                <div className="small">{dayData.vacationSuggestion.diet.tips}</div>
                                <div className="small text-muted">Calorie base: {dayData.vacationSuggestion.diet.baseCalories || 1800} kcal</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tab Navigation - nascosta in ferie, vale solo vacanza */}
            {!dayData.isVacationDay && (
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
            )}

            {/* Tab Content - nascosto in ferie */}
            {!dayData.isVacationDay && (
            <div className="tab-content">
                {/* Allenamento */}
                {activeTab === 'allenamento' && (
                    <div className="tab-pane fade show active">
                        {dayData.workoutInfo && dayData.workoutInfo.scheda !== 'Giorno libero' && dayData.workoutInfo.scheda !== 'Riposo' ? (
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
                                    <h4>{dayData.workoutInfo?.scheda === 'Giorno libero' ? 'Giorno libero' : 'Giorno di riposo'}</h4>
                                    <p className="text-muted">{dayData.workoutInfo?.scheda === 'Giorno libero' ? 'Allenamento spostato altrove. Goditi il recupero.' : 'Oggi non ci sono allenamenti programmati'}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Dieta - sempre visibile, niente immagini pasto */}
                {activeTab === 'dieta' && (
                    <div className="tab-pane fade show active">
                        {dayData.isFallbackDiet && (
                            <div className="alert alert-info mb-3">
                                Piano base uguale tutti i giorni. Personalizzalo via chat o Impostazioni.
                            </div>
                        )}
                        {dayData.mealInfo && Object.keys(dayData.mealInfo).length > 0 ? (
                            <div className="row g-3">
                                {/* Calorie e Grammi totali */}
                                <div className="col-md-12">
                                    <div className="card border-0 shadow-sm">
                                        <div className="card-body text-center py-4">
                                            <div className="row g-3">
                                                <div className="col-6">
                                                    <div className="p-3 bg-light rounded">
                                                        <h4 className="mb-0">{totalCalories} kcal</h4>
                                                        <p className="text-muted small mb-0">
                                                            {totalCalories > 2500 ? 'Superi la media!' : totalCalories < 1800 ? 'Leggeri' : 'Bilanciato'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="col-6">
                                                    <div className="p-3 bg-light rounded">
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

                                {/* Pasti - NOTA 2026-09-05: niente immagini pasto, solo testo */}
                                {Object.entries(dayData.mealInfo).map(([mealTime, details]) => (
                                    <div key={mealTime} className="col-md-6">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="mb-3">
                                                    <h5 className="mb-0">{mealTime}</h5>
                                                    <p className="mb-0 text-muted">{details.ora || 'Non specificato'}</p>
                                                </div>
                                                <div className="mb-3">
                                                    <p className="mb-1"><strong>Cibo:</strong></p>
                                                    <p className="text-muted">{details.cibo || 'Non specificato'}</p>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center gap-2">
                                                    <span className="badge bg-info bg-opacity-10 text-info">
                                                        {details.grammi || '?'}g
                                                    </span>
                                                    <span className="badge bg-danger bg-opacity-10 text-danger">
                                                        {details.calorie || '?'} kcal
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
            )}
        </div>
    )
}
