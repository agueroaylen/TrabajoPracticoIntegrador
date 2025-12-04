import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Modal from '../../shared/components/Modal'
import logocompleto from '../../assets/bite+logocompleto.jpg'
import { alertError } from '../../shared/utils/modalUtils'

function LoginModal({ isOpen, onClose, onSwitchToSignup, onLoginSuccess, isClientContext = false }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [errors, setErrors] = useState({
    username: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {
      username: '',
      password: ''
    }
    let isValid = true

    if (!formData.username.trim()) {
      newErrors.username = 'Error'
      isValid = false
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Error'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await axios.post('/api/login', {
        Username: formData.username,
        Password: formData.password
      })
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', formData.username)
      localStorage.setItem('role', response.data.role)
      
      onClose()
      
      // Si es desde el cliente, no redirigir automáticamente, solo cerrar el modal
      // El admin puede acceder al panel a través del icono de candado
      if (!isClientContext) {
        // Redirigir según el rol solo si NO es desde el cliente
        if (response.data.role === 'admin') {
          navigate('/admin')
        } else if (response.data.role === 'customer') {
          navigate('/productos')
        }
      }
      
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setErrors({
          username: 'Error',
          password: 'Error'
        })
      } else {
        await alertError('Error al iniciar sesión. Por favor, intenta nuevamente.', 'Error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex min-h-[500px]">
        {/* Columna izquierda - Formulario */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Iniciar Sesión</h2>
              <p className="text-gray-600 text-sm">Accede a tu cuenta</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="username" 
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Usuario
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.username 
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
                  } bg-white shadow-sm hover:shadow-md`}
                  placeholder="Ingresa tu usuario"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="password" 
                  className="block text-gray-700 text-sm font-semibold mb-2"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
                  } bg-white shadow-sm hover:shadow-md`}
                  placeholder="Ingresa tu contraseña"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-gray-50 text-gray-500">¿No tienes cuenta?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose()
                  onSwitchToSignup()
                }}
                className="w-full bg-white border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Crear Cuenta
              </button>
            </form>
          </div>
        </div>

        {/* Columna derecha - Imagen */}
        <div className="hidden md:block w-1/2 relative overflow-hidden bg-white flex items-center justify-center">
          <img 
            src={logocompleto} 
            alt="Logo" 
            className="w-full h-full object-contain p-4"
          />
        </div>
      </div>
    </Modal>
  )
}

export default LoginModal

