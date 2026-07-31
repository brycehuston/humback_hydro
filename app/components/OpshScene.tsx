"use client";

import type { MutableRefObject, ReactNode, RefObject } from "react";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  AdditiveBlending,
  Box3,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  MathUtils,
  Mesh,
  ShaderMaterial,
  Vector3,
} from "three";
import type { AnimationAction } from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { OpshMotionState, OpshStage } from "../opsh-data";

type OpshSceneProps = {
  stage: OpshStage;
  motionRef: MutableRefObject<OpshMotionState>;
  interactive: boolean;
  renderActive: boolean;
  compact: boolean;
  reducedMotion: boolean;
  resetSignal: number;
  fallback: ReactNode;
};

type ExtendedMotionState = OpshMotionState & {
  targetProgress?: number;
  velocity?: number;
  documentVisible?: boolean;
};

type Vec3Tuple = readonly [number, number, number];

type FlowChannel =
  | "intakeLeft"
  | "intakeRight"
  | "lowerLeft"
  | "lowerRight"
  | "pump"
  | "releaseLeft"
  | "releaseRight";

type FlowMaterialRegistry = Record<FlowChannel, ShaderMaterial | null>;

const COLORS = {
  background: "#020d14",
  fog: "#03151e",
  concrete: "#53646c",
  concreteDark: "#1b2b32",
  concreteEdge: "#7e9198",
  steel: "#5f7780",
  steelDark: "#172a33",
  waterDeep: "#063a54",
  waterBright: "#2fa7d6",
  intake: "#2d9cff",
  pump: "#29d391",
  release: "#a56cff",
  white: "#dff8ff",
} as const;

const UPPER_FLOOR = 2.5;
const UPPER_CAPACITY = 2.45;
const LOWER_FLOOR = -4.35;
const LOWER_CAPACITY = 2.15;

const UPPER_LEVELS = [0.58, 0.58, 0.9, 0.25, 0.58] as const;
const LOWER_LEVELS = [0.52, 0.82, 0.28, 0.84, 0.58] as const;

const CAMERA_POSITIONS: readonly Vec3Tuple[] = [
  [12.5, 6.5, 15.5],
  [9.8, 4.4, 12.2],
  [10.6, 2.6, 10.2],
  [13.5, 7.4, 16.8],
];

const CAMERA_TARGETS: readonly Vec3Tuple[] = [
  [0, 0.5, 0],
  [0, -0.25, 0],
  [0, 0.05, 0],
  [0, 0.65, 0],
];

/**
 * External model support is retained for a future verified asset, but the
 * repository does not contain this GLB. Keep the flag false until the asset is
 * present and validated; the procedural model is the production-safe default.
 */
const HYDRO_MODEL_URL = "/models/humpback-hydro.glb";
const EXTERNAL_MODEL_ENABLED = false;
const MODEL_FIT_SIZE = 10.8;

/**
 * Subtle model choreography for the four physical operating stages:
 * Constant Supply, Gravitational Flow, Pumping, and Release.
 *
 * Values are intentionally restrained. The camera communicates the major
 * transition; model movement supplies depth without making infrastructure
 * appear weightless.
 */
const MODEL_POSITIONS: readonly Vec3Tuple[] = [
  [0, -0.18, 0],
  [0.22, -0.12, 0.04],
  [-0.18, -0.04, 0],
  [0.04, 0.12, -0.04],
];

const MODEL_ROTATIONS: readonly Vec3Tuple[] = [
  [0, -0.12, 0],
  [0, -0.045, 0],
  [0, 0.075, 0],
  [0, 0.16, 0],
];

const MODEL_SCALES = [1, 1.025, 1.045, 1.01] as const;

const INTAKE_LEFT: readonly Vec3Tuple[] = [
  [-7.2, -3.2, 0.75],
  [-5.25, -3.2, 0.75],
  [-4.2, -3.2, 0.75],
  [-3.62, -3.2, 0.75],
];

const INTAKE_RIGHT: readonly Vec3Tuple[] = [
  [7.2, -3.2, 0.75],
  [5.25, -3.2, 0.75],
  [4.2, -3.2, 0.75],
  [3.62, -3.2, 0.75],
];

const LOWER_LEFT: readonly Vec3Tuple[] = [
  [-3.38, -3.2, 0.75],
  [-3.0, -3.48, 0.75],
  [-2.55, -3.77, 0.75],
  [-0.65, -3.77, 0.75],
];

const LOWER_RIGHT: readonly Vec3Tuple[] = [
  [3.38, -3.2, 0.75],
  [3.0, -3.48, 0.75],
  [2.55, -3.77, 0.75],
  [0.65, -3.77, 0.75],
];

const PUMP_PATH: readonly Vec3Tuple[] = [
  [0, -3.8, -0.2],
  [0, -2.35, -0.2],
  [0, -0.75, -0.2],
  [0, 1.25, -0.2],
  [0, 3.1, -0.2],
];

const RELEASE_LEFT: readonly Vec3Tuple[] = [
  [-2.6, 3.1, 0.75],
  [-2.75, 2.45, 0.75],
  [-3.35, 1.35, 0.75],
  [-3.62, 0.85, 0.75],
  [-4.65, 0.85, 0.75],
  [-7.2, 0.85, 0.75],
];

const RELEASE_RIGHT: readonly Vec3Tuple[] = [
  [2.6, 3.1, 0.75],
  [2.75, 2.45, 0.75],
  [3.35, 1.35, 0.75],
  [3.62, 0.85, 0.75],
  [4.65, 0.85, 0.75],
  [7.2, 0.85, 0.75],
];

const FLOW_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FLOW_FRAGMENT_SHADER = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSpeed;
  uniform float uDirection;
  varying vec2 vUv;

  void main() {
    float phase = fract(vUv.x * 7.0 - uTime * uSpeed * uDirection);
    float head = smoothstep(0.04, 0.2, phase);
    float tail = 1.0 - smoothstep(0.54, 0.94, phase);
    float pulse = head * tail;
    float circumference = 0.72 + 0.28 * abs(sin(vUv.y * 3.14159265));
    float alpha = uIntensity * circumference * (0.12 + pulse * 0.88);
    vec3 glow = uColor * (0.65 + pulse * 1.7);

    if (alpha < 0.006) discard;
    gl_FragColor = vec4(glow, alpha);
  }
`;

const WATER_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uMotion;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float waveA = sin(position.x * 2.15 + uTime * 0.72);
    float waveB = sin(position.y * 2.75 - uTime * 0.56);
    float waveC = sin((position.x + position.y) * 1.35 + uTime * 0.38);
    vWave = (waveA + waveB * 0.65 + waveC * 0.4) / 2.05;
    transformed.z += vWave * 0.055 * uMotion;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const WATER_FRAGMENT_SHADER = `
  uniform vec3 uDeepColor;
  uniform vec3 uBrightColor;
  uniform float uEvidence;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    float crest = smoothstep(-0.25, 0.78, vWave);
    float edge = smoothstep(0.0, 0.16, vUv.x)
      * smoothstep(0.0, 0.16, vUv.y)
      * smoothstep(0.0, 0.16, 1.0 - vUv.x)
      * smoothstep(0.0, 0.16, 1.0 - vUv.y);
    vec3 color = mix(uDeepColor, uBrightColor, 0.38 + crest * 0.46);
    color += vec3(0.08, 0.16, 0.2) * uEvidence;
    gl_FragColor = vec4(color, 0.68 + edge * 0.16);
  }
`;

const OCEAN_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uMotion;
  varying vec2 vUv;
  varying vec2 vLocal;
  varying float vWave;

  void main() {
    vUv = uv;
    vLocal = position.xy;
    vec3 transformed = position;
    float longWave = sin(position.x * 0.22 + uTime * 0.34);
    float crossWave = sin(position.y * 0.31 - uTime * 0.27);
    float detail = sin((position.x + position.y) * 0.58 + uTime * 0.5);
    vWave = longWave * 0.52 + crossWave * 0.34 + detail * 0.14;
    transformed.z += vWave * 0.16 * uMotion;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const OCEAN_FRAGMENT_SHADER = `
  uniform vec3 uDeepColor;
  uniform vec3 uBrightColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec2 vLocal;
  varying float vWave;

  void main() {
    if (abs(vLocal.x) < 6.15 && abs(vLocal.y) < 3.5) discard;
    float horizon = smoothstep(0.0, 1.0, vUv.y);
    float crest = smoothstep(0.08, 0.72, vWave);
    vec3 color = mix(uDeepColor, uBrightColor, horizon * 0.32 + crest * 0.28);
    gl_FragColor = vec4(color, uOpacity);
  }
