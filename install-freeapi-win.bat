@echo off
chcp 65001 >nul
echo FreeAPI One-Click Installer for Windows
echo ========================================
echo Installing from GitHub source
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js not detected
    echo Please install Node.js v18+: https://nodejs.org/
    pause
    exit /b 1
)

REM Check npm
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm not detected
    pause
    exit /b 1
)

REM Get Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:v=%

REM Check version (simple check for v18+)
for /f "tokens=1 delims=." %%i in ("%NODE_VERSION%") do set MAJOR=%%i
if %MAJOR% LSS 18 (
    echo ERROR: Node.js version too low (requires v18+, found v%NODE_VERSION%)
    pause
    exit /b 1
)

echo System check passed
echo   Node.js: v%NODE_VERSION%
for /f "tokens=*" %%i in ('npm --version') do echo   npm: %%i
echo.

REM Create installation directory
set INSTALL_DIR=%USERPROFILE%\.freeapi-install
echo Installing FreeAPI to: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Download from GitHub
echo Downloading FreeAPI from GitHub...

REM Check if git is available
where git >nul 2>nul
if not errorlevel 1 (
    echo    Cloning repository with git...
    if exist "%INSTALL_DIR%\freeapi" (
        cd /d "%INSTALL_DIR%\freeapi"
        git pull --quiet
    ) else (
        git clone --depth 1 https://github.com/naturecode-official/freeapi.git "%INSTALL_DIR%\freeapi"
    )
) else (
    echo    Downloading with curl...
    set TEMP_FILE=%TEMP%\freeapi-main.zip
    curl -L -s -o "%TEMP_FILE%" https://github.com/naturecode-official/freeapi/archive/refs/heads/main.zip
    
    REM Extract zip (requires PowerShell or 7zip)
    powershell -Command "Expand-Archive -Path '%TEMP_FILE%' -DestinationPath '%INSTALL_DIR%' -Force"
    powershell -Command "Move-Item '%INSTALL_DIR%\freeapi-main\*' '%INSTALL_DIR%\freeapi\' -Force"
    powershell -Command "Remove-Item '%INSTALL_DIR%\freeapi-main' -Recurse -Force"
    del "%TEMP_FILE%"
)

cd /d "%INSTALL_DIR%\freeapi"

REM Install dependencies
echo    Installing dependencies...
call npm install --silent

REM Build project
echo    Building project...
call npm run build --silent

REM Create global link
echo    Creating global link...
call npm unlink -g freeapi 2>nul
call npm link --silent

echo.
echo Installation complete!
echo.
echo Usage:
echo   freeapi --help     Show help
echo   freeapi init       Initialize configuration
echo   freeapi list       List available services
echo.
echo Quick start:
echo   1. freeapi init
echo   2. freeapi config chatgpt
echo   3. freeapi chat chatgpt
echo.
echo Installation directory: %INSTALL_DIR%\freeapi
echo GitHub: https://github.com/naturecode-official/freeapi
echo Issues: https://github.com/naturecode-official/freeapi/issues
echo.
echo Note: You may need to restart your terminal for the 'freeapi' command to work.
pause