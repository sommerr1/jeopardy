# Развертывание Jeopardy-Lang

## Автоматическое определение окружения

Приложение автоматически определяет, где оно запущено, и использует соответствующий способ обращения к API:

- **Локальная разработка** (`localhost`): Использует Express прокси-сервер
- **Netlify** (`*.netlify.app`): Использует Netlify Functions
- **Другие домены**: Использует Netlify Functions (fallback)

## Локальная разработка

### Запуск с прокси (рекомендуется)
```bash
npm run start:local
```
Это запустит:
- Vite dev server на порту 5173
- Express прокси на порту 3001

### Запуск только фронтенда
```bash
npm run dev
```
⚠️ **Внимание**: Без прокси будут ошибки CORS при обращении к Google Sheets API.

## Развертывание на Netlify

### Автоматическое развертывание из GitHub

1. **Подключите репозиторий к Netlify:**
   - Зайдите в [Netlify Dashboard](https://app.netlify.com)
   - Нажмите "New site from Git"
   - Выберите GitHub и ваш репозиторий

2. **Настройки сборки:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18` (указано в netlify.toml)

3. **Deploy:**
   - Netlify автоматически соберет проект
   - Netlify Functions будут созданы из папки `netlify/functions/`
   - Приложение будет доступно по адресу `https://your-site.netlify.app`

### Ручное развертывание

```bash
# Сборка проекта
npm run build

# Загрузка на Netlify через CLI
npx netlify deploy --prod --dir=dist
```

## Структура файлов для развертывания

```
├── netlify/
│   └── functions/
│       └── questions.js          # Netlify Function для API
├── netlify.toml                  # Конфигурация Netlify
├── src/
│   └── utils/
│       ├── environment.ts        # Определение окружения
│       └── fetchQuestions.ts     # API запросы с автопереключением
└── proxy.js                      # Локальный прокси (только для разработки)
```

## Отладка

### Проверка окружения
В консоли браузера (в режиме разработки) будет выведена информация об окружении:
```javascript
🔧 Environment Detection: {
  hostname: "localhost",
  isNetlify: false,
  isLocalhost: true,
  isDevelopment: true,
  isProduction: false,
  mode: "development",
  apiConfig: { useProxy: true, useNetlifyFunctions: false, useDirectApi: false }
}
```

### Логи API запросов
В режиме разработки все API запросы логируются в консоль:
```javascript
📋 Fetching sheets list from: http://localhost:3001/api/questions?getsheets=1
❓ Fetching questions from sheet: Sheet1 URL: http://localhost:3001/api/questions?name=Sheet1
```

### Netlify Functions логи
Логи Netlify Functions доступны в Netlify Dashboard:
- Functions → questions → View logs

## Переменные окружения

Если нужно изменить API URL для разных окружений, можно использовать переменные окружения Netlify:

1. В Netlify Dashboard: Site settings → Environment variables
2. Добавить: `VITE_SPREADSHEET_API_URL` = ваш URL
3. Обновить `src/utils/spreadsheetApiUrl.ts` для использования переменной

## Troubleshooting

### Ошибки CORS
- Убедитесь, что локально запущен прокси: `npm run proxy`
- Проверьте, что Netlify Function развернута корректно

### Ошибки сборки
- Проверьте версию Node.js (должна быть 18+)
- Убедитесь, что все зависимости установлены: `npm install`

### Проблемы с Netlify Functions
- Проверьте логи в Netlify Dashboard
- Убедитесь, что `node-fetch` в dependencies (не devDependencies)
- Проверьте синтаксис в `netlify/functions/questions.js`
