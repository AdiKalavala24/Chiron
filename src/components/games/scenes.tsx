/* eslint-disable react/no-unknown-property -- R3F's custom renderer maps JSX props like `args`/`position`/`intensity` onto three.js objects; this ESLint rule only knows the DOM/RN prop set. */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber/native';
import type { Group, Mesh } from 'three';
import { wordForLetter } from '@/features/curriculum/letter-words';

export type GameReactionState = 'idle' | 'correct' | 'incorrect';

export interface SceneProps {
  colorHex: string;
  reactionState: GameReactionState;
  /** 0-1 overall round progress — drives growth (sprout height, tower block count, etc). */
  progressRatio: number;
}

export function reactionColor(state: GameReactionState, base: string): string {
  if (state === 'correct') return '#34D399';
  if (state === 'incorrect') return '#F43F5E';
  return base;
}

/** Frame-rate-independent approach toward a target, so scenes ease rather than snap. */
function approach(current: number, target: number, delta: number, speed = 6): number {
  return current + (target - current) * Math.min(1, delta * speed);
}

/* ------------------------------------------------------------------ *
 * Phonics Monster Feast
 * ------------------------------------------------------------------ */

/**
 * A friendly one-eyed blob that chews when it's fed a correct word and
 * scrunches when it isn't. The jaw is a separate mesh so the chomp can be
 * driven independently of the idle bob.
 */
export function MonsterScene({ colorHex, reactionState, progressRatio }: SceneProps) {
  const groupRef = useRef<Group>(null);
  const jawRef = useRef<Mesh>(null);
  const chewRef = useRef(0);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    // Chewing is a decaying oscillation kicked off by a correct answer.
    const target = reactionState === 'correct' ? 1 : 0;
    chewRef.current = approach(chewRef.current, target, delta, 8);

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clockRef.current * 0.6) * 0.35;
      groupRef.current.position.y = Math.sin(clockRef.current * 1.8) * 0.06;
    }
    if (jawRef.current) {
      const chomp = chewRef.current * Math.abs(Math.sin(clockRef.current * 14));
      jawRef.current.position.y = -0.34 - chomp * 0.3;
      jawRef.current.rotation.x = chomp * 0.35;
    }
  });

  const bodyColor = reactionColor(reactionState, colorHex);
  // The monster gets visibly rounder/bigger the more it's been fed.
  const fullness = 0.85 + progressRatio * 0.35;

  return (
    <group ref={groupRef} scale={fullness}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color={bodyColor} flatShading />
      </mesh>

      {/* Eye */}
      <mesh position={[0, 0.42, 0.82]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#FFFDF5" flatShading />
      </mesh>
      <mesh position={[0, 0.42, 1.06]}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#1E293B" flatShading />
      </mesh>

      {/* Mouth cavity + hinged jaw */}
      <mesh position={[0, -0.24, 0.74]}>
        <boxGeometry args={[0.9, 0.42, 0.5]} />
        <meshStandardMaterial color="#7F1D3A" flatShading />
      </mesh>
      <mesh ref={jawRef} position={[0, -0.34, 0.82]}>
        <boxGeometry args={[0.94, 0.24, 0.5]} />
        <meshStandardMaterial color={bodyColor} flatShading />
      </mesh>

      {/* Horns */}
      <mesh position={[-0.5, 0.92, 0]}>
        <coneGeometry args={[0.14, 0.4, 8]} />
        <meshStandardMaterial color="#FBBF24" flatShading />
      </mesh>
      <mesh position={[0.5, 0.92, 0]}>
        <coneGeometry args={[0.14, 0.4, 8]} />
        <meshStandardMaterial color="#FBBF24" flatShading />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Block Tower Builder
 * ------------------------------------------------------------------ */

export interface BlockSpec {
  /** Hex color of this block — the game groups blocks by color to make an addition visible. */
  color: string;
}

interface TowerSceneProps extends SceneProps {
  /** Every block currently placed, bottom-first. */
  blocks: BlockSpec[];
  /** How tall the tower needs to get — drawn as a floating goal star. */
  goalHeight: number;
}

/**
 * The tower is built from the *actual* blocks the kid placed, in the
 * order and colors they placed them — so "4 blue and 3 yellow" is
 * literally readable off the stack, which is the whole point of the
 * game. A goal star floats at the target height.
 */
export function BlockTowerScene({ colorHex, reactionState, blocks, goalHeight }: TowerSceneProps) {
  const groupRef = useRef<Group>(null);
  const starRef = useRef<Mesh>(null);
  const clockRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.3;
    if (starRef.current) {
      starRef.current.rotation.y += delta * 1.4;
      starRef.current.position.y = starHeight(goalHeight) + Math.sin(clockRef.current * 2) * 0.08;
    }
  });

  const blockHeight = 0.36;
  const baseY = -1.4;

  return (
    <group ref={groupRef}>
      {/* Ground platform */}
      <mesh position={[0, baseY - 0.12, 0]}>
        <cylinderGeometry args={[1.1, 1.2, 0.2, 20]} />
        <meshStandardMaterial color="#8B5E3C" flatShading />
      </mesh>

      {blocks.map((block, i) => (
        <mesh key={i} position={[0, baseY + blockHeight / 2 + i * blockHeight, 0]}>
          <boxGeometry args={[0.8, blockHeight * 0.9, 0.8]} />
          <meshStandardMaterial
            color={i === blocks.length - 1 ? reactionColor(reactionState, block.color) : block.color}
            flatShading
          />
        </mesh>
      ))}

      <mesh ref={starRef} position={[0, starHeight(goalHeight), 0]}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial color={colorHex} flatShading />
      </mesh>
    </group>
  );

  function starHeight(goal: number): number {
    return baseY + goal * blockHeight + 0.35;
  }
}