`;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothStep(edge0: number, edge1: number, value: number) {
  const normalized = clamp01((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return normalized * normalized * (3 - 2 * normalized);
}

function windowSignal(
  value: number,
  start: number,
  end: number,
  feather: number,
) {
  return (
    smoothStep(start, start + feather, value)
    * (1 - smoothStep(end - feather, end, value))
  );
}

function sampleKeyframes(progress: number, values: readonly number[]) {
  const scaled = clamp01(progress) * (values.length - 1);
  const index = Math.min(values.length - 2, Math.floor(scaled));
  const local = smoothStep(0, 1, scaled - index);
  return MathUtils.lerp(values[index], values[index + 1], local);
}

function sampleVectorKeyframes(
  progress: number,
  values: readonly Vec3Tuple[],
  target: Vector3,
) {
  const scaled = clamp01(progress) * (values.length - 1);
  const index = Math.min(values.length - 2, Math.floor(scaled));
  const local = smoothStep(0, 1, scaled - index);
  const from = values[index];
  const to = values[index + 1];

  target.set(
    MathUtils.lerp(from[0], to[0], local),
    MathUtils.lerp(from[1], to[1], local),
    MathUtils.lerp(from[2], to[2], local),
  );

  return target;
}

function readRuntimeProgress(motion: ExtendedMotionState) {
  return clamp01(motion.targetProgress ?? motion.progress);
}

/**
 * The GLB and camera consume raw scroll progress because OpshExperience already
 * maps it directly across the four physical stages. The procedural flow system
 * continues using readRuntimeProgress so its existing shader timing remains
 * independently calibrated.
 */
function readPhysicalStageProgress(motion: ExtendedMotionState) {
  return clamp01(motion.progress);
}

function toCurve(points: readonly Vec3Tuple[]) {
  return new CatmullRomCurve3(
    points.map(([x, y, z]) => new Vector3(x, y, z)),
    false,
    "catmullrom",
    0.18,
  );
}

function ConcreteBlock({
  position,
  scale,
  rotation = [0, 0, 0],
  edge = false,
}: {
  position: Vec3Tuple;
  scale: Vec3Tuple;
  rotation?: Vec3Tuple;
  edge?: boolean;
}) {
  return (
    <mesh
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    >
      <boxGeometry args={scale} />
      <meshStandardMaterial
        color={edge ? COLORS.concreteEdge : COLORS.concrete}
        roughness={edge ? 0.62 : 0.92}
        metalness={edge ? 0.08 : 0.02}
      />
    </mesh>
  );
}

function StructuralShell() {
  return (
    <group>
      <ConcreteBlock position={[0, -5.08, 0]} scale={[13.1, 0.62, 6.25]} />
      <ConcreteBlock position={[0, 0.18, -2.65]} scale={[10.6, 10.2, 0.38]} />
      <ConcreteBlock
        position={[-5.15, 0, 0]}
        scale={[0.7, 10.0, 5.5]}
        rotation={[0, 0, -0.075]}
      />
      <ConcreteBlock
        position={[5.15, 0, 0]}
        scale={[0.7, 10.0, 5.5]}
        rotation={[0, 0, 0.075]}
      />
      <ConcreteBlock position={[0, 5.35, 0]} scale={[10.8, 0.38, 5.5]} />
      <ConcreteBlock position={[0, 2.32, -0.05]} scale={[10.0, 0.28, 5.05]} />
      <ConcreteBlock position={[0, -1.72, -0.05]} scale={[10.3, 0.28, 5.05]} />

      {[-2.35, 2.35].map((x) => (
        <ConcreteBlock
          key={`column-${x}`}
          position={[x, 0.15, -2.25]}
          scale={[0.34, 4.05, 0.48]}
          edge
        />
      ))}

      {[-4.45, -3.85, 3.85, 4.45].map((x) => (
        <ConcreteBlock
          key={`rib-${x}`}
          position={[x, -0.05, 2.42]}
          scale={[0.18, 8.9, 0.28]}
          edge
        />
      ))}

      {[
        [-4.7, -5.72, -2.1],
        [4.7, -5.72, -2.1],
        [-4.7, -5.72, 2.1],
        [4.7, -5.72, 2.1],
      ].map((position, index) => (
        <mesh
          key={`foot-${index}`}
          position={position as [number, number, number]}
          castShadow
        >
          <cylinderGeometry args={[0.48, 0.7, 1.25, 12]} />
          <meshStandardMaterial
            color={COLORS.concreteDark}
            roughness={0.88}
            metalness={0.06}
          />
        </mesh>
      ))}
    </group>
  );
}

function ReservoirFrame({
  floor,
  width,
  height,
  depth,
}: {
  floor: number;
  width: number;
  height: number;
  depth: number;
}) {
  const wall = 0.22;

  return (
    <group>
      <ConcreteBlock
        position={[0, floor - wall * 0.5, 0]}
        scale={[width, wall, depth]}
      />
      <ConcreteBlock
        position={[-width * 0.5, floor + height * 0.5, 0]}
        scale={[wall, height, depth]}
      />
      <ConcreteBlock
        position={[width * 0.5, floor + height * 0.5, 0]}
        scale={[wall, height, depth]}
      />
      <ConcreteBlock
        position={[0, floor + height * 0.5, -depth * 0.5]}
        scale={[width, height, wall]}
      />
      <ConcreteBlock
        position={[0, floor + height, -depth * 0.42]}
        scale={[width + 0.18, 0.16, 0.42]}
        edge
      />
    </group>
  );
}

function WaterBody({
  width,
  depth,
  volumeRef,
  surfaceRef,
  materialRef,
  compact,
}: {
  width: number;
  depth: number;
  volumeRef: RefObject<Mesh | null>;
  surfaceRef: RefObject<Mesh | null>;
  materialRef: RefObject<ShaderMaterial | null>;
  compact: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uEvidence: { value: 0 },
      uDeepColor: { value: new Color(COLORS.waterDeep) },
      uBrightColor: { value: new Color(COLORS.waterBright) },
    }),
    [],
  );

  return (
    <>
      <mesh ref={volumeRef} renderOrder={2}>
        <boxGeometry args={[width, 1, depth]} />
        <meshPhysicalMaterial
          color={COLORS.waterDeep}
          emissive="#07506e"
          emissiveIntensity={0.42}
          roughness={0.18}
          metalness={0.02}
          transparent
          opacity={0.57}
          transmission={compact ? 0 : 0.08}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={surfaceRef}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={3}
      >
        <planeGeometry
          args={[width, depth, compact ? 16 : 30, compact ? 10 : 20]}
        />
        <shaderMaterial
          ref={materialRef}
          uniforms={uniforms}
          vertexShader={WATER_VERTEX_SHADER}
          fragmentShader={WATER_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          side={DoubleSide}
        />
      </mesh>
    </>
  );
}

function FlowConduit({
  points,
  color,
  channel,
  registerMaterial,
  compact,
  radius = 0.25,
  speed = 0.95,
}: {
  points: readonly Vec3Tuple[];
  color: string;
  channel: FlowChannel;
  registerMaterial: (
    channel: FlowChannel,
    material: ShaderMaterial | null,
  ) => void;
  compact: boolean;
  radius?: number;
  speed?: number;
}) {
  const curve = useMemo(() => toCurve(points), [points]);
  const tubularSegments = compact ? 38 : 64;
  const radialSegments = compact ? 6 : 9;
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uSpeed: { value: speed },
      uDirection: { value: 1 },
    }),
    [color, speed],
  );

  return (
    <group>
      <mesh castShadow receiveShadow>
        <tubeGeometry
          args={[
            curve,
            tubularSegments,
            radius,
            radialSegments,
            false,
          ]}
        />
        <meshStandardMaterial
          color={COLORS.steelDark}
          roughness={0.3}
          metalness={0.82}
        />
      </mesh>
      <mesh renderOrder={6}>
        <tubeGeometry
          args={[
            curve,
            tubularSegments,
            radius * 1.018,
            radialSegments,
            false,
          ]}
        />
        <shaderMaterial
          ref={(material) => {
            registerMaterial(channel, material);
          }}
          uniforms={uniforms}
          vertexShader={FLOW_VERTEX_SHADER}
          fragmentShader={FLOW_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Turbine({
  position,
  accent,
  rotorRef,
}: {
  position: Vec3Tuple;
  accent: string;
  rotorRef: (rotor: Group | null) => void;
}) {
  const blades = useMemo(
    () => Array.from({ length: 8 }, (_, index) => index * Math.PI / 4),
    [],
  );

  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 0.86, 20]} />
        <meshStandardMaterial
          color={COLORS.steelDark}
          metalness={0.88}
          roughness={0.24}
        />
      </mesh>
      {[-0.44, 0.44].map((x) => (
        <mesh key={`ring-${x}`} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.56, 0.1, 10, 24]} />
          <meshStandardMaterial
            color={COLORS.steel}
            metalness={0.82}
            roughness={0.3}
          />
        </mesh>
      ))}
      <group ref={rotorRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 1.02, 12]} />
          <meshStandardMaterial
            color={COLORS.white}
            emissive={accent}
            emissiveIntensity={0.82}
            metalness={0.74}
            roughness={0.2}
          />
        </mesh>
        {blades.map((angle) => (
          <mesh
            key={angle}
            position={[0, Math.cos(angle) * 0.34, Math.sin(angle) * 0.34]}
            rotation={[angle, 0, 0]}
          >
            <boxGeometry args={[0.12, 0.4, 0.1]} />
            <meshStandardMaterial
              color={COLORS.white}
              emissive={accent}
              emissiveIntensity={0.68}
              metalness={0.64}
              roughness={0.22}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function CentralPump({
  rotorRef,
}: {
  rotorRef: RefObject<Group | null>;
}) {
  const blades = useMemo(
    () => Array.from({ length: 7 }, (_, index) => index * Math.PI * 2 / 7),
    [],
  );

  return (
    <group position={[0, -0.75, -0.2]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.62, 0.72, 1.15, 20]} />
        <meshStandardMaterial
          color={COLORS.steelDark}
          metalness={0.86}
          roughness={0.25}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.57, 0.09, 10, 24]} />
        <meshStandardMaterial
          color={COLORS.steel}
          metalness={0.82}
          roughness={0.28}
        />
      </mesh>
      <group ref={rotorRef}>
        <mesh>
          <cylinderGeometry args={[0.14, 0.14, 1.35, 12]} />
          <meshStandardMaterial
            color={COLORS.white}
            emissive={COLORS.pump}
            emissiveIntensity={0.8}
            metalness={0.72}
            roughness={0.2}
          />
        </mesh>
        {blades.map((angle) => (
          <mesh
            key={angle}
            position={[Math.cos(angle) * 0.34, 0, Math.sin(angle) * 0.34]}
            rotation={[0, -angle, 0]}
          >
            <boxGeometry args={[0.4, 0.1, 0.11]} />
            <meshStandardMaterial
              color={COLORS.white}
              emissive={COLORS.pump}
              emissiveIntensity={0.62}
              metalness={0.7}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Ocean({
  materialRef,
  compact,
}: {
  materialRef: RefObject<ShaderMaterial | null>;
  compact: boolean;
}) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMotion: { value: 1 },
      uOpacity: { value: 0.42 },
      uDeepColor: { value: new Color("#031f31") },
      uBrightColor: { value: new Color("#0c7497") },
    }),
    [],
  );

  return (
    <mesh
      position={[0, 0.72, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
    >
      <planeGeometry
        args={[80, 80, compact ? 34 : 64, compact ? 34 : 64]}
      />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={OCEAN_VERTEX_SHADER}
        fragmentShader={OCEAN_FRAGMENT_SHADER}
        transparent
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  );
}

function EvidenceNodes({
  groupRef,
}: {
  groupRef: RefObject<Group | null>;
}) {
  const positions: readonly Vec3Tuple[] = [
    [0, 4.25, 2.55],
    [-3.62, 0.85, 1.65],
    [3.62, -3.2, 1.65],
    [0, -0.75, 1.45],
  ];

  return (
    <group ref={groupRef} visible={false}>
      {positions.map((position, index) => (
        <group key={`evidence-${index}`} position={position}>
          <mesh>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshBasicMaterial color={COLORS.white} toneMapped={false} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.018, 8, 24]} />
            <meshBasicMaterial
              color={index % 2 === 0 ? COLORS.intake : COLORS.release}
              transparent
              opacity={0.72}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function updateFlow(
  material: ShaderMaterial | null,
  time: number,
  intensity: number,
) {
  if (!material) return;
  material.uniforms.uTime.value = time;
  material.uniforms.uIntensity.value = clamp01(intensity);
}

function HydroSystem({
  motionRef,
  compact,
  reducedMotion,
}: {
  motionRef: MutableRefObject<OpshMotionState>;
  compact: boolean;
  reducedMotion: boolean;
}) {
  const upperVolumeRef = useRef<Mesh>(null);
  const upperSurfaceRef = useRef<Mesh>(null);
  const upperWaterMaterialRef = useRef<ShaderMaterial>(null);
  const lowerVolumeRef = useRef<Mesh>(null);
  const lowerSurfaceRef = useRef<Mesh>(null);
  const lowerWaterMaterialRef = useRef<ShaderMaterial>(null);
  const oceanMaterialRef = useRef<ShaderMaterial>(null);
  const pumpRotorRef = useRef<Group>(null);
  const evidenceRef = useRef<Group>(null);
  const lowerRotorsRef = useRef<[Group | null, Group | null]>([null, null]);
  const upperRotorsRef = useRef<[Group | null, Group | null]>([null, null]);
  const flowMaterialsRef = useRef<FlowMaterialRegistry>({
    intakeLeft: null,
    intakeRight: null,
    lowerLeft: null,
    lowerRight: null,
    pump: null,
    releaseLeft: null,
    releaseRight: null,
  });
  const progressRef = useRef(0);
  const timeRef = useRef(0);
  const registerFlowMaterial = useCallback((
    channel: FlowChannel,
    material: ShaderMaterial | null,
  ) => {
    flowMaterialsRef.current[channel] = material;
  }, []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const runtime = motionRef.current as ExtendedMotionState;
    const motionReduced = reducedMotion || runtime.reducedMotion;
    const targetProgress = readRuntimeProgress(runtime);

    progressRef.current = motionReduced
      ? targetProgress
      : MathUtils.damp(progressRef.current, targetProgress, 6.5, delta);

    const progress = progressRef.current;
    const velocityBoost = clamp01(runtime.velocity ?? 0) * 0.08;

    const intakeSupply = 1 - smoothStep(0.2, 0.31, progress);
    const lowerGeneration = windowSignal(progress, 0.14, 0.37, 0.055);
    const pumping = windowSignal(progress, 0.31, 0.54, 0.065);
    const release = windowSignal(progress, 0.48, 0.79, 0.065);
    const evidence = smoothStep(0.76, 0.9, progress);

    if (!motionReduced) timeRef.current += delta;
    const time = timeRef.current;

    const intakeIntensity = Math.max(intakeSupply * 0.72, lowerGeneration);
    updateFlow(
      flowMaterialsRef.current.intakeLeft,
      time,
      intakeIntensity > 0.001 ? intakeIntensity + velocityBoost : 0,
    );
    updateFlow(
      flowMaterialsRef.current.intakeRight,
      time,
      intakeIntensity > 0.001 ? intakeIntensity + velocityBoost : 0,
    );
    updateFlow(
      flowMaterialsRef.current.lowerLeft,
      time,
      lowerGeneration > 0.001 ? lowerGeneration + velocityBoost : 0,
    );
    updateFlow(
      flowMaterialsRef.current.lowerRight,
      time,
      lowerGeneration > 0.001 ? lowerGeneration + velocityBoost : 0,
    );
    updateFlow(
      flowMaterialsRef.current.pump,
      time,
      pumping > 0.001 ? pumping + velocityBoost : 0,
    );
    updateFlow(
      flowMaterialsRef.current.releaseLeft,
      time,
      release > 0.001 ? release + velocityBoost : 0,
    );
    updateFlow(
      flowMaterialsRef.current.releaseRight,
      time,
      release > 0.001 ? release + velocityBoost : 0,
    );

    if (!motionReduced) {
      lowerRotorsRef.current.forEach((rotor, index) => {
        if (rotor) {
          rotor.rotation.x += delta * lowerGeneration * (index === 0 ? 5.8 : -5.8);
        }
      });
      upperRotorsRef.current.forEach((rotor, index) => {
        if (rotor) {
          rotor.rotation.x += delta * release * (index === 0 ? -6.2 : 6.2);
        }
      });
      if (pumpRotorRef.current) {
        pumpRotorRef.current.rotation.y += delta * pumping * 5.4;
      }
    }

    const upperLevel = sampleKeyframes(progress, UPPER_LEVELS);
    const lowerLevel = sampleKeyframes(progress, LOWER_LEVELS);
    const upperHeight = Math.max(0.08, UPPER_CAPACITY * upperLevel);
    const lowerHeight = Math.max(0.08, LOWER_CAPACITY * lowerLevel);

    if (upperVolumeRef.current) {
      upperVolumeRef.current.scale.y = upperHeight;
      upperVolumeRef.current.position.set(0, UPPER_FLOOR + upperHeight * 0.5, 0);
    }
    if (upperSurfaceRef.current) {
      upperSurfaceRef.current.position.set(0, UPPER_FLOOR + upperHeight, 0);
    }
    if (lowerVolumeRef.current) {
      lowerVolumeRef.current.scale.y = lowerHeight;
      lowerVolumeRef.current.position.set(0, LOWER_FLOOR + lowerHeight * 0.5, 0);
    }
    if (lowerSurfaceRef.current) {
      lowerSurfaceRef.current.position.set(0, LOWER_FLOOR + lowerHeight, 0);
    }

    const upperWaterMaterial = upperWaterMaterialRef.current;
    if (upperWaterMaterial) {
      upperWaterMaterial.uniforms.uTime.value = time;
      upperWaterMaterial.uniforms.uMotion.value = motionReduced ? 0 : 1;
      upperWaterMaterial.uniforms.uEvidence.value = evidence;
    }

    const lowerWaterMaterial = lowerWaterMaterialRef.current;
    if (lowerWaterMaterial) {
      lowerWaterMaterial.uniforms.uTime.value = time;
      lowerWaterMaterial.uniforms.uMotion.value = motionReduced ? 0 : 1;
      lowerWaterMaterial.uniforms.uEvidence.value = evidence;
    }

    if (oceanMaterialRef.current) {
      oceanMaterialRef.current.uniforms.uTime.value = time;
      oceanMaterialRef.current.uniforms.uMotion.value = motionReduced ? 0 : 1;
      oceanMaterialRef.current.uniforms.uOpacity.value = MathUtils.lerp(
        0.42,
        0.34,
        evidence,
      );
    }

    if (evidenceRef.current) {
      evidenceRef.current.visible = evidence > 0.01;
      evidenceRef.current.rotation.y = motionReduced ? 0 : time * 0.06;
      const scale = 0.72 + evidence * 0.28;
      evidenceRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, -0.1, 0]}>
      <StructuralShell />

      <ReservoirFrame
        floor={UPPER_FLOOR}
        width={6.8}
        height={2.55}
        depth={4.45}
      />
      <ReservoirFrame
        floor={LOWER_FLOOR}
        width={6.9}
        height={2.25}
        depth={4.45}
      />

      <WaterBody
        width={6.34}
        depth={4.0}
        volumeRef={upperVolumeRef}
        surfaceRef={upperSurfaceRef}
        materialRef={upperWaterMaterialRef}
        compact={compact}
      />
      <WaterBody
        width={6.44}
        depth={4.0}
        volumeRef={lowerVolumeRef}
        surfaceRef={lowerSurfaceRef}
        materialRef={lowerWaterMaterialRef}
        compact={compact}
      />

      <FlowConduit
        points={INTAKE_LEFT}
        color={COLORS.intake}
        channel="intakeLeft"
        registerMaterial={registerFlowMaterial}
        compact={compact}
      />
      <FlowConduit
        points={INTAKE_RIGHT}
        color={COLORS.intake}
        channel="intakeRight"
        registerMaterial={registerFlowMaterial}
        compact={compact}
      />
      <FlowConduit
        points={LOWER_LEFT}
        color={COLORS.intake}
        channel="lowerLeft"
        registerMaterial={registerFlowMaterial}
        compact={compact}
      />
      <FlowConduit
        points={LOWER_RIGHT}
        color={COLORS.intake}
        channel="lowerRight"
        registerMaterial={registerFlowMaterial}
        compact={compact}
      />
      <FlowConduit
        points={PUMP_PATH}
        color={COLORS.pump}
        channel="pump"
        registerMaterial={registerFlowMaterial}
        compact={compact}
        radius={0.27}
        speed={0.82}
      />
      <FlowConduit
        points={RELEASE_LEFT}
        color={COLORS.release}
        channel="releaseLeft"
        registerMaterial={registerFlowMaterial}
        compact={compact}
        speed={1.05}
      />
      <FlowConduit
        points={RELEASE_RIGHT}
        color={COLORS.release}
        channel="releaseRight"
        registerMaterial={registerFlowMaterial}
        compact={compact}
        speed={1.05}
      />

      <Turbine
        position={[-3.62, -3.2, 0.75]}
        accent={COLORS.intake}
        rotorRef={(rotor) => {
          lowerRotorsRef.current[0] = rotor;
        }}
      />
      <Turbine
        position={[3.62, -3.2, 0.75]}
        accent={COLORS.intake}
        rotorRef={(rotor) => {
          lowerRotorsRef.current[1] = rotor;
        }}
      />
      <Turbine
        position={[-3.62, 0.85, 0.75]}
        accent={COLORS.release}
        rotorRef={(rotor) => {
          upperRotorsRef.current[0] = rotor;
        }}
      />
      <Turbine
        position={[3.62, 0.85, 0.75]}
        accent={COLORS.release}
        rotorRef={(rotor) => {
          upperRotorsRef.current[1] = rotor;
        }}
      />

      <CentralPump rotorRef={pumpRotorRef} />
      <EvidenceNodes groupRef={evidenceRef} />
      <Ocean materialRef={oceanMaterialRef} compact={compact} />
    </group>
  );
}

type ClipBinding = {
  action: AnimationAction;
  duration: number;
  start: number;
  end: number;
};

/**
 * Supports either one full-cycle timeline or separate stage-named clips.
 *
 * Recommended Blender clip names:
 * - ConstantSupply / Intake
 * - GravitationalFlow / LowerTurbines
 * - Pumping / Store
 * - Release / UpperTurbines
 *
 * Unrecognized clips are treated as full 0..1 scroll timelines.
 */
function clipWindowForName(name: string): readonly [number, number] {
  const normalized = name.toLowerCase();

  if (/(constant|supply|intake)/.test(normalized)) return [0, 0.25];
  if (/(gravity|gravitational|lower.?turbine)/.test(normalized)) {
    return [0.25, 0.5];
  }
  if (/(pump|pumping|store|charge)/.test(normalized)) return [0.5, 0.75];
  if (/(release|discharge|upper.?turbine)/.test(normalized)) {
    return [0.75, 1];
  }

  return [0, 1];
}

function localClipProgress(
  progress: number,
  start: number,
  end: number,
) {
  return clamp01((progress - start) / Math.max(0.0001, end - start));
}

/**
 * GLB renderer and scroll scrubber.
 *
 * No React state is used. The model root, embedded AnimationActions, and all
 * transforms are mutated through refs inside useFrame.
 */
function AnimatedHydroModel({
  motionRef,
  compact,
  reducedMotion,
}: {
  motionRef: MutableRefObject<OpshMotionState>;
  compact: boolean;
  reducedMotion: boolean;
}) {
  const rootRef = useRef<Group>(null);
  const clipBindingsRef = useRef<ClipBinding[]>([]);
  const progressRef = useRef(0);
  const targetPosition = useMemo(() => new Vector3(), []);
  const targetRotation = useMemo(() => new Vector3(), []);

  const { scene, animations } = useGLTF(HYDRO_MODEL_URL);

  /**
   * Clone before mutation so Drei's cached GLTF remains immutable and safe for
   * additional canvases. SkeletonUtils preserves skinned-mesh bone bindings.
   */
  const { model, fitScale } = useMemo(() => {
    const clonedModel = cloneSkeleton(scene);

    clonedModel.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = true;
    });

    const bounds = new Box3().setFromObject(clonedModel);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const largestDimension = Math.max(size.x, size.y, size.z, 0.0001);

    /**
     * Recenter around the authored model bounds and normalize unknown export
     * units into the existing scene's roughly 10-unit structural envelope.
     */
    clonedModel.position.sub(center);

    return {
      model: clonedModel,
      fitScale: MODEL_FIT_SIZE / largestDimension,
    };
  }, [scene]);

  const { actions, mixer } = useAnimations(animations, rootRef);

  /**
   * Bind clips once. Actions are played in a paused state and scrubbed by
   * assigning action.time in useFrame. No animation clock runs independently
   * from the page's scroll position.
   */
  useEffect(() => {
    const bindings: ClipBinding[] = [];

    animations.forEach((clip) => {
      const action = actions[clip.name];
      if (!action) return;

      const [start, end] = clipWindowForName(clip.name);
      action.reset();
      action.play();
      action.paused = true;

      bindings.push({
        action,
        duration: Math.max(clip.duration, 0.0001),
        start,
        end,
      });
    });

    clipBindingsRef.current = bindings;
    mixer.update(0);

    return () => {
      bindings.forEach(({ action }) => action.stop());
      clipBindingsRef.current = [];
    };
  }, [actions, animations, mixer]);

  useFrame((state, rawDelta) => {
    const root = rootRef.current;
    if (!root) return;

    const runtime = motionRef.current as ExtendedMotionState;
    const motionReduced = reducedMotion || runtime.reducedMotion;
    const targetProgress = readPhysicalStageProgress(runtime);
    const delta = Math.min(rawDelta, 1 / 30);

    progressRef.current = motionReduced
      ? targetProgress
      : MathUtils.damp(progressRef.current, targetProgress, 7.2, delta);

    const progress = progressRef.current;
    sampleVectorKeyframes(progress, MODEL_POSITIONS, targetPosition);
    sampleVectorKeyframes(progress, MODEL_ROTATIONS, targetRotation);

    /**
     * A tiny desktop-only yaw drift adds depth without changing the apparent
     * engineering geometry or burning mobile GPU time.
     */
    const drift =
      motionReduced || compact
        ? 0
        : Math.sin(state.clock.elapsedTime * 0.24) * 0.012;

    root.position.copy(targetPosition);
    root.rotation.set(
      targetRotation.x,
      targetRotation.y + drift,
      targetRotation.z,
    );
    root.scale.setScalar(
      fitScale * sampleKeyframes(progress, MODEL_SCALES),
    );

    /**
     * Scroll-scrub every embedded clip. This mutates Three.js AnimationActions
     * directly; no setState or React render occurs.
     */
    clipBindingsRef.current.forEach((binding) => {
      const clipProgress = localClipProgress(
        progress,
        binding.start,
        binding.end,
      );
      binding.action.time = clipProgress * binding.duration;
    });

    mixer.update(0);
  });

  return (
    <group ref={rootRef}>
      <primitive object={model} dispose={null} />
    </group>
  );
}

function CameraRig({
  stage,
  interactive,
  motionRef,
  controlsRef,
  resetSignal,
  reducedMotion,
}: {
  stage: OpshStage;
  interactive: boolean;
  motionRef: MutableRefObject<OpshMotionState>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  resetSignal: number;
  reducedMotion: boolean;
}) {
  const { camera } = useThree();
  const lastStageRef = useRef(stage.id);
  const lastResetRef = useRef(resetSignal);
  const interactiveTransitionRef = useRef(1);
  const progressRef = useRef(0);
  const fromPosition = useMemo(() => new Vector3(), []);
  const toPosition = useMemo(() => new Vector3(), []);
  const targetPosition = useMemo(() => new Vector3(), []);
  const fromLook = useMemo(() => new Vector3(), []);
  const toLook = useMemo(() => new Vector3(), []);
  const targetLook = useMemo(() => new Vector3(), []);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 30);
    const runtime = motionRef.current as ExtendedMotionState;
    const motionReduced = reducedMotion || runtime.reducedMotion;

    if (interactive) {
      const stageChanged = lastStageRef.current !== stage.id;
      const resetChanged = lastResetRef.current !== resetSignal;

      if (stageChanged || resetChanged) {
        lastStageRef.current = stage.id;
        lastResetRef.current = resetSignal;
        interactiveTransitionRef.current = 1;
      }

      if (interactiveTransitionRef.current <= 0) return;

      targetPosition.set(
        stage.camera.position[0],
        stage.camera.position[1],
        stage.camera.position[2],
      );
      targetLook.set(
        stage.camera.target[0],
        stage.camera.target[1],
        stage.camera.target[2],
      );
      interactiveTransitionRef.current = Math.max(
        0,
        interactiveTransitionRef.current - delta * 1.15,
      );
    } else {
      const targetProgress = readPhysicalStageProgress(runtime);
      progressRef.current = motionReduced
        ? targetProgress
        : MathUtils.damp(progressRef.current, targetProgress, 6.1, delta);

      const scaled = progressRef.current * (CAMERA_POSITIONS.length - 1);
      const index = Math.min(
        CAMERA_POSITIONS.length - 2,
        Math.floor(scaled),
      );
      const local = smoothStep(0, 1, scaled - index);
      const positionA = CAMERA_POSITIONS[index];
      const positionB = CAMERA_POSITIONS[index + 1];
      const lookA = CAMERA_TARGETS[index];
      const lookB = CAMERA_TARGETS[index + 1];

      fromPosition.set(positionA[0], positionA[1], positionA[2]);
      toPosition.set(positionB[0], positionB[1], positionB[2]);
      targetPosition.lerpVectors(fromPosition, toPosition, local);

      fromLook.set(lookA[0], lookA[1], lookA[2]);
      toLook.set(lookB[0], lookB[1], lookB[2]);
      targetLook.lerpVectors(fromLook, toLook, local);
    }

    const strength = motionReduced ? 1 : 1 - Math.exp(-delta * 4.6);
    camera.position.lerp(targetPosition, strength);

    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(targetLook, strength);
      controls.update();
    } else {
      camera.lookAt(targetLook);
    }
  });

  return null;
}

function SceneContent({
  stage,
  motionRef,
  interactive,
  compact,
  reducedMotion,
  resetSignal,
}: Pick<
  OpshSceneProps,
  | "stage"
  | "motionRef"
  | "interactive"
  | "compact"
  | "reducedMotion"
  | "resetSignal"
>) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.fog, 18, 45]} />

      <ambientLight intensity={0.34} color="#78aebd" />
      <hemisphereLight args={["#9ddce9", "#02090d", 1.22]} />
      <directionalLight
        position={[8, 14, 10]}
        intensity={2.35}
        color="#d9f8ff"
        castShadow={!compact}
        shadow-mapSize-width={compact ? 512 : 1024}
        shadow-mapSize-height={compact ? 512 : 1024}
      />
      <pointLight position={[-6, -1, 6]} intensity={1.1} color={COLORS.intake} />
      <pointLight position={[0, 0, 4]} intensity={0.9} color={COLORS.pump} />
      <pointLight position={[6, 2, 6]} intensity={1.0} color={COLORS.release} />

      {EXTERNAL_MODEL_ENABLED ? (
        <Suspense
          fallback={(
            <HydroSystem
              motionRef={motionRef}
              compact={compact}
              reducedMotion={reducedMotion}
            />
          )}
        >
          <AnimatedHydroModel
            motionRef={motionRef}
            compact={compact}
            reducedMotion={reducedMotion}
          />
        </Suspense>
      ) : (
        <HydroSystem
          motionRef={motionRef}
          compact={compact}
          reducedMotion={reducedMotion}
        />
      )}

      <mesh
        position={[0, -6.2, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow={!compact}
      >
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#07171c" roughness={1} metalness={0} />
      </mesh>

      <CameraRig
        stage={stage}
        interactive={interactive}
        motionRef={motionRef}
        controlsRef={controlsRef}
        resetSignal={resetSignal}
        reducedMotion={reducedMotion}
      />

      {interactive && (
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.075}
          minDistance={9}
          maxDistance={24}
          minPolarAngle={Math.PI * 0.17}
          maxPolarAngle={Math.PI * 0.73}
          minAzimuthAngle={-Math.PI * 0.44}
          maxAzimuthAngle={Math.PI * 0.44}
          target={stage.camera.target}
        />
      )}
    </>
  );
}

export default function OpshScene(props: OpshSceneProps) {
  return (
    <Canvas
      className="opsh-canvas"
      camera={{
        position: [12.5, 6.5, 15.5],
        fov: 36,
        near: 0.1,
        far: 100,
      }}
      dpr={props.compact ? [1, 1.2] : [1, 1.6]}
      frameloop={props.renderActive ? "always" : "never"}
      fallback={props.fallback}
      gl={{
        antialias: !props.compact,
        alpha: false,
        depth: true,
        stencil: false,
        powerPreference: "high-performance",
      }}
      shadows={!props.compact}
    >
      <SceneContent
        stage={props.stage}
        motionRef={props.motionRef}
        interactive={props.interactive}
        compact={props.compact}
        reducedMotion={props.reducedMotion}
        resetSignal={props.resetSignal}
      />
    </Canvas>
  );
}
