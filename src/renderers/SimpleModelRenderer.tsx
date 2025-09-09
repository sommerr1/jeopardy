import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useAnimations, useGLTF, Grid } from '@react-three/drei';
import * as THREE from 'three';

// Импорт 3D модели
import mark23Model from '../models/mark_23__animated_free.glb';

// Простой компонент для отображения модели
const SimpleModel: React.FC<{ scale?: number }> = ({ scale = 1.0 }) => {
  const meshRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(mark23Model);
  const { actions } = useAnimations(animations, scene);
  
  // Анимация вращения
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  // Запуск анимаций
  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.values(actions)[0];
      if (firstAction) {
        firstAction.play();
      }
    }
  }, [actions]);
  
  if (!scene) {
    console.log('SimpleModel: Scene is null');
    return null;
  }
  
  console.log('SimpleModel: Rendering model with scale:', scale);
  
  return (
    <group ref={meshRef}>
      <primitive 
        object={scene} 
        scale={[scale, scale, scale]}
        position={[0, 0, 0]}
      />
    </group>
  );
};

// Компонент для отображения модели на весь экран
export const FullScreenModelRenderer: React.FC<{ scale?: number }> = ({ scale = 1.0 }) => {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none">
      {/* Панель отладки */}
      <div className="fixed top-4 left-4 z-30 bg-black/80 text-white p-3 rounded-lg text-xs font-mono">
        <div>🎯 FullScreen Model</div>
        <div>📏 Scale: {scale}x</div>
        <div>📷 Camera: [0, 0, 100]</div>
        <div>🎮 Controls: Active</div>
      </div>
      
      <Canvas
        camera={{ position: [0, 0, 100], fov: 45, near: 0.1, far: 3000 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={3.0} />
          <directionalLight position={[10, 10, 5]} intensity={3.0} />
          <pointLight position={[0, 0, 10]} intensity={2.0} />
          <Grid args={[100, 100]} cellSize={1} cellThickness={0.5} cellColor="#6b7280" sectionSize={10} sectionThickness={1} sectionColor="#9ca3af" fadeDistance={50} fadeStrength={1} followCamera={false} infiniteGrid={true} />
          <primitive object={new THREE.AxesHelper(50)} />
          <SimpleModel scale={scale} />
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            autoRotate={true}
            autoRotateSpeed={0.5}
            maxDistance={300}
            minDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

// Компонент для отображения модели снизу экрана
export const BottomModelRenderer: React.FC<{ scale?: number }> = ({ scale = 0.5 }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none z-10">
      <div className="flex justify-center items-end h-full pb-4">
        <div className="w-96 h-48 bg-gradient-to-br from-purple-500/30 to-indigo-600/30 rounded-t-2xl backdrop-blur-sm border border-purple-400/50 overflow-hidden">
          {/* Панель отладки */}
          <div className="absolute top-2 left-2 z-30 bg-black/80 text-white p-2 rounded text-xs font-mono">
            <div>🎯 Bottom Model</div>
            <div>📏 Scale: {scale}x</div>
          </div>
          
          <Canvas
            camera={{ position: [0, 0, 50], fov: 75, near: 0.1, far: 2000 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={2.0} />
              <directionalLight position={[5, 5, 5]} intensity={2.0} />
              <pointLight position={[0, 0, 5]} intensity={1.0} />
              <Grid args={[50, 50]} cellSize={1} cellThickness={0.3} cellColor="#6b7280" sectionSize={5} sectionThickness={0.8} sectionColor="#9ca3af" fadeDistance={25} fadeStrength={1} followCamera={false} infiniteGrid={true} />
              <primitive object={new THREE.AxesHelper(25)} />
              <SimpleModel scale={scale} />
              <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                autoRotate={false}
                maxDistance={100}
                minDistance={10}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}; 