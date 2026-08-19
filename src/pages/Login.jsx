import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const { login, loginWithCredentials, isAuthenticated } = useAuth()
    
    const [activeTab, setActiveTab] = useState('login')
    const [loginData, setLoginData] = useState({
        email: '',
        password: ''
    })
    const [registerData, setRegisterData] = useState({
        nome: '',
        cognome: '',
        email: '',
        annoNascita: '',
        altezza: '',
        peso: '',
        sesso: '',
        password: '',
        confermaPassword: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // Reindirizza a home se l'utente è già autenticato
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    const handleLoginChange = (e) => {
        const { name, value } = e.target
        setLoginData(prev => ({ ...prev, [name]: value }))
    }

    const handleRegisterChange = (e) => {
        const { name, value, type } = e.target
        setRegisterData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value
        }))
    }

    const validateLogin = () => {
        const errors = []
        if (!loginData.email.trim()) {
            errors.push('L\'email è obbligatoria')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
            errors.push('Inserisci un indirizzo email valido')
        }
        if (!loginData.password) {
            errors.push('La password è obbligatoria')
        }
        return errors
    }

    const validateRegister = () => {
        const errors = []
        if (!registerData.nome.trim()) errors.push('Il nome è obbligatorio')
        if (!registerData.cognome.trim()) errors.push('Il cognome è obbligatorio')
        if (!registerData.email.trim()) {
            errors.push('L\'email è obbligatoria')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
            errors.push('Inserisci un indirizzo email valido')
        }
        if (!registerData.sesso) errors.push('Il sesso è obbligatorio')
        if (!registerData.annoNascita) errors.push('L\'anno di nascita è obbligatorio')
        else if (registerData.annoNascita < 1900 || registerData.annoNascita > new Date().getFullYear()) {
            errors.push('Inserisci un anno di nascita valido')
        }
        if (!registerData.altezza) errors.push('L\'altezza è obbligatoria')
        else if (registerData.altezza < 100 || registerData.altezza > 250) {
            errors.push('Inserisci un altezza valida (100-250 cm)')
        }
        if (!registerData.peso) errors.push('Il peso è obbligatorio')
        else if (registerData.peso < 30 || registerData.peso > 200) {
            errors.push('Inserisci un peso valido (30-200 kg)')
        }
        if (!registerData.password) errors.push('La password è obbligatoria')
        else if (registerData.password.length < 6) errors.push('La password deve essere di almeno 6 caratteri')
        if (registerData.password !== registerData.confermaPassword) {
            errors.push('Le password non coincidono')
        }
        return errors
    }

    const handleLoginSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        const errors = validateLogin()
        if (errors.length > 0) {
            setError(errors.join('. '))
            setLoading(false)
            return
        }
        try {
            const result = loginWithCredentials(loginData.email, loginData.password)
            if (result.success) {
                // Usa setTimeout per evitare il conflitto di rendering con BrowserRouter
                setTimeout(() => {
                    navigate('/')
                }, 0)
            } else {
                setError(result.error)
            }
        } catch {
            setError('Errore durante il login. Riprova.')
        } finally {
            setLoading(false)
        }
    }

    const handleRegisterSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        const errors = validateRegister()
        if (errors.length > 0) {
            setError(errors.join('. '))
            setLoading(false)
            return
        }
        const userData = {
            nome: registerData.nome.trim(),
            cognome: registerData.cognome.trim(),
            email: registerData.email.trim().toLowerCase(),
            sesso: registerData.sesso,
            annoNascita: registerData.annoNascita,
            eta: new Date().getFullYear() - registerData.annoNascita,
            altezza: registerData.altezza,
            peso: registerData.peso
        }
        try {
            login(userData)
            navigate('/')
        } catch {
            setError('Errore durante la registrazione. Riprova.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-6 col-md-8 col-sm-10">
                        <div className="card border-0 shadow-lg">
                            <div className="card-header bg-primary text-white text-center py-4">
                                <div className="d-flex flex-column align-items-center gap-3">
                                    <i className="bi bi-person-circle fs-1"></i>
                                    <h3 className="mb-0 fw-bold">Benvenuto in FitPlan AI</h3>
                                    <p className="mb-0 small opacity-75">Accedi o registrati per iniziare</p>
                                </div>
                            </div>

                            <div className="card-body p-4 p-md-5">
                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show mb-4">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {error}
                                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                )}

                                <ul className="nav nav-tabs mb-4" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('login')}
                                            type="button"
                                            role="tab"
                                        >
                                            <i className="bi bi-box-arrow-in-right me-1"></i> Accedi
                                        </button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button
                                            className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('register')}
                                            type="button"
                                            role="tab"
                                        >
                                            <i className="bi bi-person-plus me-1"></i> Registrati
                                        </button>
                                    </li>
                                </ul>

                                <div className="tab-content">
                                    {activeTab === 'login' && (
                                        <form onSubmit={handleLoginSubmit}>
                                            <div className="mb-4">
                                                <h5 className="text-primary mb-3 d-flex align-items-center gap-2">
                                                    <i className="bi bi-key"></i> Credenziali di Accesso
                                                </h5>
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <label htmlFor="loginEmail" className="form-label">
                                                            <i className="bi bi-envelope me-1 text-primary"></i> Email
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            id="loginEmail"
                                                            name="email"
                                                            value={loginData.email}
                                                            onChange={handleLoginChange}
                                                            placeholder="mario.rossi@example.com"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label htmlFor="loginPassword" className="form-label">
                                                            <i className="bi bi-lock me-1 text-primary"></i> Password
                                                        </label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="loginPassword"
                                                            name="password"
                                                            value={loginData.password}
                                                            onChange={handleLoginChange}
                                                            placeholder="Inserisci la tua password"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-grid gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg py-3"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Accesso in corso...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-box-arrow-in-right me-2"></i> Accedi
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {activeTab === 'register' && (
                                        <form onSubmit={handleRegisterSubmit}>
                                            <div className="mb-4">
                                                <h5 className="text-primary mb-3 d-flex align-items-center gap-2">
                                                    <i className="bi bi-person"></i> Dati Personali
                                                </h5>
                                                <div className="row g-3">
                                                    <div className="col-md-6">
                                                        <label htmlFor="nome" className="form-label">
                                                            <i className="bi bi-person me-1 text-primary"></i> Nome *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="nome"
                                                            name="nome"
                                                            value={registerData.nome}
                                                            onChange={handleRegisterChange}
                                                            placeholder="Mario"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label htmlFor="cognome" className="form-label">
                                                            <i className="bi bi-person me-1 text-primary"></i> Cognome *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            id="cognome"
                                                            name="cognome"
                                                            value={registerData.cognome}
                                                            onChange={handleRegisterChange}
                                                            placeholder="Rossi"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label htmlFor="email" className="form-label">
                                                            <i className="bi bi-envelope me-1 text-primary"></i> Email *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            className="form-control"
                                                            id="email"
                                                            name="email"
                                                            value={registerData.email}
                                                            onChange={handleRegisterChange}
                                                            placeholder="mario.rossi@example.com"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h5 className="text-success mb-3 d-flex align-items-center gap-2">
                                                    <i className="bi bi-heart-pulse"></i> Dati per l'IA
                                                </h5>
                                                <p className="text-muted small mb-3">
                                                    Questi dati saranno usati dall'IA per fornirti suggerimenti personalizzati
                                                </p>
                                                <div className="row g-3">
                                                    <div className="col-md-3">
                                                        <label htmlFor="sesso" className="form-label">
                                                            <i className="bi bi-gender-ambiguous me-1 text-success"></i> Sesso *
                                                        </label>
                                                        <select
                                                            className="form-select"
                                                            id="sesso"
                                                            name="sesso"
                                                            value={registerData.sesso}
                                                            onChange={handleRegisterChange}
                                                            required
                                                        >
                                                            <option value="">Seleziona...</option>
                                                            <option value="Uomo">Uomo</option>
                                                            <option value="Donna">Donna</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label htmlFor="annoNascita" className="form-label">
                                                            <i className="bi bi-calendar me-1 text-success"></i> Anno di Nascita *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            id="annoNascita"
                                                            name="annoNascita"
                                                            value={registerData.annoNascita || ''}
                                                            onChange={handleRegisterChange}
                                                            placeholder="1990"
                                                            min="1900"
                                                            max={new Date().getFullYear()}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label htmlFor="altezza" className="form-label">
                                                            <i className="bi bi-rulers me-1 text-success"></i> Altezza (cm) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            id="altezza"
                                                            name="altezza"
                                                            value={registerData.altezza || ''}
                                                            onChange={handleRegisterChange}
                                                            placeholder="175"
                                                            min="100"
                                                            max="250"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label htmlFor="peso" className="form-label">
                                                            <i className="bi bi-weight me-1 text-success"></i> Peso (kg) *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            id="peso"
                                                            name="peso"
                                                            value={registerData.peso || ''}
                                                            onChange={handleRegisterChange}
                                                            placeholder="70"
                                                            min="30"
                                                            max="200"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <h5 className="text-warning mb-3 d-flex align-items-center gap-2">
                                                    <i className="bi bi-key"></i> Password
                                                </h5>
                                                <div className="row g-3">
                                                    <div className="col-12">
                                                        <label htmlFor="password" className="form-label">
                                                            <i className="bi bi-lock me-1 text-warning"></i> Password *
                                                        </label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="password"
                                                            name="password"
                                                            value={registerData.password}
                                                            onChange={handleRegisterChange}
                                                            placeholder="Minimo 6 caratteri"
                                                            minLength="6"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="col-12">
                                                        <label htmlFor="confermaPassword" className="form-label">
                                                            <i className="bi bi-lock-fill me-1 text-warning"></i> Conferma Password *
                                                        </label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="confermaPassword"
                                                            name="confermaPassword"
                                                            value={registerData.confermaPassword}
                                                            onChange={handleRegisterChange}
                                                            placeholder="Conferma la password"
                                                            minLength="6"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-grid gap-2">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary btn-lg py-3"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Registrazione in corso...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="bi bi-person-plus me-2"></i> Registrati
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                <div className="mt-4 text-center text-muted small">
                                    <p className="mb-2">
                                        <i className="bi bi-info-circle me-1"></i>
                                        I tuoi dati saranno salvati localmente sul tuo dispositivo
                                    </p>
                                    {activeTab === 'login' && (
                                        <p className="mb-0">
                                            <strong>Credenziali di test:</strong><br />
                                            Email: mario.rossi@example.com | Password: password123<br />
                                            Email: laura.bianchi@example.com | Password: password123
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="card-footer bg-light text-center py-3">
                                <p className="mb-0 small text-muted">
                                    {activeTab === 'login' 
                                        ? "Non hai un account? Registrati per iniziare" 
                                        : "Hai già un account? Accedi con le tue credenziali"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
