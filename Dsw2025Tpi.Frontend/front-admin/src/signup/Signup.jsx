import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import logocompleto from '../public/bite+logocompleto.jpg'
import { alertError } from '../utils/modalUtils'

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
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
      const response = await axios.post('/api/register', {
        Username: formData.username,
        Email: formData.email,
        Password: formData.password,
        Role: formData.role
      })
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', formData.username)
      
      // Redirigir según el rol
      if (formData.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/login')
      }
    } catch (error) {
      if (error.response?.data?.error) {
        await alertError(error.response.data.error, 'Error')
      } else {
        await alertError('Error al registrar usuario. Por favor, intenta nuevamente.', 'Error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-screen flex overflow-hidden">
      {/* Columna izquierda - Formulario */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md my-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
            <p className="text-gray-600 text-lg">Regístrate para comenzar</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
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
            
            <div>
              <label htmlFor="role" className="block text-gray-700 text-sm font-semibold mb-2">
                Tipo de Cuenta
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <option value="customer">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">¿Ya tienes cuenta?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-white border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>

      {/* Columna derecha - Imagen */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden bg-white">
        <img 
          src={logocompleto} 
          alt="Logo" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

export default Signup

