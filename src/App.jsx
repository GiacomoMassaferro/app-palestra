import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Settings from './pages/Settings'
import WorkoutPlan from './pages/WorkoutPlan'
import NutritionPlan from './pages/NutritionPlan'

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
          <Route path="/workout-plan" element={<MainLayout><WorkoutPlan /></MainLayout>} />
          <Route path="/nutrition-plan" element={<MainLayout><NutritionPlan /></MainLayout>} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  )
}

export default App
