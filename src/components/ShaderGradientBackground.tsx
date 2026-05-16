import { useEffect, useState } from 'react';
import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

type ShaderGradientSurfaceProps = {
  className?: string;
  grain?: 'on' | 'off';
};

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

export function ShaderGradientFill({
  className = 'fixed inset-0 z-0 overflow-hidden bg-black',
  grain = 'on',
}: ShaderGradientSurfaceProps) {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <div
      className={`${className} shader-gradient-surface ${
        prefersReducedMotion ? 'shader-gradient-surface-static' : ''
      }`}
      aria-hidden="true"
    >
      <div className="absolute inset-0">
        <ShaderGradientCanvas
          fov={45}
          pixelDensity={1.1}
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
            color1="#7a96a2"
            color2="#acbbc4"
            color3="#cde0ee"
            brightness={1.2}
            grain={grain}
            lightType="3d"
            envPreset="city"
            reflection={0.1}
            uTime={0}
            uDensity={1}
            uStrength={1.3}
            uFrequency={5.5}
            uAmplitude={1}
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

export function ShaderGradientBackground() {
  return <ShaderGradientFill grain="on" />;
}
