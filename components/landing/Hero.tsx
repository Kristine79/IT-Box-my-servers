'use client';

import { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  3D SCENE                                                           */
/* ------------------------------------------------------------------ */

function GlassOrb({ position, scale = 1, color = '#3b82f6', speed = 0.8 }: {
  position: [number, number, number]; scale?: number; color?: string; speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * speed * 0.3) * 0.15;
      meshRef.current.rotation.y += 0.003;
      meshRef.current.position.y = position[1] + Math.sin(t * speed * 0.5) * 0.25;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          roughness={0.2}
          metalness={0.3}
          emissive={color}
          emissiveIntensity={0.6}
        />
      </mesh>
    </Float>
  );
}

function Gear({ position, scale = 1, speed = 0.3 }: {
  position: [number, number, number]; scale?: number; speed?: number;
}) {
  const meshRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (meshRef.current) meshRef.current.rotation.z = state.clock.getElapsedTime() * speed;
  });
  return (
    <group position={position} scale={scale} ref={meshRef}>
      <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh>
          <torusGeometry args={[1, 0.32, 12, 24]} />
          <meshStandardMaterial
            color="#60a5fa"
            roughness={0.3}
            metalness={0.2}
            emissive="#60a5fa"
            emissiveIntensity={0.15}
          />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1.28, Math.sin(i * Math.PI / 3) * 1.28, 0]} rotation={[0, 0, i * Math.PI / 3]}>
            <boxGeometry args={[0.2, 0.5, 0.3]} />
            <meshStandardMaterial
              color="#60a5fa"
              roughness={0.3}
              metalness={0.2}
              emissive="#60a5fa"
              emissiveIntensity={0.1}
            />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

function GlassCard({ position, rot = [0, 0, 0], scale = 1 }: {
  position: [number, number, number]; rot?: [number, number, number]; scale?: number;
}) {
  return (
    <Float speed={0.7} rotationIntensity={0.2} floatIntensity={0.15}>
      <mesh position={position} rotation={rot} scale={scale}>
        <boxGeometry args={[2.2, 3.2, 0.08]} />
        <meshStandardMaterial
          color="#e0f2fe"
          roughness={0.2}
          metalness={0.1}
          emissive="#e0f2fe"
          emissiveIntensity={0.1}
          transparent
          opacity={0.6}
        />
      </mesh>
    </Float>
  );
}

function ServerUnit({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const ledsRef = useRef<THREE.Mesh[]>([]);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ledsRef.current.forEach((led, i) => {
      if (led) {
        const mat = led.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.3 + Math.sin(t * 3 + i * 1.2) * 0.7;
      }
    });
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05;
    }
  });
  const ledColors = ['#22c55e', '#f97316', '#3b82f6', '#22c55e', '#ef4444', '#3b82f6'];
  return (
    <group position={position} scale={scale} ref={groupRef}>
      <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.15}>
        <mesh>
          <boxGeometry args={[1.2, 2.0, 0.9]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) ledsRef.current[i] = el; }}
            position={[-0.35 + (i % 3) * 0.35, 0.6 - Math.floor(i / 3) * 0.5, 0.46]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={ledColors[i]} emissive={ledColors[i]} emissiveIntensity={1} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

function Database({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
  });
  return (
    <group position={position} scale={scale} ref={groupRef}>
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 1.4, 32]} />
          <meshStandardMaterial color="#0ea5e9" roughness={0.25} metalness={0.4} emissive="#0ea5e9" emissiveIntensity={0.15} />
        </mesh>
        {[0.35, 0, -0.35].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.58, 0.04, 8, 32]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.4} />
          </mesh>
        ))}
      </Float>
    </group>
  );
}

function Shield({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <Float speed={0.7} rotationIntensity={0.3} floatIntensity={0.25}>
      <mesh position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#22c55e" roughness={0.2} metalness={0.3} emissive="#22c55e" emissiveIntensity={0.35} transparent opacity={0.9} />
      </mesh>
    </Float>
  );
}

