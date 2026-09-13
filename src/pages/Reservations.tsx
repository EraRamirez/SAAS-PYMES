import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarCheck, Check, ChevronDown, Package, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import PageHeader from '../components/ui/PageHeader'
import SelectField from '../components/ui/SelectField'
import { CardListSkeleton } from '../components/ui/Skeleton'
import TextField from '../components/ui/TextField'
import { apiFetch } from '../lib/api'

type Container = 'bote' | 'bolsa'
type PaymentStatus = 'pagado' | 'parcial' | 'no_pagado'
type DeliveryStatus = 'pendiente' | 'entregado'

type Product = {
  _id: string
  name: string
  unit: string
  sale_price: number
}

type ReservationItem = {
  item_id: string
  product_id: string
  product_name: string
  unit: string
  quantity: number
  unit_price: number
  subtotal: number
  container: Container
  delivered: boolean
}

type Reservation = {
  _id: string
  customer_name: string
  pickup_date: string
  pickup_time: string
  items: ReservationItem[]
  total_amount: number
  amount_paid: number
  payment_status: PaymentStatus
  delivery_status: DeliveryStatus
}

const paymentMeta: Record<PaymentStatus, { label: string; className: string }> = {
  pagado: { label: 'Pagado', className: 'bg-emerald-50 text-emerald-700' },
  parcial: { label: 'Anticipo', className: 'bg-amber-50 text-amber-700' },
  no_pagado: { label: 'Sin pagar', className: 'bg-red-50 text-red-700' },
}

// Debe coincidir con BOLSA_FEE en app/services/reservations.py
const BOLSA_FEE = 2.0

function ContainerToggle({ value, onChange }: { value: Container; onChange: (c: Container) => void }) {
  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={() => onChange('bote')}
        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
          value === 'bote' ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-500'
        }`}
      >
        Bote
      </button>
      <button
        type="button"
        onClick={() => onChange('bolsa')}
        className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
          value === 'bolsa' ? 'bg-emerald-600 text-white' : 'border border-slate-200 bg-white text-slate-500'
        }`}
      >
        Bolsa (+${BOLSA_FEE.toFixed(0)})
      </button>
    </div>
  )
}

function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: () => apiFetch<Product[]>('/products') })
}

type DraftItem = { product_id: string; quantity: string; container: Container }

