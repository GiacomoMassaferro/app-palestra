import { useState } from 'react'

export default function VacationTracker({ vacationData, vacationActivities = [], onActivityToggle, onMealAdd }) {
    const [newMeal, setNewMeal] = useState({ description: '', calories: '' })
    const [expandedDates, setExpandedDates] = useState({})
    
    // Trova tutti i giorni di ferie nel mese corrente
    const getCurrentMonthVacationDays = () => {
        if (!vacationData?.vacationPeriods) return []
        
        const today = new Date()
        const currentMonth = today.getMonth()
        const currentYear = today.getFullYear()
        
        const vacationDays = []
        
        vacationData.vacationPeriods.forEach(period => {
            const start = new Date(period.startDate)
            const end = new Date(period.endDate)
            
            // Verifica se il periodo interseca il mese corrente
            if (start.getFullYear() === currentYear && start.getMonth() === currentMonth) {
                // Periodo inizia questo mese
                for (let d = new Date(start); d <= end && d.getMonth() === currentMonth; d.setDate(d.getDate() + 1)) {
                    vacationDays.push(d.toISOString().split('T')[0])
                }
            } else if (end.getFullYear() === currentYear && end.getMonth() === currentMonth) {
                // Periodo finisce questo mese
                const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
                for (let d = new Date(firstDayOfMonth); d <= end; d.setDate(d.getDate() + 1)) {
                    vacationDays.push(d.toISOString().split('T')[0])
                }
            } else if (start.getFullYear() < currentYear || (start.getFullYear() === currentYear && start.getMonth() < currentMonth) &&
                       (end.getFullYear() > currentYear || (end.getFullYear() === currentYear && end.getMonth() > currentMonth))) {
                // Periodo copre tutto il mese
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
                for (let day = 1; day <= daysInMonth; day++) {
                    vacationDays.push(new Date(currentYear, currentMonth, day).toISOString().split('T')[0])
                }
            }
        })
        
        return [...new Set(vacationDays)].sort()
    }
    
    const vacationDays = getCurrentMonthVacationDays()
    
    // Toggle espansione data
    const toggleDate = (date) => {
        setExpandedDates(prev => ({
            ...prev,
            [date]: !prev[date]
        }))
    }
    
    // Gestione nuovo pasto
    const handleMealChange = (e) => {
        const { name, value } = e.target
        setNewMeal(prev => ({ ...prev, [name]: value }))
    }
    
    const addMeal = (date) => {
        if (!newMeal.description) return
        
        const calories = newMeal.calories ? parseInt(newMeal.calories) : null
        
        if (onMealAdd) {
            onMealAdd(date, newMeal.description, calories)
        }
        
        setNewMeal({ description: '', calories: '' })
    }
    
    // Formatta data corta
    const formatShortDate = (dateStr) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    }
    
    // Filtra pasti per data
    const getMealsForDate = (dateStr) => {
        return vacationActivities.filter(a => a.date === dateStr && a.isCheatMeal)
    }
    
    // Filtra workout per data
    const getWorkoutsForDate = (dateStr) => {
        return vacationActivities.filter(a => a.date === dateStr && a.type === 'workout')
    }

    if (vacationDays.length === 0) {
        return null
    }
    
    return (
        <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 d-flex align-items-center gap-2">
                        <i className="bi bi-airplane text-warning"></i>
                        Tracciamento Attività Vacanza
                    </h5>
                    <span className="badge bg-warning bg-opacity-20 text-warning">
                        {vacationDays.length} giorno{vacationDays.length > 1 ? 'i' : ''} in ferie
                    </span>
                </div>
                
                <p className="text-muted small mb-4">
                    Traccia le attività eseguite e i pasti consumati durante le ferie. 
                    L'IA terrà conto di tutto per generare un piano di rientro personalizzato.
                </p>
                
                {/* Lista giorni di ferie */}
                <div className="space-y-2">
                    {vacationDays.map(dateStr => {
                        const suggestion = vacationData.vacationSuggestions?.[dateStr]
                        const date = new Date(dateStr)
                        const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' })
                        const isExpanded = expandedDates[dateStr]
                        
                        return (
                            <div key={dateStr} className="mb-3">
                                <div 
                                    className={`card ${isExpanded ? 'border-primary' : 'border-light'} shadow-sm`}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => toggleDate(dateStr)}
                                >
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center p-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-calendar-date text-warning"></i>
                                            <strong>{formatShortDate(dateStr)}</strong>
                                            <small className="text-muted">{dayName}</small>
                                        </div>
                                        <i className={`bi bi-chevron-${isExpanded ? 'down' : 'right'} text-muted`}></i>
                                    </div>
                                    
                                    {isExpanded && (
                                        <div className="card-body p-3">
                                            {/* Attività consigliate */}
                                            {suggestion?.workout && (
                                                <div className="mb-3">
                                                    <h6 className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-activity text-primary"></i>
                                                        Attività Consigliate
                                                    </h6>
                                                    <ul className="list-unstyled mb-0">
                                                        {(suggestion.workout.exercises || []).map((exercise, idx) => {
                                                            // Genera ID univoco per ogni attività
                                                            const activityId = `act-${dateStr}-${idx}`
                                                            // Verifica se è stata segnalata come eseguita
                                                            const isDone = vacationActivities.some(act => 
                                                                act.date === dateStr && 
                                                                act.type === 'workout' && 
                                                                act.description === exercise && 
                                                                act.done
                                                            )
                                                            
                                                            return (
                                                                <li key={idx} className="mb-2 p-2 bg-light rounded d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <small className="d-block text-muted">Esercizio {idx + 1}</small>
                                                                        <span>{exercise}</span>
                                                                    </div>
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="checkbox"
                                                                            id={activityId}
                                                                            checked={isDone}
                                                                            onChange={(e) => {
                                                                                e.stopPropagation()
                                                                                if (onActivityToggle) {
                                                                                    onActivityToggle(dateStr, activityId, e.target.checked)
                                                                                }
                                                                            }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                        <label className="form-check-label small" htmlFor={activityId} onClick={(e) => e.stopPropagation()}>
                                                                            {isDone ? 'Fatto' : 'Da fare'}
                                                                        </label>
                                                                    </div>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                    <div className="alert alert-info p-2 mt-2 mb-0 small">
                                                        <i className="bi bi-lightbulb me-1"></i>
                                                        {suggestion.workout.tips || 'Mantieni il movimento senza stress'}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Dieta consigliata */}
                                            {suggestion?.diet && (
                                                <div className="mb-3">
                                                    <h6 className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-egg-fried text-success"></i>
                                                        Consigli Alimentari
                                                    </h6>
                                                    <div className="alert alert-success p-2 small">
                                                        {suggestion.diet.tips || 'Mantieni equilibrio: 60% proteine/verdure, 30% carboidrati, 10% dolci'}
                                                    </div>
                                                    <small className="text-muted">
                                                        Calorie base: {suggestion.diet.baseCalories || 1800} kcal
                                                    </small>
                                                </div>
                                            )}
                                            
                                            {/* Aggiungi pasto mangiato */}
                                            <div className="mt-3 pt-3 border-top">
                                                <h6 className="d-flex align-items-center gap-2 mb-2">
                                                    <i className="bi bi-journal-plus text-warning"></i>
                                                    Aggiungi Pasto Mangiato
                                                </h6>
                                                <div className="row g-2">
                                                    <div className="col-8">
                                                        <input
                                                            type="text"
                                                            className="form-control form-control-sm"
                                                            placeholder="Es. Pizza Margherita + Insalata"
                                                            name="description"
                                                            value={newMeal.description}
                                                            onChange={handleMealChange}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="col-2">
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm"
                                                            placeholder="Kcal"
                                                            name="calories"
                                                            value={newMeal.calories}
                                                            onChange={handleMealChange}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                    <div className="col-2 d-flex align-items-center">
                                                        <button
                                                            className="btn btn-sm btn-success w-100"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                addMeal(dateStr)
                                                            }}
                                                            disabled={!newMeal.description}
                                                        >
                                                            <i className="bi bi-plus"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Pasti e attivita tracciati */}
                                            {getMealsForDate(dateStr).length > 0 && (
                                                <div className="mt-3">
                                                    <h6 className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-egg-fried text-success"></i>
                                                        Pasti Registrati
                                                    </h6>
                                                    {getMealsForDate(dateStr).map((meal, idx) => (
                                                        <div key={meal.id || idx} className="mb-2 p-2 bg-light rounded">
                                                            <small className="text-muted d-block">Pasto:</small>
                                                            <p className="mb-0 small">{meal.description}{meal.calories ? ` - ${meal.calories} kcal` : ''}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            {getWorkoutsForDate(dateStr).length > 0 && (
                                                <div className="mt-3">
                                                    <h6 className="d-flex align-items-center gap-2 mb-2">
                                                        <i className="bi bi-activity text-primary"></i>
                                                        Attività Registrate
                                                    </h6>
                                                    {getWorkoutsForDate(dateStr).map((activity, idx) => (
                                                        <div key={activity.id || idx} className="mb-2 p-2 bg-light rounded">
                                                            <small className="text-muted d-block">Attività:</small>
                                                            <p className="mb-0 small">{activity.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                {/* Info piano di rientro */}
                <div className="alert alert-light border mt-4">
                    <i className="bi bi-info-circle me-2 text-primary"></i>
                    <small>
                        <strong>Piano di Rientro:</strong> Al termine delle ferie, l'IA genererà automaticamente 
                        un piano di rientro basato su:
                        <ul className="mb-0 mt-1 ps-3">
                            <li>Attività eseguite durante le ferie</li>
                            <li>Pasti e sgarri alimentari segnalati</li>
                            <li>Il tuo piano originale</li>
                        </ul>
                    </small>
                </div>
            </div>
        </div>
    )
}
