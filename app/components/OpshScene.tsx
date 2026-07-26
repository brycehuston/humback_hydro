"use client";

import type { MutableRefObject, ReactNode, RefObject } from "react";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  CatmullRomCurve3,
  Group,
  InstancedMesh,
  MathUtils,
  Matrix4,
  Mesh,
  Vector3,
} from "three";
import type {
  OpshComponentId,
  OpshMotionState,
  OpshStage,
} from "../opsh-data";

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

const concrete = "#66777a";
const concreteDark = "#263a40";
const steel = "#5d7f88";
const water = "#2c9ebe";
const energy = "#56e5da";
const inactiveEmissive = "#07171c";

function highlighted(stage: OpshStage, id: OpshComponentId) {
  return stage.highlights.includes(id);
}

function materialProps(active: boolean, color = steel) {
  return {
    color,
    roughness: 0.58,
    metalness: color === concrete || color === concreteDark ? 0.08 : 0.7,
    emissive: active ? energy : inactiveEmissive,
    emissiveIntensity: active ? 0.42 : 0.05,
  };
}

function StructuralShell({ active }: { active: boolean }) {
  const shellMaterial = materialProps(active, concrete);
  return (
    <group>
      <mesh position={[0, 0.6, -3]}>
        <boxGeometry args={[9.2, 11.2, 0.35]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>
      <mesh position={[-4.45, 0.6, 0]}>
        <boxGeometry args={[0.35, 11.2, 6.3]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>
      <mesh position={[4.45, 0.6, 0]}>
        <boxGeometry args={[0.35, 11.2, 6.3]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>
      <mesh position={[0, 6.05, 0]}>
        <boxGeometry args={[9.2, 0.3, 6.3]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>
      <mesh position={[0, -4.85, 0]}>
        <boxGeometry args={[9.2, 0.45, 6.3]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[9, 0.3, 6]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>
      <mesh position={[0, -3.5, 0]}>
        <boxGeometry args={[9, 0.3, 6]} />
        <meshStandardMaterial {...shellMaterial} />
      </mesh>
    </group>
  );
}

function ReservoirFrame({
  position,
  active,
}: {
  position: [number, number, number];
  active: boolean;
}) {
  const frameMaterial = materialProps(active, concreteDark);
  return (
    <group position={position}>
      <mesh position={[0, -1.25, 0]}>
        <boxGeometry args={[7.6, 0.18, 4.9]} />
        <meshStandardMaterial {...frameMaterial} />
      </mesh>
      <mesh position={[-3.7, 0, 0]}>
        <boxGeometry args={[0.18, 2.5, 4.9]} />
        <meshStandardMaterial {...frameMaterial} />
      </mesh>
      <mesh position={[3.7, 0, 0]}>
        <boxGeometry args={[0.18, 2.5, 4.9]} />
        <meshStandardMaterial {...frameMaterial} />
      </mesh>
      <mesh position={[0, 0, -2.35]}>
        <boxGeometry args={[7.6, 2.5, 0.18]} />
        <meshStandardMaterial {...frameMaterial} />
      </mesh>
    </group>
  );
}

function Turbine({
  position,
  active,
  running,
  reverse = false,
  reducedMotion,
}: {
  position: [number, number, number];
  active: boolean;
  running: boolean;
  reverse?: boolean;
  reducedMotion: boolean;
}) {
  const rotorRef = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!rotorRef.current || !running || reducedMotion) return;
    rotorRef.current.rotation.z += delta * (reverse ? -5.2 : 5.2);
  });
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <torusGeometry args={[0.38, 0.12, 10, 24]} />
        <meshStandardMaterial {...materialProps(active)} />
      </mesh>
      <mesh ref={rotorRef}>
        <cylinderGeometry args={[0.29, 0.29, 0.13, 6]} />
        <meshStandardMaterial
          color={active ? "#bafaf3" : "#8ca5aa"}
          emissive={active ? energy : inactiveEmissive}
          emissiveIntensity={active ? 0.7 : 0.04}
          metalness={0.8}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function TurbineStage({
  y,
  z,
  active,
  running,
  reverse,
  reducedMotion,
}: {
  y: number;
  z: number;
  active: boolean;
  running: boolean;
  reverse?: boolean;
  reducedMotion: boolean;
}) {
  return (
    <group>
      {[-1.45, 0, 1.45].map((x) => (
        <Turbine
          key={x}
          position={[x, y, z]}
          active={active}
          running={running}
          reverse={reverse}
          reducedMotion={reducedMotion}
        />
      ))}
    </group>
  );
}

function Penstock({
  position,
  scale,
  active,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  scale: [number, number, number];
  active: boolean;
  rotation?: [number, number, number];
}) {
  return (
    <mesh position={position} scale={scale} rotation={rotation}>
      <cylinderGeometry args={[0.18, 0.18, 1, 16]} />
      <meshStandardMaterial {...materialProps(active)} />
    </mesh>
  );
}

function PumpArray({
  active,
  reducedMotion,
  running,
}: {
  active: boolean;
  reducedMotion: boolean;
  running: boolean;
}) {
  const groupRef = useRef<Group>(null);
  useFrame((_, delta) => {
    if (!groupRef.current || reducedMotion || !running) return;
    groupRef.current.rotation.y += delta * 0.24;
  });
  return (
    <group ref={groupRef} position={[0, -2.9, -1.2]}>
      {[-2.5, -1.25, 0, 1.25, 2.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.3, 0.36, 0.65, 14]} />
            <meshStandardMaterial {...materialProps(active)} />
          </mesh>
          <mesh position={[0, 0.43, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.24, 12]} />
            <meshStandardMaterial
              color={active ? "#bafaf3" : steel}
              emissive={active ? energy : inactiveEmissive}
              emissiveIntensity={active ? 0.7 : 0.04}
              metalness={0.8}
              roughness={0.24}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FlowParticles({
  points,
  active,
  reducedMotion,
  count,
  speed,
}: {
  points: Vector3[];
  active: boolean;
  reducedMotion: boolean;
  count: number;
  speed: number;
}) {
  const meshRef = useRef<InstancedMesh>(null);
  const curve = useMemo(() => new CatmullRomCurve3(points), [points]);
  const matrix = useMemo(() => new Matrix4(), []);
  const position = useMemo(() => new Vector3(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.visible = active;
    if (!active) return;
    const offset = reducedMotion ? 0 : clock.elapsedTime * speed;
    for (let index = 0; index < count; index += 1) {
      curve.getPoint((offset + index / count) % 1, position);
      matrix.makeScale(1, 1, 1).setPosition(position);
      mesh.setMatrixAt(index, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[0.09, 8, 8]} />
      <meshStandardMaterial
        color="#bafaf3"
        emissive={energy}
        emissiveIntensity={1.3}
        roughness={0.15}
      />
    </instancedMesh>
  );
}

function CameraRig({
  stage,
  interactive,
  motionRef,
  controlsRef,
  resetSignal,
}: {
  stage: OpshStage;
  interactive: boolean;
  motionRef: MutableRefObject<OpshMotionState>;
  controlsRef: RefObject<OrbitControlsImpl | null>;
  resetSignal: number;
}) {
  const { camera } = useThree();
  const transitionRef = useRef(1);
  const lastStageRef = useRef(stage.id);
  const lastResetRef = useRef(resetSignal);
  const targetPosition = useMemo(() => new Vector3(), []);
  const targetLook = useMemo(() => new Vector3(), []);

  useFrame((_, delta) => {
    if (lastStageRef.current !== stage.id || lastResetRef.current !== resetSignal) {
      lastStageRef.current = stage.id;
      lastResetRef.current = resetSignal;
      transitionRef.current = 1;
    }
    if (interactive && transitionRef.current <= 0) return;

    targetPosition.fromArray(stage.camera.position);
    targetLook.fromArray(stage.camera.target);
    const strength = motionRef.current.reducedMotion ? 1 : 1 - Math.exp(-delta * 3.8);
    camera.position.lerp(targetPosition, strength);
    const controls = controlsRef.current;
    if (controls) {
      controls.target.lerp(targetLook, strength);
      controls.update();
    } else {
      camera.lookAt(targetLook);
    }
    transitionRef.current = Math.max(0, transitionRef.current - delta * 1.1);
  });

  return null;
}

export function OpshModel({
  stage,
  reducedMotion,
}: {
  stage: OpshStage;
  reducedMotion: boolean;
}) {
  const upperWaterRef = useRef<Mesh>(null);
  const lowerWaterRef = useRef<Mesh>(null);
  const storeActive = stage.id === "store";
  const generateActive = stage.id === "generate";

  useFrame((_, delta) => {
    const updateWater = (mesh: Mesh | null, level: number, floorY: number, fullHeight: number) => {
      if (!mesh) return;
      const height = Math.max(0.08, fullHeight * level);
      const strength = reducedMotion ? 1 : 1 - Math.exp(-delta * 2.4);
      mesh.scale.y = MathUtils.lerp(mesh.scale.y, height, strength);
      mesh.position.y = MathUtils.lerp(mesh.position.y, floorY + height / 2, strength);
    };
    updateWater(upperWaterRef.current, stage.waterLevels.upper, 2.02, 2.25);
    updateWater(lowerWaterRef.current, stage.waterLevels.lower, -3.34, 3.95);
  });

  const storePath = useMemo(() => [
    new Vector3(0, -2.2, -0.5),
    new Vector3(2.8, -2.8, -1.2),
    new Vector3(3.3, 0.5, -1.8),
    new Vector3(2.2, 4.3, -1.2),
    new Vector3(0, 4.5, 0),
  ], []);
  const upperGenerationPath = useMemo(() => [
    new Vector3(0, 4.5, 0),
    new Vector3(0, 2.3, 0.9),
    new Vector3(0, 1.65, 1.8),
    new Vector3(0, 2.2, 5.7),
  ], []);
  const lowerGenerationPath = useMemo(() => [
    new Vector3(0, -4.1, 5.7),
    new Vector3(0, -4.1, 2.2),
    new Vector3(0, -3.9, 1.3),
    new Vector3(0, -1.7, 0),
  ], []);

  return (
    <group>
      <StructuralShell active={highlighted(stage, "structure")} />
      <ReservoirFrame position={[0, 4.45, 0]} active={highlighted(stage, "upper-reservoir")} />
      <ReservoirFrame position={[0, -1.95, 0]} active={highlighted(stage, "lower-reservoir")} />

      <mesh ref={upperWaterRef} position={[0, 2.7, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[7.15, 1, 4.4]} />
        <meshPhysicalMaterial
          color={water}
          roughness={0.16}
          metalness={0.04}
          transparent
          opacity={0.68}
          transmission={0.12}
          depthWrite={false}
          emissive="#0b5266"
          emissiveIntensity={0.36}
        />
      </mesh>
      <mesh ref={lowerWaterRef} position={[0, -2.2, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[7.15, 1, 4.4]} />
        <meshPhysicalMaterial
          color={water}
          roughness={0.16}
          metalness={0.04}
          transparent
          opacity={0.64}
          transmission={0.12}
          depthWrite={false}
          emissive="#0b5266"
          emissiveIntensity={0.32}
        />
      </mesh>

      {[-1.45, 0, 1.45].map((x) => (
        <Penstock
          key={`upper-${x}`}
          position={[x, 2.45, 1.2]}
          scale={[1, 2.7, 1]}
          active={highlighted(stage, "upper-penstock")}
        />
      ))}
      {[-1.45, 0, 1.45].map((x) => (
        <Penstock
          key={`lower-${x}`}
          position={[x, -4.05, 2.9]}
          scale={[1, 4.2, 1]}
          rotation={[Math.PI / 2, 0, 0]}
          active={highlighted(stage, "lower-penstock")}
        />
      ))}
      <Penstock
        position={[3.25, 0.55, -1.65]}
        scale={[1.15, 7.2, 1.15]}
        active={storeActive}
      />

      <TurbineStage
        y={1.6}
        z={1.25}
        active={highlighted(stage, "upper-turbines")}
        running={generateActive}
        reducedMotion={reducedMotion}
      />
      <TurbineStage
        y={-4.05}
        z={1.3}
        active={highlighted(stage, "lower-turbines")}
        running={generateActive}
        reverse
        reducedMotion={reducedMotion}
      />
      <PumpArray active={highlighted(stage, "pumps")} running={storeActive} reducedMotion={reducedMotion} />

      <FlowParticles points={storePath} active={storeActive} reducedMotion={reducedMotion} count={12} speed={0.12} />
      <FlowParticles points={upperGenerationPath} active={generateActive} reducedMotion={reducedMotion} count={8} speed={0.16} />
      <FlowParticles points={lowerGenerationPath} active={generateActive} reducedMotion={reducedMotion} count={8} speed={0.14} />

      {[[-3.3, -5.55, -2.1], [3.3, -5.55, -2.1], [-3.3, -5.55, 2.1], [3.3, -5.55, 2.1]].map(
        (position, index) => (
          <mesh key={index} position={position as [number, number, number]}>
            <cylinderGeometry args={[0.42, 0.62, 1.1, 14]} />
            <meshStandardMaterial {...materialProps(highlighted(stage, "structure"), concreteDark)} />
          </mesh>
        ),
      )}
    </group>
  );
}

function SceneContent({
  stage,
  motionRef,
  interactive,
  compact,
  reducedMotion,
  resetSignal,
}: Pick<OpshSceneProps, "stage" | "motionRef" | "interactive" | "compact" | "reducedMotion" | "resetSignal">) {
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <>
      <color attach="background" args={["#03131b"]} />
      <fog attach="fog" args={["#03131b", 19, 42]} />
      <ambientLight intensity={0.52} color="#9dcbd2" />
      <hemisphereLight args={["#b8edf2", "#07141b", 1.45]} />
      <directionalLight
        position={[8, 13, 9]}
        intensity={2.4}
        color="#d6f7f5"
        castShadow={!compact}
      />
      <pointLight position={[-6, 2, 7]} intensity={1.6} color="#147c95" />
      <pointLight position={[4, -1, 5]} intensity={1.2} color="#56e5da" />

      <OpshModel stage={stage} reducedMotion={reducedMotion} />

      <mesh position={[0, -6.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow={!compact}>
        <planeGeometry args={[80, 80, 1, 1]} />
        <meshStandardMaterial color="#0a1b1f" roughness={1} />
      </mesh>
      <mesh position={[0, 3.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70, 1, 1]} />
        <meshPhysicalMaterial
          color="#0d6d88"
          roughness={0.22}
          metalness={0.05}
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>

      <CameraRig
        stage={stage}
        interactive={interactive}
        motionRef={motionRef}
        controlsRef={controlsRef}
        resetSignal={resetSignal}
      />
      {interactive && (
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={9}
          maxDistance={24}
          minPolarAngle={Math.PI * 0.18}
          maxPolarAngle={Math.PI * 0.72}
          minAzimuthAngle={-Math.PI * 0.42}
          maxAzimuthAngle={Math.PI * 0.42}
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
      camera={{ position: [12.5, 6.5, 15.5], fov: 36, near: 0.1, far: 100 }}
      dpr={props.compact ? [1, 1.25] : [1, 1.75]}
      frameloop={props.renderActive ? "always" : "never"}
      fallback={props.fallback}
      gl={{
        antialias: !props.compact,
        alpha: false,
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
