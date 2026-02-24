# FreeAPI Windows Installer
# Usage: PowerShell -ExecutionPolicy Bypass -File install.ps1

Write-Host "FreeAPI Windows Installer" -ForegroundColor Cyan
Write-Host "=========================="
Write-Host

# Check Node.js
$nodeExists = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeExists) {
    Write-Host "ERROR: Node.js not detected" -ForegroundColor Red
    Write-Host "Please install Node.js v18+: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmExists) {
    Write-Host "ERROR: npm not detected" -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeVersion = (node --version) -replace 'v', ''
$majorVersion = [int]$nodeVersion.Split('.')[0]
if ($majorVersion -lt 18) {
    Write-Host "ERROR: Node.js version too low (requires v18+, found v$nodeVersion)" -ForegroundColor Red
    exit 1
}

Write-Host "System check passed" -ForegroundColor Green
Write-Host "   Node.js: v$nodeVersion"
Write-Host "   npm: $(npm --version)"
Write-Host

# 创建临时目录
$tempDir = Join-Path $env:TEMP "freeapi-install-$(Get-Random)"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    # 检查git
    $gitExists = Get-Command git -ErrorAction SilentlyContinue
    
    Write-Host "Installing FreeAPI..." -ForegroundColor Cyan
    
    if ($gitExists) {
        Write-Host "   Cloning repository with git..." -ForegroundColor Gray
        git clone --depth 1 https://github.com/naturecode-official/freeapi.git $tempDir
    } else {
        Write-Host "   Downloading with WebClient..." -ForegroundColor Gray
        $url = "https://github.com/naturecode-official/freeapi/archive/refs/heads/main.zip"
        $zipFile = Join-Path $tempDir "freeapi.zip"
        
        $webClient = New-Object System.Net.WebClient
        $webClient.DownloadFile($url, $zipFile)
        
        # Extract
        Add-Type -AssemblyName System.IO.Compression.FileSystem
        [System.IO.Compression.ZipFile]::ExtractToDirectory($zipFile, $tempDir)
        
        # Move files
        $extractedDir = Join-Path $tempDir "freeapi-main"
        Get-ChildItem $extractedDir | Move-Item -Destination $tempDir -Force
        Remove-Item $extractedDir -Recurse -Force
    }
    
    Set-Location $tempDir
    
    Write-Host "   Installing dependencies..." -ForegroundColor Gray
    npm install --silent
    
    Write-Host "   Building project..." -ForegroundColor Gray
    npm run build --silent
    
    Write-Host "   Installing globally..." -ForegroundColor Gray
    npm link --silent
    
    Write-Host
    Write-Host "Installation complete!" -ForegroundColor Green
    Write-Host
    
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  freeapi --help     Show help"
    Write-Host "  freeapi init       Initialize configuration"
    Write-Host "  freeapi list       List available services"
    Write-Host
    
    Write-Host "Quick start:" -ForegroundColor Yellow
    Write-Host "  1. freeapi init"
    Write-Host "  2. freeapi config chatgpt_web"
    Write-Host "  3. freeapi chat chatgpt_web"
    Write-Host
    
    Write-Host "Documentation: https://github.com/naturecode-official/freeapi" -ForegroundColor Cyan
    Write-Host "Issues: https://github.com/naturecode-official/freeapi/issues" -ForegroundColor Cyan
    
} finally {
    # 清理临时目录
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}