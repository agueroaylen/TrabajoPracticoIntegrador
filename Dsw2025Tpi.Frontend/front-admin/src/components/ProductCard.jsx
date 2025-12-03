import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(0)

  const handleIncrease = () => {
    if (quantity < product.stockQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1)
    }
  }

  const handleAddToCart = () => {
    if (quantity > 0) {
      onAddToCart(product, quantity)
      setQuantity(0)
    }
  }

  return (
    <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex flex-col h-full w-full shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1">
      {/* Imagen placeholder */}
      <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4 flex items-center justify-center flex-shrink-0">
        <div className="text-gray-400 text-3xl sm:text-4xl md:text-5xl">📦</div>
      </div>

      {/* Información del producto */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-gray-900 font-bold mb-2 sm:mb-3 text-sm sm:text-base md:text-lg line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{product.name || 'Text'}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
          <span className="text-orange-600 font-bold text-base sm:text-lg md:text-xl">${product.currentUnitPrice.toFixed(2)}</span>
          
          {/* Selector de cantidad */}
          <div className="flex items-center justify-center sm:justify-end space-x-2">
            <button
              onClick={handleDecrease}
              disabled={quantity === 0}
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
            <span className="w-7 sm:w-8 md:w-10 text-center text-gray-800 font-bold text-sm sm:text-base md:text-lg">{quantity}</span>
            <button
              onClick={handleIncrease}
              disabled={quantity >= product.stockQuantity}
              className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Botón Agregar */}
      <button
        onClick={handleAddToCart}
        disabled={quantity === 0}
        className="mt-auto w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 sm:py-2.5 md:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        Agregar al Carrito
      </button>
    </div>
  )
}

export default ProductCard

