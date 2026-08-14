import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ChatPopup from '../components/ChatPopup'

/**
 * Layout principale dell'app con navbar
 */
export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-vh-100 d-flex flex-column">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
                <div className="container">
                    <button 
                        className="navbar-brand btn btn-link text-white text-decoration-none d-flex align-items-center gap-2"
                        onClick={() => navigate('/')}
                    >
                        <i className="bi bi-gem fs-4"></i>
                        <span className="fw-bold">FitPlan AI</span>
                    </button>
                    
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarNav"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <button 
                                    className={`nav-link btn btn-link text-white text-decoration-none ${isActive('/') ? 'fw-bold' : ''}`}
                                    onClick={() => navigate('/')}
                                >
                                    <i className="bi bi-calendar-week me-1"></i> Calendario
                                </button>
                            </li>
                            <li className="nav-item">
                                <button 
                                    className={`nav-link btn btn-link text-white text-decoration-none ${isActive('/settings') ? 'fw-bold' : ''}`}
                                    onClick={() => navigate('/settings')}
                                >
                                    <i className="bi bi-gear me-1"></i> Impostazioni
                                </button>
                            </li>
                        </ul>
                        
                        {/* User Info e Logout */}
                        {user && (
                            <ul className="navbar-nav">
                                <li className="nav-item dropdown">
                                    <button 
                                        className="nav-link btn btn-link text-white text-decoration-none dropdown-toggle d-flex align-items-center gap-2"
                                        type="button"
                                        id="userDropdown"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                    >
                                        <i className="bi bi-person-circle"></i>
                                        <span>{user.nome} {user.cognome}</span>
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                        <li>
                                            <div className="dropdown-item-text ps-3 pe-3 py-2 small">
                                                <div className="fw-bold">{user.nome} {user.cognome}</div>
                                                <div className="text-muted">{user.email}</div>
                                                <hr className="my-2" />
                                                <div>
                                                    <i className="bi bi-calendar me-2"></i>
                                                    Età: {user.eta} anni
                                                </div>
                                                <div>
                                                    <i className="bi bi-rulers me-2"></i>
                                                    Altezza: {user.altezza} cm
                                                </div>
                                                <div>
                                                    <i className="bi bi-weight me-2"></i>
                                                    Peso: {user.peso} kg
                                                </div>
                                            </div>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                            <button 
                                                className="dropdown-item"
                                                onClick={() => navigate('/profile')}
                                            >
                                                <i className="bi bi-person-gear me-2"></i> Il mio profilo
                                            </button>
                                        </li>
                                        <li>
                                            <button 
                                                className="dropdown-item text-danger"
                                                onClick={() => {
                                                    logout()
                                                    navigate('/login')
                                                }}
                                            >
                                                <i className="bi bi-box-arrow-right me-2"></i> Esci
                                            </button>
                                        </li>
                                    </ul>
                                </li>
                            </ul>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow-1">
                <Outlet />
            </main>

            {/* Chat Popup - disponibile in tutte le pagine */}
            <ChatPopup />

            {/* Footer */}
            <footer className="bg-light py-3 mt-auto">
                <div className="container text-center text-muted small">
                    <p className="mb-0">
                        <i className="bi bi-heart-fill text-danger me-1"></i>
                        Powered by Mistral AI
                    </p>
                </div>
            </footer>
        </div>
    )
}
