# Documentación Completa del Proyecto Dsw2025Tpi

## Índice
1. [Arquitectura General](#arquitectura-general)
2. [Backend - Estructura y Archivos](#backend---estructura-y-archivos)
3. [Frontend - Estructura y Archivos](#frontend---estructura-y-archivos)
4. [Flujo de Datos](#flujo-de-datos)
5. [Configuración y Dependencias](#configuración-y-dependencias)

---

## Arquitectura General

El proyecto sigue una arquitectura en capas (Layered Architecture) con separación de responsabilidades:

- **Dsw2025Tpi.Domain**: Capa de dominio con entidades e interfaces
- **Dsw2025Tpi.Data**: Capa de acceso a datos (Entity Framework Core, DbContext, Repositorios)
- **Dsw2025Tpi.Application**: Capa de lógica de negocio (Servicios, DTOs, Excepciones)
- **Dsw2025Tpi.Api**: Capa de presentación (Controllers, Middlewares, Configuración)
- **Dsw2025Tpi.Frontend**: Aplicación React con Vite

---

## Backend - Estructura y Archivos

### 📁 Dsw2025Tpi.Domain

Capa de dominio que contiene las entidades del negocio y contratos.

#### **Entities/EntityBase.cs**
- **Propósito**: Clase base abstracta para todas las entidades del dominio
- **Propiedades**:
  - `Id` (Guid): Identificador único de la entidad
- **Uso**: Todas las entidades (Product, Order, Customer, OrderItem) heredan de esta clase

#### **Entities/Product.cs**
- **Propósito**: Representa un producto en el catálogo
- **Propiedades**:
  - `Sku` (string): Código SKU del producto
  - `InternalCode` (string): Código interno
  - `Name` (string): Nombre del producto
  - `Description` (string): Descripción del producto
  - `CurrentUnitPrice` (decimal): Precio unitario actual
  - `StockQuantity` (int): Cantidad en stock
  - `IsActive` (bool): Indica si el producto está activo (por defecto: true)

#### **Entities/Customer.cs**
- **Propósito**: Representa un cliente del sistema
- **Propiedades**:
  - `EMail` (string): Email del cliente
  - `Name` (string): Nombre del cliente
  - `PhoneNumber` (string): Número de teléfono (opcional)
  - `Orders` (ICollection<Order>): Colección de órdenes del cliente

#### **Entities/Order.cs**
- **Propósito**: Representa una orden de compra
- **Propiedades**:
  - `CustomerId` (Guid): ID del cliente que realizó la orden
  - `Customer` (Customer): Referencia al cliente
  - `ShippingAddress` (string): Dirección de envío
  - `BillingAddress` (string): Dirección de facturación
  - `Status` (OrderStatus): Estado de la orden (por defecto: PENDING)
  - `OrderDate` (DateTime): Fecha de la orden (por defecto: DateTime.UtcNow)
  - `TotalAmount` (decimal): Monto total de la orden
  - `OrderItems` (List<OrderItem>): Lista de items de la orden

#### **Entities/OrderItem.cs**
- **Propósito**: Representa un item individual dentro de una orden
- **Propiedades**:
  - `OrderId` (Guid): ID de la orden a la que pertenece
  - `Order` (Order): Referencia a la orden
  - `ProductId` (Guid): ID del producto
  - `Product` (Product): Referencia al producto
  - `Quantity` (int): Cantidad del producto
  - `UnitPrice` (decimal): Precio unitario al momento de la compra
  - `Name` (string): Nombre del producto (snapshot)
  - `Description` (string): Descripción del producto (snapshot)
  - `SubTotal` (decimal): Subtotal del item (Quantity * UnitPrice)

#### **Entities/OrderStatus.cs**
- **Propósito**: Enum que define los estados posibles de una orden
- **Valores**:
  - `PENDING`: Orden pendiente
  - `PROCESSING`: Orden en procesamiento
  - `SHIPPED`: Orden enviada
  - `DELIVERED`: Orden entregada
  - `CANCELLED`: Orden cancelada

#### **Interfaces/IRepository.cs**
- **Propósito**: Interfaz genérica para repositorios
- **Métodos**: Define contratos para operaciones CRUD básicas
- **Uso**: Base para implementaciones de repositorios

---

### 📁 Dsw2025Tpi.Data

Capa de acceso a datos que maneja la persistencia con Entity Framework Core.

#### **Dsw2025TpiContext.cs**
- **Propósito**: DbContext principal para las entidades de negocio (Product, Order, Customer, OrderItem)
- **Configuración**:
  - Configura las relaciones entre entidades
  - Define restricciones y validaciones a nivel de base de datos
  - Configura `PhoneNumber` y `Description` como opcionales
- **DbSets**:
  - `Products`: Tabla de productos
  - `Orders`: Tabla de órdenes
  - `Customers`: Tabla de clientes
  - `OrderItems`: Tabla de items de orden

#### **AuthenticateContext.cs**
- **Propósito**: DbContext para ASP.NET Core Identity (usuarios y roles)
- **Uso**: Gestiona la autenticación y autorización del sistema
- **Tablas**: Usuarios, Roles, Claims, Logins, Tokens (generadas por Identity)

#### **Repositories/EfRepository.cs**
- **Propósito**: Implementación genérica del repositorio usando Entity Framework Core
- **Funcionalidad**: Proporciona operaciones CRUD genéricas para cualquier entidad

#### **Seed/CustomerSeeder.cs**
- **Propósito**: Seeder para poblar la base de datos con clientes iniciales
- **Funcionalidad**:
  - Lee datos desde `Sources/customers.json`
  - Solo inserta clientes si la tabla está vacía
  - Deserializa JSON y guarda en la base de datos

#### **Seed/UserSeeder.cs**
- **Propósito**: Seeder para crear usuarios y roles iniciales del sistema
- **Funcionalidad**:
  - Crea los roles "admin" y "customer" si no existen
  - Crea usuarios de prueba:
    - Usuario "admin" con contraseña "Admin123*" y rol "admin"
    - Usuario "customer" con contraseña "Customer123*" y rol "customer"

#### **Sources/customers.json**
- **Propósito**: Archivo JSON con datos de clientes para el seeder
- **Formato**: Array de objetos Customer con propiedades Id, Name, EMail, PhoneNumber

---

### 📁 Dsw2025Tpi.Application

Capa de lógica de negocio que contiene servicios, DTOs y excepciones.

#### **Services/AuthService.cs**
- **Propósito**: Servicio de autenticación usando ASP.NET Core Identity
- **Dependencias**:
  - `UserManager<IdentityUser>`: Gestión de usuarios
  - `SignInManager<IdentityUser>`: Gestión de sesiones
  - `RoleManager<IdentityRole>`: Gestión de roles
  - `JwtTokenService`: Generación de tokens JWT
- **Métodos**:
  - `LoginAsync(string username, string password)`: Autentica un usuario y retorna token y rol
  - `RegisterAsync(string username, string email, string password, string role)`: Registra un nuevo usuario y asigna un rol

#### **Services/JwtTokenService.cs**
- **Propósito**: Servicio para generar y validar tokens JWT
- **Funcionalidad**:
  - Genera tokens JWT con claims de usuario y rol
  - Configura expiración y firma del token
  - Usa configuración desde `appsettings.json`

#### **Services/OrderManagementService.cs**
- **Propósito**: Servicio de gestión de órdenes
- **Funcionalidad**:
  - `CreateOrderAsync`: Crea una nueva orden validando stock y productos
  - `GetAllOrdersAsync`: Obtiene órdenes con filtros (estado, cliente) y paginación
  - `GetOrderByIdAsync`: Obtiene una orden por ID
  - `UpdateOrderStatusAsync`: Actualiza el estado de una orden validando transiciones permitidas
- **Validaciones**:
  - Verifica stock suficiente antes de crear orden
  - Valida transiciones de estado (ej: PENDING → PROCESSING, no PENDING → DELIVERED directamente)
  - Reduce stock automáticamente al crear orden

#### **Services/ProductManagementService.cs**
- **Propósito**: Servicio de gestión de productos
- **Funcionalidad**:
  - `CreateProductAsync`: Crea un nuevo producto
  - `GetAllProductsAsync`: Obtiene todos los productos activos
  - `GetProductByIdAsync`: Obtiene un producto por ID
  - `UpdateProductAsync`: Actualiza un producto existente
  - `DisableProductAsync`: Deshabilita un producto (soft delete)

#### **Services/InMemoryAuthService.cs**
- **Propósito**: Implementación en memoria del servicio de autenticación (para desarrollo/testing)
- **Uso**: Alternativa a `AuthService` cuando no se requiere base de datos

#### **Services/Interfaces/IAuthService.cs**
- **Propósito**: Interfaz del servicio de autenticación
- **Métodos**: Define contratos para LoginAsync y RegisterAsync

#### **Services/Interfaces/IOrderManagementService.cs**
- **Propósito**: Interfaz del servicio de gestión de órdenes
- **Métodos**: Define contratos para todas las operaciones de órdenes

#### **Services/Interfaces/IProductManagementService.cs**
- **Propósito**: Interfaz del servicio de gestión de productos
- **Métodos**: Define contratos para todas las operaciones de productos

#### **Dtos/LoginModel.cs**
- **Propósito**: DTO para solicitud de login
- **Propiedades**: `Username`, `Password`

#### **Dtos/LoginResponse.cs**
- **Propósito**: DTO para respuesta de login
- **Propiedades**: `Token` (string), `Role` (string)

#### **Dtos/RegisterModel.cs**
- **Propósito**: DTO para solicitud de registro
- **Propiedades**: `Username`, `Email`, `Password`, `Role`

#### **Dtos/ProductModel.cs**
- **Propósito**: DTOs relacionados con productos
- **Clases**:
  - `ProductRequest`: Para crear/actualizar productos
  - `ProductResponse`: Para retornar datos de productos

#### **Dtos/OrderModel.cs**
- **Propósito**: DTOs relacionados con órdenes
- **Clases**:
  - `OrderRequest`: Para crear órdenes
  - `OrderItemRequest`: Para items de orden
  - `OrderResponse`: Para retornar datos de órdenes
  - `OrderItemResponse`: Para items de orden en respuesta
  - `UpdateStatusRequest`: Para actualizar estado de orden

#### **Exceptions/AuthenticationException.cs**
- **Propósito**: Excepción para errores de autenticación (401)
- **Uso**: Lanzada cuando las credenciales son inválidas

#### **Exceptions/AuthorizationException.cs**
- **Propósito**: Excepción para errores de autorización (403)
- **Uso**: Lanzada cuando el usuario no tiene permisos

#### **Exceptions/BusinessException.cs**
- **Propósito**: Excepción para errores de negocio (400)
- **Uso**: Lanzada para validaciones de reglas de negocio

#### **Constants/ErrorMessages.cs**
- **Propósito**: Constantes con mensajes de error estandarizados
- **Uso**: Centraliza todos los mensajes de error para facilitar mantenimiento

---

### 📁 Dsw2025Tpi.Api

Capa de presentación que expone los endpoints REST y configura la aplicación.

#### **Program.cs**
- **Propósito**: Punto de entrada y configuración principal de la aplicación
- **Configuraciones**:
  - **CORS**: Permite requests desde `localhost:3000`, `3003`, `3004`
  - **DbContexts**: Configura `Dsw2025TpiContext` y `AuthenticateContext` con MySQL
  - **Identity**: Configura ASP.NET Core Identity con validaciones de contraseña
  - **JWT**: Configura autenticación JWT con validación de tokens
  - **Swagger**: Configura documentación de API con autenticación Bearer
  - **Servicios**: Registra servicios de aplicación (ProductManagementService, OrderManagementService, AuthService)
  - **Middleware**: Registra `ErrorHandlingMiddleware` para manejo global de excepciones
  - **Inicialización DB**: Ejecuta seeders al iniciar la aplicación

#### **Controllers/AuthController.cs**
- **Propósito**: Controlador para autenticación y registro
- **Endpoints**:
  - `POST /api/login`: Autentica un usuario y retorna token JWT y rol
  - `POST /api/register`: Registra un nuevo usuario
    - Si el rol es "customer", crea automáticamente un registro en la tabla `Customers`
- **Validaciones**: Verifica que los campos requeridos no estén vacíos

#### **Controllers/ProductsController.cs**
- **Propósito**: Controlador para gestión de productos
- **Endpoints**:
  - `POST /api/products`: Crea un producto (requiere rol "admin")
  - `GET /api/products`: Obtiene todos los productos (público)
  - `GET /api/products/{id}`: Obtiene un producto por ID (público)
  - `PUT /api/products/{id}`: Actualiza un producto (requiere rol "admin")
  - `PATCH /api/products/{id}`: Deshabilita un producto (requiere rol "admin")

#### **Controllers/OrdersController.cs**
- **Propósito**: Controlador para gestión de órdenes
- **Endpoints**:
  - `POST /api/Orders`: Crea una orden (sin autenticación requerida, pero requiere username)
    - Si el cliente no existe, lo crea automáticamente
  - `GET /api/Orders`: Obtiene todas las órdenes con filtros (requiere autenticación, roles: "admin", "customer")
  - `GET /api/Orders/{id}`: Obtiene una orden por ID (requiere autenticación, roles: "admin", "customer")
  - `PUT /api/Orders/{id}/status`: Actualiza el estado de una orden (requiere rol "admin")

#### **Middlewares/ErrorHandlingMiddleware.cs**
- **Propósito**: Middleware global para manejo de excepciones
- **Funcionalidad**:
  - Captura todas las excepciones no manejadas
  - Mapea excepciones a códigos HTTP apropiados:
    - `BusinessException` → 400 (Bad Request)
    - `AuthenticationException` → 401 (Unauthorized)
    - `AuthorizationException` → 403 (Forbidden)
    - `KeyNotFoundException` → 404 (Not Found)
    - Otras excepciones → 500 (Internal Server Error)
  - Retorna respuestas JSON con mensajes de error

#### **appsettings.json**
- **Propósito**: Archivo de configuración de la aplicación
- **Configuraciones**:
  - `ConnectionStrings`: Cadenas de conexión a MySQL
    - `DefaultConnection`: Base de datos principal (dsw2025tpi)
    - `AuthConnection`: Base de datos de autenticación (dsw2025tpi_auth)
  - `Jwt`: Configuración de tokens JWT (Key, Issuer, Audience)

#### **Properties/launchSettings.json**
- **Propósito**: Configuración de inicio de la aplicación
- **Configuraciones**: URLs, perfiles de ejecución, variables de entorno

---

## Frontend - Estructura y Archivos

### 📁 Dsw2025Tpi.Frontend/front-admin

Aplicación React con Vite que sirve tanto para administración como para cliente.

#### **src/main.jsx**
- **Propósito**: Punto de entrada de la aplicación React
- **Funcionalidad**: Renderiza el componente `App` en el DOM

#### **src/App.jsx**
- **Propósito**: Componente raíz que define las rutas de la aplicación
- **Rutas**:
  - `/login`: Página de login
  - `/signup`: Página de registro
  - `/admin`: Dashboard del administrador
  - `/admin/productos`: Gestión de productos (admin)
  - `/admin/ordenes`: Gestión de órdenes (admin)
  - `/productos`: Catálogo de productos (cliente)
  - `/carrito`: Carrito de compras (cliente)
- **Funcionalidad**: Maneja redirección de tokens desde URL (para comunicación entre puertos)

#### **src/index.css**
- **Propósito**: Estilos globales de la aplicación
- **Uso**: Configuración de Tailwind CSS y estilos base

#### **pages/Dashboard.jsx**
- **Propósito**: Página principal del panel de administración
- **Funcionalidad**: Muestra resumen general, estadísticas y acceso rápido a secciones

#### **pages/Products.jsx**
- **Propósito**: Página de gestión de productos para administradores
- **Funcionalidades**:
  - Lista todos los productos con paginación
  - Búsqueda por nombre
  - Filtro por estado (activo/inactivo)
  - Crear nuevo producto (formulario modal)
  - Editar producto existente
  - Deshabilitar producto
  - Muestra SKU, código interno, nombre, precio, stock
- **Autenticación**: Requiere token y rol "admin"

#### **pages/Orders.jsx**
- **Propósito**: Página de gestión de órdenes para administradores
- **Funcionalidades**:
  - Lista todas las órdenes con paginación
  - Filtro por estado (Pendiente, Entregado)
  - Ver detalles de orden en modal
  - Actualizar estado de orden (Pendiente/Entregado)
  - Muestra ID, cliente, fecha, monto total, estado
- **Autenticación**: Requiere token y rol "admin"

#### **pages/ClientProducts.jsx**
- **Propósito**: Página de catálogo de productos para clientes
- **Funcionalidades**:
  - Muestra productos activos en formato de tarjetas
  - Búsqueda de productos
  - Agregar productos al carrito
  - Navegación al carrito
- **Autenticación**: No requiere autenticación para ver productos

#### **pages/ClientCart.jsx**
- **Propósito**: Página del carrito de compras para clientes
- **Funcionalidades**:
  - Muestra productos en el carrito
  - Aumentar/disminuir cantidad
  - Eliminar productos del carrito
  - Calcular total
  - Finalizar compra (requiere autenticación)
    - Valida que el usuario esté logueado como "customer"
    - Si no está autenticado, abre modal de login
    - Crea orden en el backend
    - Limpia el carrito después de compra exitosa
    - Usa direcciones por defecto (no solicita al usuario)
- **Estado**: Guarda carrito en `localStorage`

#### **components/AdminHeader.jsx**
- **Propósito**: Header para páginas de administración
- **Funcionalidades**:
  - Muestra logo y título
  - Navegación a secciones del admin
  - Botón de cerrar sesión

#### **components/ClientHeader.jsx**
- **Propósito**: Header para páginas del cliente
- **Funcionalidades**:
  - Muestra logo y navegación
  - Si el usuario está autenticado: muestra nombre de usuario y botón "Cerrar Sesión"
  - Si no está autenticado: muestra botones "Iniciar Sesión" y "Registrarse"
  - Escucha eventos `authChange` para actualizar estado

#### **components/Sidebar.jsx**
- **Propósito**: Barra lateral de navegación para administración
- **Funcionalidades**:
  - Menú con enlaces a Dashboard, Productos, Órdenes
  - Indicador de página activa

#### **components/LoginModal.jsx**
- **Propósito**: Modal para iniciar sesión
- **Funcionalidades**:
  - Formulario de login (username, password)
  - Envío de credenciales al backend
  - Guarda token, username y role en `localStorage`
  - Dispara evento `authChange` para actualizar otros componentes
  - Soporta contexto de cliente (`isClientContext` prop)

#### **components/SignupModal.jsx**
- **Propósito**: Modal para registro de nuevos usuarios
- **Funcionalidades**:
  - Formulario de registro (username, email, password)
  - Asigna automáticamente rol "customer" para registros desde cliente
  - Envío de datos al backend
  - Guarda token, username y role en `localStorage`
  - Dispara evento `authChange` para actualizar otros componentes

#### **components/Modal.jsx**
- **Propósito**: Componente modal reutilizable
- **Funcionalidades**:
  - Muestra contenido en overlay
  - Botón de cerrar
  - Cierre al hacer clic fuera del modal

#### **components/ProductCard.jsx**
- **Propósito**: Tarjeta para mostrar un producto
- **Funcionalidades**:
  - Muestra imagen, nombre, precio, stock
  - Botón para agregar al carrito (en contexto cliente)
  - Botones de editar/deshabilitar (en contexto admin)

#### **login/Login.jsx**
- **Propósito**: Página completa de login (no modal)
- **Funcionalidades**: Similar a `LoginModal` pero como página independiente

#### **signup/Signup.jsx**
- **Propósito**: Página completa de registro (no modal)
- **Funcionalidades**: Similar a `SignupModal` pero como página independiente

#### **vite.config.js**
- **Propósito**: Configuración de Vite (build tool)
- **Configuraciones**:
  - Puerto: 3004
  - Proxy para API: redirige `/api/*` a `http://localhost:5142`

#### **tailwind.config.js**
- **Propósito**: Configuración de Tailwind CSS
- **Configuraciones**: Rutas de contenido, temas, plugins

#### **package.json**
- **Propósito**: Dependencias y scripts del proyecto
- **Dependencias principales**:
  - `react`, `react-dom`: Framework React
  - `react-router-dom`: Enrutamiento
  - `axios`: Cliente HTTP
  - `lucide-react`: Iconos
  - `tailwindcss`: Framework CSS

---

## Flujo de Datos

### Autenticación
1. Usuario ingresa credenciales en `LoginModal` o `Login.jsx`
2. Frontend envía `POST /api/login` con `LoginModel`
3. `AuthController` llama a `AuthService.LoginAsync`
4. `AuthService` valida credenciales con Identity
5. `JwtTokenService` genera token JWT
6. Backend retorna token y rol
7. Frontend guarda token, username y role en `localStorage`
8. Frontend dispara evento `authChange` para actualizar componentes

### Registro
1. Usuario completa formulario en `SignupModal` o `Signup.jsx`
2. Frontend envía `POST /api/register` con `RegisterModel`
3. `AuthController` llama a `AuthService.RegisterAsync`
4. `AuthService` crea usuario con Identity
5. Si el rol es "customer", `AuthController` crea registro en tabla `Customers`
6. Backend retorna token y rol
7. Frontend guarda datos en `localStorage`

### Crear Orden
1. Cliente agrega productos al carrito (guardado en `localStorage`)
2. Cliente hace clic en "Finalizar Compra" en `ClientCart.jsx`
3. Frontend valida autenticación (token y role === "customer")
4. Si no está autenticado, abre `LoginModal`
5. Frontend envía `POST /api/Orders` con datos del carrito
6. `OrdersController` busca o crea `Customer` por username
7. `OrderManagementService.CreateOrderAsync`:
   - Valida productos y stock
   - Crea `Order` y `OrderItem`s
   - Reduce stock de productos
   - Calcula total
8. Backend retorna orden creada
9. Frontend limpia carrito y redirige a `/productos`

### Gestión de Productos (Admin)
1. Admin accede a `/admin/productos`
2. `Products.jsx` carga productos con `GET /api/products`
3. Admin puede crear/editar/deshabilitar productos
4. Cambios se envían al backend con autenticación JWT
5. Backend valida rol "admin" con `[Authorize(Roles = "admin")]`

### Gestión de Órdenes (Admin)
1. Admin accede a `/admin/ordenes`
2. `Orders.jsx` carga órdenes con `GET /api/Orders`
3. Admin puede filtrar por estado
4. Admin puede ver detalles en modal
5. Admin puede actualizar estado con `PUT /api/Orders/{id}/status`
6. `OrderManagementService` valida transiciones de estado permitidas

---

## Configuración y Dependencias

### Backend (.NET 8.0)
- **Entity Framework Core**: ORM para acceso a datos
- **Pomelo.EntityFrameworkCore.MySql**: Proveedor MySQL para EF Core
- **ASP.NET Core Identity**: Sistema de autenticación y autorización
- **JWT Bearer**: Autenticación basada en tokens
- **Swagger/OpenAPI**: Documentación de API

### Frontend (React + Vite)
- **React 18**: Framework de UI
- **React Router DOM**: Enrutamiento
- **Axios**: Cliente HTTP
- **Tailwind CSS**: Framework de estilos
- **Lucide React**: Iconos

### Base de Datos
- **MySQL 8.0**: Base de datos relacional
- **Dos bases de datos**:
  - `dsw2025tpi`: Datos de negocio (Productos, Órdenes, Clientes)
  - `dsw2025tpi_auth`: Datos de autenticación (Usuarios, Roles)

---

## Notas Importantes

1. **Autenticación**: El sistema usa JWT tokens almacenados en `localStorage` del navegador
2. **Roles**: Solo existen dos roles: "admin" y "customer"
3. **Carrito**: Se guarda en `localStorage` del navegador (no persiste en servidor)
4. **Direcciones**: Las órdenes usan direcciones por defecto (no se solicitan al usuario)
5. **Stock**: Se reduce automáticamente al crear una orden
6. **Estados de Orden**: Solo se permiten ciertas transiciones (definidas en `OrderManagementService`)
7. **CORS**: Configurado para permitir requests desde puertos 3000, 3003, 3004

---

## Endpoints de la API

### Autenticación
- `POST /api/login` - Iniciar sesión
- `POST /api/register` - Registrar usuario

### Productos
- `GET /api/products` - Listar productos (público)
- `GET /api/products/{id}` - Obtener producto (público)
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/{id}` - Actualizar producto (admin)
- `PATCH /api/products/{id}` - Deshabilitar producto (admin)

### Órdenes
- `POST /api/Orders` - Crear orden (requiere username)
- `GET /api/Orders` - Listar órdenes (admin, customer)
- `GET /api/Orders/{id}` - Obtener orden (admin, customer)
- `PUT /api/Orders/{id}/status` - Actualizar estado (admin)

---

*Documentación generada para el proyecto Dsw2025Tpi*

