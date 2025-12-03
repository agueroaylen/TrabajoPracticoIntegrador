# 🚀 Guía Rápida: Instalar y Configurar MySQL

## Opción 1: Docker (RECOMENDADO - Más fácil) 🐳

### Paso 1: Instalar Docker Desktop

1. **Descarga Docker Desktop para Windows:**
   - Ve a: https://www.docker.com/products/docker-desktop/
   - Descarga e instala Docker Desktop
   - Reinicia tu computadora después de la instalación

2. **Iniciar Docker Desktop:**
   - Abre Docker Desktop desde el menú de inicio
   - Espera a que se inicie completamente (verás el ícono de Docker en la barra de tareas)

3. **Iniciar MySQL con Docker:**
   ```powershell
   docker-compose up -d
   ```

4. **Verificar que MySQL está corriendo:**
   ```powershell
   docker ps
   ```
   Deberías ver el contenedor `mysql-dsw2025` corriendo.

5. **Crear la base de datos de autenticación:**
   ```powershell
   docker exec -it mysql-dsw2025 mysql -uroot -proot123 -e "CREATE DATABASE IF NOT EXISTS dsw2025tpi_auth;"
   ```

6. **Continuar con los pasos de migración** (ver más abajo)

---

## Opción 2: Instalar MySQL Localmente 💻

### Paso 1: Instalar MySQL

**Opción A: MySQL Community Server (Recomendado)**

1. **Descarga MySQL 8.0:**
   - Ve a: https://dev.mysql.com/downloads/mysql/
   - **IMPORTANTE:** Selecciona la versión **MySQL 8.0** (la más reciente estable)
   - Descarga "MySQL Installer for Windows" (archivo .msi)
   - Ejecuta el instalador

2. **Durante la instalación:**
   - Selecciona "Developer Default" o "Server only"
   - Configura una contraseña para el usuario `root` (¡GUÁRDALA!)
   - Puerto: 3306 (por defecto)
   - Servicio: Configura MySQL como servicio de Windows

**Opción B: XAMPP (Más fácil, incluye MySQL + phpMyAdmin)**

1. **Descarga XAMPP:**
   - Ve a: https://www.apachefriends.org/
   - Descarga e instala XAMPP para Windows

2. **Iniciar MySQL:**
   - Abre el Panel de Control de XAMPP
   - Haz clic en "Start" junto a MySQL
   - La contraseña por defecto del usuario `root` es vacía (sin contraseña)

### Paso 2: Crear las bases de datos

**Con MySQL Workbench o línea de comandos:**
```sql
CREATE DATABASE dsw2025tpi;
CREATE DATABASE dsw2025tpi_auth;
```

**Con XAMPP (phpMyAdmin):**
1. Abre http://localhost/phpmyadmin
2. Crea las bases de datos: `dsw2025tpi` y `dsw2025tpi_auth`

### Paso 3: Configurar appsettings.json

Edita `Dsw2025Tpi.Api/appsettings.json`:

**Si usaste MySQL Community Server:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=dsw2025tpi;User=root;Password=TU_CONTRASEÑA_AQUI;Port=3306",
    "AuthConnection": "Server=localhost;Database=dsw2025tpi_auth;User=root;Password=TU_CONTRASEÑA_AQUI;Port=3306"
  }
}
```

**Si usaste XAMPP (sin contraseña):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=dsw2025tpi;User=root;Password=;Port=3306",
    "AuthConnection": "Server=localhost;Database=dsw2025tpi_auth;User=root;Password=;Port=3306"
  }
}
```

---

## Paso 4: Aplicar Migraciones (Para ambas opciones)

Una vez que MySQL esté corriendo y las bases de datos creadas:

1. **Crear las migraciones:**
   ```powershell
   # Para Dsw2025TpiContext
   dotnet ef migrations add InitialMySqlMigration --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context Dsw2025TpiContext

   # Para AuthenticateContext
   dotnet ef migrations add InitialMySqlAuthMigration --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context AuthenticateContext
   ```

2. **Aplicar las migraciones:**
   ```powershell
   # Para Dsw2025TpiContext
   dotnet ef database update --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context Dsw2025TpiContext

   # Para AuthenticateContext
   dotnet ef database update --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context AuthenticateContext
   ```

3. **Ejecutar el proyecto:**
   ```powershell
   cd Dsw2025Tpi.Api
   dotnet run
   ```

---

## ✅ Verificar que todo funciona

1. El proyecto debería iniciar sin errores
2. Puedes probar crear un usuario desde el frontend
3. Puedes probar crear un producto desde el admin

---

## 🔧 Solución de Problemas

**Error: "Cannot connect to MySQL server"**
- Verifica que MySQL esté corriendo
- Verifica que el puerto 3306 no esté bloqueado por el firewall
- Verifica las credenciales en `appsettings.json`

**Error: "Access denied for user"**
- Verifica que el usuario y contraseña sean correctos
- Si usas XAMPP, la contraseña puede estar vacía

**Error: "Database does not exist"**
- Asegúrate de crear las bases de datos antes de ejecutar las migraciones

---

## 📝 Notas

- **Docker:** Más fácil de instalar y desinstalar, no contamina tu sistema
- **MySQL Local:** Más control, pero requiere más configuración
- **XAMPP:** Incluye phpMyAdmin (interfaz web para MySQL), muy útil para principiantes

