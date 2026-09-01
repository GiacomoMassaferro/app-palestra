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
              <li className="nav-item">
                <Link className="nav-link" to="/">Calendario</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/settings">Impostazioni</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/workout-plan">Scheda Allenamento</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/nutrition-plan">Scheda Nutrizionale</Link>
              </li>
              <li className="nav-item">
                <ChatHistoryModal />
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