function NewReservationForm({ products, onCreated }: { products: Product[]; onCreated: () => void }) {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [items, setItems] = useState<DraftItem[]>([{ product_id: '', quantity: '', container: 'bote' }])

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: customerName,
          pickup_date: pickupDate,
          pickup_time: pickupTime,
          amount_paid: Number(amountPaid || 0),
          items: items
            .filter((i) => i.product_id && i.quantity)
            .map((i) => ({ product_id: i.product_id, quantity: Number(i.quantity), container: i.container })),
        }),
      }),
    onSuccess: () => {
      // Fecha y hora se mantienen a propósito: es común capturar varios
      // clientes seguidos para la misma fecha y hora de entrega.
      setCustomerName('')
      setAmountPaid('')
      setItems([{ product_id: '', quantity: '', container: 'bote' }])
      onCreated()
      nameInputRef.current?.focus()
    },
  })

  const total = items.reduce((sum, item) => {
    const product = products.find((p) => p._id === item.product_id)
    if (!product || !item.quantity) return sum
    return sum + product.sale_price * Number(item.quantity) + (item.container === 'bolsa' ? BOLSA_FEE : 0)
  }, 0)

  function updateItem(index: number, patch: Partial<DraftItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  if (!open) {
    return (
      <Button
        variant="secondary"
        fullWidth
        icon={<Plus className="h-4 w-4" />}
        onClick={() => setOpen(true)}
        className="mb-4 border-dashed"
      >
        Nuevo apartado
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
          <p className="font-semibold text-slate-900">Nuevo apartado</p>
          <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <TextField
          ref={nameInputRef}
          label="Nombre del cliente"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          autoFocus
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <TextField
            label="Fecha de entrega"
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
          />
          <TextField
            label="Hora"
            type="text"
            placeholder="ej. 11:00 am"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600">Productos</p>
          {items.map((item, index) => (
            <div key={index} className="space-y-2 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SelectField
                    label="Producto"
                    value={item.product_id}
                    onChange={(e) => updateItem(index, { product_id: e.target.value })}
                    required
                  >
                    <option value="">Selecciona...</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} (${p.sale_price.toFixed(2)}/{p.unit})
                      </option>
                    ))}
                  </SelectField>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                    className="mt-6 rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="flex items-end gap-2">
                <div className="w-24">
                  <TextField
                    label="Cantidad"
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="flex-1">
                  <span className="mb-1 block text-sm font-medium text-slate-600">Empaque</span>
                  <ContainerToggle
                    value={item.container}
                    onChange={(container) => updateItem(index, { container })}
                  />
                </div>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setItems((prev) => [...prev, { product_id: '', quantity: '', container: 'bote' }])}
          >
            Agregar otro producto
          </Button>
        </div>

        <TextField
          label="Anticipo (opcional)"
          type="number"
          step="0.01"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />

        <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
          <span className="text-sm font-medium text-emerald-800">Total</span>
          <span className="text-lg font-bold text-emerald-700">${total.toFixed(2)}</span>
        </div>

        {mutation.isError && <p className="text-sm text-red-600">No se pudo crear el apartado</p>}

        <div className="flex gap-2 pt-1">
          <Button type="submit" loading={mutation.isPending} fullWidth>
            Guardar apartado
          </Button>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

function PaymentForm({ reservation, onDone }: { reservation: Reservation; onDone: () => void }) {
  const [amount, setAmount] = useState('')
  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/reservations/${reservation._id}/payments`, {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount) }),
      }),
    onSuccess: onDone,
  })

  const pendiente = reservation.total_amount - reservation.amount_paid

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="flex items-end gap-2 border-t border-slate-100 bg-slate-50/60 p-3"
    >
      <div className="flex-1">
        <TextField
          label={`Cuanto pago (falta $${pendiente.toFixed(2)})`}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <Button type="submit" loading={mutation.isPending}>
        Registrar
      </Button>
      <Button type="button" variant="ghost" onClick={onDone}>
        Cancelar
      </Button>
      {mutation.isError && <p className="w-full text-sm text-red-600">No se pudo registrar el pago</p>}
    </form>
  )
}

function EditDetailsForm({ reservation, onDone }: { reservation: Reservation; onDone: () => void }) {
  const [customerName, setCustomerName] = useState(reservation.customer_name)
  const [pickupDate, setPickupDate] = useState(reservation.pickup_date)
  const [pickupTime, setPickupTime] = useState(reservation.pickup_time)

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/reservations/${reservation._id}`, {
        method: 'PUT',
        body: JSON.stringify({ customer_name: customerName, pickup_date: pickupDate, pickup_time: pickupTime }),
      }),
    onSuccess: onDone,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-3"
    >
      <TextField label="Nombre del cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
      <div className="grid grid-cols-2 gap-2">
        <TextField
          label="Fecha de entrega"
          type="date"
          value={pickupDate}
          onChange={(e) => setPickupDate(e.target.value)}
          required
        />
        <TextField label="Hora" type="text" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} required />
      </div>
      {mutation.isError && <p className="text-sm text-red-600">No se pudo actualizar</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={mutation.isPending} fullWidth>
          Guardar
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function AddItemForm({
  reservationId,
  products,
  onDone,
}: {
  reservationId: string
  products: Product[]
  onDone: () => void
}) {
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [container, setContainer] = useState<Container>('bote')

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/reservations/${reservationId}/items`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity: Number(quantity), container }),
      }),
    onSuccess: onDone,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-3"
    >
      <SelectField label="Producto" value={productId} onChange={(e) => setProductId(e.target.value)} required>
        <option value="">Selecciona...</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name} (${p.sale_price.toFixed(2)}/{p.unit})
          </option>
        ))}
      </SelectField>
      <div className="flex items-end gap-2">
        <div className="w-24">
          <TextField
            label="Cantidad"
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <span className="mb-1 block text-sm font-medium text-slate-600">Empaque</span>
          <ContainerToggle value={container} onChange={setContainer} />
        </div>
      </div>
      {mutation.isError && <p className="text-sm text-red-600">No se pudo agregar el producto</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={mutation.isPending} fullWidth>
          Agregar
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function EditItemForm({
  reservationId,
  item,
  onDone,
}: {
  reservationId: string
  item: ReservationItem
  onDone: () => void
}) {
  const [quantity, setQuantity] = useState(String(item.quantity))
  const [container, setContainer] = useState<Container>(item.container)

  const mutation = useMutation({
    mutationFn: () =>
      apiFetch(`/reservations/${reservationId}/items/${item.item_id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: Number(quantity), container }),
      }),
    onSuccess: onDone,
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        mutation.mutate()
      }}
      className="space-y-2 border-t border-slate-100 bg-slate-50/60 p-3"
    >
      <p className="text-sm font-medium text-slate-600">Editando {item.product_name}</p>
      <div className="flex items-end gap-2">
        <div className="w-24">
          <TextField
            label="Cantidad"
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <ContainerToggle value={container} onChange={setContainer} />
        </div>
      </div>
      {mutation.isError && <p className="text-sm text-red-600">No se pudo actualizar</p>}
      <div className="flex gap-2">
        <Button type="submit" loading={mutation.isPending} fullWidth>
          Guardar
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

