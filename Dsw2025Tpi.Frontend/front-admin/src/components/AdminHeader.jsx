import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, Store } from 'lucide-react'
import logo from '../public/logosinfondo.png'

function AdminHeader() {
  const navigate = useNavigate()
  const location = useLocation()
  const username = localStorage.getItem('username') || 'Admin'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    navigate('/login')
  }

  const handleNavigation = (path) => {
    navigate(path)
  }

  return (
    <header className="w-full bg-white shadow-md overflow-visible relative z-10">
      {/* Barra superior oscura */}
      <div className="bg-gray-800 w-full border-b border-gray-700">
        <div className="w-full max-w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center h-16 sm:h-18 md:h-20 lg:h-24 gap-2 sm:gap-3 md:gap-4">
            {/* Logo */}
            <div className="flex items-center justify-center flex-shrink-0 overflow-visible relative" style={{ width: '200px', height: '100%' }}>
              <img 
                src={logo} 
                alt="Bite Logo" 
                className="h-24 sm:h-28 md:h-32 lg:h-56 object-contain cursor-pointer"
                style={{ transform: 'translateY(4px) translateX(-20px)' }}
                onClick={() => handleNavigation('/admin')}
              />
            </div>

            {/* Espaciador */}
            <div className="flex-1"></div>

            {/* Botones de usuario y logout - Desktop */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
              <div className="flex items-center gap-4 text-white">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-lg">{username}</span>
              </div>
              <button
                onClick={() => handleNavigation('/productos')}
                className="text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                title="Ver tienda"
              >
                <Store className="w-7 h-7" />
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-orange-400 transition-colors flex items-center gap-2"
                title="Cerrar sesión"
              >
                <LogOut className="w-7 h-7" />
              </button>
            </div>

            {/* Botones móviles - Tienda y Logout */}
            <div className="lg:hidden flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={() => handleNavigation('/productos')}
                className="text-white hover:text-orange-400 transition-colors p-1.5"
                title="Ver tienda"
              >
                <Store className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
              <button
                onClick={handleLogout}
                className="text-white hover:text-orange-400 transition-colors p-1.5"
                title="Cerrar sesión"
              >
                <LogOut className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminHeader
