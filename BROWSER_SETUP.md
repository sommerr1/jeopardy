# Настройка браузеров для автотестов

## ✅ Текущая конфигурация: Только Chrome (Chromium)

В файле `playwright.config.ts` настроен только Chromium для автотестов. Остальные браузеры закомментированы.

```typescript
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
  // Закомментированные браузеры для автотестов
  // {
  //   name: 'firefox',
  //   use: { ...devices['Desktop Firefox'] },
  // },
  // {
  //   name: 'webkit',
  //   use: { ...devices['Desktop Safari'] },
  // },
  // {
  //   name: 'Mobile Chrome',
  //   use: { ...devices['Pixel 5'] },
  // },
  // {
  //   name: 'Mobile Safari',
  //   use: { ...devices['iPhone 12'] },
  // },
],
```

## 🚀 Запуск тестов в Chrome

```bash
# Основные команды
npm run test:e2e:chrome
npm run test:e2e:chrome:headed
npm run test:e2e:chrome:debug

# Или через npx
npx playwright test --project=chromium
```

## 🔧 Как добавить другие браузеры

### 1. Установить браузеры
```bash
# Установка всех браузеров
npx playwright install

# Или выборочно
npx playwright install firefox
npx playwright install webkit
```

### 2. Раскомментировать в конфигурации
Раскомментируйте нужные браузеры в `playwright.config.ts`:

```typescript
projects: [
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
  // Mobile браузеры (опционально)
  // {
  //   name: 'Mobile Chrome',
  //   use: { ...devices['Pixel 5'] },
  // },
  // {
  //   name: 'Mobile Safari',
  //   use: { ...devices['iPhone 12'] },
  // },
],
```

### 3. Добавить команды в package.json
```json
{
  "scripts": {
    "test:e2e:firefox": "playwright test --project=firefox",
    "test:e2e:webkit": "playwright test --project=webkit",
    "test:e2e:all": "playwright test"
  }
}
```

## 📊 Сравнение браузеров

| Браузер | Скорость | Стабильность | Поддержка | Рекомендация |
|---------|----------|--------------|-----------|--------------|
| Chromium | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Основной |
| Firefox | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Для кроссбраузерности |
| WebKit | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⚠️ Для Safari |
| Mobile | ⭐⭐ | ⭐⭐ | ⭐⭐ | ⚠️ Для мобильных |

## 🎯 Рекомендации

### Для разработки
- ✅ Используйте только Chromium (текущая настройка)
- ✅ Быстрое выполнение тестов
- ✅ Меньше ресурсов

### Для CI/CD
- ✅ Добавьте Firefox для базового кроссбраузерного тестирования
- ✅ Chromium + Firefox покрывают 95% пользователей

### Для релизов
- ✅ Запускайте все браузеры
- ✅ Полное кроссбраузерное покрытие
- ✅ Больше времени выполнения

## 🔄 Быстрое переключение

### Только Chrome
```bash
npm run test:e2e:chrome
```

### Chrome + Firefox
```bash
npx playwright test --project=chromium --project=firefox
```

### Все браузеры
```bash
npx playwright test
```

## 📝 Примечания

1. **Производительность**: Каждый дополнительный браузер увеличивает время выполнения тестов
2. **Ресурсы**: Больше браузеров = больше потребление памяти и CPU
3. **Стабильность**: Chromium обычно самый стабильный для автотестов
4. **Поддержка**: Некоторые функции могут работать по-разному в разных браузерах

## 🚨 Устранение проблем

### Браузер не устанавливается
```bash
# Очистка кэша
npx playwright install --force

# Проверка установленных браузеров
npx playwright --version
```

### Тесты падают в определенном браузере
1. Проверьте специфичные для браузера функции
2. Добавьте условную логику в тесты
3. Используйте теги для исключения проблемных тестов 