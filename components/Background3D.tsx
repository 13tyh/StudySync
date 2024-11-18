"use client";

import {useRef, useEffect} from "react";
import {useThree, Canvas, useFrame} from "@react-three/fiber";
import {useTheme} from "next-themes";
import * as THREE from "three";

function Particles() {
  const {theme} = useTheme();
  const points = useRef<THREE.Points>(null!);
  const particlesCount = 5000;

  useEffect(() => {
    if (!points.current) return;

    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const sizes = new Float32Array(particlesCount);

    for (let i = 0; i < particlesCount; i++) {
      const radius = Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 5;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      // テーマに基づいた色設定の改善
      const color =
        theme === "dark"
          ? new THREE.Color().setHSL(
              0.6 + Math.random() * 0.1,
              0.8,
              0.3 + Math.random() * 0.2
            )
          : new THREE.Color().setHSL(
              0.55 + Math.random() * 0.1,
              0.7,
              0.4 + Math.random() * 0.2
            ); // 明るさを調整

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = Math.random() * (theme === "dark" ? 2 : 1.5);
    }

    points.current.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    points.current.geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
    points.current.geometry.setAttribute(
      "size",
      new THREE.BufferAttribute(sizes, 1)
    );
  }, [theme]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.05;
    points.current.rotation.y = time * 0.2;
    points.current.rotation.z = time * 0.1;

    const positions = points.current.geometry.attributes.position.array;
    for (let i = 0; i < particlesCount; i++) {
      const idx = i * 3;
      const x = positions[idx];
      const z = positions[idx + 2];
      positions[idx + 1] += Math.sin(time + x * 0.1) * 0.002;
      positions[idx + 2] += Math.cos(time + z * 0.1) * 0.002;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry />
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Scene() {
  const {camera} = useThree();
  const {theme} = useTheme();

  useEffect(() => {
    camera.position.z = 8;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return (
    <>
      <ambientLight intensity={theme === "dark" ? 0.5 : 0.4} />{" "}
      {/* ライトモードの光の強さを調整 */}
      <pointLight
        position={[10, 10, 10]}
        intensity={theme === "dark" ? 0.8 : 1}
        color={theme === "dark" ? "#ffffff" : "#6366f1"}
      />
      <Particles />
    </>
  );
}

export default function Background3D() {
  const {theme} = useTheme();

  return (
    <div className="fixed inset-0 -z-10">
      <div
        className={`absolute inset-0 ${
          theme === "dark"
            ? "bg-gradient-to-br from-indigo-950/30 via-purple-950/30 to-pink-950/30"
            : "bg-gradient-to-br from-sky-200 via-indigo-200/80 to-white" // ライトモードの背景を調整
        }`}
      />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <Canvas
        camera={{position: [0, 0, 8], fov: 60}}
        style={{background: "transparent"}}
        dpr={[1, 2]}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
