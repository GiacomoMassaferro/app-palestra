import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import DayDetails from './pages/DayDetails'
import Settings from './pages/Settings'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="day/:date" element={<DayDetails />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/chat" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
