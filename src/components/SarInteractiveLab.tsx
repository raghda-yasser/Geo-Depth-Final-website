import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Satellite,
  ChevronLeft,
  ChevronRight,
  Waves,
  Mountain,
  Building2,
  Trees,
  Radio,
  RotateCcw,
  Play,
  Pause,
  Layers,
  Cpu,
  Image as ImageIcon,
} from 'lucide-react';

export type SarStepId = 1 | 2 | 3 | 4 | 5;
export type SarSurfaceId = 'water' | 'soil' | 'urban' | 'forest';

interface SarStepSpec {
  id: SarStepId;
  shortTitle: string;
  title: string;
  mechanismBadge: string;
  summary: string;
  mechanismDetail: string;
  physicsTakeaway: string;
  cameraTarget: { rotY: number; rotX: number; dist: number; lookY: number };
}

interface SarSurfaceSpec {
  id: SarSurfaceId;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  mechanism: string;
  backscatterBehavior: string;
  sarAppearance: string;
  pixelBrightnessNote: string;
  explanation: string;
  returnStrength: number; // 0.08 to 1.0 qualitative return ratio
  toneGray: number; // 0..255 qualitative pixel intensity baseline
}

const SAR_STEPS: SarStepSpec[] = [
  {
    id: 1,
    shortTitle: 'Pulse Transmission',
    title: '1. Pulse Transmission',
    mechanismBadge: 'Active Side-Looking Microwave Illumination',
    summary:
      'Unlike optical cameras that rely on sunlight, a SAR satellite actively transmits short, coherent microwave pulses down toward Earth at an oblique side-looking angle (typically 20°–45° off-nadir).',
    mechanismDetail:
      'Active radar transmitters operate day and night and penetrate clouds, smoke, and volcanic ash. Because microwaves are directed sideways rather than straight down, echoes arriving from near-range and far-range terrain can be separated precisely by arrival time.',
    physicsTakeaway: 'Side-looking geometry prevents left/right range ambiguity across the swath.',
    cameraTarget: { rotY: 0.24, rotX: 0.36, dist: 14.5, lookY: 1.5 },
  },
  {
    id: 2,
    shortTitle: 'Surface Interaction',
    title: '2. Surface Interaction',
    mechanismBadge: 'Wavelength-Scale Geometry & Dielectric Coupling',
    summary:
      'When the microwave wavefront reaches Earth, how it interacts with the ground depends on surface roughness relative to the radar wavelength (e.g., ~5.6 cm for C-band, ~24 cm for L-band), slope, and moisture content.',
    mechanismDetail:
      'Smooth surfaces act like mirrors, rough surfaces break the wave in many directions, vertical building walls create 90° corner reflectors, and vegetated canopies allow deeper penetration (especially at longer L-band wavelengths).',
    physicsTakeaway: 'Try switching the 4 surfaces below to compare how terrain geometry alters the wave.',
    cameraTarget: { rotY: 0.44, rotX: 0.28, dist: 10.8, lookY: 0.4 },
  },
  {
    id: 3,
    shortTitle: 'Backscatter & Reflection',
    title: '3. Backscatter & Reflection',
    mechanismBadge: 'Directional Scattering vs. Retro-Reflection',
    summary:
      'Only the portion of radar energy scattered directly back toward the satellite antenna — called backscatter — contributes to the recorded image.',
    mechanismDetail:
      'Calm water reflects pulses forward away from the sensor (very low backscatter). Rough soil scatters energy diffusely in all directions (moderate backscatter). Urban buildings create intense double-bounce corner reflections straight back to the satellite.',
    physicsTakeaway: 'Backscatter intensity controls pixel brightness; phase encodes slant-range distance.',
    cameraTarget: { rotY: 0.35, rotX: 0.32, dist: 11.4, lookY: 0.8 },
  },
  {
    id: 4,
    shortTitle: 'Reception & Processing',
    title: '4. Signal Reception & Processing',
    mechanismBadge: 'Synthetic Aperture & Doppler Range-Azimuth Focusing',
    summary:
      'As the satellite travels along its orbital flight track, its antenna receives thousands of returning echoes and combines them coherently to synthesize a virtual antenna hundreds of meters to kilometers long.',
    mechanismDetail:
      'By measuring exact two-way pulse travel time (Range) and the slight Doppler frequency shift caused by satellite motion (Azimuth), SAR signal processors focus echoes into high-resolution complex pixels containing both amplitude and phase.',
    physicsTakeaway: 'Combining echoes along the flight path overcomes physical antenna size limits.',
    cameraTarget: { rotY: -0.22, rotX: 0.38, dist: 14.2, lookY: 1.9 },
  },
  {
    id: 5,
    shortTitle: 'SAR Image Formation',
    title: '5. SAR Image Formation',
    mechanismBadge: 'Grayscale Backscatter Intensity & Complex Phase Map',
    summary:
      'Processed echo amplitudes are mapped onto ground range coordinates as grayscale pixels: strong backscatter renders bright white, moderate diffuse scatter renders gray, and specular loss renders dark.',
    mechanismDetail:
      'Beyond brightness (amplitude), preserving radar wave phase enables InSAR: comparing two repeat passes from the same orbital track reveals millimeter-to-centimeter crustal displacement caused by earthquakes.',
    physicsTakeaway: 'Brightness reveals surface structure & damage; phase measures ground movement.',
    cameraTarget: { rotY: 0.28, rotX: 0.44, dist: 13.6, lookY: 1.3 },
  },
];

const SAR_SURFACES: SarSurfaceSpec[] = [
  {
    id: 'water',
    name: 'Calm Water',
    subtitle: 'Specular Mirror Surface',
    icon: Waves,
    mechanism: 'Specular Reflection (Forward Mirror Bounce)',
    backscatterBehavior: 'Very low return to sensor (nearly all energy deflects away)',
    sarAppearance: 'Dark / Near-Black Pixels',
    pixelBrightnessNote: 'Low radar backscatter intensity',
    explanation:
      'Smooth open water has surface ripples smaller than the radar wavelength. Like a mirror reflecting a flashlight beam at an angle, almost all incoming microwave pulses bounce forward away from the satellite antenna, leaving calm lakes, rivers, and flooded zones dark in SAR imagery.',
    returnStrength: 0.12,
    toneGray: 24,
  },
  {
    id: 'soil',
    name: 'Rough Soil',
    subtitle: 'Diffuse Surface Scatterer',
    icon: Mountain,
    mechanism: 'Diffuse Surface Scattering (Multi-Directional)',
    backscatterBehavior: 'Moderate return across broad angles; increases with roughness & moisture',
    sarAppearance: 'Medium Gray Speckled Texture',
    pixelBrightnessNote: 'Moderate radar backscatter intensity',
    explanation:
      'Uneven soil clods, gravel, and bare rock slopes scatter incoming microwaves diffusely in many directions. A consistent fraction scatters back along the line of sight to the satellite, producing medium-gray tones whose brightness also rises when soil moisture increases.',
    returnStrength: 0.54,
    toneGray: 126,
  },
  {
    id: 'urban',
    name: 'Urban Structures',
    subtitle: 'Dihedral Corner Reflectors',
    icon: Building2,
    mechanism: 'Double-Bounce Corner Reflection (Ground + Vertical Wall)',
    backscatterBehavior: 'Very strong retro-reflective return directly back toward satellite',
    sarAppearance: 'Very Bright White Targets',
    pixelBrightnessNote: 'High radar backscatter intensity',
    explanation:
      'Perpendicular intersections between paved streets and vertical building walls form natural corner reflectors. Radar pulses strike the ground, bounce onto a building facade (or vice versa), and return cleanly straight back to the satellite—making undamaged cities stand out brightly and helping Coherence maps detect collapsed buildings.',
    returnStrength: 1.0,
    toneGray: 238,
  },
  {
    id: 'forest',
    name: 'Forest Canopy',
    subtitle: 'Volumetric Multi-Bounce Medium',
    icon: Trees,
    mechanism: 'Volume Scattering (Leaves, Twigs, Branches & Trunk-Ground)',
    backscatterBehavior: 'Moderate-to-high depolarized return distributed through canopy depth',
    sarAppearance: 'Textured Medium-Bright Gray',
    pixelBrightnessNote: 'Volumetric backscatter (wavelength-dependent)',
    explanation:
      'Leaves, branches, and trunks create a 3D scattering volume. Short C-band waves scatter mostly off upper leaves and twigs (making interferograms lose coherence over dense forests), whereas longer L-band waves (like NISAR and SAOCOM) penetrate deeper to trunks and soil beneath the canopy.',
    returnStrength: 0.72,
    toneGray: 168,
  },
];

// Reusable math temporaries at module scope (zero per-frame allocations)
const _projVec = new THREE.Vector3();
const _vStart = new THREE.Vector3();
const _vEnd = new THREE.Vector3();
const _vDir = new THREE.Vector3();

// Generate procedural SAR phased-array antenna panel canvas texture
function createAntennaPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0c192c';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    for (let x = 8; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 6);
      ctx.lineTo(x, 122);
      ctx.stroke();
    }
    for (let y = 8; y < 128; y += 24) {
      ctx.beginPath();
      ctx.moveTo(6, y);
      ctx.lineTo(250, y);
      ctx.stroke();
    }
    ctx.fillStyle = '#22d3ee';
    for (let x = 16; x < 250; x += 32) {
      for (let y = 16; y < 120; y += 24) {
        ctx.fillRect(x, y, 6, 4);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Generate procedural photovoltaic solar array texture
function createSolarCellTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0b1d3a';
    ctx.fillRect(0, 0, 256, 128);
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= 256; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 128);
      ctx.stroke();
    }
    for (let y = 0; y <= 128; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Procedural simulated grayscale SAR swath image canvas for Step 5 & Surface Panel
const SimulatedSarSwathCanvas: React.FC<{
  surface: SarSurfaceSpec;
  activeStep: SarStepId;
}> = ({ surface, activeStep }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = (canvas.width = 240);
    const h = (canvas.height = 96);
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;

    // Deterministic seeded speckle noise generator representing authentic SAR coherent speckle
    let seed = 1337 + surface.toneGray * 17;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const nx = x / w;
        const ny = y / h;
        let val = surface.toneGray;

        if (surface.id === 'water') {
          // Dark smooth basin with subtle shoreline edge at outer margins
          const edge = nx < 0.08 || nx > 0.92 ? 78 : 0;
          val = edge + (rand() * 14);
        } else if (surface.id === 'soil') {
          // Subtle topographic ridges + SAR speckle
          const ridge = Math.sin(nx * 14 + ny * 6) * 24;
          val = Math.max(15, Math.min(220, 118 + ridge + (rand() - 0.5) * 58));
        } else if (surface.id === 'urban') {
          // Dark street grid lines + ultra-bright corner reflector building facades
          const gridX = (x % 26) < 6;
          const gridY = (y % 22) < 5;
          if (gridX || gridY) {
            val = 36 + rand() * 24;
          } else {
            const hotspot = ((x % 26) < 11 && (y % 22) < 10) ? 248 : 195;
            val = Math.min(255, hotspot + (rand() - 0.5) * 35);
          }
        } else {
          // Textured heterogeneous forest canopy volume speckle
          const crown = Math.sin(nx * 28) * Math.cos(ny * 20) * 28;
          val = Math.max(45, Math.min(240, 155 + crown + (rand() - 0.5) * 78));
        }

        const idx = (y * w + x) * 4;
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = Math.min(255, val + (surface.id === 'water' ? 6 : 2));
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Highlight active target scan swath strip when on Step 5
    if (activeStep === 5) {
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.85)';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, w - 4, h - 4);
    }
  }, [surface, activeStep]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-24 rounded-lg border border-slate-700/80 block bg-slate-950"
    />
  );
};

export const SarInteractiveLab: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Projected label DOM refs (updated directly in animation loop for zero React overhead)
  const satLabelRef = useRef<HTMLDivElement | null>(null);
  const txLabelRef = useRef<HTMLDivElement | null>(null);
  const targetLabelRef = useRef<HTMLDivElement | null>(null);
  const rxLabelRef = useRef<HTMLDivElement | null>(null);
  const trackLabelRef = useRef<HTMLDivElement | null>(null);

  // Interactive Lab State
  const [activeStep, setActiveStep] = useState<SarStepId>(1);
  const [selectedSurface, setSelectedSurface] = useState<SarSurfaceId>('urban');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [resetNonce, setResetNonce] = useState<number>(0);

  const currentStep = SAR_STEPS.find((s) => s.id === activeStep) || SAR_STEPS[0];
  const currentSurface = SAR_SURFACES.find((s) => s.id === selectedSurface) || SAR_SURFACES[2];

  // Mutable ref read by the WebGL loop without tearing down renderer
  const simStateRef = useRef({
    activeStep: 1 as SarStepId,
    selectedSurface: 'urban' as SarSurfaceId,
    isPlaying: true,
    userDragging: false,
    manualOverride: false,
    rotY: 0.24,
    rotX: 0.36,
    dist: 14.5,
    lookY: 1.5,
    targetRotY: 0.24,
    targetRotX: 0.36,
    targetDist: 14.5,
    targetLookY: 1.5,
  });

  useEffect(() => {
    simStateRef.current.activeStep = activeStep;
    if (!simStateRef.current.manualOverride) {
      const cam = SAR_STEPS.find((s) => s.id === activeStep)?.cameraTarget;
      if (cam) {
        simStateRef.current.targetRotY = cam.rotY;
        simStateRef.current.targetRotX = cam.rotX;
        simStateRef.current.targetDist = cam.dist;
        simStateRef.current.targetLookY = cam.lookY;
      }
    }
  }, [activeStep]);

  useEffect(() => {
    simStateRef.current.selectedSurface = selectedSurface;
  }, [selectedSurface]);

  useEffect(() => {
    simStateRef.current.isPlaying = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (resetNonce === 0) return;
    simStateRef.current.manualOverride = false;
    const cam = SAR_STEPS.find((s) => s.id === simStateRef.current.activeStep)?.cameraTarget;
    if (cam) {
      simStateRef.current.targetRotY = cam.rotY;
      simStateRef.current.targetRotX = cam.rotX;
      simStateRef.current.targetDist = cam.dist;
      simStateRef.current.targetLookY = cam.lookY;
    }
  }, [resetNonce]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL per threejs skill directive
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#060911');
    scene.fog = new THREE.FogExp2('#060911', 0.022);

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 460;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 120);
    camera.position.set(4, 6, 13);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Orbital Studio Lighting Rig
    const keyLight = new THREE.DirectionalLight('#fff4e6', 2.4);
    keyLight.position.set(10, 14, 9);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.left = -8;
      keyLight.shadow.camera.right = 8;
      keyLight.shadow.camera.top = 8;
      keyLight.shadow.camera.bottom = -8;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#38bdf8', '#0f172a', 1.1);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#22d3ee', 0.9);
    rimLight.position.set(-10, 6, -9);
    scene.add(rimLight);

    // Subtle Starfield Backdrop (Points)
    const starPositions = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 1] = 2 + Math.random() * 26;
      starPositions[i * 3 + 2] = -14 - Math.random() * 25;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: '#cbd5e1',
      size: 0.09,
      transparent: true,
      opacity: 0.65,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // =========================================================================
    // 1. EARTH TERRAIN CROSS-SECTION & RADAR SWATH BASE
    // =========================================================================
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // Earth crustal base block + surrounding dark ground apron
    const crustGeo = new THREE.BoxGeometry(13.2, 1.4, 9.0);
    const crustMat = new THREE.MeshStandardMaterial({
      color: '#121927',
      roughness: 0.9,
      metalness: 0.08,
    });
    const crustMesh = new THREE.Mesh(crustGeo, crustMat);
    crustMesh.position.set(0.4, -0.71, 0);
    crustMesh.receiveShadow = !isSoftwareGl;
    earthGroup.add(crustMesh);

    // Top terrain surface skirt
    const terrainTopGeo = new THREE.PlaneGeometry(13.2, 9.0, 28, 20);
    terrainTopGeo.rotateX(-Math.PI / 2);
    const tPos = terrainTopGeo.attributes.position;
    for (let i = 0; i < tPos.count; i++) {
      const vx = tPos.getX(i);
      const vz = tPos.getZ(i);
      // Gentle rolling relief around edges while keeping central target patch clean & level
      const distFromTarget = Math.hypot(vx - 1.2, vz);
      const ridge =
        distFromTarget > 3.2
          ? Math.sin(vx * 0.7) * Math.cos(vz * 0.65) * 0.28 + 0.14
          : 0;
      tPos.setY(i, ridge);
    }
    terrainTopGeo.computeVertexNormals();
    const terrainTopMat = new THREE.MeshStandardMaterial({
      color: '#1c2638',
      roughness: 0.88,
      metalness: 0.06,
    });
    const terrainTopMesh = new THREE.Mesh(terrainTopGeo, terrainTopMat);
    terrainTopMesh.position.set(0.4, 0, 0);
    terrainTopMesh.receiveShadow = !isSoftwareGl;
    earthGroup.add(terrainTopMesh);

    // Subtle geographic coordinate grid over terrain
    const gridHelper = new THREE.GridHelper(13, 13, '#1e3a5f', '#132033');
    gridHelper.position.set(0.4, 0.015, 0);
    (gridHelper.material as THREE.Material).transparent = true;
    (gridHelper.material as THREE.Material).opacity = 0.45;
    earthGroup.add(gridHelper);

    // Radar Footprint Target Swath Illumination Ring
    const swathRingGeo = new THREE.RingGeometry(2.35, 2.52, 48);
    swathRingGeo.rotateX(-Math.PI / 2);
    const swathRingMat = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
    });
    const swathRing = new THREE.Mesh(swathRingGeo, swathRingMat);
    swathRing.position.set(1.2, 0.03, 0);
    earthGroup.add(swathRing);

    const swathFillGeo = new THREE.CircleGeometry(2.35, 48);
    swathFillGeo.rotateX(-Math.PI / 2);
    const swathFillMat = new THREE.MeshBasicMaterial({
      color: '#06b6d4',
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    });
    const swathFill = new THREE.Mesh(swathFillGeo, swathFillMat);
    swathFill.position.set(1.2, 0.025, 0);
    earthGroup.add(swathFill);

    // =========================================================================
    // 2. FOUR SELECTABLE TARGET SURFACES (Grounded at target center x=1.2, z=0)
    // =========================================================================
    const targetCenter = new THREE.Vector3(1.2, 0.02, 0);

    // --- Surface A: Calm Water ---
    const waterGroup = new THREE.Group();
    waterGroup.position.copy(targetCenter);
    earthGroup.add(waterGroup);

    const waterRim = new THREE.Mesh(
      new THREE.CylinderGeometry(2.32, 2.48, 0.14, 36),
      new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.92, metalness: 0.05 })
    );
    waterRim.position.y = 0.04;
    waterGroup.add(waterRim);

    const waterSurfaceMat = new THREE.MeshPhysicalMaterial({
      color: '#082f49',
      roughness: 0.06,
      metalness: 0.35,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
    });
    const waterDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.14, 2.14, 0.12, 36), waterSurfaceMat);
    waterDisc.position.y = 0.07;
    waterGroup.add(waterDisc);

    // --- Surface B: Rough Soil ---
    const soilGroup = new THREE.Group();
    soilGroup.position.copy(targetCenter);
    earthGroup.add(soilGroup);

    const soilBaseGeo = new THREE.CylinderGeometry(2.25, 2.38, 0.16, 32, 1);
    const soilBaseMat = new THREE.MeshStandardMaterial({
      color: '#78553a',
      roughness: 0.96,
      metalness: 0.02,
    });
    const soilBase = new THREE.Mesh(soilBaseGeo, soilBaseMat);
    soilBase.position.y = 0.08;
    soilBase.receiveShadow = !isSoftwareGl;
    soilGroup.add(soilBase);

    // Furrowed rocky clods via InstancedMesh (per Three.js skill directive)
    const rockGeo = new THREE.DodecahedronGeometry(0.18, 0);
    const rockMat = new THREE.MeshStandardMaterial({
      color: '#9a7152',
      roughness: 0.92,
      metalness: 0.04,
    });
    const rockCount = 42;
    const rockInst = new THREE.InstancedMesh(rockGeo, rockMat, rockCount);
    const dummy = new THREE.Object3D();
    const rockColor = new THREE.Color();
    for (let i = 0; i < rockCount; i++) {
      const ang = (i / rockCount) * Math.PI * 2 * 3.1;
      const rad = 0.25 + ((i * 37) % 100) / 100 * 1.8;
      dummy.position.set(Math.cos(ang) * rad, 0.18, Math.sin(ang) * rad);
      const s = 0.65 + ((i * 19) % 10) * 0.09;
      dummy.scale.set(s * 1.3, s * 0.72, s);
      dummy.rotation.set(i * 0.5, i * 1.1, 0);
      dummy.updateMatrix();
      rockInst.setMatrixAt(i, dummy.matrix);
      rockColor.setHSL(0.07, 0.28, 0.35 + ((i % 5) * 0.05));
      rockInst.setColorAt(i, rockColor);
    }
    rockInst.computeBoundingSphere();
    rockInst.castShadow = !isSoftwareGl;
    soilGroup.add(rockInst);

    // --- Surface C: Urban Structures ---
    const urbanGroup = new THREE.Group();
    urbanGroup.position.copy(targetCenter);
    earthGroup.add(urbanGroup);

    const asphaltPad = new THREE.Mesh(
      new THREE.BoxGeometry(4.1, 0.08, 3.8),
      new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.75, metalness: 0.12 })
    );
    asphaltPad.position.y = 0.04;
    asphaltPad.receiveShadow = !isSoftwareGl;
    urbanGroup.add(asphaltPad);

    const buildingWallMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.35,
      metalness: 0.55,
    });
    const buildingGlassMat = new THREE.MeshStandardMaterial({
      color: '#38bdf8',
      roughness: 0.15,
      metalness: 0.85,
    });
    const buildingSpecs = [
      { x: -1.0, z: -0.9, w: 0.75, h: 1.5, d: 0.75 },
      { x: 0.05, z: -0.95, w: 0.85, h: 2.05, d: 0.8 },
      { x: 1.15, z: -0.8, w: 0.7, h: 1.3, d: 0.75 },
      { x: -1.1, z: 0.25, w: 0.8, h: 1.15, d: 0.85 },
      { x: 0.0, z: 0.25, w: 0.9, h: 1.8, d: 0.85 },
      { x: 1.15, z: 0.3, w: 0.75, h: 1.55, d: 0.75 },
      { x: -0.5, z: 1.25, w: 0.85, h: 0.95, d: 0.7 },
      { x: 0.75, z: 1.25, w: 0.85, h: 1.2, d: 0.7 },
    ];
    buildingSpecs.forEach((b) => {
      const bGroup = new THREE.Group();
      bGroup.position.set(b.x, 0.08, b.z);
      // Main tower body
      const tower = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), buildingWallMat);
      tower.position.y = b.h / 2;
      tower.castShadow = !isSoftwareGl;
      tower.receiveShadow = !isSoftwareGl;
      bGroup.add(tower);
      // Rooftop mechanical crown
      const crown = new THREE.Mesh(
        new THREE.BoxGeometry(b.w * 0.55, 0.14, b.d * 0.55),
        buildingGlassMat
      );
      crown.position.y = b.h + 0.07;
      bGroup.add(crown);
      urbanGroup.add(bGroup);
    });

    // --- Surface D: Forest Canopy ---
    const forestGroup = new THREE.Group();
    forestGroup.position.copy(targetCenter);
    earthGroup.add(forestGroup);

    const forestFloor = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.38, 0.12, 32),
      new THREE.MeshStandardMaterial({ color: '#1b3824', roughness: 0.95, metalness: 0.02 })
    );
    forestFloor.position.y = 0.06;
    forestFloor.receiveShadow = !isSoftwareGl;
    forestGroup.add(forestFloor);

    const treeCount = 26;
    const trunkGeo = new THREE.CylinderGeometry(0.05, 0.08, 0.55, 7);
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5c4033', roughness: 0.92 });
    const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCount);

    const crownGeo = new THREE.ConeGeometry(0.36, 0.92, 9);
    const crownMat = new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.82 });
    const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, treeCount);

    const treeColor = new THREE.Color();
    for (let i = 0; i < treeCount; i++) {
      const ang = (i / treeCount) * Math.PI * 2 * 2.6;
      const rad = 0.25 + ((i * 29) % 100) / 100 * 1.75;
      const tx = Math.cos(ang) * rad;
      const tz = Math.sin(ang) * rad;
      const scale = 0.82 + ((i * 13) % 7) * 0.07;

      dummy.position.set(tx, 0.12 + 0.27 * scale, tz);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.set(0, i * 0.8, 0);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(i, dummy.matrix);

      dummy.position.set(tx, 0.12 + 0.72 * scale, tz);
      dummy.scale.set(scale * 1.05, scale, scale * 1.05);
      dummy.updateMatrix();
      crownInst.setMatrixAt(i, dummy.matrix);

      treeColor.setHSL(0.36 + (i % 3) * 0.02, 0.55, 0.28 + (i % 4) * 0.04);
      crownInst.setColorAt(i, treeColor);
    }
    trunkInst.computeBoundingSphere();
    crownInst.computeBoundingSphere();
    crownInst.castShadow = !isSoftwareGl;
    forestGroup.add(trunkInst);
    forestGroup.add(crownInst);

    // =========================================================================
    // 3. COMPOSITE 9-PART 3D SAR SATELLITE & ORBITAL FLIGHT TRACK
    // =========================================================================
    const satAnchorX = -3.8;
    const satAnchorY = 4.9;

    // Synthetic Aperture Flight Track Line (Azimuth Z-axis)
    const trackPoints = [
      new THREE.Vector3(satAnchorX, satAnchorY, -3.4),
      new THREE.Vector3(satAnchorX, satAnchorY, 3.4),
    ];
    const trackGeo = new THREE.BufferGeometry().setFromPoints(trackPoints);
    const trackMat = new THREE.LineDashedMaterial({
      color: '#38bdf8',
      dashSize: 0.22,
      gapSize: 0.14,
      transparent: true,
      opacity: 0.55,
    });
    const flightTrackLine = new THREE.Line(trackGeo, trackMat);
    flightTrackLine.computeLineDistances();
    scene.add(flightTrackLine);

    const satelliteGroup = new THREE.Group();
    satelliteGroup.position.set(satAnchorX, satAnchorY, 0);
    scene.add(satelliteGroup);

    // Part 1: Spacecraft Bus (Gold MLI thermal foil)
    const foilMat = new THREE.MeshStandardMaterial({
      color: '#eab308',
      metalness: 0.88,
      roughness: 0.24,
    });
    const busBody = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.75, 1.35), foilMat);
    busBody.castShadow = !isSoftwareGl;
    satelliteGroup.add(busBody);

    // Part 2: Avionics Collar & Bus Frame (Brushed Titanium)
    const metalMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.9,
      roughness: 0.2,
    });
    const avionicsCollar = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.22, 0.9), metalMat);
    avionicsCollar.position.set(0, 0.36, 0);
    satelliteGroup.add(avionicsCollar);

    // Part 3 & 4: Dual Photovoltaic Solar Wings + Struts
    const solarTex = createSolarCellTexture();
    solarTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const solarPanelMat = new THREE.MeshStandardMaterial({
      map: solarTex,
      roughness: 0.28,
      metalness: 0.65,
    });
    [-1, 1].forEach((side) => {
      const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), metalMat);
      boom.rotation.x = Math.PI / 2;
      boom.position.set(0, 0.08, side * 0.95);
      satelliteGroup.add(boom);

      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.04, 1.75), solarPanelMat);
      wing.position.set(0, 0.08, side * 2.05);
      wing.rotation.z = 0.22;
      satelliteGroup.add(wing);
    });

    // Part 5 & 6: Deployable Side-Looking Phased-Array SAR Antenna + Support Truss
    const antennaTex = createAntennaPanelTexture();
    antennaTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const sarAntennaGroup = new THREE.Group();
    sarAntennaGroup.position.set(0.45, -0.45, 0);
    // Point phased array panel toward ground target (1.2, 0.0, 0)
    sarAntennaGroup.rotation.z = 0.76;
    satelliteGroup.add(sarAntennaGroup);

    const antennaPanel = new THREE.Mesh(
      new THREE.BoxGeometry(1.85, 0.09, 0.68),
      new THREE.MeshStandardMaterial({
        map: antennaTex,
        metalness: 0.72,
        roughness: 0.28,
        emissive: '#0891b2',
        emissiveIntensity: 0.35,
      })
    );
    sarAntennaGroup.add(antennaPanel);

    const antennaFrame = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.11, 0.06), metalMat);
    antennaFrame.position.z = 0.34;
    sarAntennaGroup.add(antennaFrame);

    // Part 7: Telemetry Horn / Dish on top
    const dishMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', metalness: 0.5, roughness: 0.3 });
    const commsDish = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 16, 1, true), dishMat);
    commsDish.position.set(-0.22, 0.58, 0.25);
    commsDish.rotation.x = Math.PI;
    satelliteGroup.add(commsDish);

    // Part 8: Active Emitter Beacon on Antenna Face
    const emitterMat = new THREE.MeshBasicMaterial({ color: '#22d3ee' });
    const emitterDot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), emitterMat);
    emitterDot.position.set(0, -0.07, 0);
    sarAntennaGroup.add(emitterDot);

    // =========================================================================
    // 4. ANIMATED RADAR BEAM, TX PULSES, SURFACE SCATTER & RX ECHOES
    // =========================================================================
    // Slant-range translucent radar beam cone
    const beamMat = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const beamConeGeo = new THREE.ConeGeometry(1.9, 1, 24, 1, true);
    // Shift apex to origin and point along +Y so lookAt aligns cleanly
    beamConeGeo.translate(0, -0.5, 0);
    beamConeGeo.rotateX(-Math.PI / 2);
    const beamCone = new THREE.Mesh(beamConeGeo, beamMat);
    scene.add(beamCone);

    // Transmitted Wavefront Rings (Tx: Satellite -> Target)
    const txWaveCount = 5;
    const txWaves: THREE.Mesh[] = [];
    const txWaveGeo = new THREE.TorusGeometry(0.55, 0.032, 8, 28);
    const txWaveMat = new THREE.MeshBasicMaterial({
      color: '#22d3ee',
      transparent: true,
      opacity: 0.9,
    });
    for (let i = 0; i < txWaveCount; i++) {
      const m = new THREE.Mesh(txWaveGeo, txWaveMat.clone());
      scene.add(m);
      txWaves.push(m);
    }

    // Returning Echo Wavefront Rings (Rx: Target -> Satellite)
    const rxWaveCount = 5;
    const rxWaves: THREE.Mesh[] = [];
    const rxWaveGeo = new THREE.TorusGeometry(0.45, 0.03, 8, 28);
    const rxWaveMat = new THREE.MeshBasicMaterial({
      color: '#34d399',
      transparent: true,
      opacity: 0.9,
    });
    for (let i = 0; i < rxWaveCount; i++) {
      const m = new THREE.Mesh(rxWaveGeo, rxWaveMat.clone());
      scene.add(m);
      rxWaves.push(m);
    }

    // Dynamic Scatter / Reflection Rays Group
    const scatterGroup = new THREE.Group();
    scene.add(scatterGroup);
    const rayLineCount = 9;
    const scatterRays: { line: THREE.Line; mat: THREE.LineBasicMaterial; dot: THREE.Mesh }[] = [];
    for (let i = 0; i < rayLineCount; i++) {
      const lGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(0, 1, 0),
      ]);
      const lMat = new THREE.LineBasicMaterial({
        color: '#fbbf24',
        transparent: true,
        opacity: 0.85,
      });
      const line = new THREE.Line(lGeo, lMat);
      scatterGroup.add(line);

      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 10),
        new THREE.MeshBasicMaterial({ color: '#fbbf24', transparent: true, opacity: 0.95 })
      );
      scatterGroup.add(dot);

      scatterRays.push({ line, mat: lMat, dot });
    }

    // =========================================================================
    // MOUSE / TOUCH ORBIT CONTROLS
    // =========================================================================
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e: PointerEvent) => {
      simStateRef.current.userDragging = true;
      simStateRef.current.manualOverride = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!simStateRef.current.userDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      prevX = e.clientX;
      prevY = e.clientY;
      simStateRef.current.targetRotY += dx * 0.006;
      simStateRef.current.targetRotX = THREE.MathUtils.clamp(
        simStateRef.current.targetRotX + dy * 0.005,
        0.12,
        1.15
      );
    };
    const onPointerUp = () => {
      simStateRef.current.userDragging = false;
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // =========================================================================
    // HELPER: Project 3D world point to DOM label element
    // =========================================================================
    const projectLabel = (
      el: HTMLDivElement | null,
      wx: number,
      wy: number,
      wz: number,
      cw: number,
      ch: number
    ) => {
      if (!el) return;
      _projVec.set(wx, wy, wz).project(camera);
      if (_projVec.z > 1) {
        el.style.opacity = '0';
        return;
      }
      const px = (_projVec.x * 0.5 + 0.5) * cw;
      const py = (-_projVec.y * 0.5 + 0.5) * ch;
      el.style.opacity = '1';
      el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -50%)`;
    };

    // =========================================================================
    // ANIMATION LOOP (With Software WebGL Pacing)
    // =========================================================================
    let frameId = 0;
    let simTime = 0;
    let lastTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      const s = simStateRef.current;
      if (s.isPlaying) {
        simTime += dt;
      }

      // Smooth damped camera positioning
      s.rotY = THREE.MathUtils.damp(s.rotY, s.targetRotY, 4.5, dt);
      s.rotX = THREE.MathUtils.damp(s.rotX, s.targetRotX, 4.5, dt);
      s.dist = THREE.MathUtils.damp(s.dist, s.targetDist, 4.5, dt);
      s.lookY = THREE.MathUtils.damp(s.lookY, s.targetLookY, 4.5, dt);

      camera.position.set(
        Math.sin(s.rotY) * Math.cos(s.rotX) * s.dist,
        s.lookY + Math.sin(s.rotX) * s.dist,
        Math.cos(s.rotY) * Math.cos(s.rotX) * s.dist
      );
      camera.lookAt(-0.7, s.lookY, 0);

      // Orbiting satellite motion along synthetic aperture azimuth track
      const satZ = Math.sin(simTime * 0.55) * 1.45;
      satelliteGroup.position.set(satAnchorX, satAnchorY + Math.sin(simTime * 1.1) * 0.08, satZ);

      // Show only selected target surface
      waterGroup.visible = s.selectedSurface === 'water';
      soilGroup.visible = s.selectedSurface === 'soil';
      urbanGroup.visible = s.selectedSurface === 'urban';
      forestGroup.visible = s.selectedSurface === 'forest';

      // Slant-range endpoints (Antenna emitter -> Surface target)
      emitterDot.getWorldPosition(_vStart);
      _vEnd.set(1.2, s.selectedSurface === 'urban' ? 0.55 : 0.25, satZ * 0.28);
      _vDir.copy(_vEnd).sub(_vStart);
      const slantLen = _vDir.length();

      // Orient translucent radar cone
      beamCone.position.copy(_vStart);
      beamCone.lookAt(_vEnd);
      beamCone.scale.set(1, 1, slantLen);

      // Highlight beam & swath based on step
      const txActive = s.activeStep === 1 || s.activeStep === 2 || s.activeStep === 5;
      const rxActive = s.activeStep === 3 || s.activeStep === 4 || s.activeStep === 5;
      const surfaceHighlight = s.activeStep === 2 || s.activeStep === 3;

      beamMat.opacity = s.activeStep === 1 ? 0.16 : s.activeStep === 2 ? 0.13 : 0.07;
      swathRingMat.opacity = surfaceHighlight ? 0.92 : 0.45;
      swathFillMat.opacity = surfaceHighlight ? 0.22 : 0.08;
      swathRing.position.z = satZ * 0.28;
      swathFill.position.z = satZ * 0.28;

      // Update Tx Microwave Pulses (Satellite -> Earth)
      for (let i = 0; i < txWaveCount; i++) {
        const w = txWaves[i];
        const phase = (simTime * 0.65 + i / txWaveCount) % 1;
        w.position.copy(_vStart).lerp(_vEnd, phase);
        w.lookAt(_vEnd);
        const sc = 0.25 + phase * 1.45;
        w.scale.set(sc, sc, sc);
        const mat = w.material as THREE.MeshBasicMaterial;
        mat.opacity = (txActive ? 0.85 : 0.35) * (1 - phase * 0.65);
      }

      // Surface backscatter ratio
      const surfSpec = SAR_SURFACES.find((item) => item.id === s.selectedSurface)!;
      const returnRatio = surfSpec.returnStrength;

      // Update Rx Returning Echoes (Earth -> Satellite)
      for (let i = 0; i < rxWaveCount; i++) {
        const w = rxWaves[i];
        const phase = (simTime * 0.65 + i / rxWaveCount) % 1;
        w.position.copy(_vEnd).lerp(_vStart, phase);
        w.lookAt(_vStart);
        const sc = 0.35 + phase * 1.1;
        w.scale.set(sc, sc, sc);
        const mat = w.material as THREE.MeshBasicMaterial;
        const baseOp = rxActive ? 0.95 : 0.25;
        mat.opacity = baseOp * returnRatio * (1 - phase * 0.55);
        mat.color.set(s.selectedSurface === 'urban' ? '#34d399' : '#22d3ee');
      }

      // Update Surface Scattering Vector Rays (Step 2/3/5 physics demonstration)
      const rayPulse = (simTime * 1.15) % 1;
      for (let i = 0; i < rayLineCount; i++) {
        const rayObj = scatterRays[i];
        const attr = rayObj.line.geometry.attributes.position as THREE.BufferAttribute;
        const ox = _vEnd.x + ((i % 3) - 1) * 0.55;
        const oz = _vEnd.z + (Math.floor(i / 3) - 1) * 0.55;
        const oy = _vEnd.y;

        let dx = 0;
        let dy = 1.6;
        let dz = 0;

        if (s.selectedSurface === 'water') {
          // Specular forward bounce away from the satellite (+X direction!)
          dx = 2.6 + (i % 3) * 0.35;
          dy = 1.9;
          dz = (Math.floor(i / 3) - 1) * 0.35;
          rayObj.mat.color.set('#38bdf8');
          (rayObj.dot.material as THREE.MeshBasicMaterial).color.set('#38bdf8');
        } else if (s.selectedSurface === 'soil') {
          // Diffuse Lambertian spread across upper hemisphere
          const ang = (i / rayLineCount) * Math.PI * 2;
          dx = Math.cos(ang) * 1.5;
          dy = 1.35 + (i % 2) * 0.4;
          dz = Math.sin(ang) * 1.5;
          rayObj.mat.color.set('#fbbf24');
          (rayObj.dot.material as THREE.MeshBasicMaterial).color.set('#fbbf24');
        } else if (s.selectedSurface === 'urban') {
          // Strong double-bounce corner reflection straight back toward satellite (-X, +Y)!
          dx = -2.2 + ((i % 3) - 1) * 0.16;
          dy = 2.15;
          dz = (satZ - oz) * 0.25;
          rayObj.mat.color.set('#34d399');
          (rayObj.dot.material as THREE.MeshBasicMaterial).color.set('#34d399');
        } else {
          // Forest volumetric multi-angle canopy bounce
          const ang = (i / rayLineCount) * Math.PI * 2 + 0.4;
          dx = Math.cos(ang) * 1.2 - 0.35;
          dy = 1.1 + (i % 3) * 0.42;
          dz = Math.sin(ang) * 1.2;
          rayObj.mat.color.set('#a3e635');
          (rayObj.dot.material as THREE.MeshBasicMaterial).color.set('#a3e635');
        }

        const originY = s.selectedSurface === 'forest' ? oy + 0.55 : oy;
        attr.setXYZ(0, ox, originY, oz);
        attr.setXYZ(1, ox + dx, originY + dy, oz + dz);
        attr.needsUpdate = true;

        const rayPhase = (rayPulse + i * 0.08) % 1;
        rayObj.dot.position.set(
          ox + dx * rayPhase,
          originY + dy * rayPhase,
          oz + dz * rayPhase
        );
        const rayVis = s.activeStep === 3 || s.activeStep === 2 || s.activeStep === 5;
        rayObj.mat.opacity = rayVis ? 0.78 : 0.28;
        (rayObj.dot.material as THREE.MeshBasicMaterial).opacity = rayVis ? 0.95 : 0.35;
      }

      // Highlight flight track during Step 4
      trackMat.opacity = s.activeStep === 4 ? 0.95 : 0.4;

      // Render WebGL Scene
      renderer.render(scene, camera);

      // Project 3D Scientific Annotations onto Viewport Overlay
      const cw = container.clientWidth || width;
      const ch = container.clientHeight || height;
      projectLabel(satLabelRef.current, satAnchorX, satAnchorY + 1.05, satZ, cw, ch);
      projectLabel(
        txLabelRef.current,
        (_vStart.x + _vEnd.x) * 0.46 - 0.8,
        (_vStart.y + _vEnd.y) * 0.55 + 0.45,
        satZ * 0.65,
        cw,
        ch
      );
      projectLabel(targetLabelRef.current, 1.2, -0.55, 1.9, cw, ch);
      projectLabel(
        rxLabelRef.current,
        _vEnd.x + (s.selectedSurface === 'water' ? 2.1 : -1.45),
        _vEnd.y + 1.85,
        0.5,
        cw,
        ch
      );
      projectLabel(trackLabelRef.current, satAnchorX - 0.4, satAnchorY + 0.3, -2.8, cw, ch);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
        const mat = (obj as THREE.Mesh).material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else if (mat) {
          mat.dispose();
        }
      });
      antennaTex.dispose();
      solarTex.dispose();
      if (scene.environment) {
        scene.environment.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handlePrevStep = () => {
    setActiveStep((prev) => (prev > 1 ? ((prev - 1) as SarStepId) : 1));
  };

  const handleNextStep = () => {
    setActiveStep((prev) => (prev < 5 ? ((prev + 1) as SarStepId) : 5));
  };

  return (
    <section className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            <Satellite className="w-4 h-4" />
            <span>Interactive SAR Scientific Laboratory · Step-by-Step Physics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            How Synthetic Aperture Radar (SAR) Works
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl">
            Explore how an orbiting SAR satellite illuminates Earth with microwave pulses, measures
            surface backscatter across terrain types, and synthesizes high-resolution radar images.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{isPlaying ? 'Pause Pulse' : 'Resume Pulse'}</span>
          </button>
          <button
            type="button"
            onClick={() => setResetNonce((n) => n + 1)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1.5 transition-colors"
            title="Reset 3D camera angle"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* 5 Clickable Step Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {SAR_STEPS.map((step) => {
          const isActive = activeStep === step.id;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                simStateRef.current.manualOverride = false;
                setActiveStep(step.id);
              }}
              className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between gap-1 ${
                isActive
                  ? 'bg-cyan-950/50 border-cyan-400 text-slate-100 shadow-lg'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className={isActive ? 'text-cyan-400 font-bold' : 'text-slate-500'}>
                  STEP 0{step.id}
                </span>
                {isActive && <Radio className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <div className="text-xs font-semibold leading-snug">{step.shortTitle}</div>
            </button>
          );
        })}
      </div>

      {/* Main 3D Visualization + Step Explanation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 3D WebGL Scientific Diagram (8 cols) */}
        <div className="lg:col-span-8 relative h-[380px] sm:h-[450px] rounded-xl bg-[#060911] border border-slate-800 overflow-hidden select-none">
          {/* Isolated WebGL Mount */}
          <div
            ref={mountRef}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* Projected 3D Scientific Annotations Layer (pointer-events-none, no backdrop-blur) */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              ref={satLabelRef}
              className="absolute top-0 left-0 px-2 py-1 rounded bg-[#0b0e17]/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow-md"
            >
              SAR Satellite (Side-Looking Antenna)
            </div>

            <div
              ref={txLabelRef}
              className={`absolute top-0 left-0 px-2 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap transition-opacity ${
                activeStep === 1 || activeStep === 2
                  ? 'bg-cyan-950/95 border-cyan-400 text-cyan-200 font-bold'
                  : 'bg-[#0b0e17]/85 border-slate-700 text-slate-300'
              }`}
            >
              ↓ Transmitted Pulse (Tx)
            </div>

            <div
              ref={rxLabelRef}
              className={`absolute top-0 left-0 px-2 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap transition-opacity ${
                activeStep === 3 || activeStep === 4
                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200 font-bold'
                  : 'bg-[#0b0e17]/85 border-slate-700 text-slate-300'
              }`}
            >
              {selectedSurface === 'water'
                ? '↗ Specular Reflection (Lost Away)'
                : selectedSurface === 'urban'
                ? '↖ Strong Double-Bounce Return (Rx)'
                : selectedSurface === 'forest'
                ? '↑ Volume Canopy Scatter (Rx)'
                : '↖ Diffuse Backscatter Return (Rx)'}
            </div>

            <div
              ref={targetLabelRef}
              className="absolute top-0 left-0 px-2.5 py-1 rounded bg-[#0b0e17]/90 border border-slate-700 text-[10px] font-mono text-slate-200 whitespace-nowrap"
            >
              Target: {currentSurface.name}
            </div>

            <div
              ref={trackLabelRef}
              className={`absolute top-0 left-0 px-2 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap ${
                activeStep === 4
                  ? 'bg-cyan-950/95 border-cyan-400 text-cyan-300'
                  : 'bg-[#0b0e17]/80 border-slate-800 text-slate-400'
              }`}
            >
              Azimuth Flight Track (Synthetic Aperture)
            </div>
          </div>

          {/* Minimal Top-Left Viewport Hint (no backdrop-blur over WebGL) */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none px-2.5 py-1 rounded bg-[#0b0e17]/90 border border-slate-800 text-[10px] font-mono text-slate-300">
            Drag to rotate 3D radar geometry · Off-nadir microwave imaging
          </div>

          {/* Bottom-Left Compact Legend Strip */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none flex flex-wrap items-center gap-3 px-3 py-1.5 rounded bg-[#0b0e17]/90 border border-slate-800 text-[10px] font-mono text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
              Tx Microwave Pulse
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Rx Backscatter Echo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Surface Scattering
            </span>
          </div>
        </div>

        {/* Step-by-Step Scientific Explanation Panel (4 cols) */}
        <div className="lg:col-span-4 bg-[#0e1320] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-4">
            <div className="space-y-1.5 border-b border-slate-800 pb-3">
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                {currentStep.mechanismBadge}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{currentStep.title}</h3>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed">{currentStep.summary}</p>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                <span>Physical Mechanism</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {currentStep.mechanismDetail}
              </p>
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-lg text-[11px] text-cyan-200 leading-relaxed">
              <strong className="font-mono text-cyan-300 block mb-0.5">Key Principle:</strong>
              {currentStep.physicsTakeaway}
            </div>

            {/* Step 5 Live Simulated SAR Swath Preview inside Explanation Panel */}
            {activeStep === 5 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Simulated SAR Swath ({currentSurface.name})</span>
                  </span>
                  <span className="text-slate-400">{currentSurface.sarAppearance}</span>
                </div>
                <SimulatedSarSwathCanvas surface={currentSurface} activeStep={activeStep} />
              </div>
            )}
          </div>

          {/* Previous / Next Step Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={activeStep === 1}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <span className="text-[11px] font-mono text-slate-400">{activeStep} / 5</span>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={activeStep === 5}
              className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs font-mono flex items-center gap-1 transition-colors"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Interactive Surface Experiments Selector (Below Visualization) */}
      <div className="space-y-4 pt-2 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive Surface Scattering Experiments</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a Earth surface type to inspect its 3D radar backscatter physics and expected grayscale SAR brightness.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAR_SURFACES.map((surface) => {
            const IconComp = surface.icon;
            const isSelected = selectedSurface === surface.id;
            return (
              <button
                key={surface.id}
                type="button"
                onClick={() => setSelectedSurface(surface.id)}
                className={`p-3.5 rounded-xl border text-left transition-colors flex items-center gap-3 ${
                  isSelected
                    ? 'bg-cyan-950/45 border-cyan-400 text-slate-100 shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400/60 text-cyan-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-100 truncate">{surface.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{surface.subtitle}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. Dynamic Scientific Surface Information Panel */}
        <div className="bg-[#0e1320] border border-slate-800 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                  Selected Target Surface
                </span>
                <h3 className="text-base font-bold text-slate-100">{currentSurface.name}</h3>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-300">
                {currentSurface.sarAppearance}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                  Radar Interaction Mechanism
                </span>
                <span className="text-slate-100 font-semibold">{currentSurface.mechanism}</span>
              </div>
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-0.5">
                  Backscatter Behavior
                </span>
                <span className="text-slate-100 font-semibold">
                  {currentSurface.backscatterBehavior}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{currentSurface.explanation}</p>
          </div>

          {/* Qualitative Grayscale SAR Intensity Swatch & Return Indicator */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400 uppercase">Simulated SAR Brightness</span>
              <span className="text-cyan-400 font-bold">{currentSurface.pixelBrightnessNote}</span>
            </div>

            <SimulatedSarSwathCanvas surface={currentSurface} activeStep={activeStep} />

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Relative Backscatter to Antenna</span>
                <span className="text-slate-200">
                  {currentSurface.returnStrength >= 0.9
                    ? 'Very Strong'
                    : currentSurface.returnStrength >= 0.65
                    ? 'Moderate-High'
                    : currentSurface.returnStrength >= 0.4
                    ? 'Moderate'
                    : 'Very Low'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.round(currentSurface.returnStrength * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
