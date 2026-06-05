import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { iphoneAssetPipeline } from '../three/iphoneAssets';

export type IPhone3DProps = {
  /** Image URL mapped onto the phone's "Screen" material (portrait app screenshot works best). */
  screenSrc: string;
  /** Static fallback shown until the scene is ready or if WebGL/model load fails. */
  poster?: string;
  className?: string;
  ariaLabel?: string;
  /** Disable auto-rotation (drag still works). */
  autoRotate?: boolean;
};

/**
 * Interactive 3D iPhone viewer built on raw three.js, mirroring the Bonus rock pipeline:
 * lazy dynamic imports, DPR cap, IntersectionObserver + document-visibility frame gating,
 * and full disposal on unmount. One canvas per instance — keep instances to one at a time
 * to respect the portfolio's visible-canvas-pixel budget.
 */
export function IPhone3D({ screenSrc, poster, className, ariaLabel, autoRotate = true }: IPhone3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;

    void (async () => {
      try {
        const [threeModule, gltfModule, dracoModule, roomModule] = await Promise.all([
          import('three'),
          import('three/examples/jsm/loaders/GLTFLoader.js'),
          import('three/examples/jsm/loaders/DRACOLoader.js'),
          import('three/examples/jsm/environments/RoomEnvironment.js'),
        ]);
        if (disposed) return;

        const T = threeModule;
        const { GLTFLoader } = gltfModule;
        const { DRACOLoader } = dracoModule;
        const { RoomEnvironment } = roomModule;

        const measure = () => ({
          w: Math.max(1, mount.clientWidth),
          h: Math.max(1, mount.clientHeight),
        });
        let { w, h } = measure();

        const renderer = new T.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 720 ? 1.5 : 1.75));
        renderer.setSize(w, h, false);
        renderer.outputColorSpace = T.SRGBColorSpace;
        renderer.toneMapping = T.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.12;
        const targetAnisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

        const canvas = renderer.domElement;
        canvas.dataset.iphoneCanvas = 'contentcore-iphone';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.display = 'block';
        canvas.style.touchAction = 'pan-y';
        canvas.style.cursor = 'grab';
        mount.appendChild(canvas);

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(26, w / h, 0.1, 200);
        camera.position.set(0, 0, 30);

        const pmrem = new T.PMREMGenerator(renderer);
        const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
        scene.environment = envRT.texture;

        const key = new T.DirectionalLight(0xffffff, 2.4);
        key.position.set(6, 10, 12);
        scene.add(key);
        const rim = new T.DirectionalLight(0x9bc4ff, 1.1);
        rim.position.set(-8, 2, -6);
        scene.add(rim);
        scene.add(new T.AmbientLight(0xffffff, 0.25));
        scene.add(new T.HemisphereLight(0xffffff, 0x3a4150, 0.6));

        const group = new T.Group();
        scene.add(group);

        let screenTexture: THREE.Texture | null = null;
        try {
          screenTexture = await new T.TextureLoader().loadAsync(screenSrc);
          screenTexture.colorSpace = T.SRGBColorSpace;
          screenTexture.flipY = true;
          screenTexture.anisotropy = targetAnisotropy;
        } catch {
          screenTexture = null;
        }
        if (disposed) {
          screenTexture?.dispose();
          pmrem.dispose();
          envRT.dispose();
          renderer.dispose();
          return;
        }

        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(iphoneAssetPipeline.dracoDecoderPath);
        const gltfLoader = new GLTFLoader();
        gltfLoader.setDRACOLoader(dracoLoader);

        const gltf = await gltfLoader.loadAsync(iphoneAssetPipeline.modelUrl);
        if (disposed) {
          screenTexture?.dispose();
          pmrem.dispose();
          envRT.dispose();
          dracoLoader.dispose();
          renderer.dispose();
          return;
        }

        const model = gltf.scene;
        const box = new T.Box3().setFromObject(model);
        const center = box.getCenter(new T.Vector3());
        const size = box.getSize(new T.Vector3());
        model.position.sub(center);
        group.add(model);

        // Frame the phone by its height with a little breathing room.
        const fitHeight = size.y * 1.12;
        const distance = fitHeight / 2 / Math.tan((camera.fov * Math.PI) / 360);
        camera.position.set(0, 0, distance);
        camera.lookAt(0, 0, 0);

        model.traverse((object: THREE.Object3D) => {
          const mesh = object as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          const material = mesh.material as (THREE.Material & { name?: string }) | undefined;
          const materialName = (material?.name ?? '').toLowerCase();
          const meshName = (mesh.name ?? '').toLowerCase();
          const isScreen = materialName === iphoneAssetPipeline.screenMaterialName || meshName === 'screen';
          if (isScreen && screenTexture) {
            // The scraped "Screen" mesh ships without UVs (the original screen was untextured),
            // so project planar UVs from its local XY bounds before mapping the app screenshot.
            const geometry = mesh.geometry;
            geometry.computeBoundingBox();
            const bounds = geometry.boundingBox;
            const position = geometry.getAttribute('position');
            if (bounds && position) {
              const spanX = bounds.max.x - bounds.min.x || 1;
              const spanY = bounds.max.y - bounds.min.y || 1;
              const uvArray = new Float32Array(position.count * 2);
              for (let i = 0; i < position.count; i += 1) {
                uvArray[i * 2] = (position.getX(i) - bounds.min.x) / spanX;
                uvArray[i * 2 + 1] = (position.getY(i) - bounds.min.y) / spanY;
              }
              geometry.setAttribute('uv', new T.BufferAttribute(uvArray, 2));
            }
            mesh.material = new T.MeshStandardMaterial({
              map: screenTexture,
              emissive: new T.Color(0xffffff),
              emissiveMap: screenTexture,
              emissiveIntensity: 1.1,
              roughness: 0.2,
              metalness: 0,
            });
          }

          const activeMaterials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          activeMaterials.forEach((entry) => {
            const pbr = entry as THREE.MeshStandardMaterial;
            (['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'] as const).forEach((slot) => {
              const texture = pbr?.[slot];
              if (texture) {
                texture.anisotropy = targetAnisotropy;
                texture.needsUpdate = true;
              }
            });
          });
        });

        group.rotation.set(0.04, -0.5, 0);
        setReady(true);

        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        // Never let the phone's back face the viewer — the screen is the only thing worth seeing.
        const DRAG_YAW_LIMIT = Math.PI / 2; // drag stops at 90° (front + side edges, no back)
        const AUTO_YAW_LIMIT = (33 * Math.PI) / 180; // auto-sway reverses at 33° each side
        const AUTO_YAW_SPEED = 0.4; // radians/sec of the sine phase (gentle)
        let spinning = autoRotate && !prefersReduced;
        let targetY = group.rotation.y;
        let targetX = group.rotation.x;
        let autoPhase = Math.asin(Math.max(-1, Math.min(1, targetY / AUTO_YAW_LIMIT)));
        let dragging = false;
        let lastX = 0;
        let lastY = 0;

        const onPointerDown = (event: PointerEvent) => {
          dragging = true;
          spinning = false;
          lastX = event.clientX;
          lastY = event.clientY;
          canvas.style.cursor = 'grabbing';
          canvas.setPointerCapture?.(event.pointerId);
          schedule();
        };
        const onPointerMove = (event: PointerEvent) => {
          if (!dragging) return;
          targetY += (event.clientX - lastX) * 0.01;
          targetY = Math.max(-DRAG_YAW_LIMIT, Math.min(DRAG_YAW_LIMIT, targetY));
          targetX += (event.clientY - lastY) * 0.006;
          targetX = Math.max(-0.5, Math.min(0.5, targetX));
          lastX = event.clientX;
          lastY = event.clientY;
          schedule();
        };
        const onPointerUp = () => {
          dragging = false;
          canvas.style.cursor = 'grab';
        };
        canvas.addEventListener('pointerdown', onPointerDown);
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);

        let visible = true;
        const visibilityObserver = new IntersectionObserver(
          (entries) => {
            visible = entries[0]?.isIntersecting ?? false;
            if (visible) schedule();
          },
          { threshold: 0.05 },
        );
        visibilityObserver.observe(mount);

        const onDocumentVisibility = () => {
          if (!document.hidden && visible) schedule();
        };
        document.addEventListener('visibilitychange', onDocumentVisibility);

        const clock = new T.Clock();
        let frameId = 0;
        const renderFrame = () => {
          frameId = 0;
          const delta = Math.min(clock.getDelta(), 0.05);
          if (spinning) {
            autoPhase += delta * AUTO_YAW_SPEED;
            targetY = Math.sin(autoPhase) * AUTO_YAW_LIMIT;
          }
          group.rotation.y += (targetY - group.rotation.y) * 0.08;
          group.rotation.x += (targetX - group.rotation.x) * 0.08;
          renderer.render(scene, camera);
          const settled =
            !spinning &&
            !dragging &&
            Math.abs(targetY - group.rotation.y) < 0.0004 &&
            Math.abs(targetX - group.rotation.x) < 0.0004;
          if (!settled && visible && !document.hidden) schedule();
        };
        const schedule = () => {
          if (frameId || disposed || !visible || document.hidden) return;
          frameId = window.requestAnimationFrame(renderFrame);
        };
        schedule();

        const resizeObserver = new ResizeObserver(() => {
          const next = measure();
          w = next.w;
          h = next.h;
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h, false);
          schedule();
        });
        resizeObserver.observe(mount);

        cleanup = () => {
          visibilityObserver.disconnect();
          resizeObserver.disconnect();
          document.removeEventListener('visibilitychange', onDocumentVisibility);
          canvas.removeEventListener('pointerdown', onPointerDown);
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          if (frameId) cancelAnimationFrame(frameId);
          envRT.dispose();
          pmrem.dispose();
          screenTexture?.dispose();
          scene.traverse((object: THREE.Object3D) => {
            const mesh = object as THREE.Mesh;
            if (!mesh.isMesh) return;
            mesh.geometry?.dispose();
            const material = mesh.material;
            if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
            else material?.dispose();
          });
          dracoLoader.dispose();
          renderer.dispose();
          canvas.remove();
        };
      } catch (error) {
        if (!disposed) setFailed(true);
        console.error('IPhone3D failed to initialize', error);
      }
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [screenSrc, autoRotate]);

  return (
    <div
      ref={mountRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%' }}
    >
      {(!ready || failed) && poster ? (
        <img src={poster} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
