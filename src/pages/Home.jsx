import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import VacationTracker from '../components/VacationTracker'

export default function Home() {
    const navigate = useNavigate()
    const [calendarDays, setCalendarDays] = useState([])
    const [loading, setLoading] = useState(true)
    const [nextActivity, setNextActivity] = useState(null)
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
    const [vacationData, setVacationData] = useState(null)
    const [vacationActivities, setVacationActivities] = useState([])

    // Ottieni il nome del giorno corrente in italiano
    const getCurrentDayName = () => {
        const daysOfWeek = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
        const todayIndex = new Date().getDay()
        return daysOfWeek[todayIndex]
    }

    // Formatta la data corrente in italiano
    const getCurrentDateString = () => {
        const today = new Date()
        const daysOfWeek = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
        const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
        
        const dayName = daysOfWeek[today.getDay()]
        const day = today.getDate()
        const month = months[today.getMonth()]
        const year = today.getFullYear()
        
        return { dayName, day, month, year, full: `${dayName}, ${day} ${month} ${year}` }
    }

    // Genera suggerimento ricetta in base al tipo di pasto
    const getRecipeSuggestion = (mealName) => {
        const suggestions = {
            'Colazione': 'Prova a preparare una versione più proteica con uova aggiuntive o proteine in polvere. Combina con frutta di stagione per un apporto vitaminico.',
            'Spuntino Mattina': 'Per uno spuntino più saziante, aggiungi una fonte di grassi salutari come noci o semi. Ideale per mantenere l\'energia fino a pranzo.',
            'Pranzo': 'Accompagna il pasto principale con verdure di stagione per un apporto completo di fibre e micronutrienti. Varia le fonti proteiche durante la settimana.',
            'Spuntino Pomeriggio': 'Scegli fonti di carboidrati complessi per mantenere stabile la glicemia. Aggiungi una fonte proteica per favorire il recupero muscolare.',
            'Cena': 'Prediligi proteine magre e verdure per la cena. Limita i grassi saturi e i carboidrati semplici per favorire il sonno e il recupero notturno.',
            'Spuntino Sera': 'Opta per cibi leggeri e facili da digerire. Evita zuccheri semplici che potrebbero disturbare il sonno.'
        }
        
        return suggestions[mealName] || `Per ${mealName.toLowerCase()}, cerca di mantenere un buon equilibrio tra macronutrienti.`
    }

    // Genera consiglio su cosa portare per l'allenamento
    const getWorkoutGearSuggestions = (workoutName) => {
        const suggestions = {
            'Petto e Tricipiti': ['Asciugamano', 'Borraccia', 'Guanti da palestra', 'Cintura per pesi (opzionale)', 'Crema per le mani'], 
            'Dorsali e Bicipiti': ['Asciugamano', 'Borraccia', 'Guanti da palestra', 'Cintura per pesi (opzionale)', 'Ginocchiere (opzionale)'],
            'Gambe': ['Asciugamano', 'Borraccia', 'Cintura per pesi', 'Ginocchiere', 'Scarpette da ginnastica con suola rigida'],
            'Spalle e Addominali': ['Asciugamano', 'Borraccia', 'Guanti da palestra', 'Tappetino per addominali'],
            'Full Body': ['Asciugamano', 'Borraccia', 'Guanti da palestra', 'Cambio vestiti completo'],
            'Riposo Attivo': ['Scarpette da running', 'Borraccia', 'Asciugamano piccolo', 'Tappetino per stretching']
        }
        
        return suggestions[workoutName] || ['Asciugamano e borraccia', 'Guanti da palestra', 'Cambio vestiti']
    }

    // Navigazione mesi
    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11)
            setCurrentYear(currentYear - 1)
        } else {
            setCurrentMonth(currentMonth - 1)
        }
    }

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0)
            setCurrentYear(currentYear + 1)
        } else {
            setCurrentMonth(currentMonth + 1)
        }
    }

    // Verifica se una data è in un periodo di ferie
    const isVacationDate = (date, vacationData) => {
        if (!vacationData?.vacationPeriods) return false
        
        const dateStr = date.toISOString().split('T')[0]
        
        for (const period of vacationData.vacationPeriods) {
            if (period.startDate && period.endDate && dateStr >= period.startDate && dateStr <= period.endDate) {
                return true
            }
        }
        return false
    }

    // Genera il calendario mensile
    const generateMonthlyCalendar = (month, year, palestraData, palestraSuggestions, vacationData) => {
        const daysOfWeek = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
        const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                           'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
        
        // Primo giorno del mese
        const firstDay = new Date(year, month, 1)
        // Ultimo giorno del mese
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        
        // Giorno della settimana del primo giorno (0 = Domenica, 6 = Sabato)
        const startingDay = firstDay.getDay()
        
        // Giorno corrente
        const today = new Date()
        const isCurrentMonth = month === today.getMonth() && year === today.getFullYear()
        const currentDayOfMonth = isCurrentMonth ? today.getDate() : null
        
        // Crea array vuoti per i giorni prima del 1 del mese
        const emptyDays = []
        for (let i = 0; i < startingDay; i++) {
            emptyDays.push(null)
        }
        
        // Crea array dei giorni del mese
        const monthDays = []
        for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
            const date = new Date(year, month, dayNum)
            const dayName = daysOfWeek[date.getDay()]
            const dateStr = date.toISOString().split('T')[0]
            
            // Verifica se c'e' allenamento per questo giorno
            const routine = palestraSuggestions?.routine?.[dayName] || {}
            const hasWorkout = (palestraData?.workoutDays || []).includes(dayName) ||
                              (Array.isArray(routine.esercizi) && routine.esercizi.length > 0)
            
            // Raccolgo i pasti per questo giorno
            const meals = []
            if (palestraData?.orariPasti) {
                Object.keys(palestraData.orariPasti || {}).forEach(mealTime => {
                    if ((palestraData.orariPasti || {})[mealTime]?.ora) {
                        meals.push(mealTime)
                    }
                })
            }
            if (palestraSuggestions?.dieta?.[dayName]?.pasti) {
                Object.keys(palestraSuggestions.dieta[dayName].pasti || {}).forEach(mealTime => {
                    if (!meals.includes(mealTime)) {
                        meals.push(mealTime)
                    }
                })
            }
            
            const workoutName = routine.scheda || ''
            
            // Verifica se e' un giorno di ferie
            const isVacation = vacationData ? isVacationDate(date, vacationData) : false
            
            // Verifica se ci sono suggerimenti specifici per le ferie per questo giorno
            const vacationSuggestion = vacationData?.vacationSuggestions?.[dateStr] || null
            
            monthDays.push({
                number: dayNum,
                date: date,
                dateStr: dateStr,
                dayName: dayName,
                isCurrentDay: isCurrentMonth && dayNum === currentDayOfMonth,
                isCurrentMonth: true,
                hasWorkout,
                meals,
                workoutName,
                isVacation,
                vacationSuggestion
            })
        }
        
        // Calcola quanti giorni vuoti servono alla fine
        const totalCells = emptyDays.length + monthDays.length
        const remainingCells = (7 - (totalCells % 7)) % 7
        const trailingEmptyDays = []
        for (let i = 0; i < remainingCells; i++) {
            trailingEmptyDays.push(null)
        }
        
        // Combina tutto in settimane
        const allDays = [...emptyDays, ...monthDays, ...trailingEmptyDays]
        const weeks = []
        for (let i = 0; i < allDays.length; i += 7) {
            weeks.push(allDays.slice(i, i + 7))
        }
        
        return {
            weeks,
            monthName: monthNames[month],
            year: year
        }
    }

    // Calcola la prossima attivita in base all'ora corrente
    const calculateNextActivity = (currentDayName, palestraData, palestraSuggestions) => {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const currentTime = currentHour * 60 + currentMinute

        // Verifica se oggi c'e' allenamento
        const routineToday = palestraSuggestions?.routine?.[currentDayName] || {}
        const hasWorkoutToday = (palestraData?.workoutDays || []).includes(currentDayName) ||
                                (Array.isArray(routineToday.esercizi) && routineToday.esercizi.length > 0)

        // Raccolgo tutti i pasti di oggi con orari
        const todayMeals = []
        
        // Da palestra_data
        if (palestraData?.orariPasti) {
            Object.entries(palestraData.orariPasti || {}).forEach(([mealName, mealData]) => {
                if (mealData && typeof mealData === 'object' && mealData.ora) {
                    const [hours, minutes] = String(mealData.ora).split(':').map(Number)
                    const mealTime = hours * 60 + minutes
                    todayMeals.push({ 
                        name: mealName, 
                        time: mealTime, 
                        ora: String(mealData.ora),
                        cibo: mealData.cibo ? String(mealData.cibo) : '',
                        source: 'data' 
                    })
                }
            })
        }

        // Da suggestions
        if (palestraSuggestions?.dieta?.[currentDayName]?.pasti) {
            Object.entries(palestraSuggestions.dieta[currentDayName].pasti || {}).forEach(([mealName, mealData]) => {
                if (mealData && typeof mealData === 'object' && mealData.ora) {
                    const [hours, minutes] = String(mealData.ora).split(':').map(Number)
                    const mealTime = hours * 60 + minutes
                    // Evito duplicati
                    if (!todayMeals.some(m => m.name === mealName)) {
                        todayMeals.push({ 
                            name: mealName, 
                            time: mealTime, 
                            ora: String(mealData.ora),
                            cibo: mealData.cibo ? String(mealData.cibo) : '',
                            calorie: mealData.calorie ? String(mealData.calorie) : null,
                            grammi: mealData.grammi ? String(mealData.grammi) : null,
                            source: 'suggestions' 
                        })
                    }
                }
            })
        }

        // Ordina pasti per ora
        todayMeals.sort((a, b) => a.time - b.time)

        // Trova il prossimo pasto dopo l'ora corrente
        let nextMeal = null
        for (const meal of todayMeals) {
            if (meal.time > currentTime) {
                nextMeal = meal
                break
            }
        }

        // Se c'e' un pasto prossimo, restituisci quello
        if (nextMeal) {
            return {
                type: 'meal',
                name: nextMeal.name || 'Pasto',
                ora: nextMeal.ora || '',
                cibo: nextMeal.cibo ? String(nextMeal.cibo) : 'N/D',
                calorie: nextMeal.calorie ? String(nextMeal.calorie) : null,
                grammi: nextMeal.grammi ? String(nextMeal.grammi) : null
            }
        }

        // Se non c'e' un pasto prossimo ma c'e' allenamento oggi
        if (hasWorkoutToday) {
            const routine = palestraSuggestions?.routine?.[currentDayName] || {}
            const calendario = palestraSuggestions?.calendario?.[currentDayName] || {}
            return {
                type: 'workout',
                name: routine.scheda || 'Allenamento',
                time: '18:00',
                esercizi: Array.isArray(routine.esercizi) ? routine.esercizi : [],
                consiglio: (calendario.suggerimenti && Array.isArray(calendario.suggerimenti) && calendario.suggerimenti[0]) ? String(calendario.suggerimenti[0]) : ''
            }
        }

        // Nessuna attivita trovata
        return null
    }

    // Funzione per gestire toggle attività
    const handleActivityToggle = (date, activityId, isDone) => {
        // Trova l'attivita nell'array
        const activityIndex = vacationActivities.findIndex(act => act.id === activityId || act.date === date)
        
        let updatedActivities
        if (activityIndex !== -1) {
            // Aggiorna l'attivita esistente
            updatedActivities = vacationActivities.map((act, idx) => 
                idx === activityIndex ? { ...act, done: isDone } : act
            )
        } else {
            // Crea una nuova attivita (se non esiste)
            const newActivity = {
                id: activityId,
                date: date,
                description: activityId.split('-').slice(1).join('-'),
                type: 'workout',
                done: isDone,
                createdAt: new Date().toISOString()
            }
            updatedActivities = [...vacationActivities, newActivity]
        }
        
        setVacationActivities(updatedActivities)
        
        // Salva in localStorage
        try {
            localStorage.setItem('palestra_vacation_activities', JSON.stringify(updatedActivities))
        } catch (e) {
            console.error('Errore salvataggio attivita:', e)
        }
    }
    
    // Funzione per aggiungere pasto mangiato
    const handleMealAdd = (date, description, calories) => {
        const newMeal = {
            id: `meal-${Date.now()}`,
            date,
            description,
            calories,
            done: true,
            createdAt: new Date().toISOString()
        }
        
        setVacationActivities(prev => [...prev, newMeal])
        
        // Salva in localStorage
        try {
            const savedActivities = localStorage.getItem('palestra_vacation_activities')
            const currentActivities = savedActivities ? JSON.parse(savedActivities) : []
            localStorage.setItem('palestra_vacation_activities', JSON.stringify([...currentActivities, newMeal]))
        } catch (e) {
            console.error('Errore salvataggio attività:', e)
        }
    }
    
    useEffect(() => {
        const savedData = localStorage.getItem('palestra_data')
        const savedSuggestions = localStorage.getItem('palestra_suggestions')
        const savedVacation = localStorage.getItem('palestra_vacation')
        const savedActivities = localStorage.getItem('palestra_vacation_activities')
        
        let palestraData = null
        let palestraSuggestions = null
        let vacationData = null
        let activities = []
        
        if (savedData) {
            palestraData = JSON.parse(savedData)
        }
        if (savedSuggestions) {
            palestraSuggestions = JSON.parse(savedSuggestions)
        }
        if (savedVacation) {
            try {
                vacationData = JSON.parse(savedVacation)
            } catch (e) {
                console.error('Errore parsing vacation data:', e)
                vacationData = { vacationPeriods: [], vacationSuggestions: {} }
            }
        }
        if (savedActivities) {
            try {
                activities = JSON.parse(savedActivities)
            } catch (e) {
                console.error('Errore parsing activities:', e)
                activities = []
            }
        }

        
        setVacationData(vacationData || { vacationPeriods: [], vacationSuggestions: {} })
        setVacationActivities(activities || [])
        
        // Genera calendario mensile
        const calendar = generateMonthlyCalendar(currentMonth, currentYear, palestraData, palestraSuggestions, vacationData)
        setCalendarDays(calendar.weeks)
        
        // Calcola prossima attivita
        const dayName = getCurrentDayName()
        const activity = calculateNextActivity(dayName, palestraData, palestraSuggestions)
        setNextActivity(activity)
        
        setLoading(false)
    }, [currentMonth, currentYear])

    // Verifica se ci sono dati nel calendario
    const hasCalendarData = calendarDays.some(week => 
        week.some(day => day && (day.hasWorkout || day.meals.length > 0 || day.isVacation))
    )

    const handleDayClick = (day) => {
        // Naviga al giorno della settimana
        if (day && day.dayName) {
            navigate(`/day/${day.dateStr || day.dayName}`)
        }
    }

    // Formatta l'ora nel formato HH:MM
    const formatTime = (timeStr) => {
        if (!timeStr) return ''
        if (timeStr.includes(':')) {
            return timeStr
        }
        return timeStr
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

    const hasData = hasCalendarData

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
                        className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                        onClick={() => navigate('/settings')}
                    >
                        <i className="bi bi-gear"></i> Impostazioni
                    </button>
                </div>
            </div>

            {/* Giorno corrente */}
            <div className="mb-4">
                <div className="card border-0 shadow-sm bg-primary text-white">
                    <div className="card-body py-3">
                        <div className="d-flex align-items-center gap-3">
                            <i className="bi bi-calendar-range fs-3"></i>
                            <div>
                                <h4 className="mb-0">Oggi è <strong>{getCurrentDateString().full}</strong></h4>
                            </div>
                        </div>
                    </div>
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

            {/* Calendario mensile */}
            <div className="mb-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-3">
                        {/* Header calendario con navigazione */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <button 
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                onClick={prevMonth}
                                title="Mese precedente"
                            >
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <h5 className="mb-0">
                                {new Date(currentYear, currentMonth).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}
                            </h5>
                            <button 
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                onClick={nextMonth}
                                title="Mese successivo"
                            >
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                        
                        {/* Nomi giorni della settimana */}
                        <div className="row g-1 text-center mb-2">
                            {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((day, index) => (
                                <div key={index} className="col">
                                    <small className="fw-bold text-muted">{day}</small>
                                </div>
                            ))}
                        </div>
                        
                        {/* Griglia giorni del mese */}
                        <div>
                            {calendarDays.map((week, weekIndex) => (
                                <div key={weekIndex} className="row g-1 mb-1">
                                    {week.map((day, dayIndex) => (
                                        <div 
                                            key={dayIndex}
                                            className="col"
                                            onClick={() => day && handleDayClick(day)}
                                            style={{ cursor: day ? 'pointer' : 'default', minWidth: '40px' }}
                                        >
                                            {day ? (
                                                <div 
                                                    className={`p-2 rounded text-center position-relative ${
                                                        day.isVacation 
                                                            ? (day.isCurrentDay ? 'bg-warning text-dark fw-bold' : 'bg-warning bg-opacity-20')
                                                            : (day.isCurrentDay ? 'bg-primary text-white fw-bold' : day.hasWorkout ? 'bg-primary bg-opacity-10' : 'bg-light')
                                                    }`}
                                                    style={{ height: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                                                    title={day.isVacation 
                                                        ? `Ferie${day.vacationSuggestion ? ' - ' + day.vacationSuggestion.workout.tips : ''}`
                                                        : day.hasWorkout 
                                                            ? `Allenamento: ${day.workoutName}`
                                                            : day.meals.length > 0 
                                                                ? `Pasti: ${day.meals.join(', ')}`
                                                                : 'Riposo'
                                                    }
                                                >
                                                    <small className="d-block">{day.number}</small>
                                                    {day.isVacation && (
                                                        <small className="d-block" style={{ fontSize: '0.65rem' }}>🏖️</small>
                                                    )}
                                                    {!day.isVacation && day.hasWorkout && (
                                                        <small className="d-block" style={{ fontSize: '0.65rem' }}>🏋️</small>
                                                    )}
                                                    {!day.isVacation && day.meals.length > 0 && !day.hasWorkout && (
                                                        <small className="d-block" style={{ fontSize: '0.65rem' }}>🍽️</small>
                                                    )}
                                                    {!day.isVacation && day.hasWorkout && day.meals.length > 0 && (
                                                        <small className="d-block" style={{ fontSize: '0.65rem' }}>🏋️🍽️</small>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-2" style={{ height: '60px' }}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracciamento Vacanza (se ci sono giorni di ferie in questo mese) */}
            {vacationData && (
                <VacationTracker
                    vacationData={vacationData}
                    vacationActivities={vacationActivities}
                    onActivityToggle={handleActivityToggle}
                    onMealAdd={handleMealAdd}
                />
            )}

            {/* Prossima attivita */}
            {hasData && nextActivity && (
                <div className="mb-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-2 mb-3">
                                <i className={`fs-4 ${nextActivity.type === 'workout' ? 'text-primary' : 'text-success'}`}>
                                    {nextActivity.type === 'workout' ? '🏋️' : '🍽️'}
                                </i>
                                <h5 className="mb-0">
                                    {nextActivity.type === 'workout' ? 'Prossima Attività: Allenamento' : 'Prossima Attività: Pasto'}
                                </h5>
                            </div>
                            
                            {nextActivity.type === 'workout' ? (
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                            <i className="bi bi-calendar-event text-primary fs-4"></i>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{nextActivity.name}</h6>
                                                <small className="text-muted">Ore: {formatTime(nextActivity.time)}</small>
                                            </div>
                                        </div>
                                    </div>
                                    {nextActivity.consiglio && (
                                        <div className="col-12">
                                            <div className="alert alert-info p-2 mb-0">
                                                <i className="bi bi-lightbulb me-2"></i>
                                                <strong>Consiglio IA:</strong> {nextActivity.consiglio}
                                            </div>
                                        </div>
                                    )}
                                    {nextActivity.esercizi && nextActivity.esercizi.length > 0 && (
                                        <div className="col-12">
                                            <div className="p-3 bg-light rounded">
                                                <small className="text-muted">Cosa portare:</small>
                                                <ul className="mb-0 mt-1 ps-3">
                                                    {getWorkoutGearSuggestions(nextActivity.name).map((item, index) => (
                                                        <li key={index}><small>{item}</small></li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="d-flex align-items-center gap-2 p-3 bg-light rounded">
                                            <i className="bi bi-clock text-success fs-4"></i>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{nextActivity.name}</h6>
                                                <small className="text-muted">Ore: {formatTime(nextActivity.ora)}</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="p-3 bg-light rounded">
                                            <div className="d-flex align-items-start gap-2">
                                                <i className="bi bi-egg-fried text-warning fs-4"></i>
                                                <div>
                                                    <small className="text-muted d-block mb-1">Ricetta consigliata:</small>
                                                    <p className="mb-0 small">{nextActivity.cibo}</p>
                                                    {nextActivity.calorie && (
                                                        <small className="text-muted mt-1 d-block">
                                                            <i className="bi bi-fire me-1"></i> {nextActivity.calorie} kcal
                                                        </small>
                                                    )}
                                                    {nextActivity.grammi && (
                                                        <small className="text-muted d-block">
                                                            <i className="bi bi-weight me-1"></i> {nextActivity.grammi}
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12">
                                        <div className="alert alert-success p-2 mb-0">
                                            <i className="bi bi-lightbulb me-2"></i>
                                            <strong>Suggerimento IA:</strong> {getRecipeSuggestion(nextActivity.name)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

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
