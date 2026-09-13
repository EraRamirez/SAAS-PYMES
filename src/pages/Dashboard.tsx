import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CalendarRange, ClipboardList, TrendingUp } from 'lucide-react'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import StatCard from '../components/ui/StatCard'
import { apiFetch } from '../lib/api'

type VentaHoy = { product_id: string; product_name: string; unit: string; cantidad: number; monto: number }

type Summary = {
  stockTotal: number
  gananciaHoy: number
  gananciaSemana: number
  productosBajoInventario: { id: string; nombre: string; cantidad: number; unidad: string }[]
  ventasHoy: VentaHoy[]
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

      <div className="mt-4">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Ventas de hoy</h2>
        {data && data.ventasHoy.length === 0 && (
          <EmptyState icon={ClipboardList} message="Aun no se registran ventas hoy." />
        )}
        {data && data.ventasHoy.length > 0 && (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="p-3 font-medium">Producto</th>
                  <th className="p-3 font-medium">Cantidad</th>
                  <th className="p-3 font-medium">Monto</th>
                </tr>
              </thead>
              <tbody>
                {data.ventasHoy.map((row) => (
                  <tr key={row.product_id} className="border-b border-slate-50 last:border-0">
                    <td className="p-3 text-slate-800">{row.product_name}</td>
                    <td className="p-3 text-slate-600">
                      {row.cantidad} {row.unit}
                    </td>
                    <td className="p-3 font-medium text-emerald-600">${row.monto.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
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
