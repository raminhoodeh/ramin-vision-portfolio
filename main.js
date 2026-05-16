import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { Water } from 'three/addons/objects/Water.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setupEnvironmentTransitions } from './environment.js';
import { RockStateMachine } from './rock-state.js';
import { ParticleSystem } from './particles.js';
import { applyLiquidGlass } from './liquid-glass/index.js';

gsap.registerPlugin(ScrollTrigger);

// ══════════════════════════════════════════
//  GLOBALS
// ══════════════════════════════════════════
let scene, camera, renderer, composer, clock;
let water, rockModel, floatingRocks;
let mouse = { x: 0, y: 0, tx: 0, ty: 0 };
let scrollProgress = 0;
let scrollVelocity = 0;
let currentSection = 0;

// Module instances
let rockStateMachine = null;
let particleSystem = null;
let particlesSeeded = false;

// Scene object references (exposed for environment.js)
let dirLight, ambLight, pointLight, rimLight, underLight;
let skyMat = null;
let ambientParticles = null;
let bloomPass = null;
let vignettePass = null;
let cameraPositionCurve = null;
let cameraTargetCurve = null;
let transitionEnergy = 0;
let targetTransitionEnergy = 0;
let transitionPhase = 0;

// Camera base position (animated by scroll)
const camBase = { px: 0, py: 2.2, pz: 8, lx: 0, ly: 0.0, lz: -5 };

// Rock emissive intensity target (now managed by rock-state.js)
let rockMaterial;

const SECTION_LABELS = ['Home', 'Experience', 'Selfware', 'Qualifications', 'Tools', 'Teaching', 'AI Ramin'];
const SECTION_COUNT = SECTION_LABELS.length;
const isMobileViewport = () => window.matchMedia('(max-width: 768px)').matches;
const getDprCap = () => (isMobileViewport() ? 1.25 : 1.75);
const captureMode = new URLSearchParams(window.location.search).has('capture');
const cameraCurvePosition = new THREE.Vector3();
const cameraCurveTarget = new THREE.Vector3();

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function buildCameraCurves() {
  const cameraPoints = CAMERA_PATH.map(({ px, py, pz }) => new THREE.Vector3(px, py, pz));
  const targetPoints = CAMERA_PATH.map(({ lx, ly, lz }) => new THREE.Vector3(lx, ly, lz));
  cameraPositionCurve = new THREE.CatmullRomCurve3(cameraPoints, false, 'centripetal', 0.35);
  cameraTargetCurve = new THREE.CatmullRomCurve3(targetPoints, false, 'centripetal', 0.35);
}

function updateScrollMetrics() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const nextProgress = docHeight > 0 ? scrollTop / docHeight : 0;
  scrollVelocity += ((nextProgress - scrollProgress) - scrollVelocity) * 0.35;
  scrollProgress = THREE.MathUtils.clamp(nextProgress, 0, 1);

  const sectionFloat = scrollProgress * Math.max(SECTION_COUNT - 1, 1);
  transitionPhase = sectionFloat % 1;
  targetTransitionEnergy = Math.pow(Math.sin(transitionPhase * Math.PI), 1.6);
}

// ══════════════════════════════════════════
//  CAMERA PATH — Scroll-driven keyframes
//  [0] is overwritten at runtime by bounding-box framing.
//  Others orbit around rock center (y≈1.5) with cinematic drifts.
// ══════════════════════════════════════════
const CAMERA_PATH = [
  { px: 0,    py: 1.8,  pz: 7,   lx: 0,    ly: 1.3, lz: 0 },     // Hero (overwritten at runtime)
  { px: 1.35, py: 2.05, pz: 8.0, lx: 0.25, ly: 1.65, lz: 0 },     // Experience (slow right orbit)
  { px: -1.85, py: 1.75, pz: 7.3, lx: -0.35, ly: 1.45, lz: 0 },   // Selfware (left, intimate)
  { px: 0.85, py: 1.25, pz: 6.6, lx: 0.05, ly: 1.15, lz: 0 },     // Qualifications (closer, lower)
  { px: -1.65, py: 1.9, pz: 7.2, lx: -0.45, ly: 1.45, lz: 0 },    // Tools (technical side view)
  { px: 1.2,  py: 2.45, pz: 8.1, lx: 0.2,  ly: 1.8, lz: 0 },      // Teaching (rise)
  { px: 0,    py: 2.75, pz: 9.2, lx: 0,    ly: 1.75, lz: 0 },     // AI Ramin (wide, calm)
];

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
async function init() {
  clock = new THREE.Clock();

  // Scene
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xdceaf6, 0.006);

  // Camera
  camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(camBase.px, camBase.py, camBase.pz);
  camera.lookAt(camBase.lx, camBase.ly, camBase.lz);

  // Renderer
  const canvas = document.getElementById('webgpu-canvas');
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    preserveDrawingBuffer: captureMode,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, getDprCap()));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Post-processing
  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.18, 0.28, 0.78
  );
  composer.addPass(bloomPass);

  // Vignette + colour grading pass
  const VignetteShader = {
    uniforms: {
      tDiffuse: { value: null },
      uDarkness: { value: 0.16 },
      uOffset: { value: 0.72 },
      uContrast: { value: 1.03 },
      uSaturation: { value: 0.96 },
      uTime: { value: 0 },
      uTransition: { value: 0 },
      uTransitionPhase: { value: 0 },
      uScrollVelocity: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uDarkness;
      uniform float uOffset;
      uniform float uContrast;
      uniform float uSaturation;
      uniform float uTime;
      uniform float uTransition;
      uniform float uTransitionPhase;
      uniform float uScrollVelocity;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv;
        vec2 diagonalDir = normalize(vec2(1.0, -1.0));
        float diagonal = dot(uv, diagonalDir);
        float wave = sin(diagonal * 35.0 + uTime * 1.25 + uTransitionPhase * 6.2831853);
        float transitionMask = smoothstep(0.12, 0.86, uTransition);
        vec2 radial = uv - 0.5;
        uv += diagonalDir * wave * 0.012 * transitionMask;
        uv += normalize(radial + 0.0001) * clamp(abs(uScrollVelocity) * 28.0, 0.0, 1.0) * 0.004;
        uv = clamp(uv, vec2(0.001), vec2(0.999));

        vec4 color = texture2D(tDiffuse, uv);
        // Colour grading first (before vignette)
        // Subtle contrast boost
        color.rgb = clamp((color.rgb - 0.5) * uContrast + 0.5, 0.0, 1.0);
        // Saturation boost
        float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
        color.rgb = mix(vec3(gray), color.rgb, uSaturation);
        // Diagonal wave glint inspired by the source site's section masks.
        float band = smoothstep(0.92, 1.0, wave * 0.5 + 0.5) * transitionMask;
        color.rgb += band * vec3(0.10, 0.12, 0.14) * (1.0 - clamp(length(radial) * 1.4, 0.0, 1.0));
        // Vignette (applied last so it cleanly darkens the graded image)
        vec2 vigUv = (vUv - 0.5) * 2.0;
        float vignette = 1.0 - uDarkness * dot(vigUv, vigUv) * uOffset;
        vignette = clamp(vignette, 0.0, 1.0);
        color.rgb *= vignette;
        gl_FragColor = color;
      }
    `,
  };
  vignettePass = new ShaderPass(VignetteShader);
  composer.addPass(vignettePass);

  composer.addPass(new OutputPass());

  // Lighting
  setupLighting();

  // Background
  setupBackground();

  // Environment map for reflections (applied to Water + materials)
  generateOceanEnvironment();

  // Load 3D assets
  await loadAssets();
  buildCameraCurves();

  // Water
  setupWater();

  // Ambient particles
  setupParticles();

  // Particle system (formations)
  particleSystem = new ParticleSystem(scene);

  // Rock state machine
  if (rockModel && rockMaterial) {
    rockStateMachine = new RockStateMachine(rockModel, rockMaterial);
  }

  // Environment transitions (per-section lighting/fog/sky/water)
  setupEnvironmentTransitions({
    scene,
    renderer,
    skyMat,
    dirLight,
    ambLight,
    pointLight,
    rimLight,
    underLight,
    water,
    ambientParticles,
  });

  // Scroll system
  setupScrollTimeline();

  // UI
  setupExpandables();
  setupChatbot();
  setupModelSelector();
  setupMouseTracking();

  // Hide loader
  hideLoader();
  
  // Apply liquid glass to DOM elements.
  // 1500ms gives Three.js time to paint its first frames before glass tries to sample.
  setTimeout(() => {
    applyLiquidGlass();
  }, 1500);

  // Start render loop
  animate();
}

// ══════════════════════════════════════════
//  LIGHTING
// ══════════════════════════════════════════
function setupLighting() {
  dirLight = new THREE.DirectionalLight(0xffffff, 4.6);
  dirLight.position.set(5, 10, -5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  ambLight = new THREE.AmbientLight(0xf4f8ff, 1.5);
  scene.add(ambLight);

  pointLight = new THREE.PointLight(0xb8d7f4, 4.2, 20);
  pointLight.position.set(0, 3, -1);
  scene.add(pointLight);

  rimLight = new THREE.DirectionalLight(0xffffff, 2.6);
  rimLight.position.set(-3, 6, -4);
  scene.add(rimLight);

  underLight = new THREE.PointLight(0x95b7d8, 2.2, 25);
  underLight.position.set(0, 0.5, -6);
  scene.add(underLight);
}

// ══════════════════════════════════════════
//  BACKGROUND
// ══════════════════════════════════════════
function setupBackground() {
  const skyGeo = new THREE.SphereGeometry(200, 32, 15);
  skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor: { value: new THREE.Color(0xf8fbff) },
      bottomColor: { value: new THREE.Color(0xbfd7ee) },
      offset: { value: 33 },
      exponent: { value: 0.6 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `
  });
  scene.add(new THREE.Mesh(skyGeo, skyMat));
}

// ══════════════════════════════════════════
//  OCEAN ENVIRONMENT CUBEMAP (using PMREMGenerator per threejs-textures skill)
//  Creates a blue-tinted environment map that Water and materials will reflect.
//  This is the PROPER way to get blue water reflections — not shader hacks.
// ══════════════════════════════════════════
function generateOceanEnvironment() {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileCubemapShader();

  // Build a temporary scene with a blue gradient sky.
  // The colours here must be BRIGHT enough to produce visible reflections
  // but not so bright that they blow out bloom.
  const envScene = new THREE.Scene();

  const envSkyGeo = new THREE.SphereGeometry(50, 32, 15);
  const envSkyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {
      topColor:    { value: new THREE.Color(0xffffff) },
      bottomColor: { value: new THREE.Color(0xcfe1f2) },
      offset:   { value: 8 },
      exponent: { value: 0.5 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `
  });
  envScene.add(new THREE.Mesh(envSkyGeo, envSkyMat));

  // Subtle fill light so the environment isn't totally flat
  envScene.add(new THREE.AmbientLight(0xffffff, 0.65));
  const envDirLight = new THREE.DirectionalLight(0xffffff, 2.0);
  envDirLight.position.set(5, 10, -5);
  envScene.add(envDirLight);

  // Generate PMREM cubemap from this scene
  const envMap = pmremGenerator.fromScene(envScene, 0, 0.1, 100).texture;
  scene.environment = envMap;

  console.log('🌊 Ocean environment map generated (PMREM)');

  // Clean up temporary scene
  pmremGenerator.dispose();
  envSkyGeo.dispose();
  envSkyMat.dispose();
}

// ══════════════════════════════════════════
//  ASSET LOADING
// ══════════════════════════════════════════
async function loadAssets() {
  const loaderEl = document.getElementById('loaderFill');
  const loaderText = document.getElementById('loaderText');

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');

  const ktx2Loader = new KTX2Loader();
  ktx2Loader.setTranscoderPath('/basis/');
  ktx2Loader.detectSupport(renderer);

  loaderText.textContent = 'Loading textures…';
  loaderEl.style.width = '20%';

  let baseColorTex, emissiveTex, normalTex, metallicRoughnessTex;
  try {
    [metallicRoughnessTex, baseColorTex, emissiveTex, normalTex] = await Promise.all([
      new Promise((res, rej) => ktx2Loader.load('/gl/intro/texture_0.ktx2', res, undefined, rej)),
      new Promise((res, rej) => ktx2Loader.load('/gl/intro/texture_1.ktx2', res, undefined, rej)),
      new Promise((res, rej) => ktx2Loader.load('/gl/intro/texture_2.ktx2', res, undefined, rej)),
      new Promise((res, rej) => ktx2Loader.load('/gl/intro/texture_3.ktx2', res, undefined, rej)),
    ]);
    baseColorTex.colorSpace = THREE.SRGBColorSpace;
    emissiveTex.colorSpace = THREE.SRGBColorSpace;
    console.log('✅ All 4 KTX2 textures loaded');
    loaderEl.style.width = '50%';
  } catch (e) {
    console.warn('KTX2 direct load failed:', e);
  }

  rockMaterial = new THREE.MeshStandardMaterial({
    map: baseColorTex || null,
    emissiveMap: emissiveTex || null,
    emissive: new THREE.Color(0xdbeeff),
    emissiveIntensity: 1.35,
    normalMap: normalTex || null,
    roughnessMap: metallicRoughnessTex || null,
    metalnessMap: metallicRoughnessTex || null,
    roughness: 0.38,
    metalness: 0.56,
    color: baseColorTex ? 0xf3f8ff : 0xdce7f2,
    side: THREE.DoubleSide,
  });

  loaderText.textContent = 'Loading 3D model…';
  loaderEl.style.width = '60%';

  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setKTX2Loader(ktx2Loader);
  gltfLoader.setMeshoptDecoder(MeshoptDecoder);

  try {
    const gltf = await gltfLoader.loadAsync('/gl/intro/intro_compressed.glb');
    rockModel = gltf.scene;
    rockModel.scale.setScalar(1.3);
    rockModel.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = rockMaterial;
      }
    });

    // ── MEASURE THE ACTUAL MODEL ──
    // Compute bounding box AFTER scaling to get real world-space dimensions
    const bbox = new THREE.Box3().setFromObject(rockModel);
    const bboxSize = new THREE.Vector3();
    const bboxCenter = new THREE.Vector3();
    bbox.getSize(bboxSize);
    bbox.getCenter(bboxCenter);

    console.log('📐 Rock bounding box:', {
      min: { x: bbox.min.x.toFixed(2), y: bbox.min.y.toFixed(2), z: bbox.min.z.toFixed(2) },
      max: { x: bbox.max.x.toFixed(2), y: bbox.max.y.toFixed(2), z: bbox.max.z.toFixed(2) },
      size: { x: bboxSize.x.toFixed(2), y: bboxSize.y.toFixed(2), z: bboxSize.z.toFixed(2) },
      center: { x: bboxCenter.x.toFixed(2), y: bboxCenter.y.toFixed(2), z: bboxCenter.z.toFixed(2) },
    });

    // ── POSITION ROCK BASED ON MEASUREMENTS ──
    // We want the rock's center to appear at screen center.
    // Offset the model so its bounding box center aligns with world origin Y,
    // then shift down slightly so it sits at/near the waterline (water is at y=-0.3)
    const rockTargetY = 2.0; // Rock center in world space (above water)
    rockModel.position.set(
      -bboxCenter.x,                    // Center horizontally
      rockTargetY - bboxCenter.y,       // Center vertically at target height
      -bboxCenter.z                     // Center depth
    );

    // ── FRAME THE CAMERA BASED ON MEASUREMENTS ──
    // Calculate camera distance needed to fully frame the rock
    const fov = camera.fov * (Math.PI / 180);
    const rockHeight = bboxSize.y;
    const framingPadding = 2.4; // Extra space around rock (1.0 = tight crop, 2.0 = loose)
    const idealDistance = (rockHeight * framingPadding) / (2 * Math.tan(fov / 2));

    // Update camera base to frame the rock properly
    camBase.py = rockTargetY + 0.3;     // Slightly above rock center
    camBase.ly = rockTargetY - 0.2;     // Look slightly below center (shows more water)
    camBase.pz = Math.max(idealDistance, 6); // Don't get closer than 6 units
    camBase.lz = 0;                     // Look at the rock, not behind it

    // Apply immediately
    camera.position.set(camBase.px, camBase.py, camBase.pz);
    camera.lookAt(camBase.lx, camBase.ly, camBase.lz);

    console.log('📷 Camera framing:', {
      rockHeight: rockHeight.toFixed(2),
      idealDistance: idealDistance.toFixed(2),
      cameraY: camBase.py.toFixed(2),
      lookAtY: camBase.ly.toFixed(2),
      cameraZ: camBase.pz.toFixed(2),
    });

    // ── UPDATE CAMERA PATH to match computed framing ──
    // Hero keyframe should match our computed values
    CAMERA_PATH[0] = {
      px: 0, py: camBase.py, pz: camBase.pz,
      lx: 0, ly: camBase.ly, lz: 0
    };

    scene.add(rockModel);
    console.log('✅ Rock model loaded and framed');
  } catch (e) {
    console.warn('GLB load failed:', e);
  }

  await loadFloatingRocks(gltfLoader);

  loaderEl.style.width = '100%';
}

async function loadFloatingRocks(gltfLoader) {
  try {
    const gltf = await gltfLoader.loadAsync('/gl/global/rocks.glb');
    const sourceMeshes = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.geometry) sourceMeshes.push(child);
    });
    if (!sourceMeshes.length) return;

    floatingRocks = new THREE.Group();
    floatingRocks.name = 'floating-rock-field';
    const count = isMobileViewport() ? 18 : 42;
    const floatingMaterial = new THREE.MeshStandardMaterial({
      color: 0xd7e0ea,
      emissive: new THREE.Color(0xf2f8ff),
      emissiveIntensity: 0.28,
      roughness: 0.42,
      metalness: 0.62,
      transparent: true,
      opacity: 0.64,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < count; i++) {
      const source = sourceMeshes[i % sourceMeshes.length];
      const rock = new THREE.Mesh(source.geometry, floatingMaterial);
      const theta = (i / count) * Math.PI * 2 + Math.random() * 0.45;
      const tube = Math.random() * Math.PI * 2;
      const majorRadius = 9 + Math.random() * 7;
      const minorRadius = 2.2 + Math.random() * 3.3;
      rock.position.set(
        Math.cos(theta) * (majorRadius + Math.cos(tube) * minorRadius),
        2.2 + Math.sin(tube) * minorRadius + (Math.random() - 0.5) * 1.4,
        -1.5 + Math.sin(theta) * (majorRadius + Math.cos(tube) * minorRadius)
      );
      const s = 0.16 + Math.random() * 0.34;
      rock.scale.setScalar(s);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      rock.userData.spin = new THREE.Vector3(
        (Math.random() - 0.5) * 0.012,
        (Math.random() - 0.5) * 0.018,
        (Math.random() - 0.5) * 0.012
      );
      floatingRocks.add(rock);
    }

    floatingRocks.position.y = 0.2;
    scene.add(floatingRocks);
    console.log('Floating rock field loaded');
  } catch (e) {
    console.warn('Floating rocks load failed:', e);
  }
}

// ══════════════════════════════════════════
//  WATER
// ══════════════════════════════════════════
function setupWater() {
  const waterGeometry = new THREE.PlaneGeometry(400, 400, 128, 128);
  water = new Water(waterGeometry, {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load('/gl/global/waternormals.jpg', (tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      // Skill: anisotropic filtering for sharper normals at glancing angles
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }),
    sunDirection: new THREE.Vector3(0.3, 0.4, -0.5),
    sunColor: 0xffffff,
    waterColor: 0x9fbfdc,
    distortionScale: 2.6,
    fog: scene.fog !== undefined,
    alpha: 0.72,
    size: 1.2,                        // Smaller = more detailed wave pattern
  });

  // No shader hacking needed — the environment map (generateOceanEnvironment)
  // provides a blue sky cubemap that the Water's planar mirror naturally reflects.
  // The Water shader samples mirrorSampler (planar reflection) which now captures
  // the blue sky dome, giving us blue water without any string manipulation.

  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.3;
  scene.add(water);
  console.log('🌊 Water plane created');
}

// ══════════════════════════════════════════
//  AMBIENT PARTICLES
// ══════════════════════════════════════════
function setupParticles() {
  const count = 500;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const opacities = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = Math.random() * 15;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    sizes[i] = Math.random() * 3 + 0.5;
    opacities[i] = Math.random() * 0.5 + 0.2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x9fc4e6) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      attribute float aSize;
      attribute float aOpacity;
      uniform float uTime;
      uniform float uPixelRatio;
      varying float vOpacity;
      void main() {
        vec3 pos = position;
        pos.y += sin(uTime * 0.3 + position.x * 0.5) * 0.3;
        pos.x += sin(uTime * 0.2 + position.z * 0.3) * 0.2;
        vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = aSize * uPixelRatio * (80.0 / -mvPos.z);
        gl_Position = projectionMatrix * mvPos;
        vOpacity = aOpacity;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vOpacity;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = smoothstep(0.5, 0.0, d) * vOpacity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  });

  ambientParticles = new THREE.Points(geo, mat);
  scene.add(ambientParticles);
}

// ══════════════════════════════════════════
//  GSAP SCROLL TIMELINE
// ══════════════════════════════════════════
function setupScrollTimeline() {
  const sections = document.querySelectorAll('.section');

  // Intersection observer for section visibility + labels
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        const idx = parseInt(entry.target.dataset.index);
        if (!isNaN(idx)) {
          currentSection = idx;
          updateSectionLabel(idx);
          updateScrollbar(idx);
          updateNavLinks(idx);
        }
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => observer.observe(s));

  // Section tracking. Camera motion itself is sampled from Catmull-Rom
  // curves in the render loop, which is closer to the source site's feel.
  sections.forEach((section, i) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top center',
      end: 'bottom center',
      scrub: 1.5,
      onEnter: () => { currentSection = i; },
      onEnterBack: () => { currentSection = i; },
    });
  });

  // Scroll progress for global use (drives rock state + particles)
  updateScrollMetrics();
  window.addEventListener('scroll', updateScrollMetrics, { passive: true });

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function updateSectionLabel(idx) {
  const label = document.getElementById('sectionLabel');
  if (label) label.textContent = `// 0${idx}  ${SECTION_LABELS[idx] || ''}`;
}

function updateScrollbar(idx) {
  const thumb = document.getElementById('scrollbarThumb');
  if (thumb) {
    const pct = (idx / Math.max(SECTION_LABELS.length - 1, 1)) * 80;
    thumb.style.top = `${pct}%`;
  }
}

function updateNavLinks(idx) {
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', parseInt(l.dataset.section) === idx);
  });
}

// ══════════════════════════════════════════
//  EXPANDABLE CARDS
// ══════════════════════════════════════════
function setupExpandables() {
  // Timeline expand buttons
  document.querySelectorAll('.tc-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.timeline-card');
      const detail = card.querySelector('.tc-detail');
      const isOpen = detail.classList.contains('visible');

      if (isOpen) {
        detail.classList.remove('visible');
        detail.classList.add('hidden');
        btn.classList.remove('open');
        btn.textContent = '+';
      } else {
        detail.classList.remove('hidden');
        detail.classList.add('visible');
        btn.classList.add('open');
        btn.textContent = '×';
      }
    });
  });

  // Model selector
  document.querySelectorAll('.model-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.model-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });

  // Project card expand buttons
  document.querySelectorAll('.pc-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      const detail = card.querySelector('.pc-detail');
      if (!detail) return;
      const isOpen = detail.classList.contains('visible');

      if (isOpen) {
        detail.classList.remove('visible');
        detail.classList.add('hidden');
        btn.textContent = 'Read more →';
      } else {
        detail.classList.remove('hidden');
        detail.classList.add('visible');
        btn.textContent = 'Show less ↑';
      }
    });
  });

  // Metacognition framework toggle
  const metaToggle = document.getElementById('metacognitionToggle');
  const metaContent = document.getElementById('metacognitionContent');
  if (metaToggle && metaContent) {
    metaToggle.addEventListener('click', () => {
      const isOpen = metaContent.classList.contains('visible');
      if (isOpen) {
        metaContent.classList.remove('visible');
        metaContent.classList.add('hidden');
        metaToggle.textContent = 'Read the framework →';
      } else {
        metaContent.classList.remove('hidden');
        metaContent.classList.add('visible');
        metaToggle.textContent = 'Show less ↑';
      }
    });
  }
}

// ══════════════════════════════════════════
//  MODEL SELECTOR
// ══════════════════════════════════════════
function setupModelSelector() {
  document.querySelectorAll('.model-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.model-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    });
  });
}

// ══════════════════════════════════════════
//  MOUSE
// ══════════════════════════════════════════
function setupMouseTracking() {
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
}

// ══════════════════════════════════════════
//  LOADER
// ══════════════════════════════════════════
function hideLoader() {
  const loader = document.getElementById('loader');
  const header = document.getElementById('header');
  setTimeout(() => {
    loader?.classList.add('hidden');
    header?.classList.add('visible');
  }, 600);
}

// ══════════════════════════════════════════
//  CHATBOT (visual mockup)
// ══════════════════════════════════════════
function setupChatbot() {
  const sendBtn = document.getElementById('chatSend');
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatbotMessages');

  if (!sendBtn || !input) return;

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg chat-msg-user';
    userMsg.innerHTML = `<div class="chat-bubble">${escapeHtml(text)}</div>`;
    messages.appendChild(userMsg);
    input.value = '';

    setTimeout(() => {
      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-msg chat-msg-ai';
      aiMsg.innerHTML = `
        <div class="chat-avatar">RH</div>
        <div class="chat-bubble">Thanks for sharing that. Based on my experience across AI product management at Bayut, building autonomous agents at Deity AI, and shipping products like Qadam and Dreamsea — there's strong alignment with what you're describing. My hands-on work with the AI-Native Product OS (5-Layer Stack), RAG pipelines, multi-agent systems, and cost optimization would be particularly relevant here. Happy to discuss specifics.</div>
      `;
      messages.appendChild(aiMsg);
      messages.scrollTop = messages.scrollHeight;
    }, 1200);

    messages.scrollTop = messages.scrollHeight;
  };

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ══════════════════════════════════════════
//  RESIZE
// ══════════════════════════════════════════
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, getDprCap()));
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// ══════════════════════════════════════════
//  PARTICLE PHASE MAPPING
//  Maps scroll progress → particle phase
// ══════════════════════════════════════════
function getParticleState(progress) {
  // 0→0.40: hidden (rock is still alive)
  // 0.40→0.55: explode (rock is exploding, particles scatter)
  // 0.55→0.70: node graph (Qualifications + Tools)
  // 0.70→0.82: beam (Tools → Teaching transition)
  // 0.82→0.92: ripple (Teaching)
  // 0.92→1.0: orb (Chatbot)
  if (progress < 0.40) return { phase: 0, opacity: 0, morphT: 0 };
  if (progress < 0.55) {
    const t = (progress - 0.40) / 0.15;
    return { phase: 1, opacity: Math.min(t * 2, 1), morphT: t };
  }
  if (progress < 0.70) {
    const t = (progress - 0.55) / 0.15;
    return { phase: 2, opacity: 1, morphT: t }; // node graph
  }
  if (progress < 0.82) {
    const t = (progress - 0.70) / 0.12;
    return { phase: 3, opacity: 1, morphT: t }; // beam
  }
  if (progress < 0.92) {
    const t = (progress - 0.82) / 0.10;
    return { phase: 4, opacity: 1, morphT: t }; // ripple
  }
  const t = (progress - 0.92) / 0.08;
  return { phase: 5, opacity: 1, morphT: Math.min(t, 1) }; // orb
}

// ══════════════════════════════════════════
//  ANIMATION LOOP
// ══════════════════════════════════════════
function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  // Smooth mouse
  mouse.x += (mouse.tx - mouse.x) * 0.05;
  mouse.y += (mouse.ty - mouse.y) * 0.05;
  transitionEnergy += (targetTransitionEnergy - transitionEnergy) * 0.06;

  if (cameraPositionCurve && cameraTargetCurve) {
    const curveT = easeInOutCubic(scrollProgress);
    cameraPositionCurve.getPoint(curveT, cameraCurvePosition);
    cameraTargetCurve.getPoint(curveT, cameraCurveTarget);
    camBase.px += (cameraCurvePosition.x - camBase.px) * 0.08;
    camBase.py += (cameraCurvePosition.y - camBase.py) * 0.08;
    camBase.pz += (cameraCurvePosition.z - camBase.pz) * 0.08;
    camBase.lx += (cameraCurveTarget.x - camBase.lx) * 0.08;
    camBase.ly += (cameraCurveTarget.y - camBase.ly) * 0.08;
    camBase.lz += (cameraCurveTarget.z - camBase.lz) * 0.08;
  }

  // Camera: spline-driven base + mouse parallax offset
  camera.position.x = camBase.px + mouse.x * 0.3;
  camera.position.y = camBase.py - mouse.y * 0.15;
  camera.position.z = camBase.pz;
  camera.lookAt(
    camBase.lx + mouse.x * 0.1,
    camBase.ly,
    camBase.lz
  );

  // Water animation — slow speed for cinematic waves
  if (water) {
    water.material.uniforms['time'].value = t * 0.3;
  }

  if (floatingRocks) {
    floatingRocks.rotation.y = t * 0.014;
    floatingRocks.children.forEach((rock) => {
      rock.rotation.x += rock.userData.spin.x;
      rock.rotation.y += rock.userData.spin.y;
      rock.rotation.z += rock.userData.spin.z;
    });
  }

  // Rock state machine
  if (rockStateMachine) {
    rockStateMachine.updateFromScroll(scrollProgress);
    rockStateMachine.applyState(t);

    // Rock rotation (only if visible)
    if (rockModel && rockModel.visible) {
      rockModel.rotation.y = t * 0.05 + mouse.x * 0.1;
    }
  } else if (rockModel) {
    // Fallback if state machine failed to initialise
    rockModel.rotation.y = t * 0.05 + mouse.x * 0.1;
  }

  // Particle system (formation morphing)
  if (particleSystem) {
    const ps = getParticleState(scrollProgress);

    // Keep particle system origin synced to rock position
    if (rockModel) {
      particleSystem.points.position.copy(rockModel.position);
    }

    // Seed particles from rock position when first exploding
    if (ps.phase >= 1 && !particlesSeeded && rockModel) {
      particleSystem.seedFromObject(rockModel);
      particlesSeeded = true;
    }

    particleSystem.update(t, ps.phase, ps.opacity, ps.morphT);
  }

  // Ambient particles
  if (ambientParticles) {
    ambientParticles.material.uniforms.uTime.value = t;
    ambientParticles.rotation.y = t * 0.02;
  }

  // Dynamic bloom per section
  if (bloomPass) {
    const BLOOM_STRENGTHS = [0.16, 0.14, 0.16, 0.12, 0.12, 0.12, 0.1];
    const target = BLOOM_STRENGTHS[currentSection] || 0.8;
    bloomPass.strength += (target - bloomPass.strength) * 0.03;
  }

  if (vignettePass) {
    vignettePass.uniforms.uTime.value = t;
    vignettePass.uniforms.uTransition.value = transitionEnergy;
    vignettePass.uniforms.uTransitionPhase.value = transitionPhase;
    vignettePass.uniforms.uScrollVelocity.value = scrollVelocity;
  }

  const dynamicDprCap = transitionEnergy > 0.45 ? Math.min(getDprCap(), 1.25) : getDprCap();
  const targetDpr = Math.min(window.devicePixelRatio, dynamicDprCap);
  if (Math.abs(renderer.getPixelRatio() - targetDpr) > 0.05) {
    renderer.setPixelRatio(targetDpr);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  // Render
  composer.render();
}

// ══════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════
init();
