import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { apiFetch } from '../lib/api'

type Product = {
  _id: string
  name: string
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
          cost_price: Number(costPrice),
          sale_price: Number(salePrice),
          stock: Number(stock || 0),
          min_stock_alert: Number(minStockAlert || 0),
        }),
      }),
    onSuccess: () => {
      setName('')
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
      <button
        onClick={() => setOpen(true)}
        className="mb-4 w-full rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500"
      >
        + Nuevo producto
      </button>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="mb-4 space-y-2 rounded-xl bg-white p-4 shadow"
    >
      <input
        placeholder="Nombre del producto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2"
        required
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Costo"
          type="number"
          step="0.01"
          value={costPrice}
          onChange={(e) => setCostPrice(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          required
        />
        <input
          placeholder="Precio de venta"
          type="number"
          step="0.01"
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
          required
        />
        <input
          placeholder="Stock inicial"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
        <input
          placeholder="Alerta stock bajo"
          type="number"
          value={minStockAlert}
          onChange={(e) => setMinStockAlert(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      {mutation.isError && <p className="text-sm text-red-600">No se pudo crear el producto</p>}
      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-green-600 py-2 font-medium text-white">
          Guardar
        </button>
        <button type="button" onClick={() => setOpen(false)} className="px-3 text-sm text-gray-500">
          Cancelar
        </button>
      </div>
    </form>
  )
}

function MovementForm({
  product,
  type,
  onDone,
}: {
  product: Product
  type: ActionType
  onDone: () => void
}) {
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [reason, setReason] = useState('')
  const mutation = useProductMutation(onDone)

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
    sale: 'Cuantas vendiste',
    purchase: 'Cuantas entraron',
    adjustment: 'Ajuste (+ o -)',
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 border-t border-gray-100 bg-gray-50 p-3">
      <input
        type="number"
        placeholder={labels[type]}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="w-32 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        required
      />
      {type === 'purchase' && (
        <input
          type="number"
          step="0.01"
          placeholder="Costo unitario (opcional)"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          className="w-40 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
      )}
      {type === 'adjustment' && (
        <input
          placeholder="Motivo (ej. merma)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-40 rounded-lg border border-gray-300 px-2 py-1 text-sm"
        />
      )}
      {mutation.isError && <p className="w-full text-sm text-red-600">No se pudo registrar</p>}
      <button type="submit" className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white">
        Confirmar
      </button>
      <button type="button" onClick={onDone} className="text-sm text-gray-500">
        Cancelar
      </button>
    </form>
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
    setActiveAction(null)
  }

  if (isLoading) return <p className="p-4">Cargando...</p>
  if (error) return <p className="p-4 text-red-600">No se pudo cargar los productos</p>

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Mis productos</h1>

      <NewProductForm onCreated={refresh} />

      <ul className="divide-y divide-gray-200 rounded-xl bg-white shadow">
        {data?.map((product) => (
          <li key={product._id}>
            <div className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">Precio ${product.sale_price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{product.stock} pzas</span>
                <div className="flex gap-1 text-xs">
                  <button
                    onClick={() => setActiveAction({ productId: product._id, type: 'sale' })}
                    className="rounded bg-green-50 px-2 py-1 font-medium text-green-700"
                  >
                    Vender
                  </button>
                  <button
                    onClick={() => setActiveAction({ productId: product._id, type: 'purchase' })}
                    className="rounded bg-blue-50 px-2 py-1 font-medium text-blue-700"
                  >
                    Comprar
                  </button>
                  <button
                    onClick={() => setActiveAction({ productId: product._id, type: 'adjustment' })}
                    className="rounded bg-amber-50 px-2 py-1 font-medium text-amber-700"
                  >
                    Ajustar
                  </button>
                </div>
              </div>
            </div>
            {activeAction?.productId === product._id && (
              <MovementForm product={product} type={activeAction.type} onDone={refresh} />
            )}
          </li>
        ))}
        {data?.length === 0 && <li className="p-4 text-sm text-gray-500">Aun no tienes productos.</li>}
      </ul>
    </div>
  )
}
