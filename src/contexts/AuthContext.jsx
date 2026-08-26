// Contesto base per autenticazione (da implementare)
// Mantiene struttura per future espansioni

import { createContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('palestra_user')
    return storedUser ? JSON.parse(storedUser) : null
  })

  const login = (userData) => {
    localStorage.setItem('palestra_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('palestra_user')
    setUser(null)
  }

  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData }
    localStorage.setItem('palestra_user', JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
