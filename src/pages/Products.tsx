import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Package, Plus, ShoppingCart, SlidersHorizontal, Truck, X } from 'lucide-react'
import { useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import SelectField from '../components/ui/SelectField'
import { CardListSkeleton } from '../components/ui/Skeleton'
import TextField from '../components/ui/TextField'
import { apiFetch } from '../lib/api'

type SaleType = 'pieza' | 'granel'

type Product = {
  _id: string
  name: string
  sale_type: SaleType
  unit: string
  cost_price: number
  sale_price: number
  stock: number
  min_stock_alert: number
}

type ActionType = 'sale' | 'purchase' | 'adjustment'

function useProductMutation(onSuccess: () => void) {
  return useMutation({
    mutationFn: (vars: { path: string; body: unknown }) =>
      apiFetch(vars.path, { method: 'POST', body: JSON.stringify(vars.body) }),
    onSuccess,
  })
}

function NewProductForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState('')
  const [saleType, setSaleType] = useState<SaleType>('pieza')
  const [unit, setUnit] = useState<'kg' | 'g'>('kg')
  const [costPrice, setCostPrice] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [stock, setStock] = useState('')
  const [minStockAlert, setMinStockAlert] = useState('')
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name,
          sale_type: saleType,
          ...(saleType === 'granel' ? { unit } : {}),
          cost_price: Number(costPrice),
          sale_price: Number(salePrice),
          stock: Number(stock || 0),
          min_stock_alert: Number(minStockAlert || 0),
        }),
      }),
    onSuccess: () => {
      setName('')
      setSaleType('pieza')
      setCostPrice('')
      setSalePrice('')
      setStock('')
      setMinStockAlert('')
      setOpen(false)
      onCreated()
    },
  })

  if (!open) {
    return (
      <Button variant="secondary" fullWidth icon={<Plus className="h-4 w-4" />} onClick={() => setOpen(true)} className="mb-4 border-dashed">
        Nuevo producto
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
          <p className="font-semibold text-slate-900">Nuevo producto</p>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <TextField label="Nombre del producto" value={name} onChange={(e) => setName(e.target.value)} required />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Tipo de venta" value={saleType} onChange={(e) => setSaleType(e.target.value as SaleType)}>
            <option value="pieza">Por pieza</option>
            <option value="granel">A granel</option>
          </SelectField>
          {saleType === 'granel' && (
            <SelectField label="Unidad" value={unit} onChange={(e) => setUnit(e.target.value as 'kg' | 'g')}>
              <option value="kg">Kilogramo (kg)</option>
              <option value="g">Gramo (g)</option>
            </SelectField>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            label={saleType === 'granel' ? `Costo por ${unit}` : 'Costo'}
            type="number"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            required
          />
          <TextField
            label={saleType === 'granel' ? `Precio por ${unit}` : 'Precio de venta'}
            type="number"
            step="0.01"
            value={salePrice}
            onChange={(e) => setSalePrice(e.target.value)}
            required
          />
          <TextField
            label="Stock inicial"
            type="number"
            step={saleType === 'granel' ? '0.01' : '1'}
            value={stock}
            onChange={(e) => setStock(e.target.value)}
          />
          <TextField
            label="Alerta stock bajo"
            type="number"
            step={saleType === 'granel' ? '0.01' : '1'}
            value={minStockAlert}
            onChange={(e) => setMinStockAlert(e.target.value)}
          />
        </div>
        {mutation.isError && <p className="text-sm text-red-600">No se pudo crear el producto</p>}
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

const actionMeta: Record<ActionType, { label: string; icon: typeof ShoppingCart; variant: 'primary' | 'secondary' }> = {
  sale: { label: 'Vender', icon: ShoppingCart, variant: 'primary' },
  purchase: { label: 'Comprar', icon: Truck, variant: 'secondary' },
  adjustment: { label: 'Ajustar', icon: SlidersHorizontal, variant: 'secondary' },
}

function MovementForm({ product, type, onDone }: { product: Product; type: ActionType; onDone: () => void }) {
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [reason, setReason] = useState('')
  const mutation = useProductMutation(onDone)
  const isGranel = product.sale_type === 'granel'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (type === 'sale') {
      mutation.mutate({ path: '/movements/sale', body: { product_id: product._id, quantity: Number(quantity) } })
    } else if (type === 'purchase') {
      mutation.mutate({
        path: '/movements/purchase',
        body: {
          product_id: product._id,
          quantity: Number(quantity),
          ...(unitCost ? { unit_cost: Number(unitCost) } : {}),
        },
      })
    } else {
      mutation.mutate({
        path: '/movements/adjustment',
        body: { product_id: product._id, delta_quantity: Number(quantity), reason: reason || 'ajuste' },
      })
    }
  }

  const labels: Record<ActionType, string> = {
    sale: `Cuantos ${product.unit} vendiste`,
    purchase: `Cuantos ${product.unit} entraron`,
    adjustment: `Ajuste en ${product.unit} (+ o -)`,
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
      <div className="flex flex-wrap items-end gap-2 p-3">
        <div className="w-36">
          <TextField
            label={labels[type]}
            type="number"
            step={isGranel ? '0.01' : '1'}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        {type === 'purchase' && (
          <div className="w-36">
            <TextField
              label="Costo unitario (opcional)"
              type="number"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
            />
          </div>
        )}
        {type === 'adjustment' && (
          <div className="w-40">
            <TextField label="Motivo" placeholder="ej. merma" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        )}
        <Button type="submit" loading={mutation.isPending} className="h-[42px]">
          Confirmar
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="h-[42px]">
          Cancelar
        </Button>
      </div>
      {mutation.isError && <p className="px-3 pb-3 text-sm text-red-600">No se pudo registrar</p>}
    </motion.form>
  )
}

export default function Products() {
  const queryClient = useQueryClient()
  const [activeAction, setActiveAction] = useState<{ productId: string; type: ActionType } | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<Product[]>('/products'),
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['summary'] })
    queryClient.invalidateQueries({ queryKey: ['quincena'] })
    setActiveAction(null)
  }

  return (
    <div className="p-4">
      <PageHeader title="Mis productos" subtitle="Lo que vendes: por pieza o a granel" />

      <NewProductForm onCreated={refresh} />

      {isLoading && <CardListSkeleton />}
      {error && <p className="text-red-600">No se pudo cargar los productos</p>}

      {data && data.length === 0 && <EmptyState icon={Package} message="Aun no tienes productos." />}

      {data && data.length > 0 && (
      <Card className="divide-y divide-slate-100 overflow-hidden p-0">
        <AnimatePresence initial={false}>
          {data.map((product) => (
            <motion.div key={product._id} layout exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    ${product.sale_price.toFixed(2)} / {product.unit}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-semibold text-slate-700">
                    {product.stock} {product.unit}
                  </span>
                  <div className="flex gap-1">
                    {(Object.keys(actionMeta) as ActionType[]).map((type) => {
                      const { icon: Icon, variant } = actionMeta[type]
                      return (
                        <button
                          key={type}
                          onClick={() => setActiveAction({ productId: product._id, type })}
                          title={actionMeta[type].label}
                          className={`rounded-lg p-2 transition-colors ${
                            variant === 'primary'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <AnimatePresence>
                {activeAction?.productId === product._id && (
                  <MovementForm product={product} type={activeAction.type} onDone={refresh} />
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
