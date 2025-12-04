import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import axios from 'axios'
import ClientHeader from '../../shared/layout/ClientHeader'
import LoginModal from '../../features/auth/LoginModal'
import SignupModal from '../../features/auth/SignupModal'
import Modal from '../../shared/components/Modal'
import SuccessPurchaseModal from '../../features/cart/SuccessPurchaseModal'
import { Plus, Minus } from 'lucide-react'
import { alertError, alertWarning } from '../../shared/utils/modalUtils'

function ClientCart() {
  const location = useLocation()
  const [cart, setCart] = useState([])
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [addresses, setAddresses] = useState({
    shippingAddress: '',
    billingAddress: ''
  })
  const [addressErrors, setAddressErrors] = useState({
    shippingAddress: '',
    billingAddress: ''
  })

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
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }
    
    // Verificar si el usuario está autenticado
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const role = localStorage.getItem('role')
      if (token && role === 'customer') {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()

    // Escuchar cambios en la autenticación
    const handleAuthChange = () => {
      checkAuth()
    }

    window.addEventListener('authChange', handleAuthChange)

    return () => {
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [])

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Disparar evento para actualizar el badge del carrito en el header
    window.dispatchEvent(new Event('cartChange'))
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }
    const updatedCart = cart.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    )
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Disparar evento para actualizar el badge del carrito en el header
    window.dispatchEvent(new Event('cartChange'))
  }

  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setAddresses(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (addressErrors[name]) {
      setAddressErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateAddresses = () => {
    const newErrors = {
      shippingAddress: '',
      billingAddress: ''
    }
    let isValid = true

    if (!addresses.shippingAddress.trim()) {
      newErrors.shippingAddress = 'La dirección de envío es requerida'
      isValid = false
    }

    if (!addresses.billingAddress.trim()) {
      newErrors.billingAddress = 'La dirección de facturación es requerida'
      isValid = false
    }

    setAddressErrors(newErrors)
    return isValid
  }

  const handleFinalizePurchase = async () => {
    // Verificar si el usuario está autenticado (debe tener token, username y role de customer)
    const token = localStorage.getItem('token')
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('role')
    
    if (!token || !username || role !== 'customer') {
      // Si no está autenticado, abrir el modal de login para que se registre o inicie sesión
      setIsLoginModalOpen(true)
      return
    }

    // Validar que el carrito no esté vacío
    if (cart.length === 0) {
      await alertWarning('El carrito está vacío', 'Carrito Vacío')
      return
    }

    // Abrir modal de direcciones
    setIsAddressModalOpen(true)
  }

  const handleConfirmPurchase = async () => {
    // Validar direcciones
    if (!validateAddresses()) {
      return
    }

    const username = localStorage.getItem('username')

    try {
      // Preparar los items de la orden (usar PascalCase para coincidir con el backend)
      const orderItems = cart.map(item => ({
        ProductId: item.productId,
        Quantity: item.quantity
      }))

      // Crear la orden con las direcciones proporcionadas
      const response = await axios.post('http://localhost:5142/api/Orders', {
        Username: username,
        ShippingAddress: addresses.shippingAddress.trim(),
        BillingAddress: addresses.billingAddress.trim(),
        OrderItems: orderItems
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      // Guardar el ID de la orden
      const createdOrderId = response.data?.id || response.data?.Id || null
      setOrderId(createdOrderId)

      // Limpiar el carrito y direcciones
      setCart([])
      localStorage.removeItem('cart')
      // Disparar evento para actualizar el badge del carrito en el header
      window.dispatchEvent(new Event('cartChange'))
      setAddresses({
        shippingAddress: '',
        billingAddress: ''
      })
      setIsAddressModalOpen(false)

      // Mostrar modal de éxito
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error('Error al finalizar la compra:', error)
      console.error('Error response:', error.response)
      console.error('Error response data:', error.response?.data)
      console.error('Error response status:', error.response?.status)
      
      if (error.response?.status === 404) {
        const errorDetail = error.response?.data?.error || error.response?.data?.message || 'Endpoint no encontrado'
        await alertError(`Error 404: ${errorDetail}\n\nVerifica:\n1. Que el backend esté corriendo en http://localhost:5142\n2. Que el endpoint POST /api/Orders esté disponible en Swagger\n3. Que tengas un token válido`, 'Error de Conexión')
      } else if (error.response?.status === 401) {
        await alertWarning('Su sesión ha expirado. Por favor, inicie sesión nuevamente.', 'Sesión Expirada')
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        setIsAuthenticated(false)
        setIsAddressModalOpen(false)
        setIsLoginModalOpen(true)
      } else if (error.response?.status === 403) {
        await alertError('No tienes permisos para realizar esta acción. Verifica que tu rol sea "customer".', 'Sin Permisos')
      } else if (error.response?.data?.error) {
        await alertError(`Error: ${error.response.data.error}`, 'Error')
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        await alertError('No se pudo conectar con el servidor. Asegúrate de que el API backend esté corriendo en http://localhost:5142', 'Error de Conexión')
      } else {
        await alertError(`Error al finalizar la compra: ${error.message || 'Por favor, intenta nuevamente.'}`, 'Error')
      }
    }
  }

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setIsLoginModalOpen(false)
    // Disparar evento para actualizar el header
    window.dispatchEvent(new Event('authChange'))
  }

  const handleSignupSuccess = () => {
    setIsAuthenticated(true)
    setIsSignupModalOpen(false)
    // Disparar evento para actualizar el header
    window.dispatchEvent(new Event('authChange'))
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white grid grid-rows-[auto_1fr] w-full max-w-full overflow-x-hidden animate-fadeIn">
      <ClientHeader searchQuery="" onSearchChange={() => {}} />
      
      <main className="w-full max-w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 animate-slideIn">
        {/* Modales de autenticación */}
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

        {/* Modal de compra exitosa */}
        <SuccessPurchaseModal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false)
            setOrderId(null)
          }}
          orderId={orderId}
        />
        
        {/* Modal de direcciones */}
        <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)}>
          <div className="p-8 md:p-10 lg:p-12 max-h-[90vh] overflow-y-auto">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">Direcciones de Envío y Facturación</h2>
              <p className="text-gray-600 text-lg md:text-xl">Por favor, completa las direcciones para finalizar tu compra</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleConfirmPurchase(); }} className="space-y-6 md:space-y-8">
              <div className="bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 rounded-2xl border-2 border-gray-100 shadow-md">
                <label 
                  htmlFor="shippingAddress" 
                  className="block text-gray-900 text-lg md:text-xl font-bold mb-4"
                >
                  📦 Dirección de Envío <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="shippingAddress"
                  name="shippingAddress"
                  value={addresses.shippingAddress}
                  onChange={handleAddressChange}
                  rows="4"
                  className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base md:text-lg ${
                    addressErrors.shippingAddress 
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
                  } bg-white shadow-sm hover:shadow-md resize-none`}
                  placeholder="Ingresa tu dirección completa de envío (calle, número, ciudad, código postal, etc.)"
                />
                {addressErrors.shippingAddress && (
                  <p className="text-red-500 text-base mt-3 flex items-center">
                    <span className="mr-2">⚠️</span>
                    {addressErrors.shippingAddress}
                  </p>
                )}
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-6 md:p-8 rounded-2xl border-2 border-gray-100 shadow-md">
                <label 
                  htmlFor="billingAddress" 
                  className="block text-gray-900 text-lg md:text-xl font-bold mb-4"
                >
                  🧾 Dirección de Facturación <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="billingAddress"
                  name="billingAddress"
                  value={addresses.billingAddress}
                  onChange={handleAddressChange}
                  rows="4"
                  className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base md:text-lg ${
                    addressErrors.billingAddress 
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
                  } bg-white shadow-sm hover:shadow-md resize-none`}
                  placeholder="Ingresa tu dirección completa de facturación (calle, número, ciudad, código postal, etc.)"
                />
                {addressErrors.billingAddress && (
                  <p className="text-red-500 text-base mt-3 flex items-center">
                    <span className="mr-2">⚠️</span>
                    {addressErrors.billingAddress}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all duration-200 font-semibold text-lg shadow-sm hover:shadow-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Confirmar Compra
                </button>
              </div>
            </form>
          </div>
        </Modal>

        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-extrabold text-gray-900 mb-2 sm:mb-3 lg:mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>Mi Carrito</h1>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-2xl font-medium">Revisa tus productos antes de finalizar</p>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🛒</div>
            <p className="text-gray-600 text-base sm:text-lg md:text-xl">Tu carrito está vacío</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-5 md:gap-6 lg:gap-8 w-full">
            {/* Sección izquierda - Productos del carrito */}
            <div className="space-y-3 sm:space-y-4">
              {cart.map((item) => (
                <div key={item.productId} className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Información del producto */}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl mb-2 sm:mb-3">{item.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <p className="text-gray-600 text-xs sm:text-sm">Cantidad: <span className="font-semibold text-orange-600">{item.quantity}</span></p>
                        <p className="text-gray-900 font-bold text-base sm:text-lg">Sub Total: <span className="text-orange-600">${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span></p>
                      </div>
                    </div>

                    {/* Controles de cantidad y botón borrar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                      {/* Selector de cantidad */}
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                        >
                          <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                        <span className="w-10 sm:w-12 text-center text-gray-900 font-bold text-base sm:text-lg">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-white border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Botón Borrar */}
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sección derecha - Detalle de pedido */}
            <div className="lg:sticky lg:top-28 h-fit">
              <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 shadow-xl">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">Resumen del Pedido</h2>
                
                <div className="space-y-4 sm:space-y-5 lg:space-y-6 mb-4 sm:mb-6 lg:mb-8">
                  <div className="pb-3 sm:pb-4 lg:pb-5 border-b border-gray-200">
                    <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2 lg:mb-3">Cantidad total de productos:</p>
                    <p className="text-gray-900 font-bold text-xl sm:text-2xl lg:text-3xl">{totalQuantity}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2 lg:mb-3">Total a pagar:</p>
                    <p className="text-orange-600 font-bold text-2xl sm:text-3xl lg:text-4xl">${total.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>

                <button
                  onClick={handleFinalizePurchase}
                  className="w-full px-4 sm:px-5 md:px-6 lg:px-8 py-3 sm:py-3.5 md:py-4 lg:py-5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl transition-all duration-200 font-semibold text-base sm:text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default ClientCart

