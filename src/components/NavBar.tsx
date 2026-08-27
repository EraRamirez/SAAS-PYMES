import { NavLink, useNavigate } from 'react-router-dom'

export default function NavBar() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium ${isActive ? 'text-green-700' : 'text-gray-500'}`

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex">
        <NavLink to="/" end className={linkClass}>
          Inicio
        </NavLink>
        <NavLink to="/productos" className={linkClass}>
          Productos
        </NavLink>
      </div>
      <button onClick={handleLogout} className="py-2 text-sm text-gray-500">
        Salir
      </button>
    </nav>
  )
}
