import { useEffect, useRef, useState } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

export type ShaderGradientVariant = 'default' | 'bonus' | 'projects';

type ShaderGradientSurfaceProps = {
  className?: string;
  grain?: 'on' | 'off';
  variant?: ShaderGradientVariant;
};

type AnimatedShaderPreset = {
  brightness: number;
  color1: string;
  color2: string;
  color3: string;
  envPreset: 'city' | 'dawn';
  reflection: number;
  uAmplitude: number;
  uDensity: number;
  uStrength: number;
};

const DEFAULT_SHADER_PRESET: AnimatedShaderPreset = {
  brightness: 1.2,
  color1: '#7a96a2',
  color2: '#acbbc4',
  color3: '#cde0ee',
  envPreset: 'city',
  reflection: 0.1,
  uAmplitude: 1,
  uDensity: 1,
  uStrength: 1.3,
};

const BONUS_SHADER_PRESET: AnimatedShaderPreset = {
  brightness: 1.2,
  color1: '#334762',
  color2: '#682b71',
  color3: '#e5b9a3',
  envPreset: 'dawn',
  reflection: 0,
  uAmplitude: 1.1,
  uDensity: 1.2,
  uStrength: 1.7,
};

const PROJECTS_SHADER_PRESET: AnimatedShaderPreset = {
  brightness: 1.08,
  color1: '#07101c',
  color2: '#263f5a',
  color3: '#b9cad8',
  envPreset: 'city',
  reflection: 0.04,
  uAmplitude: 1.16,
  uDensity: 1.16,
  uStrength: 1.62,
};

const SHADER_PRESET_TRANSITION_MS = 1100;
const SHADER_PRESET_SAMPLE_MS = 1000 / 24;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInOutCubic(value: number) {
  const clamped = clamp01(value);
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - (-2 * clamped + 2) ** 3 / 2;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const toHex = (value: number) => Math.round(value).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixNumber(from: number, to: number, progress: number) {
  return from + (to - from) * progress;
}

function mixHex(from: string, to: string, progress: number) {
  const fromRgb = hexToRgb(from);
  const toRgb = hexToRgb(to);
  return rgbToHex({
    r: mixNumber(fromRgb.r, toRgb.r, progress),
    g: mixNumber(fromRgb.g, toRgb.g, progress),
    b: mixNumber(fromRgb.b, toRgb.b, progress),
  });
}

function mixPreset(from: AnimatedShaderPreset, to: AnimatedShaderPreset, progress: number): AnimatedShaderPreset {
  const eased = easeInOutCubic(progress);
  return {
    brightness: mixNumber(from.brightness, to.brightness, eased),
    color1: mixHex(from.color1, to.color1, eased),
    color2: mixHex(from.color2, to.color2, eased),
    color3: mixHex(from.color3, to.color3, eased),
    envPreset: progress > 0.5 ? to.envPreset : from.envPreset,
    reflection: mixNumber(from.reflection, to.reflection, eased),
    uAmplitude: mixNumber(from.uAmplitude, to.uAmplitude, eased),
    uDensity: mixNumber(from.uDensity, to.uDensity, eased),
    uStrength: mixNumber(from.uStrength, to.uStrength, eased),
  };
}

function useReducedMotionPreference() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener('change', updatePreference);
    return () => mediaQuery.removeEventListener('change', updatePreference);
  }, []);

  return prefersReducedMotion;
}

function useAnimatedShaderPreset(variant: ShaderGradientVariant, prefersReducedMotion: boolean) {
  const currentPresetRef = useRef<AnimatedShaderPreset>(DEFAULT_SHADER_PRESET);
  const [preset, setPreset] = useState<AnimatedShaderPreset>(DEFAULT_SHADER_PRESET);

  useEffect(() => {
    const targetPreset =
      variant === 'bonus'
        ? BONUS_SHADER_PRESET
        : variant === 'projects'
          ? PROJECTS_SHADER_PRESET
          : DEFAULT_SHADER_PRESET;

    if (prefersReducedMotion) {
      currentPresetRef.current = targetPreset;
      setPreset(targetPreset);
      return undefined;
    }

    const fromPreset = currentPresetRef.current;
    const startedAt = performance.now();
    let lastSampleAt = 0;
    let frameId = 0;

    const tick = (now: number) => {
      const progress = clamp01((now - startedAt) / SHADER_PRESET_TRANSITION_MS);
      const shouldSample = lastSampleAt === 0 || now - lastSampleAt >= SHADER_PRESET_SAMPLE_MS || progress >= 1;

      if (shouldSample) {
        const nextPreset = mixPreset(fromPreset, targetPreset, progress);
        currentPresetRef.current = nextPreset;
        lastSampleAt = now;
        setPreset(nextPreset);
      }

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [prefersReducedMotion, variant]);

  return preset;
}

export function ShaderGradientFill({
  className = 'fixed inset-0 z-0 overflow-hidden bg-black',
  grain = 'on',
  variant = 'default',
}: ShaderGradientSurfaceProps) {
  const prefersReducedMotion = useReducedMotionPreference();
  const preset = useAnimatedShaderPreset(variant, prefersReducedMotion);

  return (
    <div
      className={`${className} shader-gradient-surface ${
        prefersReducedMotion ? 'shader-gradient-surface-static' : ''
      }`}
      data-shader-variant={variant}
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        <ShaderGradientCanvas
          fov={45}
          pixelDensity={1}
          pointerEvents="none"
          lazyLoad={false}
          preserveDrawingBuffer
          powerPreference="high-performance"
        >
          <ShaderGradient
            type="waterPlane"
            animate={prefersReducedMotion ? 'off' : 'on'}
            range="disabled"
            rangeStart={0}
            rangeEnd={40}
            axesHelper="off"
            color1={preset.color1}
            color2={preset.color2}
            color3={preset.color3}
            brightness={preset.brightness}
            destination="onCanvas"
            embedMode="off"
            format="gif"
            frameRate={10}
            gizmoHelper="hide"
            grain={grain}
            lightType="3d"
            envPreset={preset.envPreset}
            reflection={preset.reflection}
            uTime={0}
            uDensity={preset.uDensity}
            uStrength={preset.uStrength}
            uFrequency={5.5}
            uAmplitude={preset.uAmplitude}
            uSpeed={0.2}
            cAzimuthAngle={180}
            cPolarAngle={90}
            cDistance={3.6}
            cameraZoom={1}
            rotationX={0}
            rotationY={10}
            rotationZ={50}
            positionX={-1.4}
            positionY={0}
            positionZ={0}
            shader="defaults"
            wireframe={false}
          />
        </ShaderGradientCanvas>
      </div>
    </div>
  );
}

export function ShaderGradientBackground({ variant = 'default' }: { variant?: ShaderGradientVariant }) {
  return <ShaderGradientFill grain="on" variant={variant} />;
}
