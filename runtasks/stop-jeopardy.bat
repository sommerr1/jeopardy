@echo off
REM Устанавливаем UTF-8, чтобы избежать кракозябр в терминале VS Code/PowerShell
chcp 65001 >nul

echo ========================================
echo    Language Jeopardy - Остановка серверов
echo ========================================
echo.

echo Останавливаем все процессы Node.js...
echo.

REM Останавливаем все процессы node.exe
taskkill /f /im node.exe >nul 2>&1

if errorlevel 1 (
    echo Процессы Node.js не найдены или уже остановлены.
) else (
    echo Все процессы Node.js успешно остановлены.
)

echo.
echo Останавливаем процессы npm...
taskkill /f /im npm.cmd >nul 2>&1
taskkill /f /im npm >nul 2>&1

echo.
echo Останавливаем процессы связанные с Vite...
taskkill /f /im vite.exe >nul 2>&1

echo.
echo Все серверы остановлены.
pause
