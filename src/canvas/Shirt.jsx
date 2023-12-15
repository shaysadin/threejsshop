import React, { useRef, useEffect, useState } from 'react';
import { easing } from 'maath';
import { useSnapshot } from 'valtio';
import { useFrame } from '@react-three/fiber';
import { Decal, useGLTF, useTexture } from '@react-three/drei';

import state from '../store';

const Shirt = () => {
  const shirtRef = useRef();
  const snap = useSnapshot(state);
  const initialMousePosition = useRef({ x: 0, y: 0 });
  const shirtRotation = useRef([0, 0, 0]);
  
  const { nodes, materials } = useGLTF('/shirt_baked.glb');

  const logoTexture = useTexture(snap.logoDecal);
  const fullTexture = useTexture(snap.fullDecal);  
  const [isDown, setIsDown] = useState(false);
  const rotationFactor = 0.009;

  useFrame((state, delta) => {
    easing.dampC(materials.lambert1.color, snap.color, 0.25, delta);
   
  });

  const handlePointerDown = (event) => {
    setIsDown(true);
    initialMousePosition.current = { x: event.clientX, y: event.clientY };
  };
  useEffect(() => {

    const handlePointerMove = (event) => {
      if (isDown) {
        const { clientX, clientY } = event;
        const distanceX = clientX - initialMousePosition.current.x;
        const distanceY = clientY - initialMousePosition.current.y;
        shirtRotation.current[1] += distanceX * rotationFactor;
        shirtRotation.current[0] += distanceY * rotationFactor;
        easing.dampE(
          shirtRef.current.rotation,
          [shirtRotation.current[0], shirtRotation.current[1], shirtRotation.current[2]],
          0.25,
          0.08
        );
        
        initialMousePosition.current = { x: clientX, y: clientY };
      }
    };

    const handlePointerUp = () => {
      setIsDown(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDown, shirtRotation, rotationFactor]);

  const stateString = JSON.stringify(snap);

  if (logoTexture) {
    logoTexture.anisotropy = 16;
  }

  return (
    <group key={stateString}>
      <mesh
        castShadow
        geometry={nodes.T_Shirt_male.geometry}
        material={materials.lambert1}
        material-roughness={1}
        dispose={null}
        ref={shirtRef}
        onPointerDown={handlePointerDown}
      >
        {snap.isFullTexture && (
          <Decal position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1} map={fullTexture} />
        )}

        {snap.isLogoTexture && (
          <Decal
            position={[0, 0.04, 0.15]}
            rotation={[0, 0, 0]}
            scale={0.15}
            map={logoTexture}
            depthTest={false}
            depthWrite={true}
          />
        )}
      </mesh>
    </group>
  );
};

export default Shirt;
