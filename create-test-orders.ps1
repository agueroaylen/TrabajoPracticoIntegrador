# Script para crear 20 órdenes de prueba
# Ejecutar desde la raíz del proyecto

$apiUrl = "http://localhost:5000/api/orders/generate-test-orders?count=20"

Write-Host "Creando 20 órdenes de prueba..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -ContentType "application/json"
    
    Write-Host "✅ Éxito: $($response.message)" -ForegroundColor Green
    Write-Host "Órdenes creadas: $($response.orders.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error al crear órdenes:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

Write-Host "`nNota: Asegúrate de que el servidor API esté corriendo en http://localhost:5000" -ForegroundColor Yellow

