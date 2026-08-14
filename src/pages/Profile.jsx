import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
    const navigate = useNavigate()
    const { user, updateUser, logout } = useAuth()
    
    const [formData, setFormData] = useState({
        nome: '',
        cognome: '',
        email: '',
        annoNascita: '',
        altezza: '',
        peso: ''
    })
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [loading, setLoading] = useState(false)

    // Carica i dati utente attuali
    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.nome || '',
                cognome: user.cognome || '',
                email: user.email || '',
                annoNascita: user.annoNascita || '',
                altezza: user.altezza || '',
                peso: user.peso || ''
            })
        }
    }, [user])

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
        
        return errors
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setLoading(true)
        
        const errors = validateForm()
        if (errors.length > 0) {
            setError(errors.join('. '))
            setLoading(false)
            return
        }

        try {
            const updatedUserData = {
                nome: formData.nome.trim(),
                cognome: formData.cognome.trim(),
                email: formData.email.trim().toLowerCase(),
                annoNascita: formData.annoNascita,
                eta: new Date().getFullYear() - formData.annoNascita,
                altezza: formData.altezza,
                peso: formData.peso
            }

            updateUser(updatedUserData)
            setSuccess('Profilo aggiornato con successo!')
            
            setTimeout(() => {
                setSuccess(null)
                navigate('/')
            }, 2000)
            
        } catch {
            setError('Errore nell\'aggiornamento del profilo. Riprova.')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (!user) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p>Caricamento...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="mb-1 d-flex align-items-center gap-2">
                        <i className="bi bi-person-circle text-primary"></i>
                        Il Mio Profilo
                    </h1>
                    <p className="text-muted mb-0">Gestione dati personali e account</p>
                </div>
                <button 
                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                    onClick={() => navigate('/')}
                >
                    <i className="bi bi-arrow-left"></i> Indietro
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}

            {success && (
                <div className="alert alert-success alert-dismissible fade show mb-4">
                    <i className="bi bi-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}

            <div className="row">
                {/* Card Profilo */}
                <div className="col-lg-8 col-md-10 mx-auto">
                    <div className="card border-0 shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0 d-flex align-items-center gap-2">
                                <i className="bi bi-person"></i> Dati Personali
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
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

                                <div className="mt-4">
                                    <h6 className="text-success mb-3 d-flex align-items-center gap-2">
                                        <i className="bi bi-heart-pulse"></i> Dati per l'IA
                                    </h6>
                                    <p className="text-muted small mb-3">
                                        Questi dati vengono usati dall'IA per fornirti suggerimenti personalizzati su allenamento e alimentazione.
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

                                <div className="mt-4">
                                    <h6 className="text-warning mb-3 d-flex align-items-center gap-2">
                                        <i className="bi bi-key"></i> Azioni
                                    </h6>
                                    
                                    <div className="d-flex gap-3">
                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                    Salvataggio...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-check-lg"></i> Salva modifiche
                                                </>
                                            )}
                                        </button>
                                        
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger btn-lg d-flex align-items-center gap-2"
                                            onClick={handleLogout}
                                        >
                                            <i className="bi bi-box-arrow-right"></i> Esci
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Info card */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center gap-3">
                                <i className="bi bi-info-circle text-primary fs-4"></i>
                                <div>
                                    <h6 className="mb-1">Informazioni</h6>
                                    <p className="mb-0 small text-muted">
                                        I tuoi dati vengono salvati localmente sul tuo dispositivo e usati esclusivamente per fornirti suggerimenti personalizzati.
                                        Nessun dato viene condiviso con terze parti.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
