import { Navigate, Route, Routes } from 'react-router-dom'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'
import Quincena from './pages/Quincena'
import RawMaterials from './pages/RawMaterials'
import Register from './pages/Register'

function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto max-w-3xl">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/productos"
        element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        }
      />
      <Route
        path="/materia-prima"
        element={
          <PrivateRoute>
            <RawMaterials />
          </PrivateRoute>
        }
      />
      <Route
        path="/quincena"
        element={
          <PrivateRoute>
            <Quincena />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}
