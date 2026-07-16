import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';
import { iphoneAssetPipeline } from '../three/iphoneAssets';

export type IPhone3DProps = {
  /** Image URL mapped onto the phone's "Screen" material (portrait app screenshot works best). */
  screenSrc: string;
  /** Optional video URL mapped onto the phone screen. Uses screenSrc/poster as the fallback still. */
  screenVideoSrc?: string;
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
export function IPhone3D({
  screenSrc,
  screenVideoSrc,
  poster,
  className,
  ariaLabel,
  autoRotate = true,
}: IPhone3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;
    setReady(false);
    setFailed(false);

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
        let screenVideo: HTMLVideoElement | null = null;
        let videoScreenActive = false;
        const loadImageTexture = async () => {
          const texture = await new T.TextureLoader().loadAsync(screenSrc);
          texture.colorSpace = T.SRGBColorSpace;
          texture.flipY = true;
          texture.anisotropy = targetAnisotropy;
          return texture;
        };

        try {
	          if (screenVideoSrc) {
	            screenVideo = document.createElement('video');
	            screenVideo.crossOrigin = 'anonymous';
	            screenVideo.src = screenVideoSrc;
            screenVideo.muted = true;
            screenVideo.loop = true;
            screenVideo.playsInline = true;
            screenVideo.autoplay = true;
            screenVideo.preload = 'auto';
            screenVideo.setAttribute('muted', '');
            screenVideo.setAttribute('playsinline', '');
            screenVideo.setAttribute('webkit-playsinline', '');
            await new Promise<void>((resolve) => {
              let settled = false;
              const finish = () => {
                if (settled) return;
                settled = true;
                window.clearTimeout(timeout);
                screenVideo?.removeEventListener('loadeddata', finish);
                screenVideo?.removeEventListener('canplay', finish);
                screenVideo?.removeEventListener('error', finish);
                resolve();
              };
              const timeout = window.setTimeout(finish, 1800);
              screenVideo?.addEventListener('loadeddata', finish, { once: true });
              screenVideo?.addEventListener('canplay', finish, { once: true });
              screenVideo?.addEventListener('error', finish, { once: true });
              screenVideo?.load();
            });

            screenTexture = new T.VideoTexture(screenVideo);
            screenTexture.colorSpace = T.SRGBColorSpace;
            screenTexture.flipY = true;
            screenTexture.minFilter = T.LinearFilter;
            screenTexture.magFilter = T.LinearFilter;
            screenTexture.generateMipmaps = false;
            videoScreenActive = true;
          } else {
            screenTexture = await loadImageTexture();
          }
        } catch {
          screenVideo?.pause();
          screenVideo = null;
          try {
            screenTexture = await loadImageTexture();
            videoScreenActive = false;
          } catch {
            screenTexture = null;
          }
        }
        if (disposed) {
          screenVideo?.pause();
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
          screenVideo?.pause();
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

	        const DYNAMIC_ISLAND_WIDTH_SCALE = 1.34;
	        const DYNAMIC_ISLAND_LEFT_EXTENSION_FACTOR = 0.14;
	        let islandMesh: THREE.Mesh | null = null;
	        let frontCameraMesh: THREE.Mesh | null = null;

	        model.traverse((object: THREE.Object3D) => {
	          const mesh = object as THREE.Mesh;
	          if (!mesh.isMesh) return;
	          mesh.castShadow = false;
	          mesh.receiveShadow = false;
	          const material = mesh.material as (THREE.Material & { name?: string }) | undefined;
	          const materialName = (material?.name ?? '').toLowerCase();
	          const meshName = (mesh.name ?? '').toLowerCase();
	          if (meshName === 'island') {
	            islandMesh = mesh;
	          }
	          if (meshName === 'front_camera') {
	            frontCameraMesh = mesh;
	          }
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

        if (islandMesh?.parent) {
	          const islandGeometry = islandMesh.geometry;
	          islandGeometry.computeBoundingBox();
	          const islandBounds = islandGeometry.boundingBox;
	          if (islandBounds) {
	            const islandSize = islandBounds.getSize(new T.Vector3());
	            const islandCenter = islandBounds.getCenter(new T.Vector3());
	            const height = islandSize.y;
	            const leftExtension = height * DYNAMIC_ISLAND_LEFT_EXTENSION_FACTOR;
	            const width = islandSize.x * DYNAMIC_ISLAND_WIDTH_SCALE + leftExtension;
	            const radius = height / 2;
	            const x = islandCenter.x - (width - leftExtension) / 2 - leftExtension;
	            const y = islandCenter.y - height / 2;
	            const shape = new T.Shape();

	            shape.moveTo(x + radius, y);
	            shape.lineTo(x + width - radius, y);
	            shape.quadraticCurveTo(x + width, y, x + width, y + radius);
	            shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	            shape.lineTo(x + radius, y + height);
	            shape.quadraticCurveTo(x, y + height, x, y + height - radius);
	            shape.lineTo(x, y + radius);
	            shape.quadraticCurveTo(x, y, x + radius, y);

	            const overlayGeometry = new T.ShapeGeometry(shape, 48);
	            overlayGeometry.translate(0, 0, islandBounds.max.z + 0.0015);
	            const overlayMaterial = new T.MeshStandardMaterial({
	              color: new T.Color(0x050505),
	              emissive: new T.Color(0x010101),
	              emissiveIntensity: 0.24,
	              roughness: 0.26,
	              metalness: 0,
	              side: T.DoubleSide,
	            });
	            const islandOverlay = new T.Mesh(overlayGeometry, overlayMaterial);
	            islandOverlay.name = 'DynamicIslandOverlay';
	            islandOverlay.position.copy(islandMesh.position);
	            islandOverlay.quaternion.copy(islandMesh.quaternion);
	            islandOverlay.scale.copy(islandMesh.scale);
	            islandOverlay.renderOrder = 2;
	            islandMesh.visible = false;
	            islandMesh.parent.add(islandOverlay);
	            if (frontCameraMesh?.parent) {
	              const cameraGeometry = frontCameraMesh.geometry;
	              cameraGeometry.computeBoundingBox();
	              const cameraBounds = cameraGeometry.boundingBox;
	              if (cameraBounds) {
	                const socketRadius = height * 0.255;
	                const coverRadius = socketRadius * 0.72;
	                const lensRadius = socketRadius * 0.4;
	                const cameraX = x + socketRadius + height * 0.052;
	                const cameraY = islandCenter.y;
	                const cameraZ = Math.max(islandBounds.max.z, cameraBounds.max.z) + 0.014;
	                const cameraOverlay = new T.Group();
	                cameraOverlay.name = 'DynamicIslandCameraOverlay';
	                cameraOverlay.position.copy(islandMesh.position);
	                cameraOverlay.quaternion.copy(islandMesh.quaternion);
	                cameraOverlay.scale.copy(islandMesh.scale);

	                const createCameraCylinder = (discRadius: number, depth: number, z: number) => {
	                  const geometry = new T.CylinderGeometry(discRadius, discRadius, depth, 48, 1, false);
	                  geometry.rotateX(Math.PI / 2);
	                  geometry.translate(cameraX, cameraY, z);
	                  return geometry;
	                };

	                const socketGeometry = createCameraCylinder(socketRadius, 0.018, cameraZ);
	                const socket = new T.Mesh(
	                  socketGeometry,
	                  new T.MeshStandardMaterial({
	                    color: new T.Color(0x090a0c),
	                    emissive: new T.Color(0x010101),
	                    emissiveIntensity: 0.08,
	                    roughness: 0.48,
	                    metalness: 0.1,
	                  }),
	                );
	                socket.renderOrder = 3;

	                const coverGeometry = createCameraCylinder(coverRadius, 0.01, cameraZ + 0.012);
	                const cover = new T.Mesh(
	                  coverGeometry,
	                  new T.MeshStandardMaterial({
	                    color: new T.Color(0x15181d),
	                    emissive: new T.Color(0x020202),
	                    emissiveIntensity: 0.08,
	                    roughness: 0.24,
	                    metalness: 0.18,
	                  }),
	                );
	                cover.renderOrder = 4;

	                const lensGeometry = new T.SphereGeometry(lensRadius, 32, 16);
	                lensGeometry.scale(1, 1, 0.28);
	                lensGeometry.translate(cameraX, cameraY, cameraZ + 0.019);
	                const lens = new T.Mesh(
	                  lensGeometry,
	                  new T.MeshStandardMaterial({
	                    color: new T.Color(0x050913),
	                    emissive: new T.Color(0x07183f),
	                    emissiveIntensity: 0.14,
	                    roughness: 0.12,
	                    metalness: 0.2,
	                  }),
	                );
	                lens.renderOrder = 5;

	                const glintGeometry = new T.CircleGeometry(lensRadius * 0.22, 20);
	                glintGeometry.translate(
	                  cameraX + lensRadius * 0.26,
	                  cameraY + lensRadius * 0.2,
	                  cameraZ + 0.032,
	                );
	                const glint = new T.Mesh(
	                  glintGeometry,
	                  new T.MeshBasicMaterial({
	                    color: new T.Color(0xdce8ff),
	                    transparent: true,
	                    opacity: 0.42,
	                    depthWrite: false,
	                  }),
	                );
	                glint.renderOrder = 6;

	                cameraOverlay.add(socket, cover, lens, glint);
	                frontCameraMesh.visible = false;
	                frontCameraMesh.parent.add(cameraOverlay);
	              }
	            }
	          }
	        }

        const AUTO_YAW_DEGREES = 23;
	        group.rotation.set(0.04, (-AUTO_YAW_DEGREES * Math.PI) / 180, 0);
        setReady(true);

        const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
        // Never let the phone's back face the viewer — the screen is the only thing worth seeing.
        const DRAG_YAW_LIMIT = Math.PI / 2; // drag stops at 90° (front + side edges, no back)
        const AUTO_YAW_LIMIT = (AUTO_YAW_DEGREES * Math.PI) / 180;
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

        const playScreenVideo = () => {
          if (!screenVideo || !videoScreenActive) return;
          void screenVideo.play().catch(() => undefined);
        };
        const pauseScreenVideo = () => {
          if (!screenVideo || !videoScreenActive) return;
          screenVideo.pause();
        };
        const onVideoFrame = () => schedule();
        screenVideo?.addEventListener('play', onVideoFrame);
        screenVideo?.addEventListener('playing', onVideoFrame);
        screenVideo?.addEventListener('timeupdate', onVideoFrame);
        screenVideo?.addEventListener('seeked', onVideoFrame);

        let visible = true;
        const visibilityObserver = new IntersectionObserver(
          (entries) => {
            visible = entries[0]?.isIntersecting ?? false;
            if (visible) {
              playScreenVideo();
              schedule();
            } else {
              pauseScreenVideo();
            }
          },
          { threshold: 0.05 },
        );
        visibilityObserver.observe(mount);

        const onDocumentVisibility = () => {
          if (!document.hidden && visible) {
            playScreenVideo();
            schedule();
          } else {
            pauseScreenVideo();
          }
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
          const videoNeedsRender =
            Boolean(screenVideo) &&
	            videoScreenActive &&
	            !screenVideo.paused &&
	            !screenVideo.ended &&
	            screenVideo.readyState >= 2;
          if ((!settled || videoNeedsRender) && visible && !document.hidden) schedule();
        };
        const schedule = () => {
          if (frameId || disposed || !visible || document.hidden) return;
          frameId = window.requestAnimationFrame(renderFrame);
        };
        playScreenVideo();
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
          screenVideo?.removeEventListener('play', onVideoFrame);
          screenVideo?.removeEventListener('playing', onVideoFrame);
          screenVideo?.removeEventListener('timeupdate', onVideoFrame);
          screenVideo?.removeEventListener('seeked', onVideoFrame);
          screenVideo?.pause();
          if (screenVideo) {
            screenVideo.removeAttribute('src');
            screenVideo.load();
          }
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
  }, [screenSrc, screenVideoSrc, autoRotate]);

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
