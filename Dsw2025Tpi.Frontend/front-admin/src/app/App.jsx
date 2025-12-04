import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import LoginPage from '../features/auth/LoginPage'
import SignupPage from '../features/auth/SignupPage'
import DashboardPage from '../features/dashboard/DashboardPage'
import ProductsPage from '../features/products/ProductsPage'
import OrdersPage from '../features/orders/OrdersPage'
import ClientProductsPage from '../features/products/ClientProductsPage'
import ClientCartPage from '../features/cart/ClientCartPage'
import ProtectedAdminRoute from '../shared/components/ProtectedAdminRoute'

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
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* Rutas del admin - Protegidas */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <DashboardPage />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/productos" element={
          <ProtectedAdminRoute>
            <ProductsPage />
          </ProtectedAdminRoute>
        } />
        <Route path="/admin/ordenes" element={
          <ProtectedAdminRoute>
            <OrdersPage />
          </ProtectedAdminRoute>
        } />
        
        {/* Rutas del cliente */}
        <Route path="/productos" element={<ClientProductsPage />} />
        <Route path="/carrito" element={<ClientCartPage />} />
        
        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

