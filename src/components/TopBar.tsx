import { LogOut, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function TopBar() {
  const navigate = useNavigate()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Store className="h-4 w-4" />
        </div>
        <span className="font-bold text-slate-900">Mi Tienda</span>
      </div>
      <button
        onClick={handleLogout}
        aria-label="Salir"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <LogOut className="h-5 w-5" />
      </button>
    </header>
  )
}
