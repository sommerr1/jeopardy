# Система рендереров для Jeopardy

## Обзор

Система рендереров позволяет легко переключаться между разными визуальными стилями игры без изменения основной логики. Каждый рендерер реализует интерфейс `GameRenderer` и отвечает за отображение игровых компонентов.

## Архитектура

### Интерфейс GameRenderer

```typescript
interface GameRenderer {
  renderBoard(questions, answered, onSelect, wronganswersstr?): React.ReactNode;
  renderQuestion(question, onAnswer, answered, onClose, modalRef?): React.ReactNode;
  renderScore(player, score, total, showCoin, onCoinAnimationEnd, coinOrigin, coins): React.ReactNode;
  renderWrongAnswers(wrongAnswers): React.ReactNode;
}
```

### Фабрика рендереров

`RendererFactory` управляет регистрацией и получением рендереров:

```typescript
// Регистрация рендерера
RendererFactory.register('classic', new ClassicRenderer());

// Получение рендерера
const renderer = RendererFactory.get('classic');

// Список доступных типов
const types = RendererFactory.getAvailableTypes();
```

## Доступные рендереры

### 1. ClassicRenderer
- **Тип**: `'classic'`
- **Описание**: Использует существующие компоненты GameBoard, QuestionModal, ScoreBoard
- **Особенности**: Полная совместимость с текущим дизайном

### 2. MinimalRenderer
- **Тип**: `'minimal'`
- **Описание**: Упрощенный дизайн с минималистичным интерфейсом
- **Особенности**: 
  - Компактная сетка вопросов
  - Простые кнопки
  - Минимальное количество элементов

### 3. DarkRenderer
- **Тип**: `'dark'`
- **Описание**: Темная тема с контрастными цветами
- **Особенности**:
  - Темный фон
  - Фиолетовые акценты
  - Высокий контраст

### 4. AutomataRenderer
- **Тип**: `'automata'`
- **Описание**: Специальный рендерер для типа игры "Автоматы"
- **Особенности**:
  - Поддержка 3D моделей GLB
  - Футуристический дизайн
  - Фиолетовая цветовая схема
  - Автоматические переходы и анимации
  - Специальные компоненты для автоматов

## Использование

### В компоненте App.tsx

```typescript
import { RendererFactory } from './renderers';

export default function App() {
  const [selectedRenderer, setSelectedRenderer] = useState<RendererType>('classic');
  const currentRenderer = RendererFactory.get(selectedRenderer);

  return (
    <div>
      <TopBar
        availableRenderers={RendererFactory.getAvailableTypes()}
        currentRenderer={selectedRenderer}
        onRendererChange={setSelectedRenderer}
      />
      
      {currentRenderer.renderScore(player, score, total, ...)}
      {currentRenderer.renderBoard(questions, answered, onSelect, ...)}
      {currentRenderer.renderQuestion(question, onAnswer, ...)}
    </div>
  );
}
```

### Добавление нового рендерера

1. Создайте новый класс, реализующий `GameRenderer`:

```typescript
export class CustomRenderer implements GameRenderer {
  renderBoard(questions, answered, onSelect, wronganswersstr) {
    // Ваша реализация
  }
  
  renderQuestion(question, onAnswer, answered, onClose, modalRef) {
    // Ваша реализация
  }
  
  renderScore(player, score, total, showCoin, onCoinAnimationEnd, coinOrigin, coins) {
    // Ваша реализация
  }
  
  renderWrongAnswers(wrongAnswers) {
    // Ваша реализация
  }
}
```

2. Зарегистрируйте рендерер в `src/renderers/index.ts`:

```typescript
import { CustomRenderer } from './CustomRenderer';

RendererFactory.register('custom', new CustomRenderer());
```

3. Добавьте тип в `src/types.ts`:

```typescript
export type RendererType = 'classic' | 'minimal' | 'dark' | 'custom';
```

## Преимущества

1. **Модульность**: Каждый рендерер инкапсулирует свою логику отображения
2. **Расширяемость**: Легко добавлять новые стили без изменения основной логики
3. **Совместимость**: Существующий код остается без изменений
4. **Гибкость**: Можно переключаться между рендерерами на лету
5. **Тестируемость**: Каждый рендерер можно тестировать отдельно

## Планы развития

- [ ] Анимированный рендерер с CSS-анимациями
- [ ] Мобильный рендерер для сенсорных устройств
- [ ] Доступный рендерер с улучшенной поддержкой скринридеров
- [ ] Кастомизируемый рендерер с настройками пользователя 