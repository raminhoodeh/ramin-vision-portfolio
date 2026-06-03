import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import dreamseaGiftLogoUrl from '../../bonus-section/dreamsea-app-icon-2026-card.jpg';
import googleMeetGiftLogoUrl from '../../bonus-section/google-meet-logo.png';
import googleSheetsGiftLogoUrl from '../../bonus-section/google-sheets-logo.png';
import udemyGiftLogoUrl from '../../bonus-section/udemy-app-logo.png';
import {
  hashgraphRockAssetPipeline,
  validateHashgraphRockAssetPipeline,
} from '../three/hashgraphRockAssets';
import {
  preloadBonusRockAssets,
  type BonusRockPreloadStatus,
} from '../three/bonusRockPreload';
import {
  BONUS_ROCK_FINAL_CLICK_COUNT,
  getBonusRockAnimationTargets,
  getBonusRockStage,
} from '../three/hashgraphRockMotion';
import { portfolioContent } from '../data/portfolio';
import { SectionKicker } from '../components/SectionHeader';
import { isPlaceholderValue, contentValue } from '../lib/placeholder';
import { type BonusGiftEntry } from './types';

type BonusRockLayerStyle = CSSProperties & Record<`--${string}`, string | number>;
type BonusGiftLogo = {
  src: string;
  alt: string;
};

export const BONUS_CELESTIAL_SPARKS = Array.from({ length: 22 }, (_, index) => index);

export function clampBonusRockClicks(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(BONUS_ROCK_FINAL_CLICK_COUNT, Math.trunc(value)));
}

function getBonusGiftLogo(gift: BonusGiftEntry): BonusGiftLogo {
  const title = gift.title.toLowerCase();

  if (title.includes('dreamsea')) {
    return { src: dreamseaGiftLogoUrl, alt: 'Dreamsea app logo' };
  }

  if (title.includes('tools database')) {
    return { src: googleSheetsGiftLogoUrl, alt: 'Google Sheets logo' };
  }

  if (title.includes('consultation')) {
    return { src: googleMeetGiftLogoUrl, alt: 'Google Meet logo' };
  }

  return { src: udemyGiftLogoUrl, alt: 'Udemy logo' };
}

