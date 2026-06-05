/**
 * SharedEngine.js
 * Manages a single WebGL context used by all Liquid Glass elements.
 * This prevents context exhaustion (browsers limit to ~16 contexts).
 */

class SharedEngine {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl', { 
      alpha: true, 
      premultipliedAlpha: false,
      preserveDrawingBuffer: true 
    });
    
    this.program = null;
    this.refs = {};
    this.initialized = false;
    this.sourceCanvas = null;
  }

  init(sourceCanvas) {
    if (this.initialized) return;
    this.sourceCanvas = sourceCanvas;
    this._setupShader();
    this.initialized = true;
    console.log('🚀 LiquidGlass Shared Engine Initialized');
  }

  _setupShader() {
    const gl = this.gl;
    const vert = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = a_pos * 0.5 + 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const frag = `
      precision mediump float;
      uniform sampler2D u_scene;
      uniform vec2 u_resolution;
      uniform vec2 u_sceneSize;
      uniform vec2 u_origin;
      uniform float u_blur;
      uniform float u_borderRadius;
      uniform float u_tintOpacity;
      varying vec2 v_uv;

      float rrDist(vec2 p, vec2 halfSize, float r) {
        vec2 q = abs(p) - halfSize + r;
        return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      }

      void main() {
        vec2 px = v_uv * u_resolution;
        vec2 screenPx = u_origin + px;
        vec2 sceneTc = vec2(screenPx.x / u_sceneSize.x, 1.0 - screenPx.y / u_sceneSize.y);

        // Clamped refraction to prevent edge-clipping
        vec2 centre = vec2(0.5);
        vec2 fromCentre = v_uv - centre;
        float edgeFactor = length(fromCentre) * 2.0;
        vec2 refract = fromCentre * edgeFactor * 0.015;
        vec2 tc = clamp(sceneTc + refract, 0.001, 0.999);

        // Optimized Gaussian blur
        vec4 color = vec4(0.0);
        float total = 0.0;
        vec2 texel = u_blur / u_sceneSize;
        for (int ix = -2; ix <= 2; ix++) {
          for (int iy = -2; iy <= 2; iy++) {
            float fx = float(ix);
            float fy = float(iy);
            float w = exp(-(fx*fx + fy*fy) / 4.0);
            color += texture2D(u_scene, tc + vec2(fx, fy) * texel) * w;
            total += w;
          }
        }
        color /= total;

        // Pearl glass tint for the bright portfolio theme.
        vec3 tint = mix(vec3(0.90, 0.94, 0.98), vec3(1.0, 1.0, 1.0), v_uv.y);
        color.rgb = mix(color.rgb, tint, u_tintOpacity);
        color.rgb += vec3(0.035, 0.045, 0.055);

        // Improved Rim Highlight (softer)
        float d = -rrDist(px - u_resolution * 0.5, u_resolution * 0.5, u_borderRadius);
        float rim = smoothstep(0.0, 3.0, d) * (1.0 - smoothstep(3.0, 10.0, d));
        color.rgb += rim * vec3(0.22, 0.26, 0.30);

        // Mask
        float sdf = rrDist(px - u_resolution * 0.5, u_resolution * 0.5, u_borderRadius);
        float mask = 1.0 - smoothstep(-0.5, 0.5, sdf);

        gl_FragColor = vec4(color.rgb, mask);
      }
    `;

    this.program = this._buildProgram(gl, vert, frag);
    gl.useProgram(this.program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (n) => gl.getUniformLocation(this.program, n);
    this.refs = {
      u_scene: u('u_scene'),
      u_resolution: u('u_resolution'),
      u_sceneSize: u('u_sceneSize'),
      u_origin: u('u_origin'),
      u_blur: u('u_blur'),
      u_borderRadius: u('u_borderRadius'),
      u_tintOpacity: u('u_tintOpacity'),
      tex: gl.createTexture()
    };

    gl.bindTexture(gl.TEXTURE_2D, this.refs.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  render(targetCtx, rect, options) {
    if (!this.initialized || !this.sourceCanvas) return;
    const gl = this.gl;
    const { refs, program } = this;

    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    if (w <= 0 || h <= 0) return;

    // Resize internal canvas to match target if needed
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }

    gl.useProgram(program);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Upload source texture once per frame (ideally)
    // For now we do it per render, but we could optimize later
    gl.bindTexture(gl.TEXTURE_2D, refs.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.sourceCanvas);

    gl.uniform2f(refs.u_resolution, w, h);
    gl.uniform2f(refs.u_sceneSize, this.sourceCanvas.width, this.sourceCanvas.height);
    gl.uniform2f(refs.u_origin, rect.left, rect.top);
    gl.uniform1f(refs.u_blur, options.blur || 14.0);
    gl.uniform1f(refs.u_borderRadius, options.borderRadius || 16.0);
    gl.uniform1f(refs.u_tintOpacity, options.tintOpacity || 0.55);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // Copy result to the target 2D canvas
    targetCtx.clearRect(0, 0, w, h);
    targetCtx.drawImage(this.canvas, 0, 0);
  }

  _buildProgram(gl, vsrc, fsrc) {
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('SharedEngine shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vsrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsrc);
    if (!vs || !fs) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    return prog;
  }
}

export default new SharedEngine();
