import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../../shared/layout/Sidebar'
import AdminHeader from '../../shared/layout/AdminHeader'

function Dashboard() {
  const navigate = useNavigate()
  const [productCount, setProductCount] = useState(0)
  const [orderCount, setOrderCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay token y rol de admin
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    
    if (!token) {
      navigate('/login')
      return
    }

    // Si el rol es customer, redirigir a productos
    if (role === 'customer') {
      navigate('/productos', { replace: true })
      return
    }

    // Si el rol no es admin, redirigir a login
    if (role !== 'admin') {
      navigate('/login', { replace: true })
      return
    }

    fetchStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`
      }

      // Obtener productos (no requiere autenticación)
      try {
        const productsResponse = await axios.get('/api/products')
        const productsData = Array.isArray(productsResponse.data) ? productsResponse.data : []
        setProductCount(productsData.length)
        console.log('Productos cargados:', productsData.length)
      } catch (productsError) {
        console.error('Error al cargar productos:', productsError)
        setProductCount(0)
      }

      // Obtener órdenes (requiere autenticación)
      // Usamos PageSize=1 para obtener solo el totalCount sin cargar todas las órdenes
      try {
        const ordersResponse = await axios.get('/api/orders', { 
          headers,
          params: {
            PageNumber: 1,
            PageSize: 1
          }
        })
        
        const responseData = ordersResponse.data
        
        console.log('Dashboard - Respuesta recibida:', responseData)
        console.log('Dashboard - Tipo:', typeof responseData, 'Es array:', Array.isArray(responseData))
        
        // El backend devuelve: { orders: [], totalCount: X, pageNumber: Y, pageSize: Z, totalPages: W }
        // O puede devolver un array si hay un problema (fallback)
        if (Array.isArray(responseData)) {
          console.warn('⚠️ Dashboard - El backend devolvió un array. Haciendo petición adicional...')
          
          // Si es un array, el backend no está devolviendo el objeto paginado correctamente
          // Intentar obtener todas las órdenes con un PageSize grande para contar
          try {
            const countResponse = await axios.get('/api/orders', { 
              headers,
              params: { PageNumber: 1, PageSize: 1000 }
            })
            
            console.log('Dashboard - Respuesta de conteo:', countResponse.data)
            console.log('Dashboard - Tipo de conteo:', typeof countResponse.data, 'Es array:', Array.isArray(countResponse.data))
            
            if (countResponse.data && typeof countResponse.data === 'object' && !Array.isArray(countResponse.data)) {
              const totalCount = Number(countResponse.data.totalCount ?? countResponse.data.TotalCount ?? 0)
              setOrderCount(totalCount)
              console.log('Dashboard - TotalCount obtenido de objeto:', totalCount)
            } else if (Array.isArray(countResponse.data)) {
              // Si también es un array, usar el length del array completo
              const totalCount = countResponse.data.length
              setOrderCount(totalCount)
              console.log('Dashboard - TotalCount obtenido del array completo:', totalCount)
            } else {
              // Fallback: usar el length del primer array (incorrecto pero mejor que nada)
              setOrderCount(responseData.length)
              console.warn('Dashboard - Usando array fallback (incorrecto):', responseData.length)
            }
          } catch (error) {
            console.error('Error al obtener totalCount:', error)
            setOrderCount(responseData.length)
          }
        } else if (responseData && typeof responseData === 'object') {
          // Extraer totalCount del objeto (puede ser camelCase o PascalCase)
          console.log('Dashboard - Propiedades del objeto:', Object.keys(responseData))
          const totalCount = Number(responseData.totalCount ?? responseData.TotalCount ?? 0)
          setOrderCount(totalCount)
          console.log('Dashboard - TotalCount extraído del objeto:', totalCount)
        } else {
          console.warn('⚠️ Dashboard - Respuesta inválida para órdenes:', responseData)
          setOrderCount(0)
        }
      } catch (ordersError) {
        console.error('Error al cargar órdenes:', ordersError)
        if (ordersError.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }
        setOrderCount(0)
      }
    } catch (error) {
      console.error('Error general al cargar estadísticas:', error)
      setProductCount(0)
      setOrderCount(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="h-screen flex flex-col overflow-hidden">
        <AdminHeader />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeItem="Principal" />
          
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Control</h1>
              <p className="text-gray-600 text-lg">Resumen de tu tienda</p>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                <p className="text-gray-600 mt-4">Cargando...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarjeta de Productos */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Productos</h2>
                  </div>
                  <p className="text-4xl font-bold text-orange-600 mb-2">{productCount}</p>
                  <p className="text-gray-600">Productos en total</p>
                </div>

                {/* Tarjeta de Órdenes */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Órdenes</h2>
                  </div>
                  <p className="text-4xl font-bold text-orange-600 mb-2">{orderCount}</p>
                  <p className="text-gray-600">Órdenes registradas</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

