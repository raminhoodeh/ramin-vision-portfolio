// ═══════════════════════════════════════════════════════
//  particles.js — Rock dissolution + particle morph system
//  Redesigned: organic streaming explosion from rock surface,
//  not a radial white blob. Particles follow velocity trails
//  outward, then morph into formations.
// ═══════════════════════════════════════════════════════
import * as THREE from 'three';

const PARTICLE_COUNT = 4000;

// ── Formation target generators ──────────────────────
function nodeGraphFormation() {
  const nodes = [
    [0, 1, 0], [2, 2, -1], [-2, 2, -1], [0, 3.5, -1],
    [1.5, 0, 0], [-1.5, 0, 0], [3, 1, -2], [-3, 1, -2],
    [0, 5, -2], [2.5, 3.5, -1.5], [-2.5, 3.5, -1.5], [0, -1.5, 0],
  ];
  const positions = [];
  const perNode = Math.floor(PARTICLE_COUNT / nodes.length);
  nodes.forEach(([nx, ny, nz]) => {
    for (let i = 0; i < perNode; i++) {
      const r = Math.random() * 0.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      positions.push(
        nx + r * Math.sin(phi) * Math.cos(theta),
        ny + r * Math.sin(phi) * Math.sin(theta),
        nz + r * Math.cos(phi)
      );
    }
  });
  while (positions.length < PARTICLE_COUNT * 3) {
    const n = nodes[Math.floor(Math.random() * nodes.length)];
    positions.push(
      n[0] + (Math.random() - 0.5) * 0.3,
      n[1] + (Math.random() - 0.5) * 0.3,
      n[2] + (Math.random() - 0.5) * 0.3
    );
  }
  return new Float32Array(positions);
}

function risingBeamFormation() {
  const positions = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const t = i / PARTICLE_COUNT;
    const angle = t * Math.PI * 24;
    const radius = 0.4 * (1 - t * 0.6);
    const height = t * 10 - 2;
    positions.push(
      radius * Math.cos(angle) + (Math.random() - 0.5) * 0.12,
      height,
      radius * Math.sin(angle) + (Math.random() - 0.5) * 0.12
    );
  }
  return new Float32Array(positions);
}

function rippleFormation() {
  const positions = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 10;
    const height = Math.sin(radius * 0.6) * 0.5 * (1 - radius / 10);
    positions.push(
      radius * Math.cos(angle),
      height + (Math.random() - 0.5) * 0.15,
      radius * Math.sin(angle)
    );
  }
  return new Float32Array(positions);
}

function orbFormation() {
  const positions = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1.8 + Math.random() * 0.4;
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta) - 1,
      r * Math.cos(phi)
    );
  }
  return new Float32Array(positions);
}

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.count = PARTICLE_COUNT;

    // Explode: particles stream outward organically from rock center
    // Each particle gets a random direction but biased outward (not uniform radial)
    this.sourcePositions = new Float32Array(PARTICLE_COUNT * 3);
    this.explodePositions = new Float32Array(PARTICLE_COUNT * 3);
    this.explodeVelocities = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Random direction on sphere, but with varying distances for organic look
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      // Layer 1: tight core (30% of particles stay close)
      // Layer 2: medium spread (40% go medium distance)
      // Layer 3: outer streaks (30% fly far)
      const layer = Math.random();
      let rMax;
      if (layer < 0.3) rMax = 0.5 + Math.random() * 0.8;
      else if (layer < 0.7) rMax = 1.0 + Math.random() * 1.5;
      else rMax = 2.0 + Math.random() * 2.5;

      const dir = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );

      this.explodePositions[i * 3]     = dir.x * rMax;
      this.explodePositions[i * 3 + 1] = dir.y * rMax + 0.5; // slight upward bias
      this.explodePositions[i * 3 + 2] = dir.z * rMax;
      this.sourcePositions[i * 3] = 0;
      this.sourcePositions[i * 3 + 1] = 0;
      this.sourcePositions[i * 3 + 2] = 0;
    }

    // Formation targets
    this.formations = {
      node: nodeGraphFormation(),
      beam: risingBeamFormation(),
      ripple: rippleFormation(),
      orb: orbFormation(),
    };

    // Current interpolated positions
    this.currentPositions = new Float32Array(PARTICLE_COUNT * 3);

    // Sizes — varying sizes for depth
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colorSeeds = new Float32Array(PARTICLE_COUNT);
    const lifetimes = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Larger size variance: tiny sparkles + medium dots + occasional big ones
      const sizeRoll = Math.random();
      if (sizeRoll < 0.6) sizes[i] = Math.random() * 0.8 + 0.2; // small sparkles
      else if (sizeRoll < 0.9) sizes[i] = Math.random() * 1.0 + 0.8; // medium
      else sizes[i] = Math.random() * 1.2 + 1.3; // larger glowy ones
      colorSeeds[i] = Math.random();
      lifetimes[i] = Math.random(); // for staggered animation
    }

    // Geometry
    this.geo = new THREE.BufferGeometry();
    this.posAttr = new THREE.BufferAttribute(this.currentPositions, 3);
    this.posAttr.setUsage(THREE.DynamicDrawUsage);
    this.geo.setAttribute('position', this.posAttr);
    this.geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.geo.setAttribute('aColorSeed', new THREE.BufferAttribute(colorSeeds, 1));
    this.geo.setAttribute('aLifetime', new THREE.BufferAttribute(lifetimes, 1));

    // Shader material — softer glow, color variation, not just white
    this.mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime:       { value: 0 },
        uOpacity:    { value: 0 },
        uColorA:     { value: new THREE.Color(0x9fc4e6) },
        uColorB:     { value: new THREE.Color(0xffffff) },
        uColorC:     { value: new THREE.Color(0xb7c4d0) },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      vertexShader: `
        attribute float aSize;
        attribute float aColorSeed;
        attribute float aLifetime;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vColorSeed;
        varying float vAlpha;
        void main() {
          vColorSeed = aColorSeed;
          vec3 pos = position;
          // Organic drift: each particle drifts uniquely
          float drift = aLifetime * 6.28;
          pos.y += sin(uTime * 0.3 + drift) * 0.12;
          pos.x += cos(uTime * 0.25 + drift * 1.3) * 0.08;
          pos.z += sin(uTime * 0.2 + drift * 0.7) * 0.06;
          vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * uPixelRatio * (60.0 / -mvPos.z);
          gl_Position = projectionMatrix * mvPos;
          // Distance-based fade
          vAlpha = smoothstep(60.0, 3.0, -mvPos.z);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        uniform float uOpacity;
        varying float vColorSeed;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          // Softer radial falloff (not hard edge)
          float glow = exp(-d * d * 14.0);
          float alpha = glow * uOpacity * vAlpha;
          // 3-color gradient based on seed
          vec3 col;
          if (vColorSeed < 0.4) {
            col = mix(uColorA, uColorB, vColorSeed / 0.4);
          } else if (vColorSeed < 0.8) {
            col = mix(uColorB, uColorA, (vColorSeed - 0.4) / 0.4);
          } else {
            col = mix(uColorA, uColorC, (vColorSeed - 0.8) / 0.2);
          }
          gl_FragColor = vec4(col, alpha);
        }
      `
    });

    this.points = new THREE.Points(this.geo, this.mat);
    this.points.position.set(0, 0, 0); // Will be synced to rock position in animate loop
    this.scene.add(this.points);

    // Start hidden
    this.mat.uniforms.uOpacity.value = 0;
  }

  // phase: 0=hidden, 1=explode, 2=node, 3=beam, 4=ripple, 5=orb
  update(t, phase, opacity, morphT) {
    this.mat.uniforms.uTime.value = t;
    this.mat.uniforms.uOpacity.value = opacity;

    if (phase === 0 || opacity < 0.01) return;

    const from = phase === 1 ? this.sourcePositions
               : phase === 2 ? this.explodePositions
               : phase === 3 ? this.formations.node
               : phase === 4 ? this.formations.beam
               :               this.formations.ripple;
    const target = phase === 1 ? this.explodePositions
                 : phase === 2 ? this.formations.node
                 : phase === 3 ? this.formations.beam
                 : phase === 4 ? this.formations.ripple
                 :               this.formations.orb;

    const eased = morphT * morphT * (3 - 2 * morphT);
    for (let i = 0; i < this.count * 3; i++) {
      this.currentPositions[i] = from[i] + (target[i] - from[i]) * eased;
    }
    this.posAttr.needsUpdate = true;
  }

  // Seed initial positions at rock location (tight cluster)
  seedFromRock(rockPos) {
    for (let i = 0; i < this.count; i++) {
      // Seed in a small sphere at rock center
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.random() * 0.3;
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      this.sourcePositions[i * 3] = x;
      this.sourcePositions[i * 3 + 1] = y;
      this.sourcePositions[i * 3 + 2] = z;
      this.currentPositions[i * 3] = x;
      this.currentPositions[i * 3 + 1] = y;
      this.currentPositions[i * 3 + 2] = z;
    }
    this.posAttr.needsUpdate = true;
  }

  seedFromObject(root) {
    if (!root) {
      this.seedFromRock();
      return;
    }

    root.updateMatrixWorld(true);
    const meshes = [];
    let totalVertices = 0;

    root.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;
      const pos = child.geometry.getAttribute('position');
      if (!pos?.count) return;
      totalVertices += pos.count;
      meshes.push({ mesh: child, position: pos, end: totalVertices });
    });

    if (!meshes.length || totalVertices === 0) {
      this.seedFromRock(root.position);
      return;
    }

    const sample = new THREE.Vector3();
    const dir = new THREE.Vector3();

    for (let i = 0; i < this.count; i++) {
      const pick = Math.floor(Math.random() * totalVertices);
      const source = meshes.find((entry) => pick < entry.end) || meshes[0];
      const prevEnd = meshes[meshes.indexOf(source) - 1]?.end || 0;
      const vertexIndex = pick - prevEnd;

      sample.fromBufferAttribute(source.position, vertexIndex);
      source.mesh.localToWorld(sample);
      sample.sub(root.position);

      this.sourcePositions[i * 3] = sample.x;
      this.sourcePositions[i * 3 + 1] = sample.y;
      this.sourcePositions[i * 3 + 2] = sample.z;
      this.currentPositions[i * 3] = sample.x;
      this.currentPositions[i * 3 + 1] = sample.y;
      this.currentPositions[i * 3 + 2] = sample.z;

      dir.copy(sample);
      if (dir.lengthSq() < 0.0001) {
        dir.set(Math.random() - 0.5, Math.random() + 0.2, Math.random() - 0.5);
      }
      dir.normalize();

      const layer = Math.random();
      const burst = layer < 0.35
        ? 0.45 + Math.random() * 0.75
        : layer < 0.75
          ? 1.0 + Math.random() * 1.8
          : 2.4 + Math.random() * 2.8;

      this.explodePositions[i * 3] = sample.x + dir.x * burst + (Math.random() - 0.5) * 0.35;
      this.explodePositions[i * 3 + 1] = sample.y + dir.y * burst + 0.65 + Math.random() * 1.2;
      this.explodePositions[i * 3 + 2] = sample.z + dir.z * burst + (Math.random() - 0.5) * 0.35;
    }

    this.posAttr.needsUpdate = true;
  }
}
