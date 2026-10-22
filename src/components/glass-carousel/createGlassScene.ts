import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export type GlassPanePose = {
  x: number;
  y: number;
  z: number;
  rotateY: number;
  opacity: number;
};

export type GlassSceneHandle = {
  resize(width: number, height: number, cardWidth: number, cardHeight: number): void;
  render(poses: readonly GlassPanePose[], lightX: number): void;
  dispose(): void;
};

type Disposable = { dispose(): void };

const PERSPECTIVE = 1400;
const PANE_DEPTH = 6.5;
const BEVEL_SIZE = 2;
const BEVEL_DEPTH = 1.35;
const PANE_COUNT = 3;

function roundedRectangle(width: number, height: number, radius: number) {
  const shape = new THREE.Shape();
  const left = -width / 2;
  const bottom = -height / 2;
  const right = width / 2;
  const top = height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  shape.moveTo(left + r, bottom);
  shape.lineTo(right - r, bottom);
  shape.quadraticCurveTo(right, bottom, right, bottom + r);
  shape.lineTo(right, top - r);
  shape.quadraticCurveTo(right, top, right - r, top);
  shape.lineTo(left + r, top);
  shape.quadraticCurveTo(left, top, left, top - r);
  shape.lineTo(left, bottom + r);
  shape.quadraticCurveTo(left, bottom, left + r, bottom);
  return shape;
}

const backdropVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// These are soft studio bands and projected floor shading, not simulated
// photon caustics. The opaque backdrop is also captured by Three's physical
// transmission pass, so the panes refract actual scene content.
const backdropFragment = `
varying vec2 vUv;
uniform vec2 uResolution;
uniform vec3 uPaper;
uniform vec3 uBlue;
uniform float uLightX;
uniform vec4 uShadows[3];
uniform float uShadowOpacity[3];

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float diagonal = p.x * 0.70 + p.y * 0.85 - uLightX * 0.13;
  float broadLight = exp(-pow((diagonal + 0.15) * 3.1, 2.0));
  float coolBand = exp(-pow((diagonal - 0.34) * 3.6, 2.0));
  float cloud = sin(p.x * 3.0 + sin(p.y * 3.2) * 0.65)
              * cos(p.y * 3.7 - p.x * 1.15);
  vec3 color = mix(uPaper, uBlue, coolBand * 0.34);
  color += vec3(0.035, 0.040, 0.045) * broadLight;
  color += vec3(0.009, 0.011, 0.013) * cloud;

  for (int i = 0; i < 3; i++) {
    vec2 q = (vUv - uShadows[i].xy) / max(uShadows[i].zw, vec2(0.001));
    float shadow = exp(-dot(q, q) * 2.4);
    color = mix(color, vec3(0.39, 0.52, 0.65), shadow * 0.10 * uShadowOpacity[i]);
    float streak = exp(-pow((q.y + 0.14 + sin(q.x * 1.8) * 0.07) * 8.0, 2.0))
                 * exp(-q.x * q.x * 2.5);
    color += vec3(0.024, 0.035, 0.047) * streak * uShadowOpacity[i];
  }

  // Fade the studio surface into the surrounding HTML rather than exposing a
  // rectangular canvas boundary. It stays in the opaque transmission list.
  vec2 fade = smoothstep(vec2(0.0), vec2(0.075), vUv)
            * smoothstep(vec2(0.0), vec2(0.075), 1.0 - vUv);
  gl_FragColor = vec4(color, fade.x * fade.y);
  #include <colorspace_fragment>
  #include <premultiplied_alpha_fragment>
}`;

