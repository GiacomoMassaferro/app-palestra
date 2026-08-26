import { createContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

// Funzione per generare ID univoco
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Limite massimo per file in Base64 (circa 4MB)
const MAX_FILE_SIZE = 4 * 1024 * 1024

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
  esercizi: [],
  files: []
}

const defaultNutritionPlan = {
  pasti: [],
  files: []
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('palestra_settings')
    const parsed = saved ? JSON.parse(saved) : defaultSettings
    // Assicurati che tutti i campi esistano per dati vecchi
    return {
      ...defaultSettings,
      ...parsed,
      giorniAllenamento: parsed.giorniAllenamento || defaultSettings.giorniAllenamento,
      orariPasti: parsed.orariPasti || defaultSettings.orariPasti
    }
  })

  const [workoutPlan, setWorkoutPlan] = useState(() => {
    const saved = localStorage.getItem('palestra_workout_plan')
    const parsed = saved ? JSON.parse(saved) : defaultWorkoutPlan
    // Assicurati che tutti i campi esistano per dati vecchi
    return {
      ...defaultWorkoutPlan,
      ...parsed,
      esercizi: parsed.esercizi || [],
      files: parsed.files || []
    }
  })

  const [nutritionPlan, setNutritionPlan] = useState(() => {
    const saved = localStorage.getItem('palestra_nutrition_plan')
    const parsed = saved ? JSON.parse(saved) : defaultNutritionPlan
    // Assicurati che tutti i campi esistano per dati vecchi
    return {
      ...defaultNutritionPlan,
      ...parsed,
      pasti: parsed.pasti || [],
      files: parsed.files || []
    }
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

  // Funzioni per gestire file nella scheda allenamento
  const addWorkoutFile = (file, description = '') => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File troppo grande. Limite massimo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const newFile = {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          uploadedAt: new Date().toISOString(),
          description: description,
          ai_metadata: {
            processable: true,
            content_type: file.type,
            category: 'workout'
          }
        }
        setWorkoutPlan({
          ...workoutPlan,
          files: [...workoutPlan.files, newFile]
        })
        resolve(newFile)
      }
      reader.onerror = () => reject(new Error('Errore nella lettura del file'))
      reader.readAsDataURL(file)
    })
  }

  const removeWorkoutFile = (fileId) => {
    setWorkoutPlan({
      ...workoutPlan,
      files: workoutPlan.files.filter(f => f.id !== fileId)
    })
  }

  // Funzioni per gestire file nella scheda nutrizionale
  const addNutritionFile = (file, description = '') => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        reject(new Error(`File troppo grande. Limite massimo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const newFile = {
          id: generateId(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          uploadedAt: new Date().toISOString(),
          description: description,
          ai_metadata: {
            processable: true,
            content_type: file.type,
            category: 'nutrition'
          }
        }
        setNutritionPlan({
          ...nutritionPlan,
          files: [...nutritionPlan.files, newFile]
        })
        resolve(newFile)
      }
      reader.onerror = () => reject(new Error('Errore nella lettura del file'))
      reader.readAsDataURL(file)
    })
  }

  const removeNutritionFile = (fileId) => {
    setNutritionPlan({
      ...nutritionPlan,
      files: nutritionPlan.files.filter(f => f.id !== fileId)
    })
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
      addWorkoutFile,
      removeWorkoutFile,
      nutritionPlan,
      addPasto,
      removePasto,
      updatePasto,
      addNutritionFile,
      removeNutritionFile,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export { SettingsContext }
