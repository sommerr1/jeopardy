@echo off
echo ========================================
echo    Перезапуск Jeopardy приложения
echo ========================================

echo.
echo [1/5] Остановка всех процессов Node.js...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Процессы Node.js остановлены
) else (
    echo - Процессы Node.js не найдены
)

echo.
echo [2/5] Ожидание завершения процессов...
timeout /t 3 /nobreak >nul

echo.
echo [3/5] Запуск прокси сервера...
start "Jeopardy Proxy" cmd /c "node proxy.js"
timeout /t 2 /nobreak >nul

echo.
echo [4/5] Запуск основного приложения...
start "Jeopardy App" cmd /c "npm run dev"
timeout /t 5 /nobreak >nul

echo.
echo [5/5] Проверка статуса сервисов...
echo Проверяем порты 3001 (прокси) и 5173 (приложение)...

:check_ports
netstat -an | findstr ":3001" >nul
if %errorlevel% equ 0 (
    echo ✓ Прокси сервер запущен на порту 3001
) else (
    echo ✗ Прокси сервер не найден на порту 3001
)

netstat -an | findstr ":5173" >nul
if %errorlevel% equ 0 (
    echo ✓ Приложение запущено на порту 5173
) else (
    echo ✗ Приложение не найдено на порту 5173
)

echo.
echo ========================================
echo    Перезапуск завершен!
echo ========================================
echo.
echo Откройте браузер и перейдите по адресу:
echo http://localhost:5173
echo.
echo Для остановки сервисов используйте:
echo stop-jeopardy.bat
echo.
pause
