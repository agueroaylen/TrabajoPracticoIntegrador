import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

function ProtectedAdminRoute({ children }) {
  const location = useLocation()

  useEffect(() => {
    // Verificar autenticación y rol
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    // Si no hay token o el rol no es admin, redirigir
    if (!token || role !== 'admin') {
      // Limpiar datos de autenticación si existen pero el rol es incorrecto
      if (role === 'customer') {
        // No limpiar el token porque el customer puede seguir usando su sesión
        // Solo redirigir
      }
    }
  }, [location])

  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // Si no está autenticado, redirigir a login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Si el rol es customer, redirigir a productos
  if (role === 'customer') {
    return <Navigate to="/productos" replace />
  }

  // Si el rol no es admin, redirigir a login
  if (role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  // Si es admin, permitir acceso
  return children
}

export default ProtectedAdminRoute

