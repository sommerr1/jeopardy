import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';

const ModelViewer: React.FC = () => {
  const meshRef = useRef<THREE.Group>(null);
  
  // Загружаем модель
  const { scene, animations } = useGLTF('/src/models/mark_23__animated_free.glb');
  
  // Добавляем поддержку анимаций
  const { actions } = useAnimations(animations, scene);
  
  // Добавляем анимацию вращения
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  // Обрабатываем анимации
  useEffect(() => {
    console.log('ModelTest: Found animations:', animations?.length || 0);
    if (animations && animations.length > 0) {
      console.log('ModelTest: Animation names:', animations.map(anim => anim.name));
      
      // Запускаем первую анимацию если она есть
      if (actions && Object.keys(actions).length > 0) {
        const firstAction = Object.values(actions)[0];
        if (firstAction) {
          console.log('ModelTest: Playing animation:', firstAction.getClip().name);
          firstAction.play();
        }
      }
    } else {
      console.log('ModelTest: No animations found in model');
    }
  }, [animations, actions]);
  
  console.log('ModelTest: Scene loaded:', scene);
  console.log('ModelTest: Scene children count:', scene?.children?.length || 0);
  
  return (
    <group ref={meshRef}>
      <primitive 
        object={scene} 
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    </group>
  );
};

const ModelTest: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 w-4/5 h-4/5 relative">
        <button 
          className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded"
          onClick={() => window.location.reload()}
        >
          Закрыть
        </button>
        <Canvas
          camera={{ position: [0, 2, 5], fov: 60 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} />
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          <ModelViewer />
        </Canvas>
      </div>
    </div>
  );
};

export default ModelTest; 