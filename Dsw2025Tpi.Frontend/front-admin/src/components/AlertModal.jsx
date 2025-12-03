import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react'

function AlertModal({ isOpen, onClose, title, message, type = 'info' }) {
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

  const iconConfig = {
    success: { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-50' },
    error: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' },
    warning: { icon: AlertCircle, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50' }
  }

  const config = iconConfig[type] || iconConfig.info
  const Icon = config.icon

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative animate-slideIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className={`${config.bgColor} rounded-full p-3 flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-gray-600 text-base md:text-lg">
                {message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg ${
                type === 'success'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                  : type === 'error'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : type === 'warning'
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
              }`}
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlertModal

