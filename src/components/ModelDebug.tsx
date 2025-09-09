import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import mark23Model from '../models/mark_23__animated_free.glb';

const DebugModel: React.FC = () => {
  console.log('DebugModel: Starting to load model');
  console.log('DebugModel: Model path:', mark23Model);
  
  try {
    const { scene } = useGLTF(mark23Model);
    console.log('DebugModel: Model loaded successfully!', scene);
    
    return (
      <primitive 
        object={scene} 
        scale={[1, 1, 1]}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
      />
    );
  } catch (error) {
    console.error('DebugModel: Failed to load model:', error);
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  }
};

const ModelDebug: React.FC = () => {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
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
            <ambientLight intensity={1} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <DebugModel />
          </Suspense>
        </Canvas>
      </div>
      <div className="absolute top-4 left-4 text-white bg-black p-4 rounded">
        <h3>Model Debug</h3>
        <p>Check console for logs</p>
        <p>Model path: {mark23Model}</p>
      </div>
    </div>
  );
};

export default ModelDebug; 