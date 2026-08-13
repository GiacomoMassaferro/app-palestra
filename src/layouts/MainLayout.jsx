import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import ChatPopup from '../components/ChatPopup'

/**
 * Layout principale dell'app con navbar
 */
export default function MainLayout() {
    const navigate = useNavigate()
    const location = useLocation()

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