function CloudCluster({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      const s = 1 + Math.sin(t * 1.2) * 0.04;
      groupRef.current.scale.set(s * scale, s * scale, s * scale);
    }
  });
  return (
    <group position={position} ref={groupRef}>
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.15}>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.7, 24, 24]} />
          <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.2} emissive="#8b5cf6" emissiveIntensity={0.2} transparent opacity={0.85} />
        </mesh>
        <mesh position={[-0.55, -0.15, 0.1]}>
          <sphereGeometry args={[0.5, 24, 24]} />
          <meshStandardMaterial color="#a78bfa" roughness={0.3} metalness={0.2} emissive="#a78bfa" emissiveIntensity={0.15} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.55, -0.1, -0.05]}>
          <sphereGeometry args={[0.45, 24, 24]} />
          <meshStandardMaterial color="#c4b5fd" roughness={0.3} metalness={0.2} emissive="#c4b5fd" emissiveIntensity={0.15} transparent opacity={0.8} />
        </mesh>
      </Float>
    </group>
  );
}

function Lock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <Float speed={0.6} rotationIntensity={0.15} floatIntensity={0.2}>
        <mesh>
          <boxGeometry args={[0.9, 0.75, 0.5]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.25} metalness={0.5} emissive="#f59e0b" emissiveIntensity={0.15} />
        </mesh>
        <mesh position={[0, 0.55, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.3, 0.08, 12, 24, Math.PI]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.6} emissive="#fbbf24" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0, -0.05, 0.26]}>
          <boxGeometry args={[0.15, 0.22, 0.04]} />
          <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.7} />
        </mesh>
      </Float>
    </group>
  );
}

function Scene() {
  return (
    <>
      <Environment preset="sunset" />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#bfdbfe" />
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#dbeafe" />
      <pointLight position={[4, -2, 3]} intensity={0.3} color="#93c5fd" />

      <GlassOrb position={[-3.2, 1.2, -2.5]} scale={1.4} color="#3b82f6" speed={0.7} />
      <GlassOrb position={[3.6, -0.4, -2]} scale={1.1} color="#60a5fa" speed={1.0} />
      <GlassOrb position={[-1.2, 2.6, -3.5]} scale={0.7} color="#93c5fd" speed={0.5} />
      <GlassOrb position={[2.2, 2.2, -4.5]} scale={0.55} color="#bfdbfe" speed={0.9} />

      <Gear position={[3.8, 1.4, -2.5]} scale={0.75} speed={0.25} />
      <Gear position={[-3.6, -1.1, -3.5]} scale={0.45} speed={-0.35} />

      <GlassCard position={[0, 0, -3.2]} rot={[0.1, 0.25, 0]} scale={1.15} />
      <GlassCard position={[-2.4, -1.6, -4.2]} rot={[0.15, -0.2, 0.08]} scale={0.85} />
      <GlassCard position={[2.6, 0.8, -4.8]} rot={[-0.08, 0.3, -0.05]} scale={0.65} />

      <ServerUnit position={[-4.2, 0.5, -3]} scale={0.9} />
      <Database position={[4.5, -0.8, -3.5]} scale={0.85} />
      <Shield position={[-2.5, -2.2, -2.8]} scale={0.7} />
      <CloudCluster position={[1.8, -1.8, -4.5]} scale={1.1} />
      <Lock position={[-0.5, 2.8, -3.8]} scale={0.65} />

      <fog attach="fog" args={['#f0f9ff', 8, 25]} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  HERO                                                               */
/* ------------------------------------------------------------------ */

export function Hero() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0.5, 6.5], fov: 42, near: 0.1, far: 20 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
          dpr={[1, 1.2]}
          frameloop="always"
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Soft blob backdrop (CSS fallback) */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -left-[15%] w-[60vw] h-[60vw] bg-sky-100/30 dark:bg-sky-900/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-sm text-[var(--primary)] text-sm font-medium mb-8 border border-[var(--primary)]/15 shadow-sm"
        >
          <Sparkles size={14} />
          <span>AI-управление инфраструктурой</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 text-[var(--foreground)]"
        >
          Управление инфраструктурой
          <br />
          с AI помощником
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          IT Box: платформа для управления серверами, проектами и доступами.
          Шифрование AES-256, OAuth2, real-time мониторинг.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/app">
            <Button
              size="lg"
              className="neu-button-accent text-lg px-8 py-6 rounded-3xl group shadow-lg shadow-blue-500/20"
            >
              Начать бесплатно
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              variant="outline"
              size="lg"
              className="neu-button text-lg px-8 py-6 rounded-3xl bg-white/50 dark:bg-white/5 backdrop-blur-sm"
            >
              Узнать больше
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
