import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

type LiquidGlassNavShellProps = {
  children: ReactNode;
  className?: string;
};

type GlassRefs = {
  program: WebGLProgram;
  texture: WebGLTexture;
  positionBuffer: WebGLBuffer;
  texcoordBuffer: WebGLBuffer;
  aPosition: number;
  aTexcoord: number;
  uImage: WebGLUniformLocation;
  uResolution: WebGLUniformLocation;
  uTextureSize: WebGLUniformLocation;
  uOrigin: WebGLUniformLocation;
  uBorderRadius: WebGLUniformLocation;
  uEdgeIntensity: WebGLUniformLocation;
  uRimIntensity: WebGLUniformLocation;
  uBlurRadius: WebGLUniformLocation;
  uTintOpacity: WebGLUniformLocation;
};

const vertexShader = `
  attribute vec2 a_position;
  attribute vec2 a_texcoord;
  varying vec2 v_texcoord;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texcoord = a_texcoord;
  }
`;

const fragmentShader = `
  precision mediump float;

  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform vec2 u_textureSize;
  uniform vec2 u_origin;
  uniform float u_borderRadius;
  uniform float u_edgeIntensity;
  uniform float u_rimIntensity;
  uniform float u_blurRadius;
  uniform float u_tintOpacity;
  varying vec2 v_texcoord;

  float roundedRectDistance(vec2 coord, vec2 size, float radius) {
    vec2 center = size * 0.5;
    vec2 pixelCoord = coord * size;
    vec2 q = abs(pixelCoord - center) - (center - radius);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
  }

  void main() {
    vec2 px = v_texcoord * u_resolution;
    vec2 screenPx = u_origin + px;
    vec2 texCoord = vec2(screenPx.x / u_textureSize.x, screenPx.y / u_textureSize.y);

    vec2 center = vec2(0.5);
    vec2 fromCenter = v_texcoord - center;
    vec2 normal = length(fromCenter) > 0.001 ? normalize(fromCenter) : vec2(0.0, 1.0);

    float inside = -roundedRectDistance(v_texcoord, u_resolution, u_borderRadius);
    float dist = max(inside, 0.0);
    float edge = exp(-dist * 0.16);
    float rim = exp(-dist * 0.42);
    float ripple = sin(dist * 0.62) * 0.003 * rim;

    vec2 refract = normal * edge * u_edgeIntensity + vec2(-normal.y, normal.x) * ripple;
    vec2 sampleCoord = clamp(texCoord + refract, vec2(0.001), vec2(0.999));

    vec4 color = vec4(0.0);
    float total = 0.0;
    vec2 texel = vec2(u_blurRadius) / u_textureSize;

    for (int x = -3; x <= 3; x++) {
      for (int y = -3; y <= 3; y++) {
        vec2 offset = vec2(float(x), float(y));
        float weight = exp(-dot(offset, offset) / 8.0);
        color += texture2D(u_image, sampleCoord + offset * texel) * weight;
        total += weight;
      }
    }

    color /= total;

    vec3 coolTint = mix(vec3(0.02, 0.025, 0.032), vec3(0.12, 0.16, 0.20), v_texcoord.y);
    color.rgb = mix(color.rgb, coolTint, u_tintOpacity);
    color.rgb += rim * u_rimIntensity * vec3(0.42, 0.58, 0.78);

    float mask = 1.0 - smoothstep(-1.0, 1.0, roundedRectDistance(v_texcoord, u_resolution, u_borderRadius));
    gl_FragColor = vec4(color.rgb, mask * 0.92);
  }
`;

function getUniform(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
  const location = gl.getUniformLocation(program, name);
  if (!location) throw new Error(`Missing uniform ${name}`);
  return location;
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? 'Shader compile failed');
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create WebGL program');

  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) ?? 'Program link failed');
  }

  return program;
}

function init(gl: WebGLRenderingContext): GlassRefs {
  const program = createProgram(gl);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  const texcoordBuffer = gl.createBuffer();
  const texture = gl.createTexture();

  if (!positionBuffer || !texcoordBuffer || !texture) {
    throw new Error('Unable to create WebGL buffers');
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0]),
    gl.STATIC_DRAW,
  );

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  return {
    program,
    texture,
    positionBuffer,
    texcoordBuffer,
    aPosition: gl.getAttribLocation(program, 'a_position'),
    aTexcoord: gl.getAttribLocation(program, 'a_texcoord'),
    uImage: getUniform(gl, program, 'u_image'),
    uResolution: getUniform(gl, program, 'u_resolution'),
    uTextureSize: getUniform(gl, program, 'u_textureSize'),
    uOrigin: getUniform(gl, program, 'u_origin'),
    uBorderRadius: getUniform(gl, program, 'u_borderRadius'),
    uEdgeIntensity: getUniform(gl, program, 'u_edgeIntensity'),
    uRimIntensity: getUniform(gl, program, 'u_rimIntensity'),
    uBlurRadius: getUniform(gl, program, 'u_blurRadius'),
    uTintOpacity: getUniform(gl, program, 'u_tintOpacity'),
  };
}

