@echo off
setlocal enabledelayedexpansion

REM Получаем абсолютный путь к директории проекта
set "PROJECT_DIR=%~dp0"
set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo ========================================
echo    Language Jeopardy - Запуск серверов
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

REM Проверяем наличие node_modules
if not exist "%PROJECT_DIR%\node_modules" (
    echo ВНИМАНИЕ: Директория node_modules не найдена.
    echo Устанавливаем зависимости...
    echo.
    cd /d "%PROJECT_DIR%"
    call npm install
    if errorlevel 1 (
        echo ОШИБКА: Не удалось установить зависимости.
        pause
        exit /b 1
    )
    echo.
    echo Зависимости успешно установлены!
    echo.
)

REM Переходим в директорию проекта
cd /d "%PROJECT_DIR%"

echo Запускаем серверы...
echo.
echo - Vite dev server (порт 5173)
echo - Express proxy server (порт 3001)
echo - Browser tools server
echo.
echo Для остановки нажмите Ctrl+C
echo.

REM Запускаем все серверы параллельно
call npm start

REM Если команда завершилась с ошибкой
if errorlevel 1 (
    echo.
    echo ОШИБКА: Произошла ошибка при запуске серверов.
    echo Проверьте логи выше для получения подробной информации.
    pause
    exit /b 1
)

echo.
echo Серверы остановлены.
pause
