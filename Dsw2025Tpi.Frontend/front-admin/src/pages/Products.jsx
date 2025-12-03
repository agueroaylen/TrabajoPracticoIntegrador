import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Sidebar from '../components/Sidebar'
import AdminHeader from '../components/AdminHeader'
import Modal from '../components/Modal'
import AlertModal from '../components/AlertModal'
import ConfirmModal from '../components/ConfirmModal'
import { Search, ChevronLeft, ChevronRight, Eye, Trash2, Ban, CheckCircle } from 'lucide-react'
import { alertSuccess, alertError, alertWarning, alertInfo, showConfirm } from '../utils/modalUtils'

function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    sku: '',
    internalCode: '',
    name: '',
    description: '',
    currentUnitPrice: '',
    stockQuantity: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', type: 'info' })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null })
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

    fetchProducts()
  }, [navigate])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, statusFilter, products])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const headers = {
        Authorization: `Bearer ${token}`
      }

      try {
        // Intentar usar endpoint de admin que devuelve todos los productos (activos e inactivos)
        const response = await axios.get('/api/products/admin/all', { headers })
        console.log('Respuesta del endpoint admin:', response)
        const productsData = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : [])
        console.log('Productos cargados:', productsData.length)
        
        // Normalizar propiedades a camelCase si vienen en PascalCase
        // ASP.NET Core serializa records en PascalCase por defecto
        const normalizedProducts = productsData.map(product => {
          // Priorizar IsActive (PascalCase) que es como viene del backend
          // Manejar tanto boolean (true/false) como número (1/0)
          let isActiveValue = product.IsActive !== undefined 
            ? product.IsActive 
            : (product.isActive !== undefined ? product.isActive : true) // Por defecto true si no viene
          
          console.log('🔍 Normalizando producto:', {
            name: product.Name || product.name,
            IsActive: product.IsActive,
            isActive: product.isActive,
            tipoIsActive: typeof product.IsActive,
            tipoisActive: typeof product.isActive,
            valorOriginal: isActiveValue,
            tipoValorOriginal: typeof isActiveValue
          })
          
          // Convertir número a boolean si es necesario (0 = false, 1 = true)
          if (typeof isActiveValue === 'number') {
            isActiveValue = isActiveValue === 1
            console.log('🔍 Convertido de número a boolean:', isActiveValue)
          }
          // Asegurar que sea boolean (convierte truthy/falsy a boolean)
          // PERO: si es 0, debe ser false explícitamente
          if (isActiveValue === 0) {
            isActiveValue = false
          } else {
            isActiveValue = Boolean(isActiveValue)
          }
          
          console.log('🔍 Valor final isActive:', isActiveValue)
          
          const normalized = {
            id: product.Id || product.id,
            sku: product.Sku || product.sku,
            name: product.Name || product.name,
            description: product.Description || product.description,
            currentUnitPrice: product.CurrentUnitPrice !== undefined ? product.CurrentUnitPrice : product.currentUnitPrice,
            stockQuantity: product.StockQuantity !== undefined ? product.StockQuantity : product.stockQuantity,
            isActive: isActiveValue // Siempre establecer isActive explícitamente en camelCase como boolean
          }
          
          return normalized
        })
        
        console.log('Productos normalizados:', normalizedProducts.length)
        console.log('Ejemplo de producto original (COMPLETO):', JSON.stringify(productsData[0], null, 2))
        console.log('Ejemplo de producto normalizado:', normalizedProducts[0])
        
        // Buscar productos inactivos en los datos originales ANTES de normalizar
        const productosInactivosAntesNormalizar = productsData.filter(p => {
          const isActive = p.IsActive !== undefined ? p.IsActive : (p.isActive !== undefined ? p.isActive : null)
          return isActive === false || isActive === 0
        })
        console.log('🔍 Productos inactivos ANTES de normalizar:', productosInactivosAntesNormalizar.length)
        if (productosInactivosAntesNormalizar.length > 0) {
          console.log('🔍 Ejemplo de producto inactivo ANTES de normalizar:', JSON.stringify(productosInactivosAntesNormalizar[0], null, 2))
        }
        
        // Verificar valores de isActive en productos originales
        const activeCheck = productsData.map((p, idx) => {
          // Priorizar IsActive (PascalCase) que es como viene del backend
          const isActiveValue = p.IsActive !== undefined ? p.IsActive : (p.isActive !== undefined ? p.isActive : true)
          const tipoIsActive = typeof p.IsActive !== 'undefined' ? typeof p.IsActive : (typeof p.isActive !== 'undefined' ? typeof p.isActive : 'undefined')
          return {
            index: idx,
            name: p.Name || p.name,
            isActive: p.isActive,
            IsActive: p.IsActive,
            tipoIsActive: tipoIsActive,
            todasLasPropiedades: Object.keys(p),
            valorIsActive: isActiveValue,
            esInactivo: isActiveValue === false || isActiveValue === 0,
            esInactivoEstricto: isActiveValue === false
          }
        })
        console.log('Verificación de isActive en productos originales:', activeCheck)
        console.log('Productos inactivos encontrados (false o 0):', activeCheck.filter(p => p.esInactivo).length)
        console.log('Productos inactivos encontrados (solo false):', activeCheck.filter(p => p.esInactivoEstricto).length)
        
        // Mostrar solo los productos inactivos
        const productosInactivos = activeCheck.filter(p => p.esInactivo)
        if (productosInactivos.length > 0) {
          console.log('🔴 PRODUCTOS INACTIVOS ENCONTRADOS:', productosInactivos)
        }
        
        console.log('Productos activos:', normalizedProducts.filter(p => p.isActive === true).length)
        console.log('Productos inactivos:', normalizedProducts.filter(p => p.isActive === false).length)
        console.log('Productos con isActive undefined:', normalizedProducts.filter(p => p.isActive === undefined).length)
        
        // Verificar si hay productos con IsActive en false en los originales
        const productosInactivosOriginales = productsData.filter(p => {
          // Priorizar IsActive (PascalCase) que es como viene del backend
          const isActive = p.IsActive !== undefined ? p.IsActive : (p.isActive !== undefined ? p.isActive : true)
          return isActive === false
        })
        console.log('Productos inactivos en datos originales:', productosInactivosOriginales.length)
        if (productosInactivosOriginales.length > 0) {
          console.log('Ejemplo de producto inactivo original:', JSON.stringify(productosInactivosOriginales[0], null, 2))
          console.log('Todos los productos inactivos:', productosInactivosOriginales.map(p => ({
            id: p.Id || p.id,
            name: p.Name || p.name,
            IsActive: p.IsActive,
            isActive: p.isActive
          })))
        }
        
        setProducts(normalizedProducts)
        setFilteredProducts(normalizedProducts)
      } catch (apiError) {
        console.error('Error al cargar productos desde endpoint admin:', apiError)
        console.error('Error response:', apiError.response)
        console.error('Error status:', apiError.response?.status)
        console.error('Error data:', apiError.response?.data)
        
        // Si el endpoint de admin falla, intentar con el endpoint público como fallback
        if (apiError.response?.status === 404 || apiError.response?.status === 403 || apiError.response?.status === 500) {
          console.warn('Endpoint admin no disponible, usando endpoint público como fallback')
          try {
            const fallbackResponse = await axios.get('/api/products')
            console.log('Respuesta del fallback:', fallbackResponse)
            const productsData = Array.isArray(fallbackResponse.data) ? fallbackResponse.data : (fallbackResponse.data ? [fallbackResponse.data] : [])
            console.log('Productos cargados desde fallback:', productsData.length)
            setProducts(productsData)
            setFilteredProducts(productsData)
          } catch (fallbackError) {
            console.error('Error en fallback:', fallbackError)
            console.error('Fallback response:', fallbackError.response)
            setProducts([])
            setFilteredProducts([])
          }
        } else if (apiError.response?.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
          setProducts([])
          setFilteredProducts([])
        } else {
          setProducts([])
          setFilteredProducts([])
        }
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      }
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = [...products]

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => {
        const name = product.name || product.Name || ''
        const sku = product.sku || product.Sku || ''
        const searchLower = searchQuery.toLowerCase()
        return name.toLowerCase().includes(searchLower) || sku.toLowerCase().includes(searchLower)
      })
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      console.log('Aplicando filtro de estado:', statusFilter)
      console.log('Productos antes del filtro:', products.length)
      
      // Mostrar información de los primeros productos para debugging
      const sampleProducts = products.slice(0, 3).map(p => ({
        id: p.id || p.Id,
        name: p.name || p.Name,
        isActive: p.isActive,
        IsActive: p.IsActive,
        todasLasPropiedades: Object.keys(p)
      }))
      console.log('Muestra de productos antes del filtro:', sampleProducts)
      
      filtered = filtered.map(product => {
        // Manejar tanto camelCase como PascalCase, y también números (0/1)
        let isActive = product.isActive !== undefined 
          ? product.isActive 
          : (product.IsActive !== undefined ? product.IsActive : true)
        
        const originalIsActive = isActive
        const tipoOriginal = typeof isActive
        
        // Convertir número a boolean si es necesario (0 = false, 1 = true)
        if (typeof isActive === 'number') {
          isActive = isActive === 1
        }
        // Asegurar que sea boolean (convierte truthy/falsy a boolean)
        isActive = Boolean(isActive)
        
        console.log('Producto en filtro:', {
          id: product.id || product.Id,
          name: product.name || product.Name,
          isActive_original: product.isActive,
          IsActive_original: product.IsActive,
          isActive_calculado: originalIsActive,
          tipo: tipoOriginal,
          isActive_final: isActive,
          statusFilter,
          cumpleFiltro: statusFilter === 'active' ? isActive === true : (statusFilter === 'inactive' ? isActive === false : true)
        })
        
        return { ...product, isActive, _shouldInclude: statusFilter === 'active' ? isActive === true : (statusFilter === 'inactive' ? isActive === false : true) }
      }).filter(product => product._shouldInclude)
      
      console.log('Productos después del filtro:', filtered.length)
      if (filtered.length === 0 && products.length > 0) {
        console.warn('⚠️ No se encontraron productos con el filtro, pero hay productos disponibles')
        console.log('Muestra de productos que NO pasaron el filtro:', products.slice(0, 3).map(p => ({
          id: p.id || p.Id,
          name: p.name || p.Name,
          isActive: p.isActive,
          IsActive: p.IsActive,
          isActiveCalculado: p.isActive !== undefined ? p.isActive : (p.IsActive !== undefined ? p.IsActive : true)
        })))
      }
    }

    console.log('Filtro aplicado:', {
      statusFilter,
      totalProductos: products.length,
      productosFiltrados: filtered.length,
      activos: filtered.filter(p => {
        const isActive = p.isActive !== undefined ? p.isActive : (p.IsActive !== undefined ? p.IsActive : true)
        return isActive === true
      }).length,
      inactivos: filtered.filter(p => {
        const isActive = p.isActive !== undefined ? p.isActive : (p.IsActive !== undefined ? p.IsActive : true)
        return isActive === false
      }).length
    })

    setFilteredProducts(filtered)
    setCurrentPage(1) // Resetear a la primera página al filtrar
  }

  const handleCreateProduct = () => {
    setShowCreateForm(true)
  }

  const handleCancelCreate = () => {
    setShowCreateForm(false)
    setFormData({
      sku: '',
      internalCode: '',
      name: '',
      description: '',
      currentUnitPrice: '',
      stockQuantity: ''
    })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmitProduct = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const productData = {
        Sku: formData.sku,
        InternalCode: formData.internalCode,
        Name: formData.name,
        Description: formData.description,
        CurrentUnitPrice: parseFloat(formData.currentUnitPrice),
        StockQuantity: parseInt(formData.stockQuantity)
      }

      await axios.post('/api/products', productData, { headers })
      
      // Recargar productos
      await fetchProducts()
      
      // Limpiar formulario y ocultar
      setShowCreateForm(false)
      setFormData({
        sku: '',
        internalCode: '',
        name: '',
        description: '',
        currentUnitPrice: '',
        stockQuantity: ''
      })
      
      await alertSuccess('Producto creado exitosamente', 'Éxito')
    } catch (error) {
      console.error('Error al crear producto:', error)
      if (error.response?.data?.error) {
        await alertError(`Error: ${error.response.data.error}`, 'Error')
      } else {
        await alertError('Error al crear el producto. Por favor, intenta nuevamente.', 'Error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`
      }
      // Usar endpoint de admin que permite ver productos inactivos
      const response = await axios.get(`/api/products/admin/${productId}`, { headers })
      setSelectedProduct(response.data)
      setIsProductModalOpen(true)
    } catch (error) {
      console.error('Error al cargar el producto:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else {
        await alertError('Error al cargar los detalles del producto. Por favor, intenta nuevamente.', 'Error')
      }
    }
  }

  const handleDisableProduct = async (productId) => {
    const confirmed = await showConfirm(
      '¿Estás seguro de que deseas inhabilitar este producto? El producto dejará de estar disponible para los clientes.',
      'Confirmar Inhabilitación',
      'Inhabilitar',
      'Cancelar'
    )
    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      await axios.patch(`/api/products/${productId}`, {}, { headers })
      
      console.log('✅ Producto inhabilitado, recargando lista...')
      
      // Recargar productos
      await fetchProducts()
      
      console.log('✅ Lista recargada después de inhabilitar')
      
      // Cerrar modal si estaba abierto
      if (selectedProduct && (selectedProduct.id === productId || selectedProduct.Id === productId)) {
        setIsProductModalOpen(false)
        setSelectedProduct(null)
      }
      
      await alertSuccess('Producto inhabilitado exitosamente', 'Éxito')
    } catch (error) {
      console.error('Error al inhabilitar producto:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else if (error.response?.data?.error) {
        await alertError(`Error: ${error.response.data.error}`, 'Error')
      } else {
        await alertError('Error al inhabilitar el producto. Por favor, intenta nuevamente.', 'Error')
      }
    }
  }

  const handleEnableProduct = async (productId) => {
    const confirmed = await showConfirm(
      '¿Estás seguro de que deseas activar este producto? El producto estará disponible para los clientes.',
      'Confirmar Activación',
      'Activar',
      'Cancelar'
    )
    if (!confirmed) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      await axios.patch(`/api/products/enable/${productId}`, {}, { headers })
      
      console.log('✅ Producto activado, recargando lista...')
      
      // Recargar productos
      await fetchProducts()
      
      console.log('✅ Lista recargada después de activar')
      
      // Cerrar modal si estaba abierto
      if (selectedProduct && (selectedProduct.id === productId || selectedProduct.Id === productId)) {
        setIsProductModalOpen(false)
        setSelectedProduct(null)
      }
      
      await alertSuccess('Producto activado exitosamente', 'Éxito')
    } catch (error) {
      console.error('Error al activar producto:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
      } else if (error.response?.data?.error) {
        await alertError(`Error: ${error.response.data.error}`, 'Error')
      } else {
        await alertError('Error al activar el producto. Por favor, intenta nuevamente.', 'Error')
      }
    }
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    setSelectedProduct(null)
  }

  // Calcular paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

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
          <Sidebar activeItem="Productos" />
          
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
            {showCreateForm ? (
              /* Formulario de creación de producto */
              <form onSubmit={handleSubmitProduct} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="sku" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base"
                  />
                </div>

                <div>
                  <label htmlFor="internalCode" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">
                    Código único
                  </label>
                  <input
                    type="text"
                    id="internalCode"
                    name="internalCode"
                    value={formData.internalCode}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base"
                  />
                </div>

                <div>
                  <label htmlFor="currentUnitPrice" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">
                    Precio
                  </label>
                  <input
                    type="number"
                    id="currentUnitPrice"
                    name="currentUnitPrice"
                    value={formData.currentUnitPrice}
                    onChange={handleFormChange}
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base"
                  />
                </div>

                <div>
                  <label htmlFor="stockQuantity" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleFormChange}
                    min="0"
                    required
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="w-full sm:w-auto px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-base"
                  >
                    {isSubmitting ? 'Creando...' : 'Crear Producto'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Header con título y botón crear */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8 md:mb-10">
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">Productos</h1>
                    <p className="text-gray-600 text-base sm:text-lg md:text-xl">Gestiona tu catálogo de productos</p>
                  </div>
                  <button
                    onClick={handleCreateProduct}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    + Crear Producto
                  </button>
                </div>

            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 mb-6 sm:mb-8">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 sm:pl-5 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 text-base sm:text-lg"
                />
                <Search className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-base sm:text-lg"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inhabilitados</option>
              </select>
            </div>

            {/* Lista de productos */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando productos...</p>
              </div>
            ) : currentProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No se encontraron productos</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
                  {currentProducts.map((product) => (
                    <div
                      key={product.id || product.Id}
                      className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-xl transition-all duration-200 shadow-lg"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3 break-words">
                          {(product.sku || product.Sku)} - {(product.name || product.Name)}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 items-start sm:items-center">
                          <p className="text-sm sm:text-base text-gray-700">
                            <span className="font-semibold text-gray-900">Stock:</span> <span className="font-bold text-orange-600 text-base sm:text-lg">{product.stockQuantity !== undefined ? product.stockQuantity : product.StockQuantity}</span>
                          </p>
                          <p className="text-sm sm:text-base text-gray-700">
                            <span className="font-semibold text-gray-900">Estado:</span> <span className={`font-bold text-base sm:text-lg ${(product.isActive !== undefined ? product.isActive : product.IsActive) ? 'text-green-600' : 'text-red-600'}`}>{(product.isActive !== undefined ? product.isActive : product.IsActive) ? 'Activo' : 'Inactivo'}</span>
                          </p>
                          {(product.currentUnitPrice !== undefined ? product.currentUnitPrice : product.CurrentUnitPrice) && (
                            <p className="text-sm sm:text-base text-gray-700">
                              <span className="font-semibold text-gray-900">Precio:</span> <span className="font-bold text-orange-600 text-base sm:text-lg">${(product.currentUnitPrice !== undefined ? product.currentUnitPrice : product.CurrentUnitPrice).toFixed(2)}</span>
                            </p>
                          )}
                        </div>
                        {(product.description || product.Description) && (
                          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3 line-clamp-2">
                            {product.description || product.Description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:ml-6">
                        <button
                          onClick={() => handleViewProduct(product.id || product.Id)}
                          className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                          Ver
                        </button>
                        {(product.isActive !== undefined ? product.isActive : product.IsActive) ? (
                          <button
                            onClick={() => handleDisableProduct(product.id || product.Id)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            title="Inhabilitar producto"
                          >
                            <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                            Inhabilitar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnableProduct(product.id || product.Id)}
                            className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 text-sm sm:text-base md:text-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            title="Activar producto"
                          >
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            Activar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
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
              </>
            )}
          </main>
        </div>
      </div>

      {/* Modal de detalles del producto */}
      <Modal isOpen={isProductModalOpen} onClose={closeProductModal}>
        <div className="p-8 md:p-10 lg:p-12 max-h-[90vh] overflow-y-auto">
          {selectedProduct ? (
            <div className="space-y-6 md:space-y-8">
              <div className="mb-6">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">Detalles del Producto</h2>
                <p className="text-gray-600 text-lg md:text-xl">Información completa del producto</p>
              </div>

              {/* Información del producto */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border-2 border-gray-100 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">SKU</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{selectedProduct.sku || selectedProduct.Sku || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Código Interno</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{selectedProduct.internalCode || selectedProduct.InternalCode || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Nombre</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">{selectedProduct.name || selectedProduct.Name || 'N/A'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Descripción</p>
                    <p className="text-lg text-gray-800">{selectedProduct.description || selectedProduct.Description || 'Sin descripción'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Precio</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600">${(selectedProduct.currentUnitPrice !== undefined ? selectedProduct.currentUnitPrice : selectedProduct.CurrentUnitPrice || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Stock</p>
                    <p className="text-2xl md:text-3xl font-bold text-orange-600">{selectedProduct.stockQuantity !== undefined ? selectedProduct.stockQuantity : selectedProduct.StockQuantity || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Estado</p>
                    <p className={`text-xl md:text-2xl font-bold ${(selectedProduct.isActive !== undefined ? selectedProduct.isActive : selectedProduct.IsActive) ? 'text-green-600' : 'text-red-600'}`}>
                      {(selectedProduct.isActive !== undefined ? selectedProduct.isActive : selectedProduct.IsActive) ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap gap-4">
                  {(selectedProduct.isActive !== undefined ? selectedProduct.isActive : selectedProduct.IsActive) ? (
                    <button
                      onClick={() => {
                        closeProductModal()
                        handleDisableProduct(selectedProduct.id || selectedProduct.Id)
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <Ban className="w-5 h-5" />
                      Inhabilitar Producto
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        closeProductModal()
                        handleEnableProduct(selectedProduct.id || selectedProduct.Id)
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-md hover:shadow-lg flex items-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Activar Producto
                    </button>
                  )}
                  <button
                    onClick={closeProductModal}
                    className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-200 font-semibold text-lg shadow-sm hover:shadow-md"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No se pudieron cargar los detalles del producto</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default Products

