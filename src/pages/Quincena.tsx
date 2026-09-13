import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownCircle, ArrowUpCircle, ChevronDown, Wallet } from 'lucide-react'
import { useState } from 'react'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import Skeleton from '../components/ui/Skeleton'
import StatCard from '../components/ui/StatCard'
import { apiFetch } from '../lib/api'

type QuincenaDia = {
  fecha: string
  ingresos: number
  egresos: number
  ganancia: number
}

type Quincena = {
  quincenaInicio: string
  quincenaFin: string
  ingresosTotal: number
  egresosTotal: number
  gananciaTotal: number
  dias: QuincenaDia[]
}

function DiaRow({ dia, maxValue }: { dia: QuincenaDia; maxValue: number }) {
  const ingresoPct = maxValue > 0 ? (dia.ingresos / maxValue) * 100 : 0
  const egresoPct = maxValue > 0 ? (dia.egresos / maxValue) * 100 : 0

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0">
      <span className="w-16 shrink-0 text-xs text-slate-500">{dia.fecha.slice(5)}</span>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${ingresoPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full bg-emerald-500"
            />
          </div>
          <span className="w-16 shrink-0 text-right text-xs font-medium text-emerald-600">
            ${dia.ingresos.toFixed(0)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${egresoPct}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="h-full rounded-full bg-red-400"
            />
          </div>
          <span className="w-16 shrink-0 text-right text-xs font-medium text-red-500">${dia.egresos.toFixed(0)}</span>
        </div>
      </div>
    </div>
  )
}

export default function Quincena() {
  const [showDesglose, setShowDesglose] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['quincena'],
    queryFn: () => apiFetch<Quincena>('/summary/quincena'),
  })

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-7 w-32" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    )
  }

  if (error || !data) return <p className="p-4 text-red-600">No se pudo cargar el reporte</p>

  const maxValue = Math.max(...data.dias.flatMap((d) => [d.ingresos, d.egresos]), 1)

  return (
    <div className="p-4">
      <PageHeader title="Quincena" subtitle={`${data.quincenaInicio} a ${data.quincenaFin}`} />

      <div className="mb-4 grid grid-cols-3 gap-2">
        <StatCard icon={ArrowUpCircle} label="Ingresos" value={`$${data.ingresosTotal.toFixed(2)}`} tone="emerald" />
        <StatCard icon={ArrowDownCircle} label="Egresos" value={`$${data.egresosTotal.toFixed(2)}`} tone="red" />
        <StatCard
          icon={Wallet}
          label="Ganancia"
          value={`$${data.gananciaTotal.toFixed(2)}`}
          tone={data.gananciaTotal >= 0 ? 'emerald' : 'red'}
        />
      </div>

      <button
        onClick={() => setShowDesglose((v) => !v)}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-emerald-700"
      >
        {showDesglose ? 'Ocultar desglose diario' : 'Ver desglose diario'}
        <motion.span animate={{ rotate: showDesglose ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {showDesglose && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="overflow-hidden p-0">
              {data.dias.map((dia) => (
                <DiaRow key={dia.fecha} dia={dia} maxValue={maxValue} />
              ))}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
