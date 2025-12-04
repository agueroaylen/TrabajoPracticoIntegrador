import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import logocompleto from '../../assets/bite+logocompleto.jpg'
import { alertError } from '../../shared/utils/modalUtils'

// Credenciales del UserSeeder:
// Admin: usuario="admin", password="Admin123*"
// Cliente: usuario="customer", password="Customer123*"

function LoginPage() {
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
    // Limpiar error cuando el usuario empieza a escribir
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
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', formData.username)
      localStorage.setItem('role', response.data.role)
      
      // Redirigir según el rol
      if (response.data.role === 'admin') {
        navigate('/admin')
      } else if (response.data.role === 'customer') {
        // Redirigir a la página de productos del cliente
        navigate('/productos')
      } else {
        // Por defecto, redirigir al admin
        navigate('/admin')
      }
    } catch (error) {
      console.error('Error completo:', error)
      console.error('Response:', error.response)
      if (error.response?.status === 401) {
        setErrors({
          username: 'Error',
          password: 'Error'
        })
        const errorMessage = error.response?.data?.error || 'Credenciales incorrectas. Verifica tu usuario y contraseña.'
        await alertError(errorMessage, 'Error de Autenticación')
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.error || 'Error interno del servidor. Verifica que el backend esté corriendo y la base de datos esté inicializada.'
        await alertError(`Error del servidor: ${errorMessage}`, 'Error del Servidor')
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        await alertError('No se pudo conectar con el servidor. Asegúrate de que el API backend esté corriendo en http://localhost:5142', 'Error de Conexión')
      } else {
        console.error('Error detallado:', error)
        const errorMessage = error.response?.data?.error || error.message || 'Por favor, intenta nuevamente.'
        await alertError(`Error al iniciar sesión: ${errorMessage}`, 'Error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    navigate('/signup')
  }

  return (
    <div className="min-h-screen w-screen flex overflow-hidden">
      {/* Columna izquierda - Formulario */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Bienvenido</h1>
            <p className="text-gray-600 text-lg">Inicia sesión en tu cuenta</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">¿No tienes cuenta?</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRegister}
              className="w-full bg-white border-2 border-gray-300 hover:border-orange-500 text-gray-700 hover:text-orange-600 font-semibold py-3.5 px-4 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Crear Cuenta
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

export default LoginPage

