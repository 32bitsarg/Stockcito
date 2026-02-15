param (
    [switch]$Publish = $false
)

$envLocalPath = ".env.local"
$envBackupPath = ".env.local.bak"

Write-Host "--- Iniciando Proceso de Build ---" -ForegroundColor Cyan
if ($Publish) {
    Write-Host "MODO RELEASE ACTIVO: Se intentará publicar en GitHub." -ForegroundColor Yellow
}

if (Test-Path $envLocalPath) {
    Rename-Item -Path $envLocalPath -NewName $envBackupPath -Force
    Write-Host "-> env.local desactivado temporalmente"
}

try {
    Write-Host "1. Ejecutando npm run build (Next.js Standalone)..."
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "2. Iniciando empaquetado con electron-builder..." -ForegroundColor Green
        
        $env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
        $cacheDir = "E:\Programacion\cache"
        if (!(Test-Path $cacheDir)) { New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null }
        $env:ELECTRON_BUILDER_CACHE = $cacheDir
        
        $builderArgs = @("--win", "--config", "electron-builder.json")
        if ($Publish) {
            $builderArgs += "--publish"
            $builderArgs += "always"
        }
        
        npx electron-builder @builderArgs
    }
    else {
        Write-Host "ERROR: El build de Next.js falló." -ForegroundColor Red
    }
}
finally {
    if (Test-Path $envBackupPath) {
        Rename-Item -Path $envBackupPath -NewName $envLocalPath -Force
        Write-Host "-> env.local restaurado"
    }
}
