import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, LogOut, Menu, X, Lock } from 'lucide-react'
import { useState, useEffect } from 'react'
import LoginModal from '../../features/auth/LoginModal'
import SignupModal from '../../features/auth/SignupModal'
import logo from '../../assets/logosinfondo.png'

function ClientHeader({ searchQuery, onSearchChange }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchHovered, setIsSearchHovered] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [cartItems, setCartItems] = useState([])
  const [isCartHovered, setIsCartHovered] = useState(false)

  // Función para obtener la cantidad de items en el carrito
  const getCartItemCount = () => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        const cart = JSON.parse(savedCart)
        // Sumar todas las cantidades de los items en el carrito
        return cart.reduce((total, item) => total + (item.quantity || 1), 0)
      }
    } catch (error) {
      console.error('Error al leer el carrito:', error)
    }
    return 0
  }

  // Función para obtener los items del carrito
  const getCartItems = () => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        return JSON.parse(savedCart)
      }
    } catch (error) {
      console.error('Error al leer el carrito:', error)
    }
    return []
  }

  useEffect(() => {
    // Verificar si el usuario está autenticado
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')
      const savedUsername = localStorage.getItem('username')
      
      // Mostrar como autenticado si hay token y username, independientemente del rol
      // Esto permite que los admins también se vean logueados en la tienda
      if (token && savedUsername) {
        setIsAuthenticated(true)
        setUsername(savedUsername)
      } else {
        setIsAuthenticated(false)
        setUsername('')
      }
    }

    // Actualizar cantidad del carrito
    const updateCartCount = () => {
      setCartItemCount(getCartItemCount())
      setCartItems(getCartItems())
    }

    checkAuth()
    updateCartCount()

    // Escuchar cambios en localStorage
    const handleStorageChange = (e) => {
      checkAuth()
      if (e.key === 'cart' || !e.key) {
        updateCartCount()
      }
    }

    // Escuchar eventos de almacenamiento (cuando se actualiza desde otra pestaña)
    window.addEventListener('storage', handleStorageChange)

    // Escuchar eventos personalizados cuando se actualiza desde la misma pestaña
    window.addEventListener('authChange', handleStorageChange)
    window.addEventListener('cartChange', updateCartCount)

    // Polling para actualizar el carrito cada segundo (por si acaso)
    const interval = setInterval(updateCartCount, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authChange', handleStorageChange)
      window.removeEventListener('cartChange', updateCartCount)
      clearInterval(interval)
    }
  }, [])

  const isProductsActive = location.pathname === '/' || location.pathname === '/productos'
  const isCartActive = location.pathname === '/carrito'

  const handleNavigation = (path) => {
    // Transición suave y fluida
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out'
      mainContent.style.opacity = '0.85'
      mainContent.style.transform = 'translateY(5px)'
    }
    
    setTimeout(() => {
      navigate(path)
      // Restaurar suavemente después de la navegación
      setTimeout(() => {
        if (mainContent) {
          mainContent.style.transition = 'opacity 0.4s ease-out, transform 0.4s ease-out'
          mainContent.style.opacity = '1'
          mainContent.style.transform = 'translateY(0)'
        }
      }, 50)
    }, 200)
  }

  const openLoginModal = () => {
    setIsLoginModalOpen(true)
    setIsSignupModalOpen(false)
  }

  const openSignupModal = () => {
    setIsSignupModalOpen(true)
    setIsLoginModalOpen(false)
  }

  const closeModals = () => {
    setIsLoginModalOpen(false)
    setIsSignupModalOpen(false)
  }

  const handleLoginSuccess = () => {
    const savedUsername = localStorage.getItem('username')
    const role = localStorage.getItem('role')
    setIsAuthenticated(true)
    setUsername(savedUsername || '')
    closeModals()
    
    // Si el rol es admin y estamos en el contexto del cliente, no redirigir
    // El admin puede acceder al panel a través del icono de candado
    if (role === 'admin') {
      // No redirigir, solo cerrar el modal y mantener en la tienda
    }
    
    // Disparar evento personalizado para actualizar otros componentes
    window.dispatchEvent(new Event('authChange'))
  }

  const handleSignupSuccess = () => {
    const savedUsername = localStorage.getItem('username')
    setIsAuthenticated(true)
    setUsername(savedUsername || '')
    closeModals()
    // Disparar evento personalizado para actualizar otros componentes
    window.dispatchEvent(new Event('authChange'))
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    setIsAuthenticated(false)
    setUsername('')
    // Disparar evento personalizado para actualizar otros componentes
    window.dispatchEvent(new Event('authChange'))
    // Redirigir a productos si está en otra página
    if (location.pathname !== '/productos') {
      navigate('/productos')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full max-w-full shadow-sm overflow-visible">
      {/* Barra superior oscura */}
      <div className="bg-gray-800 w-full">
        <div className="w-full max-w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-18 md:h-20 lg:h-24 gap-2 sm:gap-3 md:gap-4">
            {/* Logo */}
            <div className="flex items-center justify-center flex-shrink-0 overflow-visible relative" style={{ width: '200px', height: '100%' }}>
              <img 
                src={logo} 
                alt="Bite Logo" 
                className="h-24 sm:h-28 md:h-32 lg:h-56 object-contain cursor-pointer"
                style={{ transform: 'translateY(4px) translateX(-20px)' }}
                onClick={() => handleNavigation('/productos')}
              />
            </div>

            {/* Buscador - Desktop */}
            <div className="hidden lg:flex flex-1 items-center justify-center max-w-2xl mx-auto">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-5 pr-16 py-4 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-800 text-lg"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-200 rounded transition-colors">
                  <Search className="w-7 h-7 text-orange-600" />
                </button>
              </div>
            </div>


            {/* Botones de usuario y carrito - Desktop */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-4 text-white">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-lg">{username}</span>
                  </div>
                  <button
                    onClick={() => {
                      const role = localStorage.getItem('role')
                      // Si ya es admin, redirigir directamente al admin
                      if (role === 'admin') {
                        handleNavigation('/admin')
                      } else {
                        // Si no es admin, abrir el modal de login
                        setIsLoginModalOpen(true)
                        setIsSignupModalOpen(false)
                      }
                    }}
                    className="text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                    title={localStorage.getItem('role') === 'admin' ? 'Ir al panel de administración' : 'Acceder como administrador'}
                  >
                    <Lock className="w-7 h-7" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-7 h-7" />
                  </button>
                </>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="text-white hover:text-orange-400 transition-colors flex items-center gap-3 font-semibold text-lg"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Ingresá</span>
                </button>
              )}
              <div 
                className="relative"
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
              >
                <button
                  onClick={() => handleNavigation('/carrito')}
                  className="text-white hover:text-orange-400 transition-colors relative"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>

                {/* Panel desplegable del carrito */}
                {isCartHovered && cartItems.length > 0 && (
                  <>
                    {/* Puente invisible para mantener el hover */}
                    <div 
                      className="absolute right-0 top-full w-[28rem] h-2 z-50"
                      onMouseEnter={() => setIsCartHovered(true)}
                      onMouseLeave={() => setIsCartHovered(false)}
                    />
                    <div 
                      className="absolute right-0 top-full mt-2 w-[28rem] bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden animate-slideIn"
                      onMouseEnter={() => setIsCartHovered(true)}
                      onMouseLeave={() => setIsCartHovered(false)}
                    >
                      <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
                        <h3 className="text-white font-bold text-2xl">Mi Carrito</h3>
                        <p className="text-orange-100 text-lg">{cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'}</p>
                      </div>
                      <div className="max-h-[32rem] overflow-y-auto">
                        {cartItems.map((item, index) => {
                          const totalItem = (item.price || 0) * (item.quantity || 1)
                          return (
                            <div key={index} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start gap-5">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-lg truncate">{item.name}</p>
                                  <p className="text-gray-600 text-base mt-1.5">Cantidad: {item.quantity}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-orange-600 text-lg">${totalItem.toFixed(2)}</p>
                                  <p className="text-gray-500 text-base">${(item.price || 0).toFixed(2)} c/u</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-2xl">Total:</span>
                          <span className="font-bold text-orange-600 text-3xl">
                            ${cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botones móviles - Carrito y menú hamburguesa */}
            <div className="lg:hidden flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div 
                className="relative"
                onMouseEnter={() => setIsCartHovered(true)}
                onMouseLeave={() => setIsCartHovered(false)}
              >
                <button
                  onClick={() => handleNavigation('/carrito')}
                  className="text-white hover:text-orange-400 transition-colors relative p-1.5"
                >
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-white text-[10px]">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>

                {/* Panel desplegable del carrito - Mobile */}
                {isCartHovered && cartItems.length > 0 && (
                  <>
                    {/* Puente invisible para mantener el hover */}
                    <div 
                      className="absolute right-0 top-full w-[28rem] h-2 z-50"
                      onMouseEnter={() => setIsCartHovered(true)}
                      onMouseLeave={() => setIsCartHovered(false)}
                    />
                    <div 
                      className="absolute right-0 top-full mt-2 w-[28rem] bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-50 overflow-hidden animate-slideIn"
                      onMouseEnter={() => setIsCartHovered(true)}
                      onMouseLeave={() => setIsCartHovered(false)}
                    >
                      <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600">
                        <h3 className="text-white font-bold text-2xl">Mi Carrito</h3>
                        <p className="text-orange-100 text-lg">{cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'}</p>
                      </div>
                      <div className="max-h-[32rem] overflow-y-auto">
                        {cartItems.map((item, index) => {
                          const totalItem = (item.price || 0) * (item.quantity || 1)
                          return (
                            <div key={index} className="p-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start gap-5">
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-lg truncate">{item.name}</p>
                                  <p className="text-gray-600 text-base mt-1.5">Cantidad: {item.quantity}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="font-bold text-orange-600 text-lg">${totalItem.toFixed(2)}</p>
                                  <p className="text-gray-500 text-base">${(item.price || 0).toFixed(2)} c/u</p>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="p-6 bg-gray-50 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-gray-900 text-2xl">Total:</span>
                          <span className="font-bold text-orange-600 text-3xl">
                            ${cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-white hover:text-orange-400 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 sm:w-7 sm:h-7" />
                ) : (
                  <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
                )}
              </button>
            </div>
          </div>

          {/* Menú desplegable - Mobile */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-700 bg-gray-800 py-3 sm:py-4 space-y-3 sm:space-y-4 w-full text-left px-2 sm:px-4 md:px-6">
            {/* Barra de búsqueda - Mobile */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-3 sm:pl-4 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm sm:text-base"
              />
              <Search className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            </div>

            {/* Navegación - Mobile */}
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  handleNavigation('/productos')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-left font-semibold transition-all duration-200 text-sm sm:text-base ${
                  isProductsActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-orange-400'
                }`}
              >
                Productos
              </button>
              <button
                onClick={() => {
                  handleNavigation('/carrito')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-left font-semibold transition-all duration-200 text-sm sm:text-base ${
                  isCartActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-orange-400'
                }`}
              >
                Carrito
              </button>
            </nav>

            {/* Botones de autenticación - Mobile */}
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-700">
              {isAuthenticated ? (
                <>
                  <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-2 border-orange-500/30 rounded-xl">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-md">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white font-semibold text-sm sm:text-base">{username}</span>
                  </div>
                  <button
                    onClick={() => {
                      const role = localStorage.getItem('role')
                      setIsMobileMenuOpen(false)
                      // Si ya es admin, redirigir directamente al admin
                      if (role === 'admin') {
                        handleNavigation('/admin')
                      } else {
                        // Si no es admin, abrir el modal de login
                        setIsLoginModalOpen(true)
                        setIsSignupModalOpen(false)
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-xl hover:border-orange-500 hover:text-orange-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                    {localStorage.getItem('role') === 'admin' ? 'Ir al Admin' : 'Acceder como Admin'}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-xl hover:border-orange-500 hover:text-orange-400 transition-all duration-200 font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      openLoginModal()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-md text-sm sm:text-base"
                  >
                    Iniciar Sesión
                  </button>
                  <button
                    onClick={() => {
                      openSignupModal()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border-2 border-gray-600 text-white rounded-xl hover:border-orange-500 hover:text-orange-400 transition-all duration-200 font-semibold text-sm sm:text-base"
                  >
                    Registrarse
                  </button>
                </>
              )}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Barra inferior clara con secciones */}
      <div className="bg-gray-100 border-b border-gray-200 w-full">
        <div className="w-full max-w-full px-4 sm:px-6 lg:px-8">
          <nav className="hidden lg:flex items-center justify-center gap-8 h-16">
            <button
              onClick={() => handleNavigation('/productos')}
              className={`px-6 py-3 text-2xl font-semibold transition-all duration-200 ${
                isProductsActive
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Productos
            </button>
          </nav>
        </div>
      </div>

      {/* Modales */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={closeModals}
        onSwitchToSignup={openSignupModal}
        onLoginSuccess={handleLoginSuccess}
        isClientContext={true}
      />
      <SignupModal 
        isOpen={isSignupModalOpen} 
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
        onSignupSuccess={handleSignupSuccess}
        isClientContext={true}
      />
    </header>
  )
}

export default ClientHeader

