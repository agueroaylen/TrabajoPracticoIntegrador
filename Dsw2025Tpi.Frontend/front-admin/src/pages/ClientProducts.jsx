import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import ClientHeader from '../components/ClientHeader'
import ProductCard from '../components/ProductCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function ClientProducts() {
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Productos por página
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  // Animación suave al cambiar de página
  useEffect(() => {
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.style.opacity = '0'
      mainContent.style.transform = 'translateY(8px)'
      setTimeout(() => {
        mainContent.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
        mainContent.style.opacity = '1'
        mainContent.style.transform = 'translateY(0)'
      }, 10)
    }
  }, [location.pathname])

  useEffect(() => {
    // Filtrar productos según la búsqueda
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
    // Resetear a la primera página cuando cambia la búsqueda
    setCurrentPage(1)
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products')
      setProducts(response.data)
      setFilteredProducts(response.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product, quantity) => {
    const existingItem = cart.find(item => item.productId === product.id)
    
    let updatedCart
    if (existingItem) {
      updatedCart = cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      )
    } else {
      updatedCart = [...cart, {
        productId: product.id,
        name: product.name,
        price: product.currentUnitPrice,
        quantity: quantity
      }]
    }
    
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Disparar evento para actualizar el badge del carrito en el header
    window.dispatchEvent(new Event('cartChange'))
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white grid grid-rows-[auto_1fr] w-full max-w-full overflow-x-hidden animate-fadeIn">
      <ClientHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="w-full max-w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 animate-slideIn">
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-gray-900 mb-2 sm:mb-3 lg:mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Nuestros Productos</h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-2xl font-medium">Descubre nuestra amplia variedad</p>
        </div>
        
        {loading ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-orange-500"></div>
            <p className="text-gray-600 mt-4 text-sm sm:text-base">Cargando productos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-600 text-base sm:text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full max-w-full">
              {currentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
            
            {/* Controles de paginación */}
            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2 lg:gap-3 mt-6 sm:mt-8 md:mt-10 lg:mt-12 pb-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1 font-semibold text-gray-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                >
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
                
                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === 'number' && setCurrentPage(page)}
                    disabled={page === '...'}
                    className={`px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-3 border-2 rounded-xl font-semibold transition-all duration-200 text-xs sm:text-sm lg:text-base ${
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
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 border-2 border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-300 hover:bg-orange-50 flex items-center gap-1 font-semibold text-gray-700 transition-all duration-200 text-xs sm:text-sm lg:text-base"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ClientProducts

