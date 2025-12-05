import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../../shared/layout/Sidebar'
import AdminHeader from '../../shared/layout/AdminHeader'
import Modal from '../../shared/components/Modal'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { alertSuccess, alertError, alertWarning, alertInfo } from '../../shared/utils/modalUtils'

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
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

    fetchOrders()
  }, [navigate])

  useEffect(() => {
    fetchOrders()
  }, [currentPage, statusFilter, navigate])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`
      }

      // Construir parámetros de consulta
      const params = {
        PageNumber: currentPage,
        PageSize: itemsPerPage
      }

      // Agregar filtro de estado si no es 'all'
      if (statusFilter !== 'all') {
        params.Status = statusFilter
      }

      try {
        const response = await axios.get('/api/orders', { headers, params })
        const responseData = response.data
        
        // El backend devuelve un objeto con: { orders: [], totalCount: X, pageNumber: Y, pageSize: Z, totalPages: W }
        // O puede devolver directamente el array si hay un problema (fallback)
        if (Array.isArray(responseData)) {
          // Si es un array, el backend no está devolviendo el objeto paginado correctamente
          // Hacer una petición con PageSize grande para obtener todas las órdenes y contar el total
          try {
            const countResponse = await axios.get('/api/orders', { 
              headers, 
              params: { 
                PageNumber: 1, 
                PageSize: 1000,
                ...(statusFilter !== 'all' && { Status: statusFilter })
              } 
            })
            
            if (countResponse.data && typeof countResponse.data === 'object' && !Array.isArray(countResponse.data)) {
              // Si la respuesta de conteo es un objeto, extraer totalCount
              const totalCount = Number(countResponse.data.totalCount ?? countResponse.data.TotalCount ?? 0)
              setOrders(responseData)
              setTotalCount(totalCount)
              setTotalPages(Math.ceil(totalCount / itemsPerPage))
              return
            } else if (Array.isArray(countResponse.data)) {
              // Si también es un array, usar el length del array completo como totalCount
              const totalCount = countResponse.data.length
              setOrders(responseData)
              setTotalCount(totalCount)
              setTotalPages(Math.ceil(totalCount / itemsPerPage))
              return
            }
          } catch (error) {
            console.error('Error al obtener totalCount:', error)
          }
          
          // Fallback: usar el array recibido (solo muestra las órdenes de la página actual)
          setOrders(responseData)
          setTotalCount(responseData.length)
          setTotalPages(Math.ceil(responseData.length / itemsPerPage))
          return
        }
        
        // Si es un objeto, extraer los datos normalmente
        if (responseData && typeof responseData === 'object') {
          const ordersData = Array.isArray(responseData.orders) ? responseData.orders : []
          const totalCount = Number(responseData.totalCount ?? responseData.TotalCount ?? 0)
          const totalPages = Number(responseData.totalPages ?? responseData.TotalPages ?? Math.ceil(totalCount / itemsPerPage))
          
          setOrders(ordersData)
          setTotalCount(totalCount)
          setTotalPages(totalPages > 0 ? totalPages : 1)
        } else {
          setOrders([])
          setTotalCount(0)
          setTotalPages(1)
        }
      } catch (apiError) {
        console.warn('API no disponible, usando datos mock:', apiError)
        setOrders([])
        setTotalCount(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error('Error al cargar órdenes:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      }
      setOrders([])
      setTotalCount(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar órdenes localmente por búsqueda (solo en la página actual)
  const getFilteredOrders = () => {
    let filtered = [...orders]

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(order =>
        order.customerId?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const handleViewOrder = async (orderId) => {
    try {
      setLoadingOrderDetails(true)
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`
      }

      const response = await axios.get(`/api/Orders/${orderId}`, { headers })
      setSelectedOrder(response.data)
      setIsOrderModalOpen(true)
    } catch (error) {
      console.error('Error al cargar detalles de la orden:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        await alertError('Error al cargar los detalles de la orden. Por favor, intenta nuevamente.', 'Error')
      }
    } finally {
      setLoadingOrderDetails(false)
    }
  }

  const closeOrderModal = () => {
    setIsOrderModalOpen(false)
    setSelectedOrder(null)
  }

  // Función para obtener el color según el estado
  const getStatusColor = (status) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'PENDING':
        return 'text-orange-600'
      case 'PROCESSING':
        return 'text-blue-600'
      case 'SHIPPED':
        return 'text-purple-600'
      case 'DELIVERED':
        return 'text-green-600'
      case 'CANCELLED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Función para obtener el nombre en español del estado
  const getStatusName = (status) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'PENDING':
        return 'Pendiente'
      case 'PROCESSING':
        return 'En Proceso'
      case 'SHIPPED':
        return 'Enviado'
      case 'DELIVERED':
        return 'Entregado'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status || 'N/A'
    }
  }

  // Función para obtener los estados permitidos según el estado actual
  const getAllowedStatuses = (currentStatus) => {
    const statusUpper = currentStatus?.toUpperCase()
    switch (statusUpper) {
      case 'PENDING':
        return ['PROCESSING', 'DELIVERED', 'CANCELLED']
      case 'PROCESSING':
        return ['SHIPPED', 'DELIVERED', 'CANCELLED']
      case 'SHIPPED':
        return ['DELIVERED']
      case 'DELIVERED':
        return ['PENDING']
      case 'CANCELLED':
        return []
      default:
        return []
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedOrder || !selectedOrder.id) return

    try {
      setLoadingOrderDetails(true)
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Asegurar que el ID sea un string válido
      const orderId = selectedOrder.id?.toString() || selectedOrder.id

      const response = await axios.put(
        `/api/Orders/${orderId}/status`,
        { NewStatus: newStatus },
        { headers }
      )

      // Actualizar la orden seleccionada con el nuevo estado
      setSelectedOrder(response.data)
      
      // Actualizar también la lista de órdenes
      await fetchOrders()
      
      await alertSuccess(`Estado de la orden actualizado a: ${getStatusName(newStatus)}`, 'Éxito')
    } catch (error) {
      console.error('Error al actualizar el estado:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar el estado'
        await alertError(`Error: ${errorMessage}`, 'Error')
      } else if (error.response?.data?.error) {
        await alertError(`Error: ${error.response.data.error}`, 'Error')
      } else {
        await alertError('Error al actualizar el estado de la orden. Por favor, intenta nuevamente.', 'Error')
      }
    } finally {
      setLoadingOrderDetails(false)
    }
  }

  // Obtener órdenes filtradas (solo búsqueda local, el filtro de estado se hace en el servidor)
  const filteredOrders = getFilteredOrders()
  const currentOrders = filteredOrders

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="h-screen flex flex-col overflow-hidden">
        <AdminHeader />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeItem="Ordenes" />
          
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {/* Título */}
            <div className="mb-6 sm:mb-8 md:mb-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Órdenes</h1>
              <p className="text-gray-600 text-base sm:text-lg md:text-xl">
                Gestiona las órdenes de tus clientes
                {!loading && totalCount > 0 && (
                  <span className="ml-2 text-orange-600 font-semibold">
                    ({totalCount} {totalCount === 1 ? 'orden' : 'órdenes'})
                  </span>
                )}
              </p>
            </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mb-6 sm:mb-8">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar órdenes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 sm:pl-5 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base sm:text-lg"
                />
                <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setCurrentPage(1) // Resetear a la primera página al cambiar filtro
                }}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-base sm:text-lg"
              >
                <option value="all">Todos los Estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="PROCESSING">En Proceso</option>
                <option value="SHIPPED">Enviado</option>
                <option value="DELIVERED">Entregado</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            {/* Lista de órdenes */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando órdenes...</p>
              </div>
            ) : currentOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No se encontraron órdenes</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                  {currentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-xl transition-all duration-200 shadow-lg"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">
                          #{order.id?.toString().substring(0, 8) || 'N/A'} - {order.customerName || 'Nombre de Cliente'}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 items-start sm:items-center">
                          <p className="text-sm sm:text-base text-gray-700">
                            <span className="font-semibold text-gray-900">Estado:</span> <span className={`font-bold text-base sm:text-lg ${getStatusColor(order.status)}`}>{getStatusName(order.status)}</span>
                          </p>
                          {order.totalAmount && (
                            <p className="text-sm sm:text-base text-gray-700">
                              <span className="font-semibold text-gray-900">Total:</span> <span className="font-bold text-orange-600 text-base sm:text-lg">${order.totalAmount.toFixed(2)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg sm:ml-6"
                      >
                        Ver
                      </button>
                    </div>
                  ))}
                </div>

                {/* Paginación - Mostrar cuando hay más de 10 órdenes (más de 1 página) */}
                {totalCount > itemsPerPage && (
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 flex-wrap">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1 sm:gap-2 font-semibold text-gray-700 transition-all duration-200 text-sm sm:text-base md:text-lg"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    
                    {/* Números de página - ocultos en móvil pequeño */}
                    <div className="hidden sm:flex items-center gap-2">
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          disabled={page === '...'}
                          className={`px-3 sm:px-5 py-2 sm:py-3 border-2 rounded-xl font-semibold transition-all duration-200 text-sm sm:text-base md:text-lg ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-500 shadow-md'
                              : page === '...'
                              ? 'border-transparent cursor-default'
                              : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    {/* Indicador de página en móvil pequeño */}
                    <div className="sm:hidden px-3 py-2 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 text-sm">
                      {currentPage} / {totalPages}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1 sm:gap-2 font-semibold text-gray-700 transition-all duration-200 text-sm sm:text-base md:text-lg"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalles de la orden */}
      <Modal isOpen={isOrderModalOpen} onClose={closeOrderModal}>
        <div className="p-8 md:p-10 lg:p-12 max-h-[90vh] overflow-y-auto">
          {loadingOrderDetails ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              <p className="text-gray-600 mt-4 text-lg">Cargando detalles de la orden...</p>
            </div>
          ) : selectedOrder ? (
            <div className="space-y-6 md:space-y-8">
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Detalles de la Orden</h2>
                <p className="text-gray-600 text-lg md:text-xl">Información completa de la orden #{selectedOrder.id?.toString().substring(0, 8) || 'N/A'}</p>
              </div>
              
              {/* Información general */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">ID de Orden</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900">#{selectedOrder.id?.toString().substring(0, 8) || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Cliente</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900">{selectedOrder.customerName || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Estado Actual</p>
                    <p className={`text-lg md:text-xl font-bold ${getStatusColor(selectedOrder.status)}`}>{getStatusName(selectedOrder.status)}</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">Total</p>
                    <p className="text-lg md:text-xl font-bold text-orange-600">${selectedOrder.totalAmount?.toFixed(2).replace('.', ',') || '0,00'}</p>
                  </div>
                </div>

                {/* Cambiar estado */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm sm:text-base font-semibold text-gray-700 mb-3">Cambiar Estado:</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => {
                      const allowedStatuses = getAllowedStatuses(selectedOrder.status)
                      const isAllowed = allowedStatuses.includes(status)
                      const isCurrentStatus = selectedOrder.status?.toUpperCase() === status
                      
                      const statusColors = {
                        'PENDING': 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
                        'PROCESSING': 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
                        'SHIPPED': 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
                        'DELIVERED': 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
                        'CANCELLED': 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                      }
                      
                      return (
                        <button
                          key={status}
                          onClick={() => isAllowed && !isCurrentStatus && handleUpdateStatus(status)}
                          disabled={loadingOrderDetails || !isAllowed || isCurrentStatus}
                          className={`px-3 sm:px-5 py-2 sm:py-3 rounded-xl transition-all duration-200 text-xs sm:text-sm md:text-base font-semibold shadow-md ${
                            isCurrentStatus
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-white cursor-default'
                              : isAllowed
                              ? `bg-gradient-to-r ${statusColors[status]} text-white hover:shadow-lg`
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          title={
                            isCurrentStatus
                              ? 'Estado actual'
                              : isAllowed
                              ? `Cambiar a ${getStatusName(status)}`
                              : 'Transición no permitida'
                          }
                        >
                          {getStatusName(status)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Direcciones */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Direcciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">📦 Dirección de Envío</p>
                    <p className="text-base md:text-lg text-gray-800 font-medium">{selectedOrder.shippingAddress || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 border border-gray-200">
                    <p className="text-sm font-semibold text-gray-600 mb-2">🧾 Dirección de Facturación</p>
                    <p className="text-base md:text-lg text-gray-800 font-medium">{selectedOrder.billingAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Items de la orden */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 shadow-lg">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-5">Productos</h3>
                <div className="space-y-4">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-white rounded-xl p-5 md:p-6 border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div className="flex-1">
                            <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">{item.name || 'Producto sin nombre'}</p>
                            <div className="flex flex-wrap gap-4 text-sm md:text-base">
                              <p className="text-gray-600">
                                <span className="font-semibold text-gray-900">Cantidad:</span> <span className="font-bold text-orange-600">{item.quantity || 0}</span>
                              </p>
                              <p className="text-gray-600">
                                <span className="font-semibold text-gray-900">Precio unitario:</span> <span className="font-bold">${item.unitPrice?.toFixed(2).replace('.', ',') || '0,00'}</span>
                              </p>
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-sm text-gray-600 mb-1">Subtotal</p>
                            <p className="text-2xl md:text-3xl font-bold text-orange-600">${item.subtotal?.toFixed(2).replace('.', ',') || '0,00'}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-center py-8 text-lg">No hay productos en esta orden</p>
                  )}
                </div>
              </div>

              {/* Botón cerrar */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={closeOrderModal}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-200 font-semibold text-base sm:text-lg shadow-sm hover:shadow-md"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se pudieron cargar los detalles de la orden</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Orders

