import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  OrbitControls,
  useAnimations,
  useGLTF,
} from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import * as THREE from "three";

function Model() {
  const group = useRef<THREE.Group>(null);

  const { scene, animations } = useGLTF("/models/meganthropus.glb");

  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const { actions } = useAnimations(animations, clone);

  useEffect(() => {
  Object.values(actions).forEach((action) => {
    action?.reset().fadeIn(0.5).play();
  });

  return () => {
    Object.values(actions).forEach((action) => {
      action?.stop();
    });
  };
}, [actions, animations]);

  useFrame(() => {
    if (!group.current) return;
  });

  return (
    <group
      ref={group}
      position={[0, -1.05, 0]}
      rotation={[0, -Math.PI / 2, 0]}
      scale={1.3}
    >
      <primitive object={clone} />
    </group>
  );
}

export default function ViewerCanvas() {
  return (
    <Canvas
      camera={{
        position: [0, 1.2, 3.6],
        fov: 34,
      }}
    >
      <ambientLight intensity={1} />

      <directionalLight
        position={[5, 8, 5]}
        intensity={2}
      />

      <directionalLight
        position={[-5, 4, -3]}
        intensity={0.8}
      />

      <Suspense fallback={null}>
        <Model />

        <Environment preset="studio" />

        <ContactShadows
          position={[0, -1.05, 0]}
          blur={2}
          opacity={0.5}
          scale={6}
        />

        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={5}
        />
      </Suspense>
    </Canvas>
  );
}