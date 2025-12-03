# Script para crear las bases de datos MySQL
# Usa la contraseña del appsettings.json

$password = "ramiroparadi11"
$mysqlPath = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

if (Test-Path $mysqlPath) {
    Write-Host "Creando bases de datos..."
    & $mysqlPath -u root -p$password -e "CREATE DATABASE IF NOT EXISTS dsw2025tpi; CREATE DATABASE IF NOT EXISTS dsw2025tpi_auth; SHOW DATABASES LIKE 'dsw2025tpi%';"
    Write-Host "Bases de datos creadas exitosamente!"
} else {
    Write-Host "MySQL no encontrado en la ruta esperada. Por favor, crea las bases de datos manualmente usando MySQL Workbench:"
    Write-Host "CREATE DATABASE IF NOT EXISTS dsw2025tpi;"
    Write-Host "CREATE DATABASE IF NOT EXISTS dsw2025tpi_auth;"
}

