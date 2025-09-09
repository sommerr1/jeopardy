# Настройка 3D моделей и Three.js

## Установленные зависимости

```bash
npm install @react-three/fiber@8.15.19 @react-three/drei@9.102.6 three@0.162.0 --legacy-peer-deps
npm install --save-dev @types/three
```

## Компоненты для работы с 3D моделями

### GLBModel
Основной компонент для загрузки и отображения GLB файлов:

```typescript
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
```

### BottomModel
Компонент для отображения 3D модели снизу экрана:

```typescript
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
```

## Настройка освещения

### Типы источников света

1. **Ambient Light** - рассеянное освещение
   ```typescript
   <ambientLight intensity={0.5} />
   ```

2. **Directional Light** - направленный свет
   ```typescript
   <directionalLight position={[10, 10, 5]} intensity={1} />
   ```

3. **Point Light** - точечный источник света
   ```typescript
   <pointLight position={[-10, -10, -5]} intensity={0.5} />
   ```

### Окружение
```typescript
<Environment preset="sunset" />
```

Доступные пресеты: `sunset`, `dawn`, `night`, `warehouse`, `forest`, `apartment`, `studio`, `city`, `park`, `lobby`

## Настройка камеры

```typescript
<Canvas
  camera={{ 
    position: [0, 0, 5], // позиция камеры [x, y, z]
    fov: 50              // поле зрения
  }}
>
```

## Оптимизация производительности

1. **Используйте Suspense** для асинхронной загрузки:
   ```typescript
   <Suspense fallback={<div>Загрузка...</div>}>
     <GLBModel modelPath={modelPath} />
   </Suspense>
   ```

2. **Оптимизируйте размеры моделей** (рекомендуется < 5MB)

3. **Используйте LOD** для сложных моделей

4. **Кэшируйте загруженные модели**

## Устранение неполадок

### Модель не отображается
1. Проверьте путь к файлу
2. Убедитесь, что файл в формате GLB
3. Проверьте консоль на ошибки загрузки

### Проблемы с производительностью
1. Уменьшите качество текстур
2. Оптимизируйте геометрию модели
3. Используйте более простые модели для мобильных устройств

### Проблемы с освещением
1. Увеличьте интенсивность источников света
2. Добавьте дополнительные источники света
3. Проверьте настройки материала модели 