/** One optional, imperative WebGL layer. The caller owns every animation frame. */
export async function createGlassScene(mount: HTMLDivElement, onFailure: () => void): Promise<GlassSceneHandle> {
  const resources = new Set<Disposable>();
  let renderer: THREE.WebGLRenderer | undefined;
  let scene: THREE.Scene | undefined;
  let disposed = false;
  let failed = false;
  let contextCanvas: HTMLCanvasElement | undefined;
  let context: WebGL2RenderingContext | undefined;

  const own = <T extends Disposable>(resource: T): T => { resources.add(resource); return resource; };
  const release = (resource: Disposable) => {
    resources.delete(resource);
    try { resource.dispose(); } catch { /* Cleanup must continue for the other resources. */ }
  };
  const reportFailure = () => {
    if (failed) return;
    failed = true;
    try { onFailure(); } catch { /* A consumer callback cannot prevent cleanup. */ }
  };
  const handleContextLost = (event: Event) => {
    event.preventDefault();
    if (disposed) return;
    reportFailure();
    dispose();
  };
  const dispose = () => {
    if (disposed) return;
    disposed = true;
    contextCanvas?.removeEventListener('webglcontextlost', handleContextLost);
    if (scene) { scene.environment = null; scene.clear(); }
    for (const resource of resources) {
      try { resource.dispose(); } catch { /* Release the remaining GPU resources. */ }
    }
    resources.clear();
    if (renderer) {
      try { renderer.dispose(); } catch { /* Context may already be unavailable. */ }
      try { renderer.forceContextLoss(); } catch { /* Optional browser extension. */ }
    } else if (context) {
      // Constructor failure can happen after a GL context has been allocated.
      try { context.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* Best-effort partial initialization cleanup. */ }
    }
    contextCanvas?.remove();
  };

  try {
    // Create the canvas first so even a renderer-construction failure can remove
    // its listeners/context. No remote environment maps or textures are used.
    contextCanvas = document.createElement('canvas');
    contextCanvas.setAttribute('aria-hidden', 'true');
    contextCanvas.setAttribute('role', 'presentation');
    contextCanvas.tabIndex = -1;
    contextCanvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none;';
    contextCanvas.addEventListener('webglcontextlost', handleContextLost);
    const contextAttributes: WebGLContextAttributes = {
      alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power',
    };
    const nextContext = contextCanvas.getContext('webgl2', contextAttributes);
    if (!nextContext) throw new Error('WebGL2 is unavailable for the optional glass layer.');
    context = nextContext;
    renderer = new THREE.WebGLRenderer({
      canvas: contextCanvas,
      context,
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: 'low-power',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.transmissionResolutionScale = 0.8;
    mount.appendChild(contextCanvas);

    const activeRenderer = renderer;
    scene = new THREE.Scene();
    const activeScene = scene;
    const camera = new THREE.PerspectiveCamera(45, 1, 1, 6000);
    camera.position.z = PERSPECTIVE;

    const environment = own(new RoomEnvironment());
    const pmrem = own(new THREE.PMREMGenerator(activeRenderer));
    try {
      const target = own(pmrem.fromScene(environment, 0.025));
      activeScene.environment = target.texture;
      activeScene.environmentIntensity = 1.05;
    } finally {
      release(environment);
      release(pmrem);
    }

    const keyLight = new THREE.DirectionalLight(0xfffbf7, 2.1);
    keyLight.position.set(-550, 600, 900);
    activeScene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xc8e2ff, 0.85);
    fillLight.position.set(650, -100, 500);
    activeScene.add(fillLight);
    activeScene.add(new THREE.AmbientLight(0xeef5ff, 0.45));

    const shadowPositions = Array.from({ length: PANE_COUNT }, () => new THREE.Vector4(0.5, 0.15, 0.1, 0.02));
    const shadowOpacities = new Float32Array(PANE_COUNT);
    const backdropMaterial = own(new THREE.ShaderMaterial({
      uniforms: {
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPaper: { value: new THREE.Color(0xedf3f8) },
        uBlue: { value: new THREE.Color(0xb7d5ee) },
        uLightX: { value: 0 },
        uShadows: { value: shadowPositions },
        uShadowOpacity: { value: shadowOpacities },
      },
      vertexShader: backdropVertex,
      fragmentShader: backdropFragment,
      transparent: false,
      depthWrite: false,
      depthTest: false,
      toneMapped: false,
      premultipliedAlpha: true,
    }));
    const backdrop = new THREE.Mesh(own(new THREE.PlaneGeometry(1, 1)), backdropMaterial);
    backdrop.position.z = -900;
    backdrop.renderOrder = -1000;
    activeScene.add(backdrop);

    const placeholder = own(new THREE.BufferGeometry());
    const panes = Array.from({ length: PANE_COUNT }, () => {
      const face = own(new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.035,
        transmission: 1, thickness: 22, ior: 1.46,
        attenuationColor: new THREE.Color(0xe5f2ff), attenuationDistance: 420,
        clearcoat: 0.25, clearcoatRoughness: 0.04,
        envMap: activeScene.environment, envMapIntensity: 1.05, specularIntensity: 1,
        transparent: true, depthWrite: false,
      }));
      const rim = own(new THREE.MeshPhysicalMaterial({
        color: 0xc0dff7, metalness: 0, roughness: 0.035,
        transmission: 0.94, thickness: 14, ior: 1.5,
        attenuationColor: new THREE.Color(0xb1cfea), attenuationDistance: 160,
        clearcoat: 1, clearcoatRoughness: 0.035,
        envMap: activeScene.environment, envMapIntensity: 1.55,
        transparent: true, depthWrite: false,
      }));
      const frontMaterial = own(new THREE.LineBasicMaterial({ color: 0xf2fbff, transparent: true, opacity: 0.95, depthWrite: false }));
      const backMaterial = own(new THREE.LineBasicMaterial({ color: 0x8fb9d9, transparent: true, opacity: 0.65, depthWrite: false }));
      const mesh = new THREE.Mesh(placeholder, [face, rim]);
      const front = new THREE.LineLoop(placeholder, frontMaterial);
      const back = new THREE.LineLoop(placeholder, backMaterial);
      const group = new THREE.Group();
      group.add(mesh, front, back);
      group.visible = false;
      activeScene.add(group);
      return { group, mesh, front, back, face, rim, frontMaterial, backMaterial };
    });

    let width = 0;
    let height = 0;
    let cardWidth = 0;
    let cardHeight = 0;
    let paneGeometry: THREE.ExtrudeGeometry | undefined;
    let outlineGeometry: THREE.BufferGeometry | undefined;

    const resize: GlassSceneHandle['resize'] = (nextWidth, nextHeight, nextCardWidth, nextCardHeight) => {
      if (disposed || ![nextWidth, nextHeight, nextCardWidth, nextCardHeight].every(Number.isFinite) ||
        nextWidth <= 0 || nextHeight <= 0 || nextCardWidth <= BEVEL_SIZE * 2 || nextCardHeight <= BEVEL_SIZE * 2) return;
      try {
        if (nextWidth !== width || nextHeight !== height) {
          width = nextWidth;
          height = nextHeight;
          activeRenderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(height / (2 * PERSPECTIVE)));
          camera.updateProjectionMatrix();
          const distanceScale = (PERSPECTIVE - backdrop.position.z) / PERSPECTIVE;
          backdrop.scale.set(width * distanceScale, height * distanceScale, 1);
          backdropMaterial.uniforms.uResolution.value.set(width, height);
        }
        if (nextCardWidth !== cardWidth || nextCardHeight !== cardHeight) {
          cardWidth = nextCardWidth;
          cardHeight = nextCardHeight;
          const shape = roundedRectangle(cardWidth - 2 * BEVEL_SIZE, cardHeight - 2 * BEVEL_SIZE, Math.max(1, 24 - BEVEL_SIZE));
          const nextPane = own(new THREE.ExtrudeGeometry(shape, {
            depth: PANE_DEPTH, steps: 1, curveSegments: 12,
            bevelEnabled: true, bevelThickness: BEVEL_DEPTH,
            bevelSize: BEVEL_SIZE, bevelSegments: 3,
          }));
          nextPane.translate(0, 0, -PANE_DEPTH / 2);
          const points = shape.getPoints(12).map((point: { x: number; y: number }) => new THREE.Vector3(point.x, point.y, 0));
          const nextOutline = own(new THREE.BufferGeometry().setFromPoints(points));
          for (const pane of panes) {
            pane.mesh.geometry = nextPane;
            pane.front.geometry = nextOutline;
            pane.back.geometry = nextOutline;
            pane.front.position.z = PANE_DEPTH / 2 + BEVEL_DEPTH + 0.06;
            pane.back.position.z = -PANE_DEPTH / 2 - BEVEL_DEPTH - 0.06;
          }
          if (paneGeometry) release(paneGeometry);
          if (outlineGeometry) release(outlineGeometry);
          paneGeometry = nextPane;
          outlineGeometry = nextOutline;
        }
      } catch {
        reportFailure();
        dispose();
      }
    };

    const render: GlassSceneHandle['render'] = (poses, lightX) => {
      if (disposed || !width || !height || !cardWidth || !cardHeight) return;
      try {
        const light = Number.isFinite(lightX) ? THREE.MathUtils.clamp(lightX, -1, 1) : 0;
        backdropMaterial.uniforms.uLightX.value = light;
        keyLight.position.x = -width * 0.42 + light * width * 0.24;
        activeScene.environmentRotation.y = light * 0.14;
        for (let index = 0; index < PANE_COUNT; index++) {
          const pane = panes[index];
          const pose = poses[index];
          const valid = pose && [pose.x, pose.y, pose.z, pose.rotateY, pose.opacity].every(Number.isFinite);
          const opacity = valid ? THREE.MathUtils.clamp(pose.opacity, 0, 1) : 0;
          pane.group.visible = opacity > 0.005;
          shadowOpacities[index] = opacity;
          if (!valid) continue;
          pane.group.position.set(pose.x, -pose.y, pose.z);
          pane.group.rotation.y = pose.rotateY;
          pane.face.opacity = opacity;
          pane.rim.opacity = opacity;
          pane.frontMaterial.opacity = opacity * 0.95;
          pane.backMaterial.opacity = opacity * 0.65;
          const projectionScale = PERSPECTIVE / Math.max(120, PERSPECTIVE - pose.z);
          shadowPositions[index].set(
            0.5 + (pose.x + 12 * light) * projectionScale / width,
            0.5 - (pose.y + cardHeight / 2 + 22) * projectionScale / height,
            cardWidth * 0.59 * projectionScale / width,
            Math.max(13, cardHeight * 0.055) * projectionScale / height,
          );
        }
        activeRenderer.render(activeScene, camera);
      } catch {
        reportFailure();
        dispose();
      }
    };

    return { resize, render, dispose };
  } catch (error) {
    reportFailure();
    dispose();
    throw error;
  }
}