function ReservationCard({
  reservation,
  products,
  onChanged,
}: {
  reservation: Reservation
  products: Product[]
  onChanged: () => void
}) {
  const [showPayment, setShowPayment] = useState(false)
  const [editingDetails, setEditingDetails] = useState(false)
  const [addingItem, setAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  function invalidateAll() {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['summary'] })
    queryClient.invalidateQueries({ queryKey: ['quincena'] })
    queryClient.invalidateQueries({ queryKey: ['reservations-summary'] })
    onChanged()
  }

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) =>
      apiFetch(`/reservations/${reservation._id}/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: onChanged,
  })

  const deliverMutation = useMutation({
    mutationFn: () => apiFetch(`/reservations/${reservation._id}/deliver`, { method: 'POST' }),
    onSuccess: invalidateAll,
  })

  const canEditReservation = reservation.delivery_status === 'pendiente'

  const payment = paymentMeta[reservation.payment_status]

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-1.5">
          <div>
            <p className="font-semibold text-slate-900">{reservation.customer_name}</p>
            <p className="text-sm text-slate-500">
              {reservation.pickup_date} · {reservation.pickup_time}
            </p>
          </div>
          {canEditReservation && (
            <button
              onClick={() => setEditingDetails((v) => !v)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${payment.className}`}>
          {payment.label}
        </span>
      </div>

      <AnimatePresence>
        {editingDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="-mx-4 -mt-3 mb-3 overflow-hidden"
          >
            <EditDetailsForm
              reservation={reservation}
              onDone={() => {
                setEditingDetails(false)
                onChanged()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {reservation.items.map((item) => (
          <div key={item.item_id} className={`rounded-xl ${item.delivered ? 'bg-emerald-50/60' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  {item.quantity} {item.unit} de {item.product_name}
                </p>
                <p className="text-xs text-slate-500">
                  {item.container === 'bote' ? 'Trae bote' : `Bolsa (+$${BOLSA_FEE.toFixed(0)})`} · $
                  {item.subtotal.toFixed(2)}
                </p>
              </div>
              {item.delivered ? (
                <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                  <Check className="h-3.5 w-3.5" />
                  Entregado
                </span>
              ) : (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => setEditingItemId((v) => (v === item.item_id ? null : item.item_id))}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {reservation.items.length > 1 && (
                    <button
                      onClick={() => removeItemMutation.mutate(item.item_id)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <AnimatePresence>
              {editingItemId === item.item_id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <EditItemForm
                    reservationId={reservation._id}
                    item={item}
                    onDone={() => {
                      setEditingItemId(null)
                      onChanged()
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {deliverMutation.isError && <p className="mt-2 text-sm text-red-600">No se pudo entregar el apartado</p>}
      {removeItemMutation.isError && <p className="mt-2 text-sm text-red-600">No se pudo quitar ese producto</p>}

      {canEditReservation && !addingItem && (
        <button
          onClick={() => setAddingItem(true)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Agregar producto
        </button>
      )}

      <AnimatePresence>
        {addingItem && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <AddItemForm
              reservationId={reservation._id}
              products={products}
              onDone={() => {
                setAddingItem(false)
                invalidateAll()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {canEditReservation && (
        <Button
          fullWidth
          className="mt-3"
          icon={<Check className="h-4 w-4" />}
          loading={deliverMutation.isPending}
          onClick={() => deliverMutation.mutate()}
        >
          Entregar apartado completo
        </Button>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
        <p className="text-sm text-slate-600">
          Total <span className="font-semibold text-slate-900">${reservation.total_amount.toFixed(2)}</span>
          {reservation.amount_paid > 0 && (
            <span className="text-slate-400"> · pagado ${reservation.amount_paid.toFixed(2)}</span>
          )}
        </p>
        {reservation.payment_status !== 'pagado' && (
          <Button variant="ghost" className="text-sm" onClick={() => setShowPayment((v) => !v)}>
            Registrar pago
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showPayment && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <PaymentForm
              reservation={reservation}
              onDone={() => {
                setShowPayment(false)
                onChanged()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

type SummaryRow = {
  product_id: string
  product_name: string
  unit: string
  total_reservado: number
  total_entregado: number
  total_pendiente: number
}

function ReservationsSummary() {
  const [open, setOpen] = useState(false)
  const { data } = useQuery({
    queryKey: ['reservations-summary'],
    queryFn: () => apiFetch<{ productos: SummaryRow[] }>('/reservations/summary'),
    enabled: open,
  })

  return (
    <div className="mt-4">
      <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-1 text-sm font-medium text-emerald-700">
        {open ? 'Ocultar resumen por producto' : 'Ver resumen por producto'}
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && data && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card className="mt-2 overflow-hidden p-0">
              {data.productos.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">Aun no hay apartados.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                      <th className="p-3 font-medium">Producto</th>
                      <th className="p-3 font-medium">Apartado</th>
                      <th className="p-3 font-medium">Entregado</th>
                      <th className="p-3 font-medium">Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.productos.map((row) => (
                      <tr key={row.product_id} className="border-b border-slate-50 last:border-0">
                        <td className="p-3 text-slate-800">{row.product_name}</td>
                        <td className="p-3 text-slate-600">
                          {row.total_reservado} {row.unit}
                        </td>
                        <td className="p-3 text-emerald-600">
                          {row.total_entregado} {row.unit}
                        </td>
                        <td className="p-3 font-medium text-amber-600">
                          {row.total_pendiente} {row.unit}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Reservations() {
  const [tab, setTab] = useState<DeliveryStatus>('pendiente')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const queryClient = useQueryClient()

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const { data: products } = useProducts()

  const { data, isLoading, error } = useQuery({
    queryKey: ['reservations', tab, debouncedSearch],
    queryFn: () =>
      apiFetch<Reservation[]>(
        `/reservations?estado=${tab}${debouncedSearch ? `&q=${encodeURIComponent(debouncedSearch)}` : ''}`
      ),
  })

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ['reservations'] })
  }

  return (
    <div className="p-4">
      <PageHeader title="Apartados" subtitle="Lo que tus clientes reservaron para recoger despues" />

      <NewReservationForm products={products ?? []} onCreated={refresh} />

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre del cliente"
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 outline-none transition-shadow focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        <button
          onClick={() => setTab('pendiente')}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'pendiente' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
          }`}
        >
          Por entregar
        </button>
        <button
          onClick={() => setTab('entregado')}
          className={`rounded-lg py-2 text-sm font-semibold transition-colors ${
            tab === 'entregado' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'
          }`}
        >
          Entregados
        </button>
      </div>

      {isLoading && <CardListSkeleton />}
      {error && <p className="text-red-600">No se pudo cargar los apartados</p>}
      {data && data.length === 0 && (
        <EmptyState
          icon={tab === 'pendiente' ? CalendarCheck : Package}
          message={tab === 'pendiente' ? 'No hay apartados pendientes.' : 'Aun no hay apartados entregados.'}
        />
      )}

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {data?.map((reservation) => (
            <motion.div key={reservation._id} layout exit={{ opacity: 0 }}>
              <ReservationCard reservation={reservation} products={products ?? []} onChanged={refresh} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ReservationsSummary />
    </div>
  )
}
