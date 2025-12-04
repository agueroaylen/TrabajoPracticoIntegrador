import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LayoutDashboard, Package, FileText } from 'lucide-react'

function Sidebar({ activeItem }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  
  // En mobile siempre comprimido, en desktop usar localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Verificar si estamos en el cliente (no SSR)
    if (typeof window === 'undefined') return false
    
    // En mobile (pantallas pequeñas), siempre comprimido
    if (window.innerWidth < 1024) {
      return true
    }
    const saved = localStorage.getItem('sidebarCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      // En mobile siempre comprimido
      if (mobile) {
        setIsCollapsed(true)
      }
    }

    // Verificar al montar
    checkMobile()

    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Guardar el estado en localStorage cuando cambie (solo en desktop)
  useEffect(() => {
    // Solo guardar si no es mobile
    if (!isMobile && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed))
    }
  }, [isCollapsed, isMobile])

  const menuItems = [
    { path: '/admin', label: 'Principal', key: 'Principal', icon: LayoutDashboard },
    { path: '/admin/productos', label: 'Productos', key: 'Productos', icon: Package },
    { path: '/admin/ordenes', label: 'Ordenes', key: 'Ordenes', icon: FileText }
  ]

  const handleNavigation = (path) => {
    navigate(path)
  }

  const isActive = (key) => {
    if (key === 'Principal') {
      return location.pathname === '/admin'
    }
    return location.pathname.includes(key.toLowerCase())
  }

  return (
    <aside className={`bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 overflow-y-auto shadow-sm relative z-20 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16 sm:w-20' : 'w-64 lg:w-72'
    }`}>
      <div className={`p-4 sm:p-5 md:p-6 ${isCollapsed ? 'px-2' : ''}`}>
        {/* Botón de toggle - oculto en mobile */}
        <div className={`flex justify-end mb-4 ${isMobile ? 'hidden' : ''}`}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              // Solo permitir toggle en desktop
              if (!isMobile) {
                setIsCollapsed(!isCollapsed)
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-900"
            title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            type="button"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="space-y-2 sm:space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.key}
                onClick={(e) => {
                  e.stopPropagation()
                  handleNavigation(item.path)
                }}
                className={`w-full flex items-center gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl transition-all duration-200 font-semibold text-base sm:text-lg lg:text-xl ${
                  isCollapsed ? 'justify-center px-2' : 'text-left'
                } ${
                  isActive(item.key)
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
                title={isCollapsed ? item.label : ''}
                type="button"
              >
                <Icon className={`flex-shrink-0 ${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            )
          })}
          {!isCollapsed && (
            <div className="border-t border-gray-200 mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6"></div>
          )}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar

