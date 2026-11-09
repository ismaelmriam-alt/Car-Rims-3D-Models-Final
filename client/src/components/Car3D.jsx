import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { CAR_PAINT } from '../vehicleColors.js';

// Curated vehicles use distinct CC0, unbranded GLB body-style previews where available.
// Other catalogue vehicles retain the procedural fallback. None of these assets are OEM replicas.

const SPECS = {
  hatchback: {
    body: [[-1.95, 0.28], [-1.98, 0.7], [-1.9, 0.98], [-0.5, 1.0], [0.9, 1.0], [1.75, 0.9], [1.98, 0.62], [1.95, 0.28]],
    cabin: [[-1.5, 0.98], [-1.2, 1.42], [0.35, 1.5], [1.0, 0.98]],
    front: 1.98, axles: [1.25, -1.2], R: 0.3, lampY: [0.72, 0.8],
  },
  sedan: {
    body: [[-2.3, 0.28], [-2.33, 0.72], [-2.2, 1.02], [-1.0, 1.04], [0.7, 1.02], [1.9, 0.92], [2.28, 0.62], [2.25, 0.28]],
    cabin: [[-1.2, 1.0], [-0.8, 1.46], [0.55, 1.46], [1.15, 1.0]],
    front: 2.28, axles: [1.45, -1.4], R: 0.33, lampY: [0.74, 0.84],
  },
  suv: {
    body: [[-2.25, 0.35], [-2.28, 0.9], [-2.2, 1.15], [0.8, 1.15], [1.9, 1.05], [2.22, 0.75], [2.2, 0.35]],
    cabin: [[-2.1, 1.12], [-1.95, 1.7], [0.6, 1.72], [1.25, 1.12]],
    front: 2.22, axles: [1.4, -1.35], R: 0.38, lampY: [0.85, 0.95],
  },
  coupe: {
    body: [[-2.2, 0.26], [-2.25, 0.65], [-2.1, 0.92], [0.6, 0.95], [1.9, 0.82], [2.2, 0.55], [2.15, 0.26]],
    cabin: [[-1.25, 0.93], [-0.5, 1.32], [0.45, 1.34], [1.05, 0.93]],
    front: 2.2, axles: [1.4, -1.3], R: 0.33, lampY: [0.66, 0.74],
  },
};

const SPOKES = {
  'Multi-Spoke': { n: 10, w: 0.05 },
  Mesh: { n: 18, w: 0.025 },
  'Split-Spoke': { n: 10, w: 0.04 },
  'Deep Dish': { n: 6, w: 0.11 },
  Sport: { n: 5, w: 0.13 },
};

// Closed, rounded outline: quadratic curves through every vertex.
function smoothShape(pts) {
  const s = new THREE.Shape();
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[pts.length - 1], pts[0]);
  s.moveTo(...start);
  pts.forEach((p, i) => {
    const m = mid(p, pts[(i + 1) % pts.length]);
    s.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  });
  return s;
}

function extrude(shape, depth, bevel) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel * 0.6, bevelSegments: 4, curveSegments: 16,
  });
  g.translate(0, 0, -depth / 2);
  return g;
}

function Wheel({ x, side, R, rimColor, style }) {
  const sp = SPOKES[style] || SPOKES.Sport;
  const rimR = R * 0.68;
  const rim = (
    <meshStandardMaterial color={rimColor} metalness={0.85} roughness={0.28} />
  );
  return (
    <group position={[x, R, side * 0.8]} rotation={[0, side < 0 ? Math.PI : 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R, R, 0.24, 48]} />
        <meshStandardMaterial color="#101012" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[rimR, rimR, 0.04, 40]} />
        <meshStandardMaterial color="#050506" roughness={0.8} />
      </mesh>
      <mesh position={[R * 0.36, -R * 0.06, 0.08]}>
        <boxGeometry args={[R * 0.26, R * 0.36, 0.05]} />
        <meshStandardMaterial color="#c4161c" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.125]}>
        <torusGeometry args={[rimR, R * 0.04, 10, 48]} />
        {rim}
      </mesh>
      {Array.from({ length: sp.n }, (_, i) => (
        <group key={i} rotation={[0, 0, (i / sp.n) * Math.PI * 2]}>
          <mesh position={[R * 0.38, 0, 0.115]}>
            <boxGeometry args={[R * 0.56, sp.w, 0.035]} />
            {rim}
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0, 0.13]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R * 0.14, R * 0.14, 0.05, 24]} />
        {rim}
      </mesh>
      <mesh position={[0, 0, 0.158]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R * 0.06, R * 0.06, 0.02, 16]} />
        <meshStandardMaterial color="#0b0b0d" />
      </mesh>
      {/* wheel arch shadow ring sits on the body surface */}
      <mesh position={[0, 0, 0.075]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[R * 1.14, R * 1.14, 0.01, 40]} />
        <meshStandardMaterial color="#060607" roughness={1} />
      </mesh>
    </group>
  );
}

function Car({ bodyType, color, rimColor, rimStyle }) {
  const spec = SPECS[bodyType] || SPECS.sedan;
  const paint = CAR_PAINT[color] || CAR_PAINT.black;

  const geo = useMemo(() => {
    const body = extrude(smoothShape(spec.body), 1.55, 0.07);
    const cabin = extrude(smoothShape(spec.cabin), 1.3, 0.04);
    const [rb, rt, ft] = [spec.cabin[0], spec.cabin[1], spec.cabin[2]];
    const P = (t) => [rt[0] + (ft[0] - rt[0]) * t, rt[1] + (ft[1] - rt[1]) * t];
    const a = P(0.1), b = P(0.9);
    const roofShape = new THREE.Shape([
      new THREE.Vector2(a[0], a[1] + 0.012), new THREE.Vector2(b[0], b[1] + 0.012),
      new THREE.Vector2(b[0], b[1] - 0.05), new THREE.Vector2(a[0], a[1] - 0.05),
    ]);
    const roof = extrude(roofShape, 1.32, 0.02);
    void rb;
    return { body, cabin, roof };
  }, [spec]);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  const [headY, tailY] = spec.lampY;
  return (
    <group>
      <mesh geometry={geo.body}>
        <meshPhysicalMaterial color={paint} metalness={0.4} roughness={0.3} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.3} />
      </mesh>
      <mesh geometry={geo.cabin}>
        <meshPhysicalMaterial color="#0a0e13" metalness={0.9} roughness={0.06} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={geo.roof}>
        <meshPhysicalMaterial color={paint} metalness={0.4} roughness={0.3} clearcoat={1} clearcoatRoughness={0.08} envMapIntensity={1.3} />
      </mesh>
      {/* lower sill / bumpers */}
      <mesh position={[0, 0.27, 0]}>
        <boxGeometry args={[spec.front * 2 - 0.7, 0.08, 1.5]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.7} />
      </mesh>
      {/* lights */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[spec.front - 0.04, headY, s * 0.55]}>
            <boxGeometry args={[0.1, 0.1, 0.34]} />
            <meshStandardMaterial color="#ffffff" emissive="#fff6d8" emissiveIntensity={1.6} />
          </mesh>
          <mesh position={[-spec.front + 0.04, tailY, s * 0.55]}>
            <boxGeometry args={[0.08, 0.09, 0.36]} />
            <meshStandardMaterial color="#ff2a2a" emissive="#ff1010" emissiveIntensity={1.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[spec.front - 0.02, headY - 0.18, 0]}>
        <boxGeometry args={[0.05, 0.14, 0.7]} />
        <meshStandardMaterial color="#060607" roughness={0.6} />
      </mesh>
      {/* wheels */}
      {spec.axles.map((x) => [-1, 1].map((side) => (
        <Wheel key={`${x}${side}`} x={x} side={side} R={spec.R} rimColor={rimColor} style={rimStyle} />
      )))}
    </group>
  );
}


// CC0, unbranded body-style assets. These are visual stand-ins, NOT OEM replicas.
// The vehicle identity selects a distinct silhouette; fitment data remains independent.
const MODEL_ASSETS = {
  'kia|picanto': 'https://files.innerscene.com/library/silver-five-door-compact-hatchback-6bf4a878/d40c0ce1ee7464556dc8/silver-five-door-compact-hatchback.glb',
  'bmw|x3': 'https://files.innerscene.com/library/generic-compact-suv-9f157ee5/fbafbd81b04c3d969f9c/generic-compact-suv.glb',
  'bmw|x5': 'https://files.innerscene.com/library/charcoal-five-door-crossover-suv-a1996830/b3001cfaec6e114962a0/charcoal-five-door-crossover-suv.glb',
  'bmw|x6': 'https://files.innerscene.com/library/sage-five-door-crossover-suv-1db314ad/494f615dc24305723112/sage-five-door-crossover-suv.glb',
  'ferrari|488': '/models/generic-mid-engine-supercar.glb',
  'porsche|911': 'https://files.innerscene.com/library/generic-two-door-coupe-f57c8670/8a933a393940e894aee9/generic-two-door-coupe.glb',
  'mercedes-benz|c-class': 'https://files.innerscene.com/library/sedan-car-42109739/75c64c1b3c8b03734314/sedan-original.glb',
  'mercedes-benz|g-class': 'https://files.innerscene.com/library/suv-dc972cab/fe9e6d452331cda7d3f7/suv-original.glb',
  'lamborghini|huracan': 'https://files.innerscene.com/library/generic-convertible-roadster-05aace60/d641e5f9919e786ffc65/generic-convertible-roadster.glb',
  'land-rover|range-rover-sport': 'https://files.innerscene.com/library/generic-station-wagon-estate-car-dec07098/4bc6a8a968865937f8bc/generic-station-wagon-estate-car.glb',
};

function assetForVehicle(vehicle) {
  if (!vehicle?.make || !vehicle?.model) return null;
  const key = `${vehicle.make.toLowerCase().replace(/[^a-z0-9]+/g, '-') .replace(/^-|-$/g, '')}|${vehicle.model.toLowerCase().replace(/[^a-z0-9]+/g, '-') .replace(/^-|-$/g, '')}`;
  return MODEL_ASSETS[key] || null;
}

function ImportedVehicle({ url, rimColor }) {
  const { scene } = useGLTF(url);
  const instance = useMemo(() => {
    const cloned = scene.clone(true);
    // Recolour only clearly named rim/spoke/hub meshes when the source exposes them.
    cloned.traverse((node) => {
      if (!node.isMesh || !/(rim|spoke|alloy|hub)/i.test(node.name || '')) return;
      const recolour = (material) => {
        const next = material.clone();
        if (next.color) next.color.set(rimColor || '#9a9da5');
        if (next.metalness !== undefined) next.metalness = 0.9;
        if (next.roughness !== undefined) next.roughness = 0.25;
        return next;
      };
      node.material = Array.isArray(node.material) ? node.material.map(recolour) : recolour(node.material);
    });
    const bounds = new THREE.Box3().setFromObject(cloned);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const longAxisIsZ = size.z > size.x;
    const longest = Math.max(size.x, size.z) || 1;
    return {
      object: cloned,
      scale: 4.65 / longest,
      offset: [-center.x, -bounds.min.y, -center.z],
      rotation: longAxisIsZ ? Math.PI / 2 : 0,
    };
  }, [scene, rimColor]);
  return (
    <group scale={instance.scale} rotation-y={instance.rotation}>
      <primitive object={instance.object} position={instance.offset} />
    </group>
  );
}

