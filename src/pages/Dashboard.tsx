import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '../lib/api'

type Summary = {
  stockTotal: number
  gananciaHoy: number
  gananciaSemana: number
  productosBajoInventario: { id: string; nombre: string; cantidad: number }[]
}

export default function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['summary'],
    queryFn: () => apiFetch<Summary>('/summary'),
  })

  if (isLoading) return <p className="p-4">Cargando...</p>
  if (error) return <p className="p-4 text-red-600">No se pudo cargar la informacion</p>

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold text-gray-900">Mi tienda</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Ganancia hoy</p>
          <p className="text-2xl font-bold text-green-600">${data?.gananciaHoy.toFixed(2)}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Ganancia semana</p>
          <p className="text-2xl font-bold text-green-600">${data?.gananciaSemana.toFixed(2)}</p>
        </div>
      </div>

      {data && data.productosBajoInventario.length > 0 && (
        <div className="rounded-xl bg-amber-50 p-4 shadow">
          <p className="mb-2 font-medium text-amber-800">Producto bajo en inventario</p>
          <ul className="space-y-1 text-sm text-amber-700">
            {data.productosBajoInventario.map((p) => (
              <li key={p.id}>
                {p.nombre} - quedan {p.cantidad}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
