import { Link } from 'react-router-dom'
import ChatBot from '../components/ChatBot'
import ChatHistoryModal from '../components/ChatHistoryModal'

export default function MainLayout({ children }) {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">App Palestra</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* Voci per mobile - visibili solo su mobile */}
              <li className="nav-item d-lg-none">
                <Link className="nav-link" to="/">Calendario</Link>
              </li>
              <li className="nav-item d-lg-none">
                <Link className="nav-link" to="/settings">Impostazioni</Link>
              </li>
              <li className="nav-item d-lg-none">
                <Link className="nav-link" to="/workout-plan">Scheda Allenamento</Link>
              </li>
              <li className="nav-item d-lg-none">
                <Link className="nav-link" to="/nutrition-plan">Scheda Nutrizionale</Link>
              </li>
              
              {/* Dropdown menu per desktop - nascosti su mobile */}
              <li className="nav-item dropdown d-none d-lg-block">
                <button
                  className="nav-link dropdown-toggle btn btn-link"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Menu
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/">Calendario</Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/settings">Impostazioni</Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/workout-plan">Scheda Allenamento</Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/nutrition-plan">Scheda Nutrizionale</Link>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li className="dropdown-header">Chat AI</li>
                  <li>
                    <ChatHistoryModal />
                  </li>
                </ul>
              </li>
            </ul>
            <ChatBot />
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        {children}
      </div>
    </>
  )
}
