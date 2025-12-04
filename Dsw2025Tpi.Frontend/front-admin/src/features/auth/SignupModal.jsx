import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Modal from '../../shared/components/Modal'
import logocompleto from '../../assets/bite+logocompleto.jpg'
import { alertError } from '../../shared/utils/modalUtils'

function SignupModal({ isOpen, onClose, onSwitchToLogin, onSignupSuccess, isClientContext = false }) {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
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
    const newErrors = {}
    let isValid = true

    if (!formData.username.trim()) {
      newErrors.username = 'El usuario es requerido'
      isValid = false
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
      isValid = false
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida'
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres'
      isValid = false
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
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
      // Si es desde el cliente, asignar automáticamente el rol "customer"
      const role = isClientContext ? 'customer' : 'customer' // Por defecto siempre customer desde el cliente
      
      const response = await axios.post('/api/register', {
        Username: formData.username,
        Email: formData.email,
        Password: formData.password,
        Role: role
      })
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', formData.username)
      localStorage.setItem('role', response.data.role)
      
      onClose()
      
      // Si es desde el cliente, no redirigir, solo cerrar el modal
      if (!isClientContext) {
        // Si no es desde el cliente, redirigir según el rol
        if (response.data.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/productos')
        }
      }
      
      if (onSignupSuccess) {
        onSignupSuccess()
      }
      
      // Limpiar el formulario
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error al registrar:', error)
      if (error.response?.data?.error) {
        await alertError(`Error: ${error.response.data.error}`, 'Error')
      } else {
        await alertError('Error al registrar usuario. Por favor, intenta nuevamente.', 'Error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex min-h-[600px]">
        {/* Columna izquierda - Formulario */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="w-full max-w-sm mx-auto py-4">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Crear Cuenta</h2>
              <p className="text-gray-600 text-sm">Regístrate para comenzar</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
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
                  placeholder="Elige un nombre de usuario"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.username}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
                  } bg-white shadow-sm hover:shadow-md`}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
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
                  placeholder="Mínimo 8 caracteres"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-semibold mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-400 focus:ring-red-400 focus:border-red-400' 
                      : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
                  } bg-white shadow-sm hover:shadow-md`}
                  placeholder="Repite tu contraseña"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </span>
                ) : (
                  'Crear Cuenta'
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-gray-50 text-gray-500">¿Ya tienes cuenta?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose()
                  onSwitchToLogin()
                }}
                className="w-full bg-white border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Iniciar Sesión
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

export default SignupModal

