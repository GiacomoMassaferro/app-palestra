import { createContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

const defaultSettings = {
  obiettivo: 'Massa Muscolare',
  livello: 'Intermedio',
  preferenzeAlimentari: 'Onnivoro',
  giorniAllenamento: ['Lunedì', 'Martedì', 'Giovedì', 'Venerdì'],
  durataAllenamento: 75,
  orariPasti: [
    { ora: '07:30', descrizione: 'Colazione' },
    { ora: '13:00', descrizione: 'Pranzo' },
    { ora: '16:00', descrizione: 'Spuntino' },
    { ora: '20:00', descrizione: 'Cena' }
  ]
}

const defaultWorkoutPlan = {
  esercizi: []
}

const defaultNutritionPlan = {
  pasti: []
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('palestra_settings')
    return saved ? JSON.parse(saved) : defaultSettings
  })

  const [workoutPlan, setWorkoutPlan] = useState(() => {
    const saved = localStorage.getItem('palestra_workout_plan')
    return saved ? JSON.parse(saved) : defaultWorkoutPlan
  })

  const [nutritionPlan, setNutritionPlan] = useState(() => {
    const saved = localStorage.getItem('palestra_nutrition_plan')
    return saved ? JSON.parse(saved) : defaultNutritionPlan
  })

  useEffect(() => {
    localStorage.setItem('palestra_settings', JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    localStorage.setItem('palestra_workout_plan', JSON.stringify(workoutPlan))
  }, [workoutPlan])

  useEffect(() => {
    localStorage.setItem('palestra_nutrition_plan', JSON.stringify(nutritionPlan))
  }, [nutritionPlan])

  const updateSettings = (newSettings) => {
    setSettings({ ...settings, ...newSettings })
  }

  const addEsercizio = (esercizio) => {
    setWorkoutPlan({
      ...workoutPlan,
      esercizi: [...workoutPlan.esercizi, esercizio]
    })
  }

  const removeEsercizio = (index) => {
    const newEsercizi = [...workoutPlan.esercizi]
    newEsercizi.splice(index, 1)
    setWorkoutPlan({ ...workoutPlan, esercizi: newEsercizi })
  }

  const updateEsercizio = (index, newEsercizio) => {
    const newEsercizi = [...workoutPlan.esercizi]
    newEsercizi[index] = { ...newEsercizi[index], ...newEsercizio }
    setWorkoutPlan({ ...workoutPlan, esercizi: newEsercizi })
  }

  const addPasto = (pasto) => {
    setNutritionPlan({
      ...nutritionPlan,
      pasti: [...nutritionPlan.pasti, pasto]
    })
  }

  const removePasto = (index) => {
    const newPasti = [...nutritionPlan.pasti]
    newPasti.splice(index, 1)
    setNutritionPlan({ ...nutritionPlan, pasti: newPasti })
  }

  const updatePasto = (index, newPasto) => {
    const newPasti = [...nutritionPlan.pasti]
    newPasti[index] = { ...newPasti[index], ...newPasto }
    setNutritionPlan({ ...nutritionPlan, pasti: newPasti })
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setWorkoutPlan(defaultWorkoutPlan)
    setNutritionPlan(defaultNutritionPlan)
  }

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      workoutPlan,
      addEsercizio,
      removeEsercizio,
      updateEsercizio,
      nutritionPlan,
      addPasto,
      removePasto,
      updatePasto,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export { SettingsContext }
