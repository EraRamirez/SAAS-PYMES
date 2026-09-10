import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, LayoutGrid, LogOut, Package, Store, Wheat } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio', icon: LayoutGrid, end: true },
  { to: '/productos', label: 'Productos', icon: Package, end: false },
  { to: '/materia-prima', label: 'Materia prima', icon: Wheat, end: false },
  { to: '/quincena', label: 'Quincena', icon: CalendarDays, end: false },
]

export default function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  function isActive(to: string, end: boolean) {
    return end ? location.pathname === to : location.pathname.startsWith(to)
  }

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Store className="h-4 w-4" />
          </div>
          <span className="font-bold text-slate-900">Mi Tienda</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />
          Salir
        </button>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2">
        {links.map(({ to, label, icon: Icon, end }) => {
          const active = isActive(to, end)
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <Icon className={`h-4 w-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span className={active ? 'text-emerald-700' : 'text-slate-500'}>{label}</span>
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-emerald-600"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </nav>
    </header>
  )
}
