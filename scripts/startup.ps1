$ErrorActionPreference = "Stop"
$baseDir = $PSScriptRoot
$logDir = "$baseDir\logs"
if (-Not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$mvnw = "$baseDir\auth-service\mvnw.cmd"

function Wait-ForPort($port, $maxAttempts=60) {
    Write-Host "Waiting for port $port to open..."
    for ($i=1; $i -le $maxAttempts; $i++) {
        $conn = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        if ($conn.TcpTestSucceeded) {
            Write-Host "Port $port is open!"
            return $true
        }
        Start-Sleep -Seconds 2
    }
    Write-Warning "Timeout waiting for port $port"
    return $false
}

function Start-Microservice($name, $waitForPort) {
    Write-Host "Starting $name ..."
    $workDir = "$baseDir\$name"
    $logFile = "$logDir\$name.log"
    $errFile = "$logDir\${name}_err.log"
    # Remove old logs
    if (Test-Path $logFile) { Remove-Item $logFile -Force }
    if (Test-Path $errFile) { Remove-Item $errFile -Force }
    Start-Process -FilePath $mvnw -ArgumentList "spring-boot:run", "-Dspring-boot.run.jvmArguments=-Deureka.instance.preferIpAddress=true" -WorkingDirectory $workDir -RedirectStandardOutput $logFile -RedirectStandardError $errFile -WindowStyle Hidden
    if ($waitForPort -gt 0) {
        Wait-ForPort $waitForPort
    }
}

# 1. Config Server (must be first)
Start-Microservice "config-server" 8888

# 2. Eureka Server
Start-Microservice "eureka-service" 8761

# 3. Core Services - start with small delays
# Auth on 8087, Catalog on 8085, Order on 8086, Admin on 8084, Gateway on 8089
$coreServices = @("auth-service", "catalog-service", "order-service", "admin-service", "api-gateway", "notificatoin-service")
foreach ($svc in $coreServices) {
    Start-Microservice $svc 0
    Start-Sleep -Seconds 8
}

Write-Host ""
Write-Host "======================================================"
Write-Host " All services instructed to start!"
Write-Host " Config Server : http://localhost:8888"
Write-Host " Eureka        : http://localhost:8761"
Write-Host " Auth Service  : http://localhost:8087"
Write-Host " Catalog       : http://localhost:8085"
Write-Host " Order Service : http://localhost:8086"
Write-Host " Admin Service : http://localhost:8084"
Write-Host " API Gateway   : http://localhost:8089"
Write-Host " Frontend      : http://localhost:5173"
Write-Host " Monitor logs  : $logDir"
Write-Host "======================================================"

