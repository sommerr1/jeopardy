# Quick status check for Jeopardy services
Write-Host "Quick service check..." -ForegroundColor Cyan

# Check ports
$ports = @(3001, 5173, 3000)
$services = @("Proxy", "Vite Dev", "Browser Tools")

for ($i = 0; $i -lt $ports.Count; $i++) {
    $port = $ports[$i]
    $service = $services[$i]
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $port)
        $connection.Close()
        Write-Host "OK $service (port $port): RUNNING" -ForegroundColor Green
    }
    catch {
        Write-Host "FAIL $service (port $port): NOT RUNNING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "For detailed check run: .\runtasks\check-status.ps1" -ForegroundColor Yellow
