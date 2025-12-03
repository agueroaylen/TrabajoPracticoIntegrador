import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './login/Login'
import Signup from './signup/Signup'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import ClientProducts from './pages/ClientProducts'
import ClientCart from './pages/ClientCart'
import ProtectedAdminRoute from './components/ProtectedAdminRoute'

function App() {
  useEffect(() => {
    // Si hay token y username en la URL (redirección desde otro puerto), guardarlos en localStorage
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const username = urlParams.get('username')
    
    if (token && username) {
      localStorage.setItem('token', token)
      localStorage.setItem('username', username)
      // Limpiar la URL
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Rutas del admin - Protegidas */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <Dashboard />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/productos" element={
          <ProtectedAdminRoute>
            <Products />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/ordenes" element={
          <ProtectedAdminRoute>
            <Orders />
          </ProtectedAdminRoute>
        } />
        
        {/* Rutas del cliente */}
        <Route path="/productos" element={<ClientProducts />} />
        <Route path="/carrito" element={<ClientCart />} />
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

