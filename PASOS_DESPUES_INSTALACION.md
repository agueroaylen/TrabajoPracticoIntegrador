# 🚀 Pasos Después de Instalar MySQL

## Paso 1: Actualizar la contraseña en appsettings.json

Edita `Dsw2025Tpi.Api/appsettings.json` y reemplaza `root123` con la contraseña que configuraste durante la instalación:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=dsw2025tpi;User=root;Password=TU_CONTRASEÑA_AQUI;Port=3306",
    "AuthConnection": "Server=localhost;Database=dsw2025tpi_auth;User=root;Password=TU_CONTRASEÑA_AQUI;Port=3306"
  }
}
```

## Paso 2: Crear las bases de datos

Tienes 3 opciones:

### Opción A: Usando MySQL Workbench (Recomendado - Interfaz gráfica)

1. Abre MySQL Workbench (se instaló con MySQL)
2. Conecta al servidor local (localhost:3306) con usuario `root` y tu contraseña
3. Ejecuta estos comandos SQL:

```sql
CREATE DATABASE IF NOT EXISTS dsw2025tpi;
CREATE DATABASE IF NOT EXISTS dsw2025tpi_auth;
```

### Opción B: Usando línea de comandos

```powershell
# Reemplaza TU_CONTRASEÑA con tu contraseña real
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dsw2025tpi; CREATE DATABASE IF NOT EXISTS dsw2025tpi_auth;"
```

### Opción C: Usando el archivo SQL

```powershell
# Reemplaza TU_CONTRASEÑA con tu contraseña real
mysql -u root -p < crear_bases_datos.sql
```

## Paso 3: Aplicar las migraciones

Una vez creadas las bases de datos, ejecuta:

```powershell
# Crear migraciones
dotnet ef migrations add InitialMySqlMigration --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context Dsw2025TpiContext

dotnet ef migrations add InitialMySqlAuthMigration --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context AuthenticateContext

# Aplicar migraciones
dotnet ef database update --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context Dsw2025TpiContext

dotnet ef database update --project Dsw2025Tpi.Data --startup-project Dsw2025Tpi.Api --context AuthenticateContext
```

## Paso 4: Ejecutar el proyecto

```powershell
cd Dsw2025Tpi.Api
dotnet run
```

## ✅ Verificar que todo funciona

1. El proyecto debería iniciar sin errores
2. Puedes probar crear un usuario desde el frontend
3. Puedes probar crear un producto desde el admin

