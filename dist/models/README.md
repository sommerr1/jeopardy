# 3D Модели для рендерера "Автоматы"

Эта папка содержит 3D модели в формате GLB для использования в рендерере "Автоматы".

## Поддерживаемые модели

### Текущие модели (заглушки)
- `automata_left.glb` - Левый автомат
- `automata_right.glb` - Правый автомат  
- `question_automata.glb` - Автомат для вопросов

### Как добавить реальные 3D модели

1. **Подготовка моделей:**
   - Экспортируйте модели в формате GLB
   - Оптимизируйте размер (рекомендуется < 5MB)
   - Убедитесь, что текстуры встроены в файл

2. **Размещение:**
   - Поместите .glb файлы в эту папку
   - Используйте понятные имена файлов

3. **Интеграция с Three.js:**
   ```javascript
   import { useGLTF } from '@react-three/drei';
   
   function AutomataModel({ modelPath }) {
     const { scene } = useGLTF(modelPath);
     return <primitive object={scene} />;
   }
   ```

## Рекомендации по дизайну

- **Цветовая схема:** Фиолетовые и индиго тона
- **Стиль:** Футуристический, технологичный
- **Анимации:** Плавные переходы и эффекты
- **Размер:** Адаптивный под разные экраны

## Производительность

- Используйте LOD (Level of Detail) для сложных моделей
- Оптимизируйте геометрию и текстуры
- Кэшируйте загруженные модели
- Используйте сжатие текстур

## Примеры использования

```typescript
// В AutomataRenderer.tsx
const ThreeDElement: React.FC<{ modelPath?: string }> = ({ modelPath }) => {
  if (modelPath) {
    return (
      <Canvas>
        <AutomataModel modelPath={modelPath} />
      </Canvas>
    );
  }
  
  // Fallback на эмодзи
  return <div className="text-4xl">🤖</div>;
};
``` 