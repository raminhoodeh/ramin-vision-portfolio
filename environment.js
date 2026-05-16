// ═══════════════════════════════════════════════════════
//  environment.js — Per-section 3D environment transitions
//  Swaps lighting, fog, sky, water, and particle colors
//  via GSAP ScrollTrigger for each section.
// ═══════════════════════════════════════════════════════
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ──────────────────────────────────────────
//  7 environment presets — one per section
// ──────────────────────────────────────────
const ENVIRONMENTS = [
  // 0 — Hero: white-silver dawn
  {
    skyTop:    new THREE.Color(0xf8fbff),
    skyBottom: new THREE.Color(0xbfd7ee),
    fog:       { color: new THREE.Color(0xdceaf6), density: 0.006 },
    water:     { color: new THREE.Color(0x9fbfdc), sunColor: 0xffffff },
    ambient:   { color: new THREE.Color(0xf4f8ff), intensity: 1.5 },
    dir:       { color: new THREE.Color(0xffffff), intensity: 4.6 },
    point:     { color: new THREE.Color(0xb8d7f4), intensity: 4.2 },
    rim:       { color: new THREE.Color(0xffffff), intensity: 2.6 },
    under:     { color: new THREE.Color(0x95b7d8), intensity: 2.2 },
    particleColor: new THREE.Color(0x9fc4e6),
    toneExposure: 1.08,
  },
  // 1 — Experience: crisp silver-blue
  {
    skyTop:    new THREE.Color(0xf6f9fd),
    skyBottom: new THREE.Color(0xc7d8e8),
    fog:       { color: new THREE.Color(0xe5eef6), density: 0.008 },
    water:     { color: new THREE.Color(0xa9c3d8), sunColor: 0xf4fbff },
    ambient:   { color: new THREE.Color(0xf5f8fc), intensity: 1.35 },
    dir:       { color: new THREE.Color(0xffffff), intensity: 4.0 },
    point:     { color: new THREE.Color(0x9ec8ec), intensity: 3.8 },
    rim:       { color: new THREE.Color(0xddeeff), intensity: 2.2 },
    under:     { color: new THREE.Color(0x8db2d2), intensity: 2.0 },
    particleColor: new THREE.Color(0x9ebbd4),
    toneExposure: 1.0,
  },
  // 2 — Selfware / Projects: pale opal blue
  {
    skyTop:    new THREE.Color(0xffffff),
    skyBottom: new THREE.Color(0xcfe5f3),
    fog:       { color: new THREE.Color(0xe8f3f8), density: 0.008 },
    water:     { color: new THREE.Color(0xb4cbda), sunColor: 0xffffff },
    ambient:   { color: new THREE.Color(0xf8fbff), intensity: 1.35 },
    dir:       { color: new THREE.Color(0xfaffff), intensity: 3.8 },
    point:     { color: new THREE.Color(0xb0d8ea), intensity: 4.0 },
    rim:       { color: new THREE.Color(0xffffff), intensity: 2.0 },
    under:     { color: new THREE.Color(0x94bac9), intensity: 2.0 },
    particleColor: new THREE.Color(0xa9d4e8),
    toneExposure: 1.0,
  },
  // 3 — Qualifications: clean pearl-cyan
  {
    skyTop:    new THREE.Color(0xf9fdff),
    skyBottom: new THREE.Color(0xcce7e9),
    fog:       { color: new THREE.Color(0xe8f5f5), density: 0.008 },
    water:     { color: new THREE.Color(0xaed0d4), sunColor: 0xffffff },
    ambient:   { color: new THREE.Color(0xf8ffff), intensity: 1.3 },
    dir:       { color: new THREE.Color(0xffffff), intensity: 3.7 },
    point:     { color: new THREE.Color(0x9fd3d8), intensity: 3.8 },
    rim:       { color: new THREE.Color(0xeaffff), intensity: 1.9 },
    under:     { color: new THREE.Color(0x8fbcc0), intensity: 2.0 },
    particleColor: new THREE.Color(0x9bcbd0),
    toneExposure: 0.98,
  },
  // 4 — Tools: polished steel
  {
    skyTop:    new THREE.Color(0xf7f9fb),
    skyBottom: new THREE.Color(0xc8d3df),
    fog:       { color: new THREE.Color(0xe1e8ef), density: 0.009 },
    water:     { color: new THREE.Color(0xa7b7c8), sunColor: 0xf9fcff },
    ambient:   { color: new THREE.Color(0xf6f8fb), intensity: 1.25 },
    dir:       { color: new THREE.Color(0xffffff), intensity: 3.6 },
    point:     { color: new THREE.Color(0xb5c8db), intensity: 3.7 },
    rim:       { color: new THREE.Color(0xffffff), intensity: 1.8 },
    under:     { color: new THREE.Color(0x8fa3b8), intensity: 1.9 },
    particleColor: new THREE.Color(0xb5c6d6),
    toneExposure: 0.96,
  },
  // 5 — Teaching: warm white
  {
    skyTop:    new THREE.Color(0xffffff),
    skyBottom: new THREE.Color(0xd7e1e8),
    fog:       { color: new THREE.Color(0xf1f4f6), density: 0.008 },
    water:     { color: new THREE.Color(0xb8c5cf), sunColor: 0xffffff },
    ambient:   { color: new THREE.Color(0xffffff), intensity: 1.3 },
    dir:       { color: new THREE.Color(0xffffff), intensity: 3.7 },
    point:     { color: new THREE.Color(0xc5d1dc), intensity: 3.6 },
    rim:       { color: new THREE.Color(0xffffff), intensity: 1.8 },
    under:     { color: new THREE.Color(0xa3b3c0), intensity: 1.8 },
    particleColor: new THREE.Color(0xc2ced8),
    toneExposure: 1.0,
  },
  // 6 — AI Ramin / Chatbot: clear silver focus
  {
    skyTop:    new THREE.Color(0xf8fbff),
    skyBottom: new THREE.Color(0xd4dde6),
    fog:       { color: new THREE.Color(0xe9eef4), density: 0.009 },
    water:     { color: new THREE.Color(0xb3c0cd), sunColor: 0xffffff },
    ambient:   { color: new THREE.Color(0xf8fbff), intensity: 1.15 },
    dir:       { color: new THREE.Color(0xffffff), intensity: 3.2 },
    point:     { color: new THREE.Color(0xb2c8dc), intensity: 3.2 },
    rim:       { color: new THREE.Color(0xffffff), intensity: 1.6 },
    under:     { color: new THREE.Color(0x93aabc), intensity: 1.6 },
    particleColor: new THREE.Color(0xb8c8d8),
    toneExposure: 0.94,
  },
];

