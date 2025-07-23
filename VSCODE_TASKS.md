# VS Code Tasks для автотестов

## 🚀 Доступные задачи (Tasks)

В файле `.vscode/tasks.json` добавлены команды для запуска автотестов через VS Code Tasks.

### 📋 Список задач

#### Основные тесты
- **`Run E2E Tests (Chrome)`** - Запуск всех тестов в Chrome (по умолчанию)
- **`Run E2E Tests (Chrome - Headed)`** - Запуск тестов в видимом режиме Chrome
- **`Run E2E Tests (Chrome - Debug)`** - Запуск тестов в режиме отладки Chrome
- **`Run E2E Tests (All)`** - Запуск всех тестов (если добавлены другие браузеры)
- **`Run E2E Tests (UI Mode)`** - Запуск тестов с UI интерфейсом Playwright

#### Специальные задачи
- **`Run Specific Test File`** - Запуск конкретного файла теста
- **`Install Playwright Browsers`** - Установка браузеров Playwright
- **`Show Playwright Report`** - Открытие отчета Playwright

## 🎯 Как использовать

### Способ 1: Через Command Palette
1. Нажмите `Ctrl+Shift+P` (Windows/Linux) или `Cmd+Shift+P` (Mac)
2. Введите "Tasks: Run Task"
3. Выберите нужную задачу из списка

### Способ 2: Через Terminal
1. Откройте Terminal в VS Code (`Ctrl+`` `)
2. Введите команду напрямую:
   ```bash
   npm run test:e2e:chrome
   ```

### Способ 3: Через кнопки в интерфейсе
1. Откройте панель "Testing" (значок колбы)
2. Нажмите на кнопку "Run Tests"

## 🔧 Настройка горячих клавиш

Добавьте в `keybindings.json` (File > Preferences > Keyboard Shortcuts):

```json
[
  {
    "key": "ctrl+shift+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Run E2E Tests (Chrome)"
  },
  {
    "key": "ctrl+shift+h",
    "command": "workbench.action.tasks.runTask",
    "args": "Run E2E Tests (Chrome - Headed)"
  },
  {
    "key": "ctrl+shift+d",
    "command": "workbench.action.tasks.runTask",
    "args": "Run E2E Tests (Chrome - Debug)"
  }
]
```

## 📁 Запуск конкретного теста

### Через задачу "Run Specific Test File"
1. Запустите задачу "Run Specific Test File"
2. Введите имя файла (например: `homepage.spec.ts`)
3. Тест запустится только для этого файла

### Доступные файлы тестов:
- `homepage.spec.ts` - Тесты главной страницы
- `navigation.spec.ts` - Тесты навигации
- `game-flow.spec.ts` - Тесты игрового процесса

## 🎨 Настройка отображения

Все задачи настроены с параметрами:
- **`reveal: "always"`** - Показывать терминал при запуске
- **`panel: "shared"`** - Использовать общий терминал
- **`group: "test"`** - Группировка в категории "Test"

## 🔍 Отладка тестов

### Режим отладки
1. Запустите "Run E2E Tests (Chrome - Debug)"
2. Браузер откроется в режиме отладки
3. Вы можете пошагово выполнять тесты

### UI режим
1. Запустите "Run E2E Tests (UI Mode)"
2. Откроется веб-интерфейс Playwright
3. Вы можете визуально управлять тестами

## 📊 Просмотр отчетов

После выполнения тестов:
1. Запустите "Show Playwright Report"
2. Откроется веб-страница с подробным отчетом
3. Включает скриншоты, видео и логи

## ⚡ Быстрые команды

### Основные команды
```bash
# Запуск всех тестов в Chrome
Ctrl+Shift+P → "Run E2E Tests (Chrome)"

# Запуск в видимом режиме
Ctrl+Shift+P → "Run E2E Tests (Chrome - Headed)"

# Запуск в режиме отладки
Ctrl+Shift+P → "Run E2E Tests (Chrome - Debug)"
```

### Специальные команды
```bash
# Запуск конкретного файла
Ctrl+Shift+P → "Run Specific Test File" → введите имя файла

# Установка браузеров
Ctrl+Shift+P → "Install Playwright Browsers"

# Просмотр отчета
Ctrl+Shift+P → "Show Playwright Report"
```

## 🚨 Устранение проблем

### Задача не запускается
1. Проверьте, что dev-сервер запущен
2. Убедитесь, что Playwright установлен: `npm install --save-dev @playwright/test`
3. Установите браузеры: `npx playwright install chromium`

### Ошибки в тестах
1. Запустите тесты в режиме отладки
2. Проверьте логи в терминале
3. Используйте UI режим для визуальной отладки

### Проблемы с браузером
1. Переустановите браузеры: `npx playwright install --force`
2. Проверьте версию Playwright: `npx playwright --version`

## 📝 Примечания

1. **Dev-сервер**: Убедитесь, что `npm run dev` запущен перед тестами
2. **Порты**: Тесты настроены на `http://localhost:5173`
3. **Браузеры**: Используется только Chromium для скорости
4. **Отчеты**: Сохраняются в папке `playwright-report/`

## 🔄 Интеграция с CI/CD

Для автоматизации в CI/CD используйте команды:
```bash
# Установка зависимостей
npm install
npx playwright install chromium

# Запуск тестов
npm run test:e2e:chrome
``` 