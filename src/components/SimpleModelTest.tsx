import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import mark23Model from '../models/mark_23__animated_free.glb';

const SimpleModel: React.FC = () => {
  console.log('SimpleModel: Loading model from:', mark23Model);
  
  try {
    const { scene } = useGLTF(mark23Model);
    console.log('SimpleModel: Model loaded successfully:', scene);
    
    return (
      <primitive 
        object={scene} 
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    );
  } catch (error) {
    console.error('SimpleModel: Error loading model:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
};

const SimpleModelTest: React.FC = () => {
  return (
    <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
      <div className="w-96 h-96 bg-white rounded-lg overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={
            <mesh>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="blue" />
            </mesh>
          }>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <SimpleModel />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default SimpleModelTest; 