import { motion } from 'framer-motion'
import { Store } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import TextField from '../components/ui/TextField'
import { apiFetch } from '../lib/api'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, pin }),
      })
      localStorage.setItem('token', token)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
            <Store className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-slate-900">Entrar a mi tienda</h1>
        </div>

        <Card className="space-y-4 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Numero de telefono"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <TextField
              label="PIN"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              required
            />
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm text-red-600"
              >
                {error}
              </motion.p>
            )}
            <Button type="submit" fullWidth loading={loading}>
              Entrar
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/registro" className="font-medium text-emerald-700 hover:underline">
            Crear mi tienda
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
