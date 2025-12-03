# Instrucciones para Ejecutar el Backend

## Pasos después de instalar .NET SDK:

1. **Restaurar paquetes NuGet:**
   ```powershell
   cd Dsw2025Tpi.Api
   dotnet restore
   ```

2. **Ejecutar el backend:**
   ```powershell
   dotnet run
   ```

   O desde la raíz del proyecto:
   ```powershell
   dotnet run --project Dsw2025Tpi.Api
   ```

3. **El backend se ejecutará en:**
   - http://localhost:5142
   - Swagger UI: http://localhost:5142/swagger

4. **La base de datos SQLite se creará automáticamente:**
   - Archivo: `Dsw2025Tpi.Api/Dsw2025TpiDb.sqlite`
   - Se ejecutarán las migraciones automáticamente
   - Se crearán los usuarios iniciales:
     - Usuario: `admin`, Password: `Admin123*`
     - Usuario: `customer`, Password: `Customer123*`

## Nota:
Si tienes Visual Studio instalado, puedes simplemente abrir `Dsw2025Tpi.sln` y presionar F5 para ejecutar el proyecto.

