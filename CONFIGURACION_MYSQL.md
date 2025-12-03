# Guía de Configuración de MySQL

## 📋 Pasos para configurar MySQL

### Opción 1: Usar Docker (RECOMENDADO - Más fácil) 🐳

**Requisito:** Tener Docker Desktop instalado ([https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop))

1. **Iniciar MySQL con Docker:**
   ```bash
   docker-compose up -d
   ```
   
   Esto creará un contenedor MySQL con:
   - Usuario: `root`
   - Contraseña: `root123`
   - Base de datos: `dsw2025tpi` (ya creada)
   - Puerto: `3306`

2. **Verificar que MySQL está corriendo:**
   ```bash
   docker ps
   ```
   
   Deberías ver el contenedor `mysql-dsw2025` corriendo.

3. **Crear la base de datos de autenticación:**
   ```bash
   docker exec -it mysql-dsw2025 mysql -uroot -proot123 -e "CREATE DATABASE IF NOT EXISTS dsw2025tpi_auth;"
   ```

**Para detener MySQL:**
```bash
docker-compose down
```

**Para iniciar MySQL nuevamente:**
```bash
docker-compose up -d
```

### Opción 2: Instalar MySQL localmente

**Windows:**
1. Descarga MySQL desde [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. O instala MySQL usando XAMPP/WAMP que incluye MySQL
3. Durante la instalación, configura una contraseña para el usuario `root`

### 2. Crear las bases de datos (solo si instalaste MySQL localmente)

Si usaste Docker, la base de datos `dsw2025tpi` ya está creada. Solo necesitas crear `dsw2025tpi_auth`:

**Con Docker:**
```bash
docker exec -it mysql-dsw2025 mysql -uroot -proot123 -e "CREATE DATABASE IF NOT EXISTS dsw2025tpi_auth;"
```

**Con MySQL local:**
Conecta a MySQL usando MySQL Workbench, phpMyAdmin, o la línea de comandos:

```sql
CREATE DATABASE dsw2025tpi;
CREATE DATABASE dsw2025tpi_auth;
```

### 3. Configurar Connection Strings

Edita `Dsw2025Tpi.Api/appsettings.json` y configura las connection strings:

**Si usaste Docker (con las credenciales del docker-compose.yml):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=dsw2025tpi;User=root;Password=root123;Port=3306",
    "AuthConnection": "Server=localhost;Database=dsw2025tpi_auth;User=root;Password=root123;Port=3306"
  }
}
```

**Si instalaste MySQL localmente:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=dsw2025tpi;User=root;Password=tu-password;Port=3306",
    "AuthConnection": "Server=localhost;Database=dsw2025tpi_auth;User=root;Password=tu-password;Port=3306"
  }
}
```

**Para servidor remoto:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tu-servidor.com;Database=dsw2025tpi;User=tu-usuario;Password=tu-password;Port=3306",
    "AuthConnection": "Server=tu-servidor.com;Database=dsw2025tpi_auth;User=tu-usuario;Password=tu-password;Port=3306"
  }
}
```

### 4. Instalar paquetes NuGet

Los paquetes ya están actualizados en `Dsw2025Tpi.Data.csproj`:
- `Pomelo.EntityFrameworkCore.MySql` (ya agregado)

Ejecuta:
```bash
dotnet restore
```

### 5. Crear migraciones

Desde la terminal en la carpeta raíz del proyecto:

```bash
# Para Dsw2025TpiContext
dotnet ef migrations add InitialMySqlMigration --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context Dsw2025TpiContext

# Para AuthenticateContext
dotnet ef migrations add InitialMySqlAuthMigration --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context AuthenticateContext
```

### 6. Aplicar migraciones

```bash
# Para Dsw2025TpiContext
dotnet ef database update --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context Dsw2025TpiContext

# Para AuthenticateContext
dotnet ef database update --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context AuthenticateContext
```

### 7. Ejecutar el proyecto

```bash
cd Dsw2025Tpi.Api
dotnet run
```

## ✅ Ventajas de MySQL

- **Gratis y Open Source:** MySQL Community Edition es completamente gratuito
- **Muy popular:** Ampliamente usado en la industria
- **Rápido:** Excelente rendimiento para aplicaciones web
- **Compatible:** Funciona perfectamente con Entity Framework Core
- **Flexible:** Puede ejecutarse localmente o en la nube

## 🔄 Alternativa: MySQL en la nube

Si prefieres usar MySQL en la nube, puedes usar servicios como:
- **PlanetScale** (serverless MySQL)
- **AWS RDS MySQL**
- **Azure Database for MySQL**
- **Google Cloud SQL**

## 📝 Notas Importantes

- **Puerto:** MySQL usa el puerto 3306 por defecto
- **Usuario:** Asegúrate de que el usuario tenga permisos para crear tablas
- **Versión:** El código está configurado para MySQL 8.0.21, ajusta la versión si es necesario
- **Charset:** MySQL usa UTF-8 por defecto, que es compatible con tu aplicación

