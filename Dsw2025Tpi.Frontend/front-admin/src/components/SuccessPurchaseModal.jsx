import { useEffect } from 'react'
import { CheckCircle, Package, ShoppingBag, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function SuccessPurchaseModal({ isOpen, onClose, orderId }) {
  const navigate = useNavigate()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleContinueShopping = () => {
    onClose()
    navigate('/productos')
  }

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative animate-slideIn overflow-hidden border-2 border-orange-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/40 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/40 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative p-8 md:p-12">
          {/* Icono de éxito con animación */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Círculo exterior animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-ping opacity-20"></div>
              {/* Círculo medio */}
              <div className="absolute inset-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full"></div>
              {/* Icono principal */}
              <div className="relative bg-gradient-to-br from-green-500 to-green-600 rounded-full p-6 shadow-xl transform hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-20 h-20 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
              {/* Estrellas decorativas */}
              <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 w-6 h-6 text-orange-500 animate-pulse delay-75" />
            </div>
          </div>

          {/* Título con gradiente */}
          <div className="text-center mb-4">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-2 text-gray-900">
              ¡Compra Confirmada!
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-orange-500 mx-auto rounded-full"></div>
          </div>

          {/* Mensaje */}
          <p className="text-gray-800 text-lg md:text-xl text-center mb-8 font-semibold">
            Tu orden ha sido procesada exitosamente y está siendo preparada.
          </p>

          {/* Información adicional con diseño mejorado */}
          {orderId && (
            <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl p-6 mb-6 border-2 border-orange-200 shadow-lg relative overflow-hidden">
              {/* Patrón de fondo */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_50%)]"></div>
              </div>
              <div className="relative flex items-center gap-4 justify-center">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-3 shadow-md">
                  <Package className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-1">
                    ID de Orden
                  </p>
                  <p className="text-gray-900 text-xl md:text-2xl font-bold">
                    <span className="text-orange-600">
                      #{orderId.toString().substring(0, 8).toUpperCase()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje informativo mejorado */}
          <div className="bg-orange-50 rounded-2xl p-5 mb-8 border-2 border-orange-200 shadow-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500"></div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-gray-800 text-sm md:text-base text-center font-semibold">
                Recibirás un correo de confirmación con los detalles de tu pedido.
              </p>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75"></div>
            </div>
          </div>

          {/* Botones mejorados */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleContinueShopping}
              className="group px-10 py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 text-white rounded-2xl transition-all duration-300 font-bold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transform hover:scale-105 hover:-translate-y-1 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <ShoppingBag className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Seguir Comprando</span>
            </button>
            <button
              onClick={onClose}
              className="px-10 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessPurchaseModal

