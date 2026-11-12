import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Play, RotateCcw, Sliders, Eye, EyeOff } from 'lucide-react';

export type FaultMode = 'strike-slip' | 'normal' | 'thrust';

export const ThreeFaultViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // UI State
  const [faultMode, setFaultMode] = useState<FaultMode>('strike-slip');
  const [isRupturing, setIsRupturing] = useState<boolean>(false);
  const [showWaves, setShowWaves] = useState<boolean>(true);
  const [hudCollapsed, setHudCollapsed] = useState<boolean>(false);

  // Animation & Three.js refs
  const stateRef = useRef({
    faultMode: 'strike-slip' as FaultMode,
    isRupturing: false,
    ruptureProgress: 0,
    waveRadius: 0,
    targetSlip: 0,
    currentSlip: 0,
  });

  useEffect(() => {
    stateRef.current.faultMode = faultMode;
  }, [faultMode]);

  useEffect(() => {
    stateRef.current.isRupturing = isRupturing;
  }, [isRupturing]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07090e');
    scene.fog = new THREE.FogExp2('#07090e', 0.04);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Procedural Studio Environment Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Studio Lighting: Warm Directional Key + Cool Hemisphere Fill
    const keyLight = new THREE.DirectionalLight('#fff5eb', 2.2);
    keyLight.position.set(12, 16, 10);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#38bdf8', '#0f172a', 1.0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight('#06b6d4', 0.8);
    rimLight.position.set(-10, -5, -10);
    scene.add(rimLight);

    // ==========================================
    // Procedural Crustal Fault Model (3–12 Parts)
    // ==========================================
    const faultRig = new THREE.Group();
    scene.add(faultRig);

    // Part 1: Footwall Crust Block (Stationary Reference)
    const footwallGroup = new THREE.Group();
    faultRig.add(footwallGroup);

    // Layer 1A: Footwall Basaltic/Granitic Basement (Dark slate, rough)
    const basementMat = new THREE.MeshStandardMaterial({
      color: '#1e293b',
      roughness: 0.85,
      metalness: 0.1,
    });
    const footwallBaseGeom = new THREE.BoxGeometry(4.5, 2.5, 7);
    const footwallBaseMesh = new THREE.Mesh(footwallBaseGeom, basementMat);
    footwallBaseMesh.position.set(-2.25, -1.25, 0);
    footwallBaseMesh.receiveShadow = !isSoftwareGl;
    footwallGroup.add(footwallBaseMesh);

    // Layer 1B: Footwall Sedimentary Stratum (Terracotta / Sandstone)
    const stratumMat = new THREE.MeshStandardMaterial({
      color: '#78350f',
      roughness: 0.7,
      metalness: 0.05,
    });
    const footwallStratumGeom = new THREE.BoxGeometry(4.5, 0.8, 7);
    const footwallStratumMesh = new THREE.Mesh(footwallStratumGeom, stratumMat);
    footwallStratumMesh.position.set(-2.25, 0.4, 0);
    footwallGroup.add(footwallStratumMesh);

    // Layer 1C: Footwall Topsoil / Surface Bedrock (Olive / Slate gray)
    const topsoilMat = new THREE.MeshStandardMaterial({
      color: '#334155',
      roughness: 0.9,
      metalness: 0.05,
    });
    const footwallTopGeom = new THREE.BoxGeometry(4.5, 0.4, 7);
    const footwallTopMesh = new THREE.Mesh(footwallTopGeom, topsoilMat);
    footwallTopMesh.position.set(-2.25, 1.0, 0);
    footwallGroup.add(footwallTopMesh);

    // Part 2: Hanging Wall Crust Block (Active Moving Block)
    const hangingWallGroup = new THREE.Group();
    faultRig.add(hangingWallGroup);

    const hangingBaseMesh = new THREE.Mesh(footwallBaseGeom, basementMat);
    hangingBaseMesh.position.set(2.25, -1.25, 0);
    hangingBaseMesh.castShadow = !isSoftwareGl;
    hangingBaseMesh.receiveShadow = !isSoftwareGl;
    hangingWallGroup.add(hangingBaseMesh);

    const hangingStratumMesh = new THREE.Mesh(footwallStratumGeom, stratumMat);
    hangingStratumMesh.position.set(2.25, 0.4, 0);
    hangingWallGroup.add(hangingStratumMesh);

    const hangingTopMesh = new THREE.Mesh(footwallTopGeom, topsoilMat);
    hangingTopMesh.position.set(2.25, 1.0, 0);
    hangingWallGroup.add(hangingTopMesh);

    // Part 3: Fault Plane Interface Surface (Polished slickenlines / friction boundary)
    const faultPlaneMat = new THREE.MeshStandardMaterial({
      color: '#06b6d4',
      roughness: 0.3,
      metalness: 0.6,
      transparent: true,
      opacity: 0.35,
    });
    const faultPlaneGeom = new THREE.PlaneGeometry(0.1, 4.0);
    const faultPlane = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 3.8, 7.1),
      faultPlaneMat
    );
    faultPlane.position.set(0, -0.1, 0);
    faultRig.add(faultPlane);

    // Part 4: Hypocenter Rupture Nucleation Point (Glowing sphere)
    const hypoMat = new THREE.MeshBasicMaterial({ color: '#ef4444' });
    const hypoMesh = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), hypoMat);
    hypoMesh.position.set(0, -0.6, 0);
    faultRig.add(hypoMesh);

    // Part 5: Seismic Wavefronts (P-wave compressional + S-wave shear expanding rings)
    const pWaveMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const pWaveMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 18), pWaveMat);
    pWaveMesh.position.copy(hypoMesh.position);
    pWaveMesh.visible = false;
    scene.add(pWaveMesh);

    const sWaveMat = new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const sWaveMesh = new THREE.Mesh(new THREE.SphereGeometry(0.6, 14, 14), sWaveMat);
    sWaveMesh.position.copy(hypoMesh.position);
    sWaveMesh.visible = false;
    scene.add(sWaveMesh);

    // Part 6: Surface Seismometer Station (Procedural 4-part instrument)
    const stationGroup = new THREE.Group();
    stationGroup.position.set(-3.2, 1.2, 1.5);
    faultRig.add(stationGroup);

    // Base pad
    const padMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.4, metalness: 0.8 })
    );
    stationGroup.add(padMesh);

    // Enclosure vault
    const vaultMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.3, 0.35),
      new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.2 })
    );
    vaultMesh.position.y = 0.2;
    stationGroup.add(vaultMesh);

    // Telemetry antenna mast
    const mastMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8),
      new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9, roughness: 0.2 })
    );
    mastMesh.position.y = 0.65;
    stationGroup.add(mastMesh);

    // Soft Radial Contact Grounding Shadow
    const shadowGeo = new THREE.PlaneGeometry(12, 10);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: '#020617',
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
    });
    const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -2.52;
    scene.add(contactShadow);

    // Mouse / Touch Drag Orbit
    let isMouseDown = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotX = 0.4;
    let rotY = -0.5;

    const handleCanvasMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleCanvasMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotY += dx * 0.006;
      rotX = Math.max(0.1, Math.min(1.2, rotX + dy * 0.006));
    };

    const handleCanvasMouseUp = () => {
      isMouseDown = false;
    };

    const canvasDom = renderer.domElement;
    canvasDom.addEventListener('mousedown', handleCanvasMouseDown);
    window.addEventListener('mousemove', handleCanvasMouseMove);
    window.addEventListener('mouseup', handleCanvasMouseUp);

    // Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop with Exponential Damping
    let frameId = 0;
    let clock = new THREE.Clock();

    const tick = () => {
      const dt = clock.getDelta();

      // Damped camera orbital movement
      const targetCamX = Math.sin(rotY) * Math.cos(rotX) * 16;
      const targetCamY = Math.sin(rotX) * 16;
      const targetCamZ = Math.cos(rotY) * Math.cos(rotX) * 16;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4, dt);
      camera.lookAt(0, 0, 0);

      // Fault Rupture Animation Kinematics
      const s = stateRef.current;
      if (s.isRupturing) {
        s.ruptureProgress += dt * 1.5;
        s.targetSlip = Math.sin(Math.min(Math.PI, s.ruptureProgress * 2)) * 1.2;

        // Expand seismic wavefronts
        s.waveRadius += dt * 5.0;
        pWaveMesh.visible = true;
        sWaveMesh.visible = true;

        pWaveMesh.scale.setScalar(s.waveRadius);
        sWaveMesh.scale.setScalar(s.waveRadius * 0.6); // S-wave is ~60% speed of P-wave

        (pWaveMat as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.7 - s.waveRadius / 10);
        (sWaveMat as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.6 - s.waveRadius / 8);

        if (s.ruptureProgress >= 2.0) {
          s.isRupturing = false;
          setIsRupturing(false);
          s.ruptureProgress = 0;
          s.waveRadius = 0;
          pWaveMesh.visible = false;
          sWaveMesh.visible = false;
        }
      } else {
        s.targetSlip = 0.2; // Slight resting displacement for pedagogical clarity
      }

      // Smooth kinematic slip interpolation
      s.currentSlip = THREE.MathUtils.damp(s.currentSlip, s.targetSlip, 5, dt);

      // Apply fault offsets according to tectonic kinematic style
      if (s.faultMode === 'strike-slip') {
        // Horizontal parallel displacement along Z
        hangingWallGroup.position.set(0, 0, s.currentSlip * 1.5);
        hangingWallGroup.rotation.set(0, 0, 0);
      } else if (s.faultMode === 'normal') {
        // Extensional downward downdip slip along Y and separation along X
        hangingWallGroup.position.set(s.currentSlip * 0.4, -s.currentSlip * 0.8, 0);
      } else if (s.faultMode === 'thrust') {
        // Compressional upward updip thrusting along Y and shortening along X
        hangingWallGroup.position.set(-s.currentSlip * 0.4, s.currentSlip * 0.8, 0);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };

    tick();

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      canvasDom.removeEventListener('mousedown', handleCanvasMouseDown);
      window.removeEventListener('mousemove', handleCanvasMouseMove);
      window.removeEventListener('mouseup', handleCanvasMouseUp);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const triggerRupture = () => {
    stateRef.current.ruptureProgress = 0;
    stateRef.current.waveRadius = 0;
    stateRef.current.isRupturing = true;
    setIsRupturing(true);
  };

  return (
    <div className="relative w-full h-[460px] bg-[#07090e] border border-slate-800 rounded-xl overflow-hidden select-none">
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Title & Telemetry */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none space-y-1">
        <div className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
          <span>Tectonic Fault Simulator · 3D Physical Model</span>
        </div>
        <div className="text-xs text-slate-300">
          Click and drag to rotate 3D view · Observe wave propagation
        </div>
      </div>

      {/* Viewport Collapsible Bottom Dock (Three.js skill directive) */}
      <div
        className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[95%] max-w-xl bg-[#0b0e17]/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 p-3 space-y-2.5 ${
          hudCollapsed ? 'translate-y-[calc(100%-2rem)]' : 'translate-y-0'
        }`}
      >
        {/* Dock Header & Collapse Affordance */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-xs font-mono">
          <span className="text-slate-300 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Kinematic Controls
          </span>
          <button
            onClick={() => setHudCollapsed(!hudCollapsed)}
            className="text-slate-400 hover:text-white text-[11px] transition-colors"
          >
            {hudCollapsed ? '▴ Expand Controls' : '▾ Hide Controls'}
          </button>
        </div>

        {/* Fault Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono">
          {(
            [
              { id: 'strike-slip', label: 'Strike-Slip', desc: 'Horizontal Shear' },
              { id: 'normal', label: 'Normal Fault', desc: 'Crustal Extension' },
              { id: 'thrust', label: 'Reverse / Thrust', desc: 'Plate Collision' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setFaultMode(m.id);
                triggerRupture();
              }}
              className={`p-1.5 rounded text-center transition-colors ${
                faultMode === m.id
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold">{m.label}</div>
              <div className="text-[10px] text-slate-400 font-normal">{m.desc}</div>
            </button>
          ))}
        </div>

        {/* Action Trigger Button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-slate-400 font-mono">
            Mode:{' '}
            <strong className="text-cyan-400">
              {faultMode === 'strike-slip'
                ? 'Strike-Slip (San Andreas / East Anatolian)'
                : faultMode === 'normal'
                ? 'Normal (Basin & Range extensional)'
                : 'Thrust (Subduction / High Atlas / Himalayas)'}
            </strong>
          </div>
          <button
            onClick={triggerRupture}
            disabled={isRupturing}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-lg shadow-rose-950"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRupturing ? 'Rupturing...' : 'Trigger Rupture Slip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