export function LiquidGlassNavShell({ children, className = '' }: LiquidGlassNavShellProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const refsRef = useRef<GlassRefs | null>(null);
  const snapshotRef = useRef<HTMLCanvasElement | null>(null);
  const captureTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    const gl = canvas?.getContext('webgl', { alpha: true, preserveDrawingBuffer: true });
    if (!canvas || !root || !gl) return undefined;

    try {
      refsRef.current = init(gl);
    } catch (error) {
      console.warn('Liquid glass nav disabled:', error);
      return undefined;
    }

    const render = () => {
      const refs = refsRef.current;
      const snapshot = snapshotRef.current;
      if (!refs || !snapshot || !root.isConnected) return;

      const rect = root.getBoundingClientRect();
      const width = Math.max(Math.round(rect.width), 1);
      const height = Math.max(Math.round(rect.height), 1);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const targetWidth = Math.max(Math.round(width * dpr), 1);
      const targetHeight = Math.max(Math.round(height * dpr), 1);

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      gl.useProgram(refs.program);
      gl.viewport(0, 0, targetWidth, targetHeight);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.bindTexture(gl.TEXTURE_2D, refs.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, snapshot);

      gl.bindBuffer(gl.ARRAY_BUFFER, refs.positionBuffer);
      gl.enableVertexAttribArray(refs.aPosition);
      gl.vertexAttribPointer(refs.aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, refs.texcoordBuffer);
      gl.enableVertexAttribArray(refs.aTexcoord);
      gl.vertexAttribPointer(refs.aTexcoord, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1i(refs.uImage, 0);
      gl.uniform2f(refs.uResolution, targetWidth, targetHeight);
      gl.uniform2f(refs.uTextureSize, snapshot.width, snapshot.height);
      gl.uniform2f(refs.uOrigin, rect.left * dpr, rect.top * dpr);
      gl.uniform1f(refs.uBorderRadius, (height * dpr) / 2);
      gl.uniform1f(refs.uEdgeIntensity, 0.018);
      gl.uniform1f(refs.uRimIntensity, 0.08);
      gl.uniform1f(refs.uBlurRadius, 5.0);
      gl.uniform1f(refs.uTintOpacity, 0.48);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const drawLiveMediaSnapshot = () => {
      const rect = root.getBoundingClientRect();
      const navCenterX = rect.left + rect.width / 2;
      const navCenterY = rect.top + rect.height / 2;
      const media = Array.from(
        document.querySelectorAll<HTMLVideoElement | HTMLImageElement | HTMLCanvasElement>(
          '[data-glass-media], #gradientCanvas',
        ),
      ).find((element) => {
        const mediaRect = element.getBoundingClientRect();
        const isVisible =
          mediaRect.width > 0 &&
          mediaRect.height > 0 &&
          mediaRect.bottom >= 0 &&
          mediaRect.top <= window.innerHeight;
        const coversNav =
          navCenterX >= mediaRect.left &&
          navCenterX <= mediaRect.right &&
          navCenterY >= mediaRect.top &&
          navCenterY <= mediaRect.bottom;

        return isVisible && coversNav;
      });

      if (!media) return false;
      if (media instanceof HTMLVideoElement && media.readyState < 2) return false;
      if (media instanceof HTMLImageElement && !media.complete) return false;
      if (media instanceof HTMLCanvasElement && (media.width === 0 || media.height === 0)) return false;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(Math.round(window.innerWidth * dpr), 1);
      const height = Math.max(Math.round(window.innerHeight * dpr), 1);
      const snapshot = snapshotRef.current ?? document.createElement('canvas');
      const ctx = snapshot.getContext('2d');
      if (!ctx) return false;

      if (snapshot.width !== width || snapshot.height !== height) {
        snapshot.width = width;
        snapshot.height = height;
      }

      const mediaRect = media.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgb(8, 8, 8)';
      ctx.fillRect(0, 0, width, height);

      try {
        ctx.drawImage(
          media,
          mediaRect.left * dpr,
          mediaRect.top * dpr,
          mediaRect.width * dpr,
          mediaRect.height * dpr,
        );
      } catch {
        return false;
      }

      snapshotRef.current = snapshot;
      return true;
    };

    const capture = () => {
      if (drawLiveMediaSnapshot()) {
        render();
      }
    };

    const scheduleCapture = () => {
      if (captureTimerRef.current) window.clearTimeout(captureTimerRef.current);
      captureTimerRef.current = window.setTimeout(() => {
        capture();
      }, 180);
    };

    capture();

    const tick = () => {
      if (drawLiveMediaSnapshot()) render();
      rafRef.current = window.setTimeout(() => {
        rafRef.current = requestAnimationFrame(tick);
      }, 80);
    };

    rafRef.current = requestAnimationFrame(tick);

    window.addEventListener('resize', scheduleCapture);
    window.addEventListener('scroll', scheduleCapture, { passive: true });
    window.addEventListener('load', scheduleCapture);

    return () => {
      window.removeEventListener('resize', scheduleCapture);
      window.removeEventListener('scroll', scheduleCapture);
      window.removeEventListener('load', scheduleCapture);
      if (captureTimerRef.current) window.clearTimeout(captureTimerRef.current);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        window.clearTimeout(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={rootRef}
      data-glass-ignore
      className={`relative overflow-hidden rounded-full border border-white/70 bg-white/70 shadow-[0_16px_44px_rgba(55,80,108,0.18)] backdrop-blur-md ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-90"
      />
      <div className="relative z-10 inline-flex items-center px-2 py-2">{children}</div>
    </div>
  );
}