/* ------------------------------------------------------------------ *
 * Echo the Space Alien
 * ------------------------------------------------------------------ */

interface AlienSceneProps extends SceneProps {
  /** 0-1 live mic level — wobbles the antenna so the alien visibly "hears" the kid. */
  micLevel: number;
  listening: boolean;
}

/**
 * Echo sits on top of a rocket whose thrust plume grows with accumulated
 * pronunciation power. The antenna bulb tracks live mic level, which is
 * the cue that the alien is listening right now.
 */
export function AlienScene({ colorHex, reactionState, progressRatio, micLevel, listening }: AlienSceneProps) {
  const groupRef = useRef<Group>(null);
  const antennaRef = useRef<Mesh>(null);
  const flameRef = useRef<Mesh>(null);
  const clockRef = useRef(0);
  const levelRef = useRef(0);

  useFrame((_, delta) => {
    clockRef.current += delta;
    levelRef.current = approach(levelRef.current, listening ? micLevel : 0, delta, 12);

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(clockRef.current * 0.5) * 0.4;
      groupRef.current.position.y = Math.sin(clockRef.current * 1.4) * 0.05;
    }
    if (antennaRef.current) {
      const bulb = 0.1 + levelRef.current * 0.16;
      antennaRef.current.scale.setScalar(bulb / 0.1);
      antennaRef.current.position.x = Math.sin(clockRef.current * 9) * levelRef.current * 0.08;
    }
    if (flameRef.current) {
      // Plume length is thrust from banked power, plus a flicker.
      const flicker = 0.85 + Math.sin(clockRef.current * 22) * 0.15;
      const length = 0.15 + progressRatio * 0.9;
      flameRef.current.scale.set(1, length * flicker, 1);
      flameRef.current.position.y = -1.15 - (length * flicker) / 2;
    }
  });

  const skin = reactionColor(reactionState, colorHex);

  return (
    <group ref={groupRef}>
      {/* Head */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.5, 20, 20]} />
        <meshStandardMaterial color={skin} flatShading />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.18, 0.68, 0.42]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#1E293B" flatShading />
      </mesh>
      <mesh position={[0.18, 0.68, 0.42]}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color="#1E293B" flatShading />
      </mesh>
      {/* Antenna */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#1E293B" flatShading />
      </mesh>
      <mesh ref={antennaRef} position={[0, 1.36, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={0.6} flatShading />
      </mesh>

      {/* Rocket body + fins */}
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.4, 0.5, 1.3, 14]} />
        <meshStandardMaterial color="#E2E8F0" flatShading />
      </mesh>
      <mesh position={[-0.48, -0.9, 0]} rotation={[0, 0, 0.4]}>
        <coneGeometry args={[0.16, 0.5, 6]} />
        <meshStandardMaterial color="#F472B6" flatShading />
      </mesh>
      <mesh position={[0.48, -0.9, 0]} rotation={[0, 0, -0.4]}>
        <coneGeometry args={[0.16, 0.5, 6]} />
        <meshStandardMaterial color="#F472B6" flatShading />
      </mesh>

      {/* Thrust plume */}
      <mesh ref={flameRef} position={[0, -1.25, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.3, 1, 10]} />
        <meshStandardMaterial color="#FBBF24" emissive="#F97316" emissiveIntensity={0.8} flatShading />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ *
 * Magic Canvas Tracing — reward objects
 * ------------------------------------------------------------------ */

/**
 * Eight procedural silhouettes the traced letter can pop into. Deliberately
 * primitive-based rather than imported models: it keeps the reward
 * instant and offline, and flat-shaded blocky shapes match the app's
 * sticker-book art direction.
 */
export type RewardShape = 'orb' | 'winged' | 'puff' | 'barrel' | 'spire' | 'poly' | 'boxy' | 'finned';

export function RewardShapeMesh({ shape, colorHex }: { shape: RewardShape; colorHex: string }) {
  switch (shape) {
    case 'winged':
      return (
        <group>
          <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.1, 1.1, 8]} />
            <meshStandardMaterial color="#1E293B" flatShading />
          </mesh>
          <mesh position={[-0.5, 0.15, 0]} rotation={[0, 0, 0.5]}>
            <coneGeometry args={[0.45, 0.9, 3]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[0.5, 0.15, 0]} rotation={[0, 0, -0.5]}>
            <coneGeometry args={[0.45, 0.9, 3]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
        </group>
      );
    case 'puff':
      return (
        <group>
          <mesh position={[-0.4, -0.1, 0]}>
            <sphereGeometry args={[0.42, 14, 14]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[0.4, -0.1, 0]}>
            <sphereGeometry args={[0.42, 14, 14]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
        </group>
      );
    case 'barrel':
      return (
        <group>
          <mesh>
            <cylinderGeometry args={[0.6, 0.6, 0.8, 18]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.63, 0.63, 0.08, 18]} />
            <meshStandardMaterial color="#FFFDF5" flatShading />
          </mesh>
        </group>
      );
    case 'spire':
      return (
        <group>
          <mesh position={[0, -0.55, 0]}>
            <cylinderGeometry args={[0.16, 0.2, 0.6, 10]} />
            <meshStandardMaterial color="#8B5E3C" flatShading />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <coneGeometry args={[0.6, 1.2, 10]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
        </group>
      );
    case 'poly':
      return (
        <mesh>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial color={colorHex} flatShading />
        </mesh>
      );
    case 'boxy':
      return (
        <group>
          <mesh>
            <boxGeometry args={[1.05, 1.05, 1.05]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.12, 0.22, 1.12]} />
            <meshStandardMaterial color="#FBBF24" flatShading />
          </mesh>
        </group>
      );
    case 'finned':
      return (
        <group>
          <mesh scale={[1.25, 0.85, 0.7]}>
            <sphereGeometry args={[0.55, 16, 16]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.3, 0.5, 6]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[0.42, 0.06, 0.42]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#1E293B" flatShading />
          </mesh>
        </group>
      );
    case 'orb':
    default:
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.8, 20, 20]} />
            <meshStandardMaterial color={colorHex} flatShading />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.28, 6]} />
            <meshStandardMaterial color="#8B5E3C" flatShading />
          </mesh>
        </group>
      );
  }
}

