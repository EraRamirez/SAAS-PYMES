import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function Register() {
  const [nombreNegocio, setNombreNegocio] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const { token } = await apiFetch<{ token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nombre_negocio: nombreNegocio,
          owner_name: ownerName,
          phone,
          pin,
        }),
      })
      localStorage.setItem('token', token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-gray-900">Crea tu tienda</h1>
        <input
          type="text"
          placeholder="Nombre de tu negocio"
          value={nombreNegocio}
          onChange={(e) => setNombreNegocio(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="text"
          placeholder="Tu nombre"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="tel"
          placeholder="Numero de telefono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        />
        <input
          type="password"
          inputMode="numeric"
          placeholder="Crea un PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-green-600 py-2 font-medium text-white">
          Crear mi tienda
        </button>
        <p className="text-center text-sm text-gray-500">
          <Link to="/login" className="text-green-700 hover:underline">
            Ya tengo cuenta
          </Link>
        </p>
      </form>
    </div>
  )
}
