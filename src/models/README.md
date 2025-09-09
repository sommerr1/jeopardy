# 3D Модели для рендерера "Автоматы"

Эта папка содержит 3D модели в формате GLB для использования в рендерере "Автоматы".

## Поддерживаемые модели

### Текущие модели
- `mark_23__animated_free.glb` - Основная анимированная модель (отображается снизу экрана)
- Простые 3D объекты роботов (создаются программно)

### Как добавить реальные 3D модели

1. **Подготовка моделей:**
   - Экспортируйте модели в формате GLB
   - Оптимизируйте размер (рекомендуется < 5MB)
   - Убедитесь, что текстуры встроены в файл

2. **Размещение:**
   - Поместите .glb файлы в эту папку
   - Используйте понятные имена файлов

3. **Импорт в коде:**
   ```typescript
   import mark23Model from './models/mark_23__animated_free.glb';
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
import { Canvas } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import mark23Model from '../models/mark_23__animated_free.glb';

// Компонент для загрузки и отображения GLB модели
const GLBModel: React.FC<{ modelPath: string }> = ({ modelPath }) => {
  const { scene } = useGLTF(modelPath);
  
  return (
    <primitive 
      object={scene} 
      scale={[0.5, 0.5, 0.5]}
      position={[0, -1, 0]}
      rotation={[0, Math.PI / 4, 0]}
    />
  );
};

// Компонент для отображения 3D модели снизу экрана
const BottomModel: React.FC<{ modelPath: string }> = ({ modelPath }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none z-10">
      <div className="flex justify-center items-end h-full pb-4">
        <div className="w-64 h-40 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 rounded-t-2xl backdrop-blur-sm border border-purple-400/50 overflow-hidden">
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <pointLight position={[-10, -10, -5]} intensity={0.5} />
              <GLBModel modelPath={modelPath} />
              <Environment preset="sunset" />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
};

// Использование в игровой доске
<BottomModel modelPath={mark23Model} />
``` 