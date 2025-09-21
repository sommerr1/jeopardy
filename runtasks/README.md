# 🚀 Runtasks - Скрипты для запуска и управления

Эта папка содержит все скрипты для запуска, остановки и проверки статуса сервисов проекта Jeopardy.

## 📁 Содержимое папки

### **PowerShell скрипты (.ps1)**
- **`check-status.ps1`** - Подробная проверка статуса всех сервисов
- **`quick-check.ps1`** - Быстрая проверка только портов

### **Batch скрипты (.bat)**
- **`start-jeopardy.bat`** - Запуск всех сервисов (dev + proxy + browser tools)
- **`start-dev-only.bat`** - Запуск только Vite dev сервера
- **`stop-jeopardy.bat`** - Остановка всех Node.js процессов
- **`restart-jeopardy.bat`** - Перезапуск всех сервисов с проверкой

## 🎯 Способы использования

### **1. Через npm команды (рекомендуется)**
```bash
# Проверка статуса
npm run check:status
npm run check:quick

# Запуск сервисов
npm run start
npm run start:local
npm run dev
npm run proxy
```

### **2. Напрямую через PowerShell**
```powershell
# Проверка статуса
.\runtasks\check-status.ps1
.\runtasks\quick-check.ps1
```

### **3. Напрямую через Batch файлы**
```cmd
# Запуск сервисов
.\runtasks\start-jeopardy.bat
.\runtasks\start-dev-only.bat
.\runtasks\restart-jeopardy.bat

# Остановка сервисов
.\runtasks\stop-jeopardy.bat
```

## 🔧 Что проверяют скрипты

### **Проверка статуса:**
- **Прокси сервер** (порт 3001) - для обхода CORS
- **Vite Dev сервер** (порт 5173) - основное приложение
- **Browser Tools Server** (порт 3000) - инструменты разработки

### **Запуск сервисов:**
- **start-jeopardy.bat** - запускает все сервисы параллельно
- **start-dev-only.bat** - запускает только Vite dev сервер
- **restart-jeopardy.bat** - останавливает все, затем запускает заново

### **Остановка сервисов:**
- **stop-jeopardy.bat** - принудительно завершает все Node.js процессы

## 📊 Примеры вывода

### **Быстрая проверка:**
```
Quick service check...
OK Proxy (port 3001): RUNNING
OK Vite Dev (port 5173): RUNNING
FAIL Browser Tools (port 3000): NOT RUNNING

For detailed check run: .\runtasks\check-status.ps1
```

### **Подробная проверка:**
```
Checking Jeopardy services status...

Checking proxy server (port 3001)...
OK Proxy server: RUNNING and responding

Checking Vite dev server (port 5173)...
OK Vite dev server: RUNNING and responding

Checking browser-tools-server (port 3000)...
FAIL Browser Tools Server: NOT RUNNING

Final status:
Running services: 2 of 3
```

## 🌐 URL для проверки

- **Сайт**: http://localhost:5173
- **Прокси API**: http://localhost:3001/api/questions?getsheets=1
- **Browser Tools**: http://localhost:3000

## 🐛 Устранение проблем

### **Проблема: "Execution Policy" ошибка**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### **Проблема: Порт занят**
```bash
# Найти процесс
netstat -ano | findstr :3001
netstat -ano | findstr :5173
netstat -ano | findstr :3000

# Завершить процесс
taskkill /PID <PID> /F
```

### **Проблема: Сервис не запускается**
1. Проверьте, что все зависимости установлены: `npm install`
2. Проверьте логи в консоли
3. Убедитесь, что порты свободны
4. Попробуйте перезапустить: `.\runtasks\restart-jeopardy.bat`

## 📝 Логирование

Все скрипты выводят подробную информацию о:
- Статусе каждого сервиса
- Активных процессах Node.js
- Рекомендациях по устранению проблем
- Командах для запуска сервисов

## 🔄 Автоматизация

Скрипты можно использовать в CI/CD pipeline или автоматических тестах:

```bash
# Проверка перед тестами
npm run check:status && npm run test:e2e

# Автоматический перезапуск при ошибках
.\runtasks\restart-jeopardy.bat
```

## 📋 Зависимости

- **Node.js** - для запуска серверов
- **npm** - для управления зависимостями
- **PowerShell** - для скриптов проверки статуса
- **Windows Command Prompt** - для batch файлов

## 🎯 Рекомендации

1. **Используйте npm команды** для кроссплатформенности
2. **Проверяйте статус** перед началом работы
3. **Используйте restart-jeopardy.bat** при проблемах
4. **Следите за логами** для диагностики проблем
