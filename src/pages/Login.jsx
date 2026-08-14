import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        annoNascita: '',
        altezza: '',
        peso: '',
        password: '',
        confermaPassword: ''
    })
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    // Se già autenticato, reindirizza a home
    if (isAuthenticated) {
        navigate('/')
        return null
    }

    const handleChange = (e) => {
        const { name, value, type } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseInt(value)) : value
        }))
    }

    const validateForm = () => {
        const errors = []
        
        if (!formData.nome.trim()) errors.push('Il nome è obbligatorio')
        if (!formData.cognome.trim()) errors.push('Il cognome è obbligatorio')
        if (!formData.email.trim()) {
            errors.push('L\'email è obbligatoria')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Inserisci un indirizzo email valido')
        }
        if (!formData.annoNascita) errors.push('L\'anno di nascita è obbligatorio')
        else if (formData.annoNascita < 1900 || formData.annoNascita > new Date().getFullYear()) {
            errors.push('Inserisci un anno di nascita valido')
        }
        if (!formData.altezza) errors.push('L\'altezza è obbligatoria')
        else if (formData.altezza < 100 || formData.altezza > 250) {
            errors.push('Inserisci un altezza valida (100-250 cm)')
        }
        if (!formData.peso) errors.push('Il peso è obbligatorio')
        else if (formData.peso < 30 || formData.peso > 200) {
            errors.push('Inserisci un peso valido (30-200 kg)')
        }
        if (!formData.password) errors.push('La password è obbligatoria')
        else if (formData.password.length < 6) errors.push('La password deve essere di almeno 6 caratteri')
        if (formData.password !== formData.confermaPassword) {
            errors.push('Le password non coincidono')
        }
        
        return errors
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)
        
        const errors = validateForm()
        if (errors.length > 0) {
            setError(errors.join('. '))
            setLoading(false)
            return
        }

        // Dati utente da salvare (senza password in chiaro)
        const userData = {
            nome: formData.nome.trim(),
            cognome: formData.cognome.trim(),
            email: formData.email.trim().toLowerCase(),
            annoNascita: formData.annoNascita,
            eta: new Date().getFullYear() - formData.annoNascita,
            altezza: formData.altezza,
            peso: formData.peso
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
                            {/* Header */}
                            <div className="card-header bg-primary text-white text-center py-4">
                                <div className="d-flex flex-column align-items-center gap-3">
                                    <i className="bi bi-person-circle fs-1"></i>
                                    <h3 className="mb-0 fw-bold">Benvenuto in FitPlan AI</h3>
                                    <p className="mb-0 small opacity-75">Registrati per iniziare</p>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="card-body p-4 p-md-5">
                                {error && (
                                    <div className="alert alert-danger alert-dismissible fade show mb-4">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        {error}
                                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {/* Dati Personali */}
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
                                                    value={formData.nome}
                                                    onChange={handleChange}
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
                                                    value={formData.cognome}
                                                    onChange={handleChange}
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
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="mario.rossi@example.com"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dati Fisici (per l'IA) */}
                                    <div className="mb-4">
                                        <h5 className="text-success mb-3 d-flex align-items-center gap-2">
                                            <i className="bi bi-heart-pulse"></i> Dati per l'IA
                                        </h5>
                                        <p className="text-muted small mb-3">
                                            Questi dati saranno usati dall'IA per fornirti suggerimenti personalizzati
                                        </p>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <label htmlFor="annoNascita" className="form-label">
                                                    <i className="bi bi-calendar me-1 text-success"></i> Anno di Nascita *
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="annoNascita"
                                                    name="annoNascita"
                                                    value={formData.annoNascita || ''}
                                                    onChange={handleChange}
                                                    placeholder="1990"
                                                    min="1900"
                                                    max={new Date().getFullYear()}
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="altezza" className="form-label">
                                                    <i className="bi bi-rulers me-1 text-success"></i> Altezza (cm) *
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="altezza"
                                                    name="altezza"
                                                    value={formData.altezza || ''}
                                                    onChange={handleChange}
                                                    placeholder="175"
                                                    min="100"
                                                    max="250"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="peso" className="form-label">
                                                    <i className="bi bi-weight me-1 text-success"></i> Peso (kg) *
                                                </label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    id="peso"
                                                    name="peso"
                                                    value={formData.peso || ''}
                                                    onChange={handleChange}
                                                    placeholder="70"
                                                    min="30"
                                                    max="200"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password */}
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
                                                    value={formData.password}
                                                    onChange={handleChange}
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
                                                    value={formData.confermaPassword}
                                                    onChange={handleChange}
                                                    placeholder="Conferma la password"
                                                    minLength="6"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Submit */}
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

                                {/* Info */}
                                <div className="mt-4 text-center text-muted small">
                                    <p className="mb-0">
                                        <i className="bi bi-info-circle me-1"></i>
                                        I tuoi dati saranno salvati localmente sul tuo dispositivo
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="card-footer bg-light text-center py-3">
                                <p className="mb-0 small text-muted">
                                    Già registrato? Accedi automaticamente
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
