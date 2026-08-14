import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Carica utente da localStorage al montaggio
        const savedUser = localStorage.getItem('palestra_user')
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (e) {
                console.error('Errore caricamento utente:', e)
            }
        }
        setLoading(false)
    }, [])

    const login = (userData) => {
        const userWithTimestamp = {
            ...userData,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        }
        localStorage.setItem('palestra_user', JSON.stringify(userWithTimestamp))
        setUser(userWithTimestamp)
        return userWithTimestamp
    }

    const logout = () => {
        localStorage.removeItem('palestra_user')
        setUser(null)
    }

    const updateUser = (updates) => {
        if (!user) return null
        
        const updatedUser = {
            ...user,
            ...updates,
            lastLogin: new Date().toISOString()
        }
        localStorage.setItem('palestra_user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return updatedUser
    }

    const isAuthenticated = !!user

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve essere usato dentro AuthProvider')
    }
    return context
}
