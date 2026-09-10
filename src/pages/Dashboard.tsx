import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CalendarRange, TrendingUp } from 'lucide-react'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import StatCard from '../components/ui/StatCard'
import { apiFetch } from '../lib/api'

type Summary = {
  stockTotal: number
  gananciaHoy: number
  gananciaSemana: number
  productosBajoInventario: { id: string; nombre: string; cantidad: number; unidad: string }[]
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['summary'],
    queryFn: () => apiFetch<Summary>('/summary'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    )
  }

  if (error) return <p className="p-4 text-red-600">No se pudo cargar la informacion</p>

  return (
    <div className="p-4">
      <PageHeader title="Mi tienda" subtitle="Resumen de hoy y de la semana" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="Ganancia hoy" value={`$${data?.gananciaHoy.toFixed(2)}`} tone="emerald" />
        <StatCard
          icon={CalendarRange}
          label="Ganancia semana"
          value={`$${data?.gananciaSemana.toFixed(2)}`}
          tone="emerald"
        />
      </div>

      <AnimatePresence>
        {data && data.productosBajoInventario.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <Card className="border-amber-100 bg-amber-50/60 p-4">
              <div className="mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="font-semibold text-amber-800">Producto bajo en inventario</p>
              </div>
              <ul className="space-y-1 text-sm text-amber-700">
                {data.productosBajoInventario.map((p) => (
                  <li key={p.id}>
                    {p.nombre} — quedan {p.cantidad} {p.unidad}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
