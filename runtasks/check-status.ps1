# Script for checking Jeopardy proxy and site status
# Checks availability of local proxy (port 3001) and Vite dev server (port 5173)

Write-Host "Checking Jeopardy services status..." -ForegroundColor Cyan
Write-Host ""

# Function to check port availability
function Test-Port {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to check HTTP response
function Test-HttpEndpoint {
    param(
        [string]$Url,
        [string]$ServiceName
    )
    
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 5 -UseBasicParsing
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

# Check proxy server (port 3001)
Write-Host "Checking proxy server (port 3001)..." -ForegroundColor Yellow
$proxyPortOpen = Test-Port -Port 3001 -ServiceName "Proxy"
$proxyHttpOk = Test-HttpEndpoint -Url "http://localhost:3001/api/questions?getsheets=1" -ServiceName "Proxy API"

if ($proxyPortOpen -and $proxyHttpOk) {
    Write-Host "OK Proxy server: RUNNING and responding" -ForegroundColor Green
} elseif ($proxyPortOpen) {
    Write-Host "WARN Proxy server: RUNNING but API not responding" -ForegroundColor Yellow
} else {
    Write-Host "FAIL Proxy server: NOT RUNNING" -ForegroundColor Red
}

# Check Vite dev server (port 5173)
Write-Host "Checking Vite dev server (port 5173)..." -ForegroundColor Yellow
$vitePortOpen = Test-Port -Port 5173 -ServiceName "Vite"
$viteHttpOk = Test-HttpEndpoint -Url "http://localhost:5173" -ServiceName "Vite Dev Server"

if ($vitePortOpen -and $viteHttpOk) {
    Write-Host "OK Vite dev server: RUNNING and responding" -ForegroundColor Green
} elseif ($vitePortOpen) {
    Write-Host "WARN Vite dev server: RUNNING but not responding" -ForegroundColor Yellow
} else {
    Write-Host "FAIL Vite dev server: NOT RUNNING" -ForegroundColor Red
}

# Check browser-tools-server (port 3000)
Write-Host "Checking browser-tools-server (port 3000)..." -ForegroundColor Yellow
$browserToolsPortOpen = Test-Port -Port 3000 -ServiceName "Browser Tools"
$browserToolsHttpOk = Test-HttpEndpoint -Url "http://localhost:3000" -ServiceName "Browser Tools Server"

if ($browserToolsPortOpen -and $browserToolsHttpOk) {
    Write-Host "OK Browser Tools Server: RUNNING and responding" -ForegroundColor Green
} elseif ($browserToolsPortOpen) {
    Write-Host "WARN Browser Tools Server: RUNNING but not responding" -ForegroundColor Yellow
} else {
    Write-Host "FAIL Browser Tools Server: NOT RUNNING" -ForegroundColor Red
}

Write-Host ""
Write-Host "Final status:" -ForegroundColor Cyan

# Count statuses
$totalServices = 3
$runningServices = 0

if ($proxyPortOpen) { $runningServices++ }
if ($vitePortOpen) { $runningServices++ }
if ($browserToolsPortOpen) { $runningServices++ }

Write-Host "Running services: $runningServices of $totalServices" -ForegroundColor $(if ($runningServices -eq $totalServices) { "Green" } elseif ($runningServices -gt 0) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "Commands to start services:" -ForegroundColor Cyan
Write-Host "npm run start        - Start all services" -ForegroundColor White
Write-Host "npm run start:local  - Start only dev + proxy" -ForegroundColor White
Write-Host "npm run dev          - Start only Vite dev server" -ForegroundColor White
Write-Host "npm run proxy        - Start only proxy" -ForegroundColor White

Write-Host ""
Write-Host "URLs for manual check:" -ForegroundColor Cyan
Write-Host "Site: http://localhost:5173" -ForegroundColor White
Write-Host "Proxy API: http://localhost:3001/api/questions?getsheets=1" -ForegroundColor White
Write-Host "Browser Tools: http://localhost:3000" -ForegroundColor White

# Check processes
Write-Host ""
Write-Host "Active Node.js processes:" -ForegroundColor Cyan
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Write-Host "PID: $($_.Id) - $($_.ProcessName)" -ForegroundColor White
    }
} else {
    Write-Host "No active Node.js processes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Check completed!" -ForegroundColor Green