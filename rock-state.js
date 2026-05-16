// ═══════════════════════════════════════════════════════
//  rock-state.js — Scroll-driven rock state machine
//  States: IDLE → WARMING → GLOWING → EXPLODING → DISSOLVED
//  Driven by global scroll progress (0→1).
// ═══════════════════════════════════════════════════════
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const ROCK_STATES = {
  IDLE:      0,
  WARMING:   1,
  GLOWING:   2,
  EXPLODING: 3,
  DISSOLVED: 4,
};

export class RockStateMachine {
  constructor(rockModel, rockMaterial) {
    this.rock = rockModel;
    this.material = rockMaterial;
    this.state = ROCK_STATES.IDLE;
    this.progress = 0; // 0→1 global scroll progress
    this.opacity = 1;
    this.scale = 1.0;
    this.emissiveIntensity = 1.35;
    this.pulsePhase = 0;

    // Store original vertex positions for explosion later
    this._originalPositions = null;
    this._extractVertices();
  }

  _extractVertices() {
    if (!this.rock) return;
    this.rock.traverse((child) => {
      if (child.isMesh && child.geometry && !this._originalPositions) {
        const pos = child.geometry.getAttribute('position');
        if (pos) {
          this._originalPositions = new Float32Array(pos.array);
          this._mesh = child;
        }
      }
    });
  }

  /**
   * Returns extracted vertex positions for particle seeding.
   * @returns {Float32Array|null}
   */
  getVertexPositions() {
    return this._originalPositions;
  }

  /**
   * Update state from scroll progress (0→1).
   * Call this every frame or on scroll.
   */
  updateFromScroll(progress) {
    this.progress = progress;

    // State thresholds
    if (progress < 0.15) {
      this.state = ROCK_STATES.IDLE;
    } else if (progress < 0.28) {
      this.state = ROCK_STATES.WARMING;
    } else if (progress < 0.42) {
      this.state = ROCK_STATES.GLOWING;
    } else if (progress < 0.55) {
      this.state = ROCK_STATES.EXPLODING;
    } else {
      this.state = ROCK_STATES.DISSOLVED;
    }
  }

  /**
   * Apply visual state to rock model each frame.
   * @param {number} time - elapsed time for pulse animation
   */
  applyState(time) {
    if (!this.rock || !this.material) return;

    switch (this.state) {
      case ROCK_STATES.IDLE:
        this.emissiveIntensity = THREE.MathUtils.lerp(this.emissiveIntensity, 1.35, 0.03);
        this.scale = THREE.MathUtils.lerp(this.scale, 1.0, 0.03);
        this.opacity = 1;
        break;

      case ROCK_STATES.WARMING: {
        const wP = THREE.MathUtils.clamp((this.progress - 0.15) / 0.13, 0, 1);
        this.emissiveIntensity = THREE.MathUtils.lerp(1.35, 2.0, wP);
        this.pulsePhase += 0.02;
        this.emissiveIntensity += Math.sin(this.pulsePhase * 3 + time * 2) * 0.12 * wP;
        this.scale = THREE.MathUtils.lerp(this.scale, 1.0, 0.03);
        this.opacity = 1;
        break;
      }

      case ROCK_STATES.GLOWING: {
        const gP = THREE.MathUtils.clamp((this.progress - 0.28) / 0.14, 0, 1);
        this.emissiveIntensity = THREE.MathUtils.lerp(2.0, 2.8, gP);
        this.pulsePhase += 0.03;
        this.emissiveIntensity += Math.sin(this.pulsePhase * 5 + time * 3) * 0.16;
        this.scale = THREE.MathUtils.lerp(1.0, 1.06, gP);
        this.opacity = 1;
        break;
      }

      case ROCK_STATES.EXPLODING: {
        const eP = THREE.MathUtils.clamp((this.progress - 0.42) / 0.13, 0, 1);
        this.emissiveIntensity = THREE.MathUtils.lerp(2.8, 3.4, eP * 0.3);
        // Fast shrink + fade — rock should disappear quickly
        this.scale = THREE.MathUtils.lerp(1.06, 0.15, eP * eP);
        this.opacity = THREE.MathUtils.lerp(1, 0, eP * eP);
        break;
      }

      case ROCK_STATES.DISSOLVED:
        this.emissiveIntensity = 0;
        this.opacity = 0;
        this.scale = 0.01;
        break;
    }

    // Apply to model
    this.material.emissiveIntensity = this.emissiveIntensity;
    this.material.opacity = this.opacity;
    this.material.transparent = this.opacity < 1;

    if (this.rock) {
      const s = this.scale;
      this.rock.scale.set(s * 1.3, s * 1.3, s * 1.3); // 1.3 is the base scale from main.js
      this.rock.visible = this.opacity > 0.01;
    }
  }

  /**
   * @returns {boolean} true if rock has exploded and particles should be visible
   */
  isExploded() {
    return this.state >= ROCK_STATES.EXPLODING;
  }

  /**
   * @returns {boolean} true if rock is fully dissolved
   */
  isDissolved() {
    return this.state === ROCK_STATES.DISSOLVED;
  }

  /**
   * @returns {number} 0→1 explosion progress (0 = just started, 1 = fully dissolved)
   */
  getExplosionProgress() {
    if (this.state === ROCK_STATES.EXPLODING) {
      return THREE.MathUtils.clamp((this.progress - 0.42) / 0.13, 0, 1);
    }
    if (this.state === ROCK_STATES.DISSOLVED) return 1;
    return 0;
  }
}
