namespace Dsw2025Tpi.Application.Constants
{
    public static class ErrorMessages
    {
        // Productos
        public const string SkuRequired = "El SKU es obligatorio.";
        public const string NameRequired = "El nombre es obligatorio.";
        public const string PriceMustBePositive = "El precio debe ser mayor a 0.";
        public const string StockCannotBeNegative = "El stock no puede ser negativo.";
        public const string SkuAlreadyExists = "Ya existe un producto con ese SKU.";
        public const string ProductNotFound = "Producto no encontrado o inactivo.";
        public const string InsufficientStock = "No hay stock suficiente para el producto."; 

        // Ordenes
        public const string OrderNotFound = "Orden no encontrada."; 
        public const string InvalidOrderStatus = "El estado ingresado no es valido. Estados validos: Pending, Processing, Shipped, Delivered o Cancelled."; 
        public const string InvalidStatusTransition = "Transición inválida de estado: {0} → {1}.";
        public const string OrderMustContainItems = "La orden debe contener al menos un producto.";
        public const string QuantityMustBeGreaterThanZero = "La cantidad para el producto {0} debe ser mayor a 0.";
        public const string CustomerNotFound = "Cliente no encontrado.";

        // Autorizacion y autenticacion
        public const string UnauthorizedAccess = "No estás autenticado como cliente ni como administrador.";
        public const string ForbiddenAccess = "No tenés permisos para acceder a este recurso.";
        public const string InvalidCredentials = "Usuario o contraseña incorrectos.";
        

    }
}
