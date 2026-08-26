import { Link } from 'react-router-dom'

export default function MainLayout({ children }) {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">App Palestra</Link>
        </div>
      </nav>
      <div className="container mt-4">
        {children}
      </div>
    </>
  )
}
