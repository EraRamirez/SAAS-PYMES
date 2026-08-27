import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'

function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
    </Routes>
  )
}
