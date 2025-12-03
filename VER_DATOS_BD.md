# Cómo Ver los Datos de la Base de Datos

## Opción 1: MySQL Workbench (Recomendado - Interfaz Gráfica)

### Instalación:
1. Descarga MySQL Workbench desde: https://dev.mysql.com/downloads/workbench/
2. Instala el programa
3. Abre MySQL Workbench

### Conexión:
- **Hostname:** `localhost`
- **Port:** `3306`
- **Username:** `root`
- **Password:** `ramiroparadi11`

### Ver Datos:
1. En el panel izquierdo, expande "Schemas"
2. Expande `dsw2025tpi` (base de datos principal)
3. Expande "Tables"
4. Haz clic derecho en cualquier tabla (Products, Customers, Orders, OrderItems)
5. Selecciona "Select Rows - Limit 1000"
6. Verás todos los datos en formato de tabla

### Para la base de autenticación:
1. Expande `dsw2025tpiauth`
2. Expande "Tables"
3. Verás tablas como: `Usuarios`, `Roles`, `UsuariosRoles`, etc.

---

## Opción 2: MySQL Command Line (Terminal)

### Comandos útiles para ver datos:

#### Ver todas las bases de datos:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "SHOW DATABASES;"
```

#### Ver todas las tablas de la base principal:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SHOW TABLES;"
```

#### Ver todos los productos:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SELECT * FROM Products;"
```

#### Ver todos los clientes:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SELECT * FROM Customers;"
```

#### Ver todas las órdenes:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SELECT * FROM Orders;"
```

#### Ver items de orden:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SELECT * FROM OrderItems;"
```

#### Ver usuarios:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpiauth; SELECT UserName, Email FROM Usuarios;"
```

#### Ver roles:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpiauth; SELECT * FROM Roles;"
```

---

## Opción 3: Modo Interactivo MySQL

### Entrar al cliente MySQL:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11
```

### Una vez dentro, puedes ejecutar:
```sql
-- Ver bases de datos
SHOW DATABASES;

-- Usar la base de datos principal
USE dsw2025tpi;

-- Ver tablas
SHOW TABLES;

-- Ver todos los productos
SELECT * FROM Products;

-- Ver productos con formato bonito
SELECT Id, Sku, Name, CurrentUnitPrice, StockQuantity, IsActive FROM Products;

-- Ver clientes
SELECT * FROM Customers;

-- Ver órdenes con información del cliente
SELECT o.Id, c.Name as Cliente, o.TotalAmount, o.Status, o.OrderDate 
FROM Orders o 
JOIN Customers c ON o.CustomerId = c.Id;

-- Ver items de una orden específica
SELECT oi.ProductId, p.Name as Producto, oi.Quantity, oi.UnitPrice, oi.SubTotal
FROM OrderItems oi
JOIN Products p ON oi.ProductId = p.Id
WHERE oi.OrderId = 'd26fa683-4bea-47e3-8666-4f6259c1ca4d';

-- Salir
EXIT;
```

---

## Opción 4: phpMyAdmin (Si lo tienes instalado)

Si tienes XAMPP, WAMP o similar instalado:
1. Abre phpMyAdmin en el navegador (normalmente `http://localhost/phpmyadmin`)
2. Usuario: `root`
3. Contraseña: `ramiroparadi11`
4. Selecciona la base de datos `dsw2025tpi` o `dsw2025tpiauth`
5. Haz clic en las tablas para ver los datos

---

## Opción 5: Visual Studio Code Extension

Puedes instalar la extensión "MySQL" en VS Code:
1. Abre VS Code
2. Ve a Extensiones (Ctrl+Shift+X)
3. Busca "MySQL"
4. Instala la extensión
5. Configura la conexión con los mismos datos

---

## Resumen de Bases de Datos

### Base de Datos Principal: `dsw2025tpi`
- **Products**: Productos del catálogo
- **Customers**: Clientes
- **Orders**: Órdenes de compra
- **OrderItems**: Items individuales de cada orden

### Base de Datos de Autenticación: `dsw2025tpiauth`
- **Usuarios**: Usuarios del sistema
- **Roles**: Roles (admin, customer)
- **UsuariosRoles**: Relación usuarios-roles
- **UsuariosClaims**: Claims de usuarios
- **RolesClaims**: Claims de roles
- **UsuariosLogins**: Logins externos
- **UsuariosTokens**: Tokens de usuarios

---

## Comandos Rápidos de Consulta

### Contar registros:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SELECT COUNT(*) as TotalProductos FROM Products; SELECT COUNT(*) as TotalClientes FROM Customers; SELECT COUNT(*) as TotalOrdenes FROM Orders;"
```

### Ver último producto creado:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SELECT * FROM Products ORDER BY Id DESC LIMIT 1;"
```

### Ver última orden creada:
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -pramiroparadi11 -e "USE dsw2025tpi; SELECT * FROM Orders ORDER BY OrderDate DESC LIMIT 1;"
```

