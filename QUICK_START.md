# 🚀 Быстрый старт автотестов

## ⚡ Быстрый запуск через VS Code

### 1. Запустите dev-сервер
```bash
npm run dev
```

### 2. Запустите тесты через Tasks
1. `Ctrl+Shift+P` → "Tasks: Run Task"
2. Выберите **"Run E2E Tests (Chrome)"**

## 🎯 Основные команды

| Действие | VS Code Task | Терминал |
|----------|--------------|----------|
| Запуск тестов | `Run E2E Tests (Chrome)` | `npm run test:e2e:chrome` |
| Видимый режим | `Run E2E Tests (Chrome - Headed)` | `npm run test:e2e:chrome:headed` |
| Отладка | `Run E2E Tests (Chrome - Debug)` | `npm run test:e2e:chrome:debug` |
| UI режим | `Run E2E Tests (UI Mode)` | `npm run test:e2e:ui` |
| Конкретный файл | `Run Specific Test File` | `npx playwright test homepage.spec.ts` |
| Отчет | `Show Playwright Report` | `npx playwright show-report` |

## 🔧 Настройка горячих клавиш

Добавьте в `keybindings.json`:
```json
{
  "key": "ctrl+shift+t",
  "command": "workbench.action.tasks.runTask",
  "args": "Run E2E Tests (Chrome)"
}
```

## 📁 Файлы тестов

- `tests/e2e/homepage.spec.ts` - Главная страница
- `tests/e2e/navigation.spec.ts` - Навигация
- `tests/e2e/game-flow.spec.ts` - Игровой процесс

## 🚨 Если что-то не работает

1. **Dev-сервер не запущен**: `npm run dev`
2. **Браузер не установлен**: `npx playwright install chromium`
3. **Зависимости не установлены**: `npm install`
4. **Проблемы с тестами**: Запустите в режиме отладки

## 📊 Результаты

- Отчеты: `playwright-report/`
- Скриншоты: при ошибках
- Видео: в режиме отладки
- Логи: в терминале

## 🎯 Рекомендуемый workflow

1. Запустите dev-сервер
2. Запустите тесты через VS Code Tasks
3. При ошибках используйте режим отладки
4. Просмотрите отчеты для анализа 