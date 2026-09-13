import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBasket, Truck, X } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import { CardListSkeleton } from '../components/ui/Skeleton'
import TextField from '../components/ui/TextField'
import { apiFetch } from '../lib/api'

type RawMaterial = {
  _id: string
  name: string
  unit: string
  stock: number
}

type ActionType = 'purchase' | 'usage'

function useMaterialMutation(onSuccess: () => void) {
  return useMutation({
    mutationFn: (vars: { path: string; body: unknown }) =>
      apiFetch(vars.path, { method: 'POST', body: JSON.stringify(vars.body) }),
    onSuccess,
  })
}

function NewMaterialForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [stock, setStock] = useState('')
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/raw-materials', {
        method: 'POST',
        body: JSON.stringify({ name, unit, stock: Number(stock || 0) }),
      }),
    onSuccess: () => {
      setName('')
      setUnit('')
      setStock('')
      setOpen(false)
      onCreated()
    },
  })

  if (!open) {
    return (
      <Button
        variant="secondary"
        fullWidth
        icon={<Plus className="h-4 w-4" />}
        onClick={() => setOpen(true)}
        className="mb-4 border-dashed"
      >
        Nueva materia prima
      </Button>
    )
  }

  return (
    <Card className="mb-4 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-900">Nueva materia prima</p>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <TextField label="Nombre" placeholder="ej. Maiz" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Unidad"
            placeholder="kg, litro, pieza"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            required
          />
          <TextField
            label="Existencia inicial"
            type="number"
            step="0.01"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
        </div>
        {mutation.isError && <p className="text-sm text-red-600">No se pudo crear la materia prima</p>}
        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={mutation.isPending} fullWidth>
            Guardar
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

function MovementForm({ material, type, onDone }: { material: RawMaterial; type: ActionType; onDone: () => void }) {
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const mutation = useMaterialMutation(onDone)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (type === 'purchase') {
      mutation.mutate({
        path: `/raw-materials/${material._id}/purchases`,
        body: { quantity: Number(quantity), unit_cost: Number(unitCost) },
      })
    } else {
      mutation.mutate({ path: `/raw-materials/${material._id}/usage`, body: { quantity: Number(quantity) } })
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="overflow-hidden border-t border-slate-100 bg-slate-50/60"
    >
      <div className="space-y-3 p-3">
        <div className={type === 'purchase' ? 'grid grid-cols-2 gap-2' : ''}>
          <TextField
            label={`Cuantos ${material.unit}`}
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
          {type === 'purchase' && (
            <TextField
              label="Costo unitario"
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              required
            />
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" loading={mutation.isPending} fullWidth>
            Confirmar
          </Button>
          <Button type="button" variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        </div>
      </div>
      {mutation.isError && <p className="px-3 pb-3 text-sm text-red-600">No se pudo registrar</p>}
    </motion.form>
  )
}

export default function RawMaterials() {
  const queryClient = useQueryClient()
  const [activeAction, setActiveAction] = useState<{ materialId: string; type: ActionType } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['raw-materials'],
    queryFn: () => apiFetch<RawMaterial[]>('/raw-materials'),
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['raw-materials'] })
    queryClient.invalidateQueries({ queryKey: ['quincena'] })
    setActiveAction(null)
  }

  return (
    <div className="p-4">
      <PageHeader title="Materia prima" subtitle="Lo que compras para producir, sin ligarlo a una receta" />

      <NewMaterialForm onCreated={refresh} />

      {isLoading && <CardListSkeleton />}
      {error && <p className="text-red-600">No se pudo cargar la materia prima</p>}
      {data && data.length === 0 && <EmptyState icon={ShoppingBasket} message="Aun no tienes materia prima registrada." />}

      {data && data.length > 0 && (
        <Card className="divide-y divide-slate-100 overflow-hidden p-0">
          <AnimatePresence initial={false}>
            {data.map((material) => (
              <motion.div key={material._id} layout exit={{ opacity: 0 }}>
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="truncate font-semibold text-slate-900">{material.name}</p>
                    <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                      {material.stock} {material.unit}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveAction({ materialId: material._id, type: 'purchase' })}
                      className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 text-slate-600 transition-colors active:bg-slate-200"
                    >
                      <Truck className="h-5 w-5" />
                      <span className="text-xs font-medium">Comprar</span>
                    </button>
                    <button
                      onClick={() => setActiveAction({ materialId: material._id, type: 'usage' })}
                      className="flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl bg-slate-100 text-slate-600 transition-colors active:bg-slate-200"
                    >
                      <Minus className="h-5 w-5" />
                      <span className="text-xs font-medium">Usar</span>
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {activeAction?.materialId === material._id && (
                    <MovementForm material={material} type={activeAction.type} onDone={refresh} />
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}
    </div>
  )
}
