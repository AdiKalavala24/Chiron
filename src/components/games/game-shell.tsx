/* eslint-disable react/no-unknown-property -- R3F's custom renderer maps JSX props like `args`/`position`/`intensity` onto three.js objects; this ESLint rule only knows the DOM/RN prop set. */
import React, { useRef } from 'react';
import { Text, View } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber/native';
import type { Group, Mesh } from 'three';
import { useTheme } from '@/theme';
import { PillChip } from '@/components/ui';
import { reactionColor, type GameReactionState, type SceneProps } from './scenes';

/** The original generic scenes — one procedural shape that grows as rounds are won. */
export type GameSceneVariant = 'sprout' | 'gem' | 'trail' | 'tower';

function SproutScene({ colorHex, reactionState, progressRatio }: SceneProps) {
  const groupRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });
  const height = 0.6 + progressRatio * 1.4;
  const color = reactionColor(reactionState, colorHex);
  return (
    <group ref={groupRef}>
      <mesh position={[0, -0.9, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 0.3, 16]} />
        <meshStandardMaterial color="#8B5E3C" flatShading />
      </mesh>
      <mesh position={[0, -0.75 + height / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, height, 8]} />
        <meshStandardMaterial color="#34D399" flatShading />
      </mesh>
      <mesh position={[0, -0.75 + height + 0.3, 0]}>
        <coneGeometry args={[0.55, 0.9, 8]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    </group>
  );
}

function GemScene({ colorHex, reactionState, progressRatio }: SceneProps) {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8;
      meshRef.current.rotation.x += delta * 0.3;
    }
  });
  const scale = 0.7 + progressRatio * 0.6;
  return (
    <mesh ref={meshRef} scale={scale}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={reactionColor(reactionState, colorHex)} flatShading />
    </mesh>
  );
}

function TrailScene({ colorHex, reactionState, progressRatio }: SceneProps) {
  const meshRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * 0.6;
  });
  const scale = 0.7 + progressRatio * 0.5;
  return (
    <mesh ref={meshRef} scale={scale} rotation={[Math.PI / 2.4, 0, 0]}>
      <torusKnotGeometry args={[0.7, 0.22, 100, 12, 2, 3]} />
      <meshStandardMaterial color={reactionColor(reactionState, colorHex)} flatShading />
    </mesh>
  );
}

function TowerScene({ colorHex, reactionState, progressRatio }: SceneProps) {
  const groupRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.35;
  });
  const blockCount = Math.max(1, Math.round(1 + progressRatio * 5));
  const color = reactionColor(reactionState, colorHex);
  return (
    <group ref={groupRef}>
      {Array.from({ length: blockCount }).map((_, i) => (
        <mesh key={i} position={[0, i * 0.5 - 1, 0]}>
          <boxGeometry args={[0.9, 0.42, 0.9]} />
          <meshStandardMaterial color={i === blockCount - 1 ? color : colorHex} flatShading />
        </mesh>
      ))}
    </group>
  );
}

const SCENES: Record<GameSceneVariant, React.ComponentType<SceneProps>> = {
  sprout: SproutScene,
  gem: GemScene,
  trail: TrailScene,
  tower: TowerScene,
};

interface GameShellProps {
  skillChip: string;
  roundGoal: string;
  colorHex: string;
  reactionState: GameReactionState;
  progressRatio: number;
  /** One of the generic growing shapes. Ignored when `scene` is supplied. */
  variant?: GameSceneVariant;
  /**
   * A purpose-built scene, rendered inside the shared Canvas and lighting
   * rig. The four flagship games (Phonics Monster Feast, Magic Canvas
   * Tracing, Block Tower Builder, Echo the Space Alien) each pass their
   * own here; the older content-driven games use `variant` instead.
   */
  scene?: React.ReactNode;
  canvasHeight?: number;
  children?: React.ReactNode;
}

/**
 * Shared Expo GL / React Three Fiber shell every game plugs into —
 * skill chip, round goal, a 3D viewport, and the game's own controls
 * underneath. What's real here is the loop: an actual 3D canvas,
 * actually reacting to actually-graded answers.
 */
export function GameShell({
  skillChip,
  roundGoal,
  colorHex,
  reactionState,
  progressRatio,
  variant = 'gem',
  scene,
  canvasHeight = 220,
  children,
}: GameShellProps) {
  const theme = useTheme();
  const Scene = SCENES[variant];

  return (
    <View>
      <View style={{ flexDirection: 'row', marginBottom: theme.space[3] }}>
        <PillChip label={skillChip} />
      </View>
      <Text style={{ fontFamily: theme.fontFamily.bodyMedium, fontSize: theme.fontSize.base, color: theme.colors.foreground, marginBottom: theme.space[3] }}>
        {roundGoal}
      </Text>
      <View
        style={{
          height: canvasHeight,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          borderWidth: theme.borderWidth.chunky,
          borderColor: theme.colors.foreground,
          backgroundColor: '#111827',
        }}
      >
        <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1.2} />
          {scene ?? <Scene colorHex={colorHex} reactionState={reactionState} progressRatio={progressRatio} />}
        </Canvas>
      </View>
      <View style={{ marginTop: theme.space[4] }}>{children}</View>
    </View>
  );
}