const VIEWS = {
  '3/4': { pos: [4.5, 1.9, 5.0], target: [0, 0.65, 0] },
  Front: { pos: [6.2, 1.2, 0.01], target: [0, 0.7, 0] },
  Side: { pos: [0.01, 1.3, 6.4], target: [0, 0.7, 0] },
  Rear: { pos: [-6.2, 1.4, 0.01], target: [0, 0.7, 0] },
  Top: { pos: [0.01, 8, 0.01], target: [0, 0, 0] },
  Wheel: { pos: [2.9, 0.75, 3.4], target: [1.3, 0.35, 0.8] },
};
export const VIEW_NAMES = Object.keys(VIEWS);

function CameraRig({ view }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);
  useEffect(() => {
    const v = VIEWS[view] || VIEWS['3/4'];
    camera.position.set(...v.pos);
    if (controls) {
      controls.target.set(...v.target);
      controls.update();
    } else {
      camera.lookAt(...v.target);
    }
  }, [view, camera, controls]);
  return null;
}

class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <Fallback text="The 3D viewer hit an error." /> : this.props.children;
  }
}

class AssetBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Fallback = ({ text }) => (
  <div className="car3d__fallback">
    <p>{text}</p>
    <small>Your recommendations below still work. Try a different browser or enable hardware acceleration to see the 3D car.</small>
  </div>
);

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export default function Car3D({ bodyType, vehicle, color, rimColor = '#9a9da5', rimStyle = 'Sport', autoRotate = true, view = '3/4' }) {
  const ok = useRef(hasWebGL()).current;
  const modelUrl = assetForVehicle(vehicle);
  if (!ok) return <Fallback text="3D is not available in this browser." />;
  return (
    <Boundary>
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 34, near: 0.1, far: 60, position: VIEWS['3/4'].pos }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        shadows={false}
        aria-label="Interactive 3D car. Drag to rotate, scroll to zoom."
      >
        <color attach="background" args={['#101012']} />
        <fog attach="fog" args={['#101012', 14, 30]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 4]} intensity={2.2} />
        <directionalLight position={[-5, 4, -3]} intensity={0.9} color="#ffb0b0" />
        <pointLight position={[-6, 2, -4]} intensity={30} color="#E31B23" />
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={2.2} position={[0, 6, 0]} scale={[10, 10, 1]} rotation-x={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.6} position={[-6, 2, 3]} scale={[8, 3, 1]} rotation-y={Math.PI / 2} />
          <Lightformer form="rect" intensity={1.2} color="#ff4a4a" position={[6, 1.5, -4]} scale={[6, 2, 1]} rotation-y={-Math.PI / 2} />
        </Environment>

        <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
          <circleGeometry args={[3.5, 72]} />
          <meshStandardMaterial color="#0c0c0f" roughness={0.55} metalness={0.4} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={0.002}>
          <ringGeometry args={[3.3, 3.36, 96]} />
          <meshStandardMaterial color="#E31B23" emissive="#E31B23" emissiveIntensity={1.4} />
        </mesh>

        {modelUrl ? (
          <AssetBoundary fallback={<Car bodyType={bodyType} color={color} rimColor={rimColor} rimStyle={rimStyle} />}>
            <Suspense fallback={<Car bodyType={bodyType} color={color} rimColor={rimColor} rimStyle={rimStyle} />}>
              <ImportedVehicle url={modelUrl} rimColor={rimColor} />
            </Suspense>
          </AssetBoundary>
        ) : (
          <Car bodyType={bodyType} color={color} rimColor={rimColor} rimStyle={rimStyle} />
        )}
        <ContactShadows position={[0, 0.005, 0]} opacity={0.65} scale={12} blur={2.4} far={3} />
        <OrbitControls
          makeDefault enablePan={false} enableDamping minDistance={2.6} maxDistance={11}
          maxPolarAngle={Math.PI / 2 - 0.03} autoRotate={autoRotate} autoRotateSpeed={0.9}
        />
        <CameraRig view={view} />
      </Canvas>
    </Boundary>
  );
}