// ──────────────────────────────────────────
//  Transition Setup
// ──────────────────────────────────────────
// References object shape:
//   { scene, renderer, skyMat, dirLight, ambLight, pointLight, rimLight, underLight, water, ambientParticles }

export function setupEnvironmentTransitions(refs) {
  const sections = document.querySelectorAll('.section');

  sections.forEach((section, i) => {
    if (i >= ENVIRONMENTS.length) return;
    const env = ENVIRONMENTS[i];

    // Convert sunColor hex to RGB for tweening
    const sunCol = new THREE.Color(env.water.sunColor);
    const proxy = {
      skyTopR: env.skyTop.r, skyTopG: env.skyTop.g, skyTopB: env.skyTop.b,
      skyBotR: env.skyBottom.r, skyBotG: env.skyBottom.g, skyBotB: env.skyBottom.b,
      fogR: env.fog.color.r, fogG: env.fog.color.g, fogB: env.fog.color.b,
      fogDensity: env.fog.density,
      waterR: env.water.color.r, waterG: env.water.color.g, waterB: env.water.color.b,
      sunR: sunCol.r, sunG: sunCol.g, sunB: sunCol.b,
      ambR: env.ambient.color.r, ambG: env.ambient.color.g, ambB: env.ambient.color.b,
      ambI: env.ambient.intensity,
      dirR: env.dir.color.r, dirG: env.dir.color.g, dirB: env.dir.color.b,
      dirI: env.dir.intensity,
      ptR: env.point.color.r, ptG: env.point.color.g, ptB: env.point.color.b,
      ptI: env.point.intensity,
      rimR: env.rim.color.r, rimG: env.rim.color.g, rimB: env.rim.color.b,
      rimI: env.rim.intensity,
      undR: env.under.color.r, undG: env.under.color.g, undB: env.under.color.b,
      undI: env.under.intensity,
      pclR: env.particleColor.r, pclG: env.particleColor.g, pclB: env.particleColor.b,
      toneExposure: env.toneExposure,
    };

    gsap.to(proxy, {
      skyTopR: env.skyTop.r, skyTopG: env.skyTop.g, skyTopB: env.skyTop.b,
      skyBotR: env.skyBottom.r, skyBotG: env.skyBottom.g, skyBotB: env.skyBottom.b,
      fogR: env.fog.color.r, fogG: env.fog.color.g, fogB: env.fog.color.b,
      fogDensity: env.fog.density,
      waterR: env.water.color.r, waterG: env.water.color.g, waterB: env.water.color.b,
      sunR: sunCol.r, sunG: sunCol.g, sunB: sunCol.b,
      ambR: env.ambient.color.r, ambG: env.ambient.color.g, ambB: env.ambient.color.b,
      ambI: env.ambient.intensity,
      dirR: env.dir.color.r, dirG: env.dir.color.g, dirB: env.dir.color.b,
      dirI: env.dir.intensity,
      ptR: env.point.color.r, ptG: env.point.color.g, ptB: env.point.color.b,
      ptI: env.point.intensity,
      rimR: env.rim.color.r, rimG: env.rim.color.g, rimB: env.rim.color.b,
      rimI: env.rim.intensity,
      undR: env.under.color.r, undG: env.under.color.g, undB: env.under.color.b,
      undI: env.under.intensity,
      pclR: env.particleColor.r, pclG: env.particleColor.g, pclB: env.particleColor.b,
      toneExposure: env.toneExposure,

      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'top top',
        scrub: 1.5,
      },

      onUpdate: () => {
        // Sky gradient
        if (refs.skyMat) {
          refs.skyMat.uniforms.topColor.value.setRGB(proxy.skyTopR, proxy.skyTopG, proxy.skyTopB);
          refs.skyMat.uniforms.bottomColor.value.setRGB(proxy.skyBotR, proxy.skyBotG, proxy.skyBotB);
        }

        // Fog
        if (refs.scene?.fog) {
          refs.scene.fog.color.setRGB(proxy.fogR, proxy.fogG, proxy.fogB);
          refs.scene.fog.density = proxy.fogDensity;
        }

        // Lights
        if (refs.ambLight) {
          refs.ambLight.color.setRGB(proxy.ambR, proxy.ambG, proxy.ambB);
          refs.ambLight.intensity = proxy.ambI;
        }
        if (refs.dirLight) {
          refs.dirLight.color.setRGB(proxy.dirR, proxy.dirG, proxy.dirB);
          refs.dirLight.intensity = proxy.dirI;
        }
        if (refs.pointLight) {
          refs.pointLight.color.setRGB(proxy.ptR, proxy.ptG, proxy.ptB);
          refs.pointLight.intensity = proxy.ptI;
        }
        if (refs.rimLight) {
          refs.rimLight.color.setRGB(proxy.rimR, proxy.rimG, proxy.rimB);
          refs.rimLight.intensity = proxy.rimI;
        }
        if (refs.underLight) {
          refs.underLight.color.setRGB(proxy.undR, proxy.undG, proxy.undB);
          refs.underLight.intensity = proxy.undI;
        }

        // Water — use dedicated water color, not fog
        if (refs.water?.material?.uniforms?.waterColor) {
          refs.water.material.uniforms.waterColor.value.setRGB(
            proxy.waterR, proxy.waterG, proxy.waterB
          );
        }
        // Water sunColor (specular highlight colour)
        if (refs.water?.material?.uniforms?.sunColor) {
          refs.water.material.uniforms.sunColor.value.setRGB(
            proxy.sunR, proxy.sunG, proxy.sunB
          );
        }

        // Ambient particles color
        if (refs.ambientParticles?.material?.uniforms?.uColor) {
          refs.ambientParticles.material.uniforms.uColor.value.setRGB(proxy.pclR, proxy.pclG, proxy.pclB);
        }

        // Tone mapping exposure
        if (refs.renderer) {
          refs.renderer.toneMappingExposure = proxy.toneExposure;
        }
      }
    });
  });
}

export { ENVIRONMENTS };
