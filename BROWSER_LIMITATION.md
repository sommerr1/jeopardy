# Способы ограничения браузеров в Playwright

## ✅ Текущая настройка: Только Chromium

В вашем проекте настроен только Chromium для тестирования. Это самый простой и эффективный способ.

## 🔧 Способы ограничения браузеров

### 1. **Оставить только нужный браузер в конфигурации** (текущий подход)

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Удалены все остальные браузеры
  ],
});
```

**Преимущества:**
- ✅ Простота настройки
- ✅ Быстрый запуск тестов
- ✅ Экономия ресурсов
- ✅ Меньше зависимостей

### 2. **Использование переменных окружения**

```typescript
// playwright.config.ts
export default defineConfig({
  projects: process.env.BROWSER === 'firefox' ? [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ] : process.env.BROWSER === 'webkit' ? [
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ] : [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

**Использование:**
```bash
# Запуск в Firefox
BROWSER=firefox npm run test:e2e

# Запуск в WebKit
BROWSER=webkit npm run test:e2e

# Запуск в Chromium (по умолчанию)
npm run test:e2e
```

### 3. **Использование тегов в тестах**

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      grep: /@chromium/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /@firefox/,
    },
  ],
});
```

**В тестах:**
```typescript
test('should work in chromium @chromium', async ({ page }) => {
  // Тест только для Chromium
});

test('should work in firefox @firefox', async ({ page }) => {
  // Тест только для Firefox
});
```

### 4. **Запуск с указанием проекта**

```bash
# Запуск только в Chromium
npx playwright test --project=chromium

# Запуск только в Firefox
npx playwright test --project=firefox

# Запуск в нескольких браузерах
npx playwright test --project=chromium --project=firefox
```

### 5. **Условная конфигурация для CI/CD**

```typescript
// playwright.config.ts
export default defineConfig({
  projects: process.env.CI ? [
    // В CI запускаем только Chromium для скорости
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ] : [
    // Локально запускаем все браузеры
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## 🚀 Команды для запуска в Chromium

### Основные команды
```bash
# Запуск всех тестов в Chromium
npm run test:e2e:chrome

# Запуск в Chromium в видимом режиме
npm run test:e2e:chrome:headed

# Запуск в Chromium в режиме отладки
npm run test:e2e:chrome:debug
```

### Дополнительные команды
```bash
# Запуск конкретного теста в Chromium
npx playwright test homepage.spec.ts --project=chromium

# Запуск тестов с определенным тегом в Chromium
npx playwright test --grep "homepage" --project=chromium

# Запуск в Chromium с UI интерфейсом
npx playwright test --project=chromium --ui
```

## 📊 Сравнение подходов

| Подход | Простота | Гибкость | Скорость | Рекомендация |
|--------|----------|----------|----------|--------------|
| Только один браузер | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Для большинства проектов |
| Переменные окружения | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Для гибкости |
| Теги | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⚠️ Для сложных сценариев |
| Указание проекта | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Для выборочного тестирования |

## 🎯 Рекомендации

1. **Для разработки**: Используйте только Chromium (текущий подход)
2. **Для CI/CD**: Добавьте Firefox для кроссбраузерного тестирования
3. **Для релизов**: Запускайте все браузеры для полного покрытия
4. **Для отладки**: Используйте режим `--headed` для визуального контроля

## 🔄 Изменение конфигурации

Если в будущем понадобится добавить другие браузеры:

1. Установите браузеры: `npx playwright install firefox webkit`
2. Добавьте проекты в `playwright.config.ts`
3. Обновите команды в `package.json`
4. Протестируйте на разных браузерах 