interface RewardSceneProps {
  shape: RewardShape;
  colorHex: string;
  /** False before the letter is traced — the object stays hidden until it's earned. */
  revealed: boolean;
}

/** Spins and scales the earned object in, so completing a letter has a visible payoff. */
export function RewardScene({ shape, colorHex, revealed }: RewardSceneProps) {
  const groupRef = useRef<Group>(null);
  const scaleRef = useRef(0);

  useFrame((_, delta) => {
    scaleRef.current = approach(scaleRef.current, revealed ? 1 : 0, delta, 5);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scaleRef.current);
      groupRef.current.rotation.y += delta * (revealed ? 1.1 : 0);
      groupRef.current.position.y = Math.sin(Date.now() * 0.002) * 0.1 * scaleRef.current;
    }
  });

  return (
    <group ref={groupRef} scale={0}>
      <RewardShapeMesh shape={shape} colorHex={colorHex} />
    </group>
  );
}

/**
 * How each letter's keyword is drawn. The *word* comes from
 * `LETTER_WORDS` (shared with the technique ensemble's phonics
 * derivation); this table only decides which of the eight procedural
 * silhouettes and which color represents it.
 */
const LETTER_SHAPES: Record<string, { shape: RewardShape; color: string }> = {
  A: { shape: 'orb', color: '#F43F5E' },
  B: { shape: 'winged', color: '#8B5CF6' },
  C: { shape: 'puff', color: '#93C5FD' },
  D: { shape: 'barrel', color: '#F472B6' },
  E: { shape: 'orb', color: '#FDE68A' },
  F: { shape: 'finned', color: '#38BDF8' },
  G: { shape: 'boxy', color: '#34D399' },
  H: { shape: 'spire', color: '#FB923C' },
  I: { shape: 'spire', color: '#F9A8D4' },
  J: { shape: 'winged', color: '#64748B' },
  K: { shape: 'poly', color: '#FBBF24' },
  L: { shape: 'finned', color: '#4ADE80' },
  M: { shape: 'orb', color: '#E2E8F0' },
  N: { shape: 'puff', color: '#A16207' },
  O: { shape: 'orb', color: '#FB923C' },
  P: { shape: 'poly', color: '#8B5CF6' },
  Q: { shape: 'boxy', color: '#F472B6' },
  R: { shape: 'spire', color: '#F43F5E' },
  S: { shape: 'poly', color: '#FBBF24' },
  T: { shape: 'spire', color: '#34D399' },
  U: { shape: 'puff', color: '#8B5CF6' },
  V: { shape: 'boxy', color: '#38BDF8' },
  W: { shape: 'finned', color: '#60A5FA' },
  X: { shape: 'barrel', color: '#FBBF24' },
  Y: { shape: 'poly', color: '#F472B6' },
  Z: { shape: 'finned', color: '#94A3B8' },
};

/** Digits and anything unmapped still get a payoff rather than a blank canvas. */
export function rewardForGlyph(glyph: string): { word: string; shape: RewardShape; color: string } {
  const key = glyph.trim().charAt(0).toUpperCase();
  const drawing = LETTER_SHAPES[key] ?? { shape: 'poly' as RewardShape, color: '#FBBF24' };
  return { word: wordForLetter(key), ...drawing };
}
