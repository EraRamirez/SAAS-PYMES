import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, CalendarDays, LayoutGrid, Package, Wheat } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Inicio', icon: LayoutGrid, end: true },
  { to: '/productos', label: 'Productos', icon: Package, end: false },
  { to: '/materia-prima', label: 'Insumos', icon: Wheat, end: false },
  { to: '/apartados', label: 'Apartados', icon: CalendarCheck, end: false },
  { to: '/quincena', label: 'Quincena', icon: CalendarDays, end: false },
]

export default function BottomNav() {
  const location = useLocation()

  function isActive(to: string, end: boolean) {
    return end ? location.pathname === to : location.pathname.startsWith(to)
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-3xl">
        {links.map(({ to, label, icon: Icon, end }) => {
          const active = isActive(to, end)
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium"
            >
              <Icon className={`h-5 w-5 ${active ? 'text-emerald-700' : 'text-slate-400'}`} strokeWidth={active ? 2.4 : 2} />
              <span className={`truncate ${active ? 'font-semibold text-emerald-700' : 'text-slate-500'}`}>{label}</span>
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-emerald-600"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </AnimatePresence>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
