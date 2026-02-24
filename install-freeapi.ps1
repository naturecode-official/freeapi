# FreeAPI One-Click Installer for Windows PowerShell
# Usage: irm https://raw.githubusercontent.com/naturecode-official/freeapi/main/install-freeapi.ps1 | iex

Write-Host "FreeAPI One-Click Installer for Windows" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Installing from GitHub source" -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not detected" -ForegroundColor Red
    Write-Host "Please install Node.js v18+: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "npm detected: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm not detected" -ForegroundColor Red
    exit 1
}

# Check Node.js version
$nodeMajor = [int]($nodeVersion -replace 'v', '' -split '\.')[0]
if ($nodeMajor -lt 18) {
    Write-Host "ERROR: Node.js version too low (requires v18+, found $nodeVersion)" -ForegroundColor Red
    exit 1
}

Write-Host "System check passed" -ForegroundColor Green
Write-Host ""

# Create installation directory
$installDir = "$env:USERPROFILE\.freeapi-install"
Write-Host "Installing FreeAPI to: $installDir" -ForegroundColor Cyan

if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}

# Download from GitHub
Write-Host "Downloading FreeAPI from GitHub..." -ForegroundColor Cyan

if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "   Cloning repository with git..." -ForegroundColor Gray
    if (Test-Path "$installDir\freeapi") {
        Set-Location "$installDir\freeapi"
        git pull --quiet
    } else {
        git clone --depth 1 https://github.com/naturecode-official/freeapi.git "$installDir\freeapi"
    }
} else {
    Write-Host "   Downloading with curl..." -ForegroundColor Gray
    $tempFile = "$env:TEMP\freeapi-main.zip"
    Invoke-WebRequest -Uri "https://github.com/naturecode-official/freeapi/archive/refs/heads/main.zip" -OutFile $tempFile
    
    # Extract zip
    Expand-Archive -Path $tempFile -DestinationPath $installDir -Force
    Move-Item "$installDir\freeapi-main\*" "$installDir\freeapi\" -Force
    Remove-Item "$installDir\freeapi-main" -Recurse -Force
    Remove-Item $tempFile -Force
}

Set-Location "$installDir\freeapi"

# Install dependencies
Write-Host "   Installing dependencies..." -ForegroundColor Gray
npm install --silent

# Build project
Write-Host "   Building project..." -ForegroundColor Gray
npm run build --silent

# Create global link
Write-Host "   Creating global link..." -ForegroundColor Gray
npm unlink -g freeapi 2>$null
npm link --silent

Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Usage:" -ForegroundColor Yellow
Write-Host "  freeapi --help     Show help"
Write-Host "  freeapi init       Initialize configuration"
Write-Host "  freeapi list       List available services"
Write-Host ""
Write-Host "Quick start:" -ForegroundColor Yellow
Write-Host "  1. freeapi init"
Write-Host "  2. freeapi config chatgpt"
Write-Host "  3. freeapi chat chatgpt"
Write-Host ""
Write-Host "Installation directory: $installDir\freeapi" -ForegroundColor Gray
Write-Host "GitHub: https://github.com/naturecode-official/freeapi" -ForegroundColor Gray
Write-Host "Issues: https://github.com/naturecode-official/freeapi/issues" -ForegroundColor Gray
Write-Host ""
Write-Host "Note: You may need to restart your terminal for the 'freeapi' command to work." -ForegroundColor Cyan