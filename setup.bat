@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1

:: ╔══════════════════════════════════════════════════════╗
:: ║       PixelPal — One-Click Setup (Windows)           ║
:: ╚══════════════════════════════════════════════════════╝

echo.
echo   ██████╗ ██╗██╗  ██╗███████╗██╗     ██████╗  █████╗ ██╗
echo   ██╔══██╗██║╚██╗██╔╝██╔════╝██║     ██╔══██╗██╔══██╗██║
echo   ██████╔╝██║ ╚███╔╝ █████╗  ██║     ██████╔╝███████║██║
echo   ██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║     ██╔═══╝ ██╔══██║██║
echo   ██║     ██║██╔╝ ██╗███████╗███████╗██║     ██║  ██║███████╗
echo   ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝
echo.
echo   Your cute pixel-art desktop companion
echo.

:: ── 1. Check Node ─────────────────────────────────────────────────────────────
echo [1/4] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [WARN] Node.js not found.
  echo [INFO] Opening Node.js download page...
  start https://nodejs.org/en/download/
  echo.
  echo Please install Node.js 18 or later, then run this script again.
  echo.
  pause
  exit /b 1
)

for /f "tokens=1" %%v in ('node --version') do set NODE_VERSION=%%v
echo [OK] Node.js %NODE_VERSION% found

:: ── 2. Install dependencies ───────────────────────────────────────────────────
echo.
echo [2/4] Installing dependencies...
echo       (Downloading Electron ~100MB, please wait)
echo.
call npm install
if %errorlevel% neq 0 (
  echo [ERROR] npm install failed. Check your internet connection and try again.
  pause
  exit /b 1
)
echo [OK] Dependencies installed

:: ── 3. Build ──────────────────────────────────────────────────────────────────
echo.
echo [3/4] Building PixelPal...
call npm run build
if %errorlevel% neq 0 (
  echo [ERROR] Build failed. See errors above.
  pause
  exit /b 1
)
echo [OK] Build complete

:: ── 4. Launch ─────────────────────────────────────────────────────────────────
echo.
echo ╔══════════════════════════════════════╗
echo ║   Setup complete!  Launching...      ║
echo ╚══════════════════════════════════════╝
echo.
echo   Your pet will appear on your desktop.
echo   Right-click the pet to open Settings.
echo   Check the system tray to control PixelPal.
echo.

call npx electron .
