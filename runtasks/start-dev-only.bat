@echo off
setlocal enabledelayedexpansion

REM Получаем абсолютный путь к директории проекта (на уровень выше)
set "PROJECT_DIR=%~dp0.."
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo ========================================
echo    Language Jeopardy - Только Dev Server
echo ========================================
echo.
echo Проект находится в: %PROJECT_DIR%
echo.

REM Проверяем наличие package.json
if not exist "%PROJECT_DIR%\package.json" (
    echo ОШИБКА: Файл package.json не найден в директории %PROJECT_DIR%
    echo Убедитесь, что бат файл находится в корне проекта.
    pause
    exit /b 1
)

REM Переходим в директорию проекта
cd /d "%PROJECT_DIR%"

echo Запускаем только Vite dev server (порт 5173)...
echo.
echo Для остановки нажмите Ctrl+C
echo.

REM Запускаем только dev сервер
call npm run dev

REM Если команда завершилась с ошибкой
if errorlevel 1 (
    echo.
    echo ОШИБКА: Произошла ошибка при запуске dev сервера.
    echo Проверьте логи выше для получения подробной информации.
    pause
    exit /b 1
)

echo.
echo Dev сервер остановлен.
pause
