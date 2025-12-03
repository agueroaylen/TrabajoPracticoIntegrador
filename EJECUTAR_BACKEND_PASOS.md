# Pasos para Ejecutar el Backend

## 1. Reiniciar la Terminal/PowerShell
**IMPORTANTE:** Después de instalar .NET SDK, debes cerrar y volver a abrir tu terminal/PowerShell para que reconozca el comando `dotnet`.

## 2. Verificar que .NET está instalado
Abre una **nueva** terminal/PowerShell y ejecuta:
```powershell
dotnet --version
```
Deberías ver algo como: `8.0.xxx`

## 3. Navegar al directorio del proyecto
```powershell
cd "C:\Users\RAMIRO\Desktop\Proyectos Personales\Dsw2025Tpi.-master\Dsw2025Tpi.Api"
```

## 4. Restaurar los paquetes NuGet
```powershell
dotnet restore
```

## 5. Ejecutar el backend
```powershell
dotnet run
```

## 6. Verificar que está corriendo
Deberías ver mensajes como:
- `Now listening on: http://localhost:5142`
- `Application started. Press Ctrl+C to shut down.`

Abre tu navegador en: `http://localhost:5142/swagger` para ver la documentación de la API.

## 7. Probar el login
Una vez que el backend esté corriendo:
1. Abre el frontend del admin en `http://localhost:3000/login`
2. Usa las credenciales:
   - Usuario: `admin`
   - Password: `Admin123*`

## Nota
Mantén la terminal abierta mientras el backend esté corriendo. Para detenerlo, presiona `Ctrl+C`.

