import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'

type Product = {
  id: string
  nombre: string
  costo: number
  precio: number
  cantidad: number
}

export default function Products() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => apiFetch<Product[]>('/products'),
  })

  if (isLoading) return <p className="p-4">Cargando...</p>
  if (error) return <p className="p-4 text-red-600">No se pudo cargar los productos</p>

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Mis productos</h1>
      <ul className="divide-y divide-gray-200 rounded-xl bg-white shadow">
        {data?.map((product) => (
          <li key={product.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium text-gray-900">{product.nombre}</p>
              <p className="text-sm text-gray-500">Precio ${product.precio.toFixed(2)}</p>
            </div>
            <span className="text-sm font-medium text-gray-700">{product.cantidad} pzas</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
