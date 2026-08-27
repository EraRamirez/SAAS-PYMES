import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const { token } = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, pin }),
      })
      localStorage.setItem('token', token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold text-gray-900">Entrar a mi tienda</h1>
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
          placeholder="PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-green-600 py-2 font-medium text-white">
          Entrar
        </button>
      </form>
    </div>
  )
}