function MagicalRockScene({
  clickCount,
  revealed,
  gifts,
  preloadStatus,
  onRockClick,
}: {
  clickCount: number;
  revealed: boolean;
  gifts: BonusGiftEntry[];
  preloadStatus: BonusRockPreloadStatus;
  onRockClick: () => void;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [rockReady, setRockReady] = useState(false);
  const clickCountRef = useRef(clickCount);
  const revealedRef = useRef(revealed);
  const targetTracksRef = useRef(getBonusRockAnimationTargets(clickCount));
  const clickImpulseRef = useRef(0);
  const lastActivationRef = useRef(0);

  useEffect(() => {
    if (clickCount > clickCountRef.current) {
      clickImpulseRef.current = 1;
    }

    clickCountRef.current = clickCount;
    revealedRef.current = revealed;
    targetTracksRef.current = getBonusRockAnimationTargets(clickCount);
  }, [clickCount, revealed]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let cancelled = false;
    let disposeScene: (() => void) | undefined;
    setRockReady(false);
    void preloadBonusRockAssets('visible');

    void Promise.all([
      import('three'),
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/loaders/DRACOLoader.js'),
      import('three/examples/jsm/loaders/KTX2Loader.js'),
    ]).then(async ([THREE, { GLTFLoader }, { DRACOLoader }, { KTX2Loader }]) => {
      if (cancelled || !mount.isConnected) return;

      validateHashgraphRockAssetPipeline();

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      camera.position.set(0.1, 0.08, 5.8);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 720 ? 1.15 : 1.25));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 0.96;
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = 'hashgraph-bonus-rock-canvas';
      renderer.domElement.dataset.bonusRockCanvas = 'hashgraph-intro-rock';
      renderer.domElement.setAttribute('aria-hidden', 'true');
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.width = '100%';
      mount.querySelectorAll('.hashgraph-bonus-rock-canvas').forEach((canvas) => canvas.remove());
      mount.appendChild(renderer.domElement);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      const envScene = new THREE.Scene();
      const envSky = new THREE.Mesh(
        new THREE.SphereGeometry(50, 32, 15),
        new THREE.ShaderMaterial({
          side: THREE.BackSide,
          uniforms: {
            topColor: { value: new THREE.Color(0xf8fcff) },
            bottomColor: { value: new THREE.Color(0xb8d0e0) },
            offset: { value: 8 },
            exponent: { value: 0.5 },
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
          `,
        }),
      );
      envScene.add(envSky);
      envScene.add(new THREE.AmbientLight(0xffffff, 0.46));
      const envLight = new THREE.DirectionalLight(0xffffff, 1.35);
      envLight.position.set(5, 10, -5);
      envScene.add(envLight);
      const envMap = pmremGenerator.fromScene(envScene, 0, 0.1, 100).texture;
      scene.environment = envMap;
      pmremGenerator.dispose();
      envSky.geometry.dispose();
      envSky.material.dispose();

      const rockGroup = new THREE.Group();
      rockGroup.rotation.set(-0.06, -0.12, 0.025);
      scene.add(rockGroup);

      const keyLight = new THREE.DirectionalLight(0xf8fbff, 3.05);
      keyLight.position.set(4.5, 6, 5);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xbfdfff, 1.8);
      rimLight.position.set(-4, 2.8, -3.5);
      scene.add(rimLight);

      const glowLight = new THREE.PointLight(0x91c7ec, 1.45, 9);
      glowLight.position.set(-0.6, 0.35, 2.2);
      scene.add(glowLight);
      scene.add(new THREE.AmbientLight(0xe7f3ff, 0.76));

      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath(hashgraphRockAssetPipeline.decoders.dracoDecoderPath);
      dracoLoader.setDecoderConfig({ type: 'wasm' });
      dracoLoader.setWorkerLimit(1);

      const ktx2Loader = new KTX2Loader();
      ktx2Loader.setTranscoderPath(hashgraphRockAssetPipeline.decoders.basisTranscoderPath);
      ktx2Loader.setWorkerLimit(1);
      ktx2Loader.detectSupport(renderer);

      const gltfLoader = new GLTFLoader();
      gltfLoader.setDRACOLoader(dracoLoader);
      gltfLoader.setKTX2Loader(ktx2Loader);

      let rockMaterial: import('three').MeshStandardMaterial | undefined;
      let rockRoot: import('three').Object3D | undefined;
      const rockShards: {
        mesh: import('three').Mesh;
        basePosition: import('three').Vector3;
        baseRotation: import('three').Euler;
        baseScale: import('three').Vector3;
        blast: import('three').Vector3;
        fracture: import('three').Vector3;
        spin: import('three').Vector3;
        fractureThreshold: number;
        fractureStrength: number;
        ruptureStrength: number;
        falloff: number;
        delay: number;
      }[] = [];

      const smoothstep = (value: number) => value * value * (3 - 2 * value);
      const seededRandom = (seed: number) => {
        const value = Math.sin(seed * 12.9898) * 43758.5453;
        return value - Math.floor(value);
      };
      const randomUnit = () => new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.18, Math.random() - 0.5).normalize();

      const createRockMaterial = async () => {
        try {
          const [metallicRoughnessTex, baseColorTex, emissiveTex, normalTex] = await Promise.all([
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.metallicRoughness),
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.baseColor),
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.emissive),
            ktx2Loader.loadAsync(hashgraphRockAssetPipeline.textureUrls.normal),
          ]);

          baseColorTex.colorSpace = THREE.SRGBColorSpace;
          emissiveTex.colorSpace = THREE.SRGBColorSpace;

          return new THREE.MeshStandardMaterial({
            map: baseColorTex,
            emissiveMap: emissiveTex,
            emissive: new THREE.Color(0xcdf8ff),
            emissiveIntensity: 1.16,
            normalMap: normalTex,
            roughnessMap: metallicRoughnessTex,
            metalnessMap: metallicRoughnessTex,
            roughness: 0.5,
            metalness: 0.46,
            color: 0x315d78,
            envMapIntensity: 0.54,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
          });
        } catch (error) {
          console.warn('Original WebGL rock material failed to load, using fallback material.', error);
          return new THREE.MeshStandardMaterial({
            color: 0x315d78,
            emissive: new THREE.Color(0xcdf8ff),
            emissiveIntensity: 1.16,
            roughness: 0.5,
            metalness: 0.46,
            envMapIntensity: 0.54,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 1,
          });
        }
      };

      const normalizeRock = (object: import('three').Object3D) => {
        object.scale.setScalar(1.3);
        object.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        object.position.set(-center.x, -center.y, -center.z);
        object.updateMatrixWorld(true);

        const fov = camera.fov * (Math.PI / 180);
        const distance = (Math.max(size.y, 2.2) * 1.72) / (2 * Math.tan(fov / 2));
        camera.position.set(0.12, 0.14, Math.max(4.75, distance));
        camera.lookAt(0, 0.02, 0);
      };

      const prepareShards = (object: import('three').Object3D) => {
        object.updateMatrixWorld(true);
        const rootBox = new THREE.Box3().setFromObject(object);
        const rootCenter = rootBox.getCenter(new THREE.Vector3());
        const rootSize = rootBox.getSize(new THREE.Vector3());

        object.traverse((child: import('three').Object3D) => {
          if (!(child instanceof THREE.Mesh) || !child.geometry) return;

          const shardIndex = rockShards.length + 1;
          const shardBox = new THREE.Box3().setFromObject(child);
          const shardCenter = shardBox.getCenter(new THREE.Vector3());
          const worldBlast = shardCenter.clone().sub(rootCenter);
          if (worldBlast.lengthSq() < 0.0001) {
            worldBlast.copy(randomUnit());
          }
          worldBlast.normalize();
          worldBlast.x += (Math.random() - 0.5) * 0.35;
          worldBlast.y += 0.2 + Math.random() * 0.34;
          worldBlast.z += (Math.random() - 0.5) * 0.35;
          worldBlast.normalize();

          const parent = child.parent ?? rockGroup;
          const localStart = parent.worldToLocal(shardCenter.clone());
          const localEnd = parent.worldToLocal(shardCenter.clone().add(worldBlast));
          const blast = localEnd.sub(localStart);
          if (blast.lengthSq() < 0.0001) blast.copy(randomUnit());
          blast.normalize();

          const shardSeed =
            shardIndex * 17.17 +
            shardCenter.x * 11.11 +
            shardCenter.y * 23.23 +
            shardCenter.z * 31.31;
          const fractureRoll = seededRandom(shardSeed);
          const heightRatio = THREE.MathUtils.clamp((shardCenter.y - rootBox.min.y) / Math.max(rootSize.y, 0.001), 0, 1);
          const radialRatio = THREE.MathUtils.clamp(
            Math.hypot(
              (shardCenter.x - rootCenter.x) / Math.max(rootSize.x, 0.001),
              (shardCenter.z - rootCenter.z) / Math.max(rootSize.z, 0.001),
            ) * 1.8,
            0,
            1,
          );
          const fractureEligible = fractureRoll > 0.56 && heightRatio > 0.12 && heightRatio < 0.9;
          const fractureStrength = fractureEligible ? (0.34 + seededRandom(shardSeed + 1.9) * 0.46) * (0.72 + radialRatio * 0.28) : 0;
          const fractureThreshold = 0.4 + seededRandom(shardSeed + 4.7) * 0.34;
          const worldFracture = worldBlast
            .clone()
            .multiplyScalar(0.68)
            .add(new THREE.Vector3((seededRandom(shardSeed + 7.1) - 0.5) * 0.42, (heightRatio - 0.46) * 0.26, (seededRandom(shardSeed + 8.3) - 0.5) * 0.42))
            .normalize();
          const localFractureEnd = parent.worldToLocal(shardCenter.clone().add(worldFracture));
          const fracture = localFractureEnd.sub(localStart.clone());
          if (fracture.lengthSq() < 0.0001) fracture.copy(blast);
          fracture.normalize();

          rockShards.push({
            mesh: child,
            basePosition: child.position.clone(),
            baseRotation: child.rotation.clone(),
            baseScale: child.scale.clone(),
            blast,
            fracture,
            spin: new THREE.Vector3(
              (Math.random() - 0.5) * 1.6,
              (Math.random() - 0.5) * 1.9,
              (Math.random() - 0.5) * 1.4,
            ),
            fractureThreshold,
            fractureStrength,
            ruptureStrength: 0.78 + seededRandom(shardSeed + 11.6) * 0.56,
            falloff: 0.12 + seededRandom(shardSeed + 15.4) * 0.38,
            delay: seededRandom(shardSeed + 19.2) * 0.18,
          });
        });
      };

      const particleCount = window.innerWidth < 720 ? 640 : 920;
      const particlePositions = new Float32Array(particleCount * 3);
      const basePositions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const particleSizes = new Float32Array(particleCount);
      const particleSeeds = new Float32Array(particleCount);

      const seedFallbackParticles = () => {
        for (let i = 0; i < particleCount; i += 1) {
          const radius = 0.25 + Math.random() * 0.9;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const idx = i * 3;
          const x = radius * Math.sin(phi) * Math.cos(theta);
          const y = radius * Math.sin(phi) * Math.sin(theta);
          const z = radius * Math.cos(phi);
          basePositions[idx] = x;
          basePositions[idx + 1] = y;
          basePositions[idx + 2] = z;
          particlePositions[idx] = x;
          particlePositions[idx + 1] = y;
          particlePositions[idx + 2] = z;
          const direction = new THREE.Vector3(x, y + 0.2, z).normalize();
          velocities[idx] = direction.x * (1.5 + Math.random() * 2.7);
          velocities[idx + 1] = direction.y * (1.4 + Math.random() * 2.4) + Math.random() * 1.2;
          velocities[idx + 2] = direction.z * (1.5 + Math.random() * 2.7);
        }
      };

      const seedParticlesFromModel = (object: import('three').Object3D) => {
        object.updateMatrixWorld(true);
        const meshes: { mesh: import('three').Mesh; position: import('three').BufferAttribute; end: number }[] = [];
        let totalVertices = 0;

        object.traverse((child: import('three').Object3D) => {
          if (!(child instanceof THREE.Mesh) || !child.geometry) return;
          const position = child.geometry.getAttribute('position') as import('three').BufferAttribute | undefined;
          if (!position?.count) return;
          totalVertices += position.count;
          meshes.push({ mesh: child, position, end: totalVertices });
        });

        if (!meshes.length || !totalVertices) {
          seedFallbackParticles();
          return;
        }

        const sample = new THREE.Vector3();
        const direction = new THREE.Vector3();
        for (let i = 0; i < particleCount; i += 1) {
          const pick = Math.floor(Math.random() * totalVertices);
          const sourceIndex = meshes.findIndex((entry) => pick < entry.end);
          const source = meshes[sourceIndex] ?? meshes[0];
          const previousEnd = sourceIndex > 0 ? meshes[sourceIndex - 1].end : 0;
          const vertexIndex = pick - previousEnd;
          const idx = i * 3;

          sample.fromBufferAttribute(source.position, vertexIndex);
          source.mesh.localToWorld(sample);
          rockGroup.worldToLocal(sample);

          basePositions[idx] = sample.x;
          basePositions[idx + 1] = sample.y;
          basePositions[idx + 2] = sample.z;
          particlePositions[idx] = sample.x;
          particlePositions[idx + 1] = sample.y;
          particlePositions[idx + 2] = sample.z;

          direction.copy(sample);
          if (direction.lengthSq() < 0.0001) direction.copy(randomUnit());
          direction.normalize();
          direction.y += 0.16 + Math.random() * 0.24;
          direction.x += (Math.random() - 0.5) * 0.28;
          direction.z += (Math.random() - 0.5) * 0.28;
          direction.normalize();

          const layer = Math.random();
          const force = layer < 0.42 ? 0.9 + Math.random() * 1.25 : layer < 0.8 ? 1.8 + Math.random() * 2.2 : 3.2 + Math.random() * 2.6;
          velocities[idx] = direction.x * force;
          velocities[idx + 1] = direction.y * force + 0.35 + Math.random() * 1.15;
          velocities[idx + 2] = direction.z * force;
        }
      };

      seedFallbackParticles();

      for (let i = 0; i < particleCount; i += 1) {
        const sizeRoll = Math.random();
        particleSizes[i] = sizeRoll < 0.7 ? 0.65 + Math.random() * 1.4 : 1.8 + Math.random() * 2.4;
        particleSeeds[i] = Math.random();
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleGeometry.setAttribute('aSize', new THREE.BufferAttribute(particleSizes, 1));
      particleGeometry.setAttribute('aSeed', new THREE.BufferAttribute(particleSeeds, 1));
      const particlePositionAttribute = particleGeometry.getAttribute('position') as import('three').BufferAttribute;
      const particleMaterial = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0 },
          uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.8) },
        },
        vertexShader: `
          attribute float aSize;
          attribute float aSeed;
          uniform float uTime;
          uniform float uPixelRatio;
          varying float vSeed;
          varying float vAlpha;
          void main() {
            vSeed = aSeed;
            vec3 pos = position;
            pos.y += sin(uTime * 0.8 + aSeed * 13.0) * 0.035;
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = aSize * uPixelRatio * (58.0 / max(1.0, -mvPosition.z));
            gl_Position = projectionMatrix * mvPosition;
            vAlpha = smoothstep(60.0, 3.0, -mvPosition.z);
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          varying float vSeed;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            if (d > 0.5) discard;
            float glow = exp(-d * d * 14.0);
            vec3 blue = vec3(0.46, 0.68, 0.88);
            vec3 white = vec3(0.88, 0.97, 1.0);
            vec3 silver = vec3(0.62, 0.72, 0.82);
            vec3 color = mix(mix(blue, white, smoothstep(0.0, 0.55, vSeed)), silver, smoothstep(0.82, 1.0, vSeed));
            gl_FragColor = vec4(color, glow * uOpacity * vAlpha * 0.88);
          }
        `,
      });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      particles.frustumCulled = false;
      particles.renderOrder = 3;
      rockGroup.add(particles);

      const shockwaveGeometry = new THREE.RingGeometry(0.82, 0.9, 128);
      const shockwaveMaterial = new THREE.MeshBasicMaterial({
        color: 0xc5ecf8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
      });
      const shockwave = new THREE.Mesh(shockwaveGeometry, shockwaveMaterial);
      shockwave.renderOrder = 4;
      shockwave.position.set(0, 0.02, 0.04);
      rockGroup.add(shockwave);

      try {
        rockMaterial = await createRockMaterial();
        if (cancelled || !mount.isConnected) return;

        const gltf = await gltfLoader.loadAsync(hashgraphRockAssetPipeline.modelUrl);
        if (cancelled || !mount.isConnected) return;

        rockRoot = gltf.scene;
        rockRoot.traverse((child: import('three').Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material = rockMaterial as import('three').MeshStandardMaterial;
          }
        });

        normalizeRock(rockRoot);
        rockGroup.add(rockRoot);
        prepareShards(rockRoot);
        seedParticlesFromModel(rockRoot);
      } catch (error) {
        console.warn('Original WebGL rock failed to load, using fallback geometry.', error);
        if (!rockMaterial) rockMaterial = await createRockMaterial();
        if (cancelled || !mount.isConnected) return;
        const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 4), rockMaterial);
        mesh.rotation.set(-0.18, 0.18, 0.08);
        rockRoot = mesh;
        rockGroup.add(mesh);
        prepareShards(mesh);
      }

      setRockReady(true);

      let frameId = 0;
      const initialTracks = targetTracksRef.current;
      let wakeProgress = initialTracks.wakeProgress;
      let fractureProgress = initialTracks.fractureProgress;
      let ruptureProgress = initialTracks.ruptureProgress;
      let giftPeekProgress = initialTracks.giftPeekProgress;
      let giftRevealProgress = initialTracks.giftRevealProgress;
      let rockSceneInView = true;
      let layoutRockScale = 1;
      let particlesWereActive = false;
      const clock = new THREE.Clock();

      const resize = () => {
        const rect = mount.getBoundingClientRect();
        const width = Math.max(Math.round(rect.width || mount.clientWidth || 640), 1);
        const height = Math.max(Math.round(rect.height || mount.clientHeight || 430), 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const fov = camera.fov * (Math.PI / 180);
        const visibleHeight = 2 * Math.tan(fov / 2) * camera.position.z;
        const visibleWidth = visibleHeight * camera.aspect;
        const isWide = width >= 820;
        layoutRockScale = isWide ? 1 : width < 520 ? 0.72 : 0.82;
        rockGroup.position.set(isWide ? visibleWidth * 0.22 : 0, isWide ? 0.02 : -visibleHeight * 0.18, 0);
      };

      const observer = new ResizeObserver(resize);
      observer.observe(mount);
      resize();
      const settledResizeFrame = window.requestAnimationFrame(resize);
      const settledResizeTimer = window.setTimeout(resize, 120);

      const shouldRenderRockScene = () =>
        !cancelled && mount.isConnected && rockSceneInView && document.visibilityState === 'visible';

      const scheduleRockFrame = () => {
        if (frameId || !shouldRenderRockScene()) return;
        frameId = window.requestAnimationFrame(animate);
      };

      function animate() {
        frameId = 0;
        if (!shouldRenderRockScene()) return;

        const delta = Math.min(clock.getDelta(), 0.05);
        const elapsed = clock.elapsedTime;
        clickImpulseRef.current = Math.max(0, clickImpulseRef.current - delta * (revealedRef.current ? 1.15 : 1.8));
        const clickStage = Math.min(clickCountRef.current, BONUS_ROCK_FINAL_CLICK_COUNT);
        const clickStageRatio = clickStage / BONUS_ROCK_FINAL_CLICK_COUNT;
        const clickImpulse = smoothstep(THREE.MathUtils.clamp(clickImpulseRef.current, 0, 1));
        const clickExpansion = 1 - clickImpulse;
        const targetTracks = targetTracksRef.current;
        wakeProgress += (targetTracks.wakeProgress - wakeProgress) * Math.min(1, delta * 5.4);
        fractureProgress += (targetTracks.fractureProgress - fractureProgress) * Math.min(1, delta * 4.2);
        ruptureProgress += (targetTracks.ruptureProgress - ruptureProgress) * Math.min(1, delta * 2.35);
        giftPeekProgress += (targetTracks.giftPeekProgress - giftPeekProgress) * Math.min(1, delta * 4.4);
        giftRevealProgress += (targetTracks.giftRevealProgress - giftRevealProgress) * Math.min(1, delta * 3.1);

        const wake = smoothstep(THREE.MathUtils.clamp(wakeProgress, 0, 1));
        const fracture = smoothstep(THREE.MathUtils.clamp(fractureProgress, 0, 1));
        const rupture = smoothstep(THREE.MathUtils.clamp(ruptureProgress, 0, 1));
        const giftPeek = smoothstep(THREE.MathUtils.clamp(giftPeekProgress, 0, 1));
        const giftReveal = smoothstep(THREE.MathUtils.clamp(giftRevealProgress, 0, 1));
        const preRuptureEnergy = Math.max(wake * 0.52, fracture);
        const pressurePulse =
          Math.sin(elapsed * (4.4 + wake * 1.2 + fracture * 2.4 + rupture * 3.2)) *
            (0.025 * wake + 0.06 * fracture + 0.08 * rupture) +
          clickImpulse * (clickStage === 1 ? 0.07 : clickStage === 2 ? 0.12 : 0.24);

        rockGroup.rotation.y += delta * (0.14 + wake * 0.04 + fracture * 0.08 + rupture * 0.42);
        rockGroup.rotation.x = -0.06 + Math.sin(elapsed * 1.45) * (0.018 + preRuptureEnergy * 0.016);
        rockGroup.rotation.z = 0.025 + Math.sin(elapsed * 1.1) * (0.004 * wake + 0.01 * fracture + 0.012 * rupture);
        rockGroup.scale.setScalar(
          layoutRockScale *
            (1 + wake * 0.006 + fracture * 0.014 + clickImpulse * (clickStage === 1 ? 0.012 : clickStage === 2 ? 0.024 : 0.052)),
        );

        if (rockMaterial) {
          rockMaterial.emissiveIntensity =
            1.12 +
            wake * 0.32 +
            fracture * 0.46 +
            rupture * 0.88 +
            clickImpulse * (clickStage === 1 ? 0.16 : clickStage === 2 ? 0.34 : 1.42) +
            Math.max(0, pressurePulse * 1.9);
          rockMaterial.envMapIntensity = 0.5 + wake * 0.04 + fracture * 0.08 + rupture * 0.12;
          rockMaterial.opacity = revealedRef.current ? Math.max(0.08, 1 - rupture * 0.86) : 1;
          rockMaterial.transparent = true;
        }

        glowLight.intensity =
          1.25 +
          wake * 0.78 +
          fracture * 1.45 +
          rupture * 4.25 +
          clickImpulse * (clickStage === 1 ? 0.58 : clickStage === 2 ? 1.3 : 6.5) +
          Math.max(0, pressurePulse * 9);
        shockwave.scale.setScalar(1 + clickExpansion * (clickStage === 1 ? 0.7 : clickStage === 2 ? 1.35 : 3.25));
        shockwave.rotation.z = elapsed * 0.22;
        shockwaveMaterial.opacity = clickImpulse * (clickStage === 1 ? 0.03 : clickStage === 2 ? 0.07 : 0.34);

        const shouldAnimateShards = fracture > 0.0005 || rupture > 0.0005 || clickStage >= 2 || revealedRef.current;
        if (shouldAnimateShards) {
          for (let shardIndex = 0; shardIndex < rockShards.length; shardIndex += 1) {
            const shard = rockShards[shardIndex];
            const ruptureShardProgress = smoothstep(THREE.MathUtils.clamp((rupture - shard.delay) / (1 - shard.delay), 0, 1));
            const fractureShardProgress =
              smoothstep(THREE.MathUtils.clamp((fracture - shard.fractureThreshold) / (1 - shard.fractureThreshold), 0, 1)) *
              shard.fractureStrength *
              (1 - ruptureShardProgress);
            const clickNudge =
              clickStage === 2
                ? clickImpulse * 0.008 * shard.fractureStrength
                : clickStage >= BONUS_ROCK_FINAL_CLICK_COUNT
                  ? clickImpulse * 0.26
                  : 0;
            const fractureDistance = fractureShardProgress * 0.07 + clickNudge;
            const ruptureDistance = ruptureShardProgress * 5.4 * shard.ruptureStrength * (0.56 + shard.delay * 1.35);
            const shardRotationEnergy =
              fractureShardProgress * 0.08 +
              ruptureShardProgress * (1.7 + shard.ruptureStrength * 0.82) +
              (clickStage === 2 ? clickImpulse * 0.035 : clickStage >= BONUS_ROCK_FINAL_CLICK_COUNT ? clickImpulse * 0.18 : 0);
            const scale = revealedRef.current ? Math.max(0.11, 1 - ruptureShardProgress * 0.68) : 1 + wake * 0.006 + fracture * 0.018;
            shard.mesh.position
              .copy(shard.basePosition)
              .addScaledVector(shard.fracture, fractureDistance)
              .addScaledVector(shard.blast, ruptureDistance);
            if (ruptureShardProgress > 0.42) {
              shard.mesh.position.y -= (ruptureShardProgress - 0.42) * (ruptureShardProgress - 0.42) * shard.falloff;
            }
            shard.mesh.rotation.set(
              shard.baseRotation.x + shard.spin.x * shardRotationEnergy,
              shard.baseRotation.y + shard.spin.y * shardRotationEnergy,
              shard.baseRotation.z + shard.spin.z * shardRotationEnergy,
            );
            shard.mesh.scale.set(shard.baseScale.x * scale, shard.baseScale.y * scale, shard.baseScale.z * scale);
          }
        }

        const localParticleSpread = wake * 0.012 + fracture * 0.055 + giftPeek * 0.018;
        const spread =
          localParticleSpread +
          rupture * 4.15 +
          clickImpulse * (clickStage === 1 ? 0.008 : clickStage === 2 ? 0.024 : 0.28);
        particles.rotation.y -= delta * (0.035 + preRuptureEnergy * 0.035 + rupture * 0.16);
        particleMaterial.uniforms.uTime.value = elapsed;
        const particleOpacity = Math.min(
          0.84,
          wake * 0.016 +
            fracture * 0.048 +
            giftPeek * 0.018 +
            rupture * 0.68 +
            giftReveal * 0.07 +
            clickImpulse * (clickStage === 1 ? 0.008 : clickStage === 2 ? 0.022 : 0.22),
        );
        particleMaterial.uniforms.uOpacity.value = particleOpacity;
        const particleMotionActive = particleOpacity > 0.002 || spread > 0.001 || particlesWereActive;
        if (particleMotionActive) {
          for (let i = 0; i < particleCount; i += 1) {
            const idx = i * 3;
            const seed = particleSeeds[i];
            const wave = Math.sin(elapsed * 1.7 + seed * 10) * (0.006 * wake + 0.014 * fracture + 0.07 * rupture);
            particlePositions[idx] = basePositions[idx] + velocities[idx] * spread + wave;
            particlePositions[idx + 1] = basePositions[idx + 1] + velocities[idx + 1] * spread - rupture * rupture * 0.38;
            particlePositions[idx + 2] =
              basePositions[idx + 2] +
              velocities[idx + 2] * spread +
              Math.cos(elapsed * 1.4 + seed * 8) * (0.005 * wake + 0.012 * fracture + 0.06 * rupture);
          }
          particlePositionAttribute.needsUpdate = true;
        }
        particlesWereActive = particleOpacity > 0.002;

        if (rockRoot) rockRoot.visible = !revealedRef.current || rupture < 0.98;

        renderer.render(scene, camera);
        scheduleRockFrame();
      }

      const rockVisibilityObserver =
        typeof window.IntersectionObserver === 'undefined'
          ? null
          : new window.IntersectionObserver(
              ([entry]) => {
                rockSceneInView = entry.isIntersecting;
                if (rockSceneInView) {
                  clock.getDelta();
                  scheduleRockFrame();
                }
              },
              { rootMargin: '260px 0px' },
            );

      rockVisibilityObserver?.observe(mount);

      const handleRockDocumentVisibility = () => {
        if (document.visibilityState === 'visible') {
          clock.getDelta();
          scheduleRockFrame();
        }
      };

      document.addEventListener('visibilitychange', handleRockDocumentVisibility);

      scheduleRockFrame();

      disposeScene = () => {
        window.cancelAnimationFrame(frameId);
        window.cancelAnimationFrame(settledResizeFrame);
        window.clearTimeout(settledResizeTimer);
        observer.disconnect();
        rockVisibilityObserver?.disconnect();
        document.removeEventListener('visibilitychange', handleRockDocumentVisibility);
        renderer.dispose();
        particleGeometry.dispose();
        particleMaterial.dispose();
        shockwaveGeometry.dispose();
        shockwaveMaterial.dispose();
        envMap.dispose();
        dracoLoader.dispose();
        ktx2Loader.dispose();
        if (rockMaterial) {
          const textures = new Set([
            rockMaterial.map,
            rockMaterial.emissiveMap,
            rockMaterial.normalMap,
            rockMaterial.roughnessMap,
            rockMaterial.metalnessMap,
          ]);
          textures.forEach((texture) => texture?.dispose());
          rockMaterial.dispose();
        }
        rockGroup.traverse((child: import('three').Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
          }
        });
        renderer.domElement.remove();
      };
    });

    return () => {
      cancelled = true;
      disposeScene?.();
    };
  }, []);

  const rockStage = getBonusRockStage(clickCount);
  const rockTrackTargets = getBonusRockAnimationTargets(clickCount);
  const clickStage = rockStage.clickCount;
  const clicksRemaining = BONUS_ROCK_FINAL_CLICK_COUNT - clickStage;
  const actionLabel = rockStage.actionLabel;
  const rockLayerStyle: BonusRockLayerStyle = {
    '--bonus-rock-wake-progress': rockTrackTargets.wakeProgress,
    '--bonus-rock-fracture-progress': rockTrackTargets.fractureProgress,
    '--bonus-rock-rupture-progress': rockTrackTargets.ruptureProgress,
    '--bonus-gift-peek-progress': rockTrackTargets.giftPeekProgress,
    '--bonus-gift-reveal-progress': rockTrackTargets.giftRevealProgress,
    '--bonus-gift-preview-opacity': rockStage.giftPreview.opacity,
    '--bonus-gift-preview-scale': rockStage.giftPreview.scale,
    '--bonus-gift-preview-blur': `${rockStage.giftPreview.blurPx}px`,
  };
  const liveStatus = revealed
    ? 'The Bonus rock exploded and the gifts are unlocked.'
    : `${clicksRemaining} ${clicksRemaining === 1 ? 'click' : 'clicks'} until the Bonus rock explodes.`;
  const handleRockActivation = () => {
    const now = performance.now();
    if (now - lastActivationRef.current < 120) return;

    lastActivationRef.current = now;
    onRockClick();
  };
  const handleKeyboardRockActivation = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return;

    handleRockActivation();
  };

  return (
    <div
      className="bonus-rock-event-layer group absolute inset-0 text-left"
      aria-label={liveStatus}
      aria-pressed={revealed}
      data-bonus-rock-layer="interactive"
      data-rock-loaded={rockReady}
      data-rock-stage={clickStage}
      data-rock-stage-name={rockStage.id}
      data-rock-preload-status={preloadStatus}
      data-gift-preview={rockStage.giftPreview.mode}
      data-gift-reveal={revealed ? 'visible' : 'hidden'}
      style={rockLayerStyle}
    >
      <div className="bonus-gift-reveal absolute grid gap-3 sm:grid-cols-2" aria-hidden={!revealed}>
        {gifts.map((gift, index) => {
          const giftLabel = `Gift ${String(index + 1).padStart(2, '0')}`;
          const giftLogo = getBonusGiftLogo(gift);
          const giftContent = (
            <>
              <div className="bonus-gift-card-copy">
                <span>{giftLabel}</span>
                <strong>{gift.title}</strong>
                <em>{contentValue(gift.detail)}</em>
                <small>{isPlaceholderValue(gift.link) ? 'Gift revealed' : 'Open gift'}</small>
              </div>
              <img className="bonus-gift-card-logo" src={giftLogo.src} alt={giftLogo.alt} loading="lazy" />
            </>
          );

          return isPlaceholderValue(gift.link) ? (
            <div key={gift.title} className="bonus-gift-card is-disabled">
              {giftContent}
            </div>
          ) : (
            <a
              key={gift.title}
              href={gift.link}
              target="_blank"
              rel="noreferrer"
              className="bonus-gift-card"
              tabIndex={revealed ? undefined : -1}
            >
              {giftContent}
            </a>
          );
        })}
      </div>
      <div className="bonus-rock-loading-orb absolute inset-0" aria-hidden="true" />
      <div ref={mountRef} className="bonus-rock-canvas-mount absolute inset-0" />
      <div className="bonus-rock-atmosphere absolute inset-0" />
      <span className="sr-only" aria-live="polite">
        {liveStatus}
      </span>
      {!revealed ? (
        <button
          type="button"
          onPointerDown={handleRockActivation}
          onClick={handleKeyboardRockActivation}
          className="bonus-rock-hitbox absolute"
          aria-label={liveStatus}
        />
      ) : null}
      <div className="bonus-rock-status absolute bottom-5 left-5 right-5 flex flex-wrap items-center justify-end gap-3">
        <span className="rounded-full bg-white/40 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted transition duration-300 group-hover:bg-white/65 group-hover:text-text-primary">
          {actionLabel}
        </span>
      </div>
    </div>
  );
}

function BonusCelestialBurst() {
  return (
    <div className="bonus-celestial-burst" aria-hidden="true">
      {BONUS_CELESTIAL_SPARKS.map((index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function BonusSection({
  rockClicks,
  preloadStatus,
  onRockClick,
}: {
  rockClicks: number;
  preloadStatus: BonusRockPreloadStatus;
  onRockClick: () => void;
}) {
  const { bonus } = portfolioContent;
  const revealed = rockClicks >= 3;

  return (
    <section id="bonus" className="relative isolate min-h-full overflow-hidden bg-transparent py-14 md:py-20" data-rock-revealed={revealed}>
      <BonusCelestialBurst />
      <MagicalRockScene
        clickCount={rockClicks}
        revealed={revealed}
        gifts={bonus.gifts}
        preloadStatus={preloadStatus}
        onRockClick={onRockClick}
      />
      <div className="bonus-content-shell relative z-30 mx-auto flex min-h-[calc(100dvh-10rem)] max-w-[1200px] items-start px-6 md:min-h-[calc(100dvh-11rem)] md:px-10 lg:items-center lg:px-16">
        <div className="bonus-copy-layout w-full">
          <div className="bonus-copy-card min-w-0 rounded-[2rem] p-7 md:p-10">
            <SectionKicker number="06" label="Bonus" className="tracking-[0.3em]" />
            <h2 className="bonus-copy-title mt-4 text-text-primary">
              {bonus.hook}
            </h2>
            <p className="mt-6 text-sm leading-7 text-muted md:text-base">{bonus.body}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
