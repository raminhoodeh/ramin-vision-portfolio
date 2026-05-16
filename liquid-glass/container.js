import SharedEngine from './SharedEngine.js';

export default class Container {
  static instances = []

  constructor(options = {}) {
    this.borderRadius = options.borderRadius || 16
    this.tintOpacity = options.tintOpacity !== undefined ? options.tintOpacity : 0.55
    this.blur = options.blur || 14.0

    this.canvas = null
    this.ctx = null
    this.element = null
    this.contentWrapper = null
    
    Container.instances.push(this)
    this._createElement()
  }

  _createElement() {
    this.element = document.createElement('div')
    this.element.className = 'glass-container'
    this.element.style.cssText = `
      position: relative;
      border-radius: ${this.borderRadius}px;
      overflow: hidden;
      background: transparent;
    `

    // Now a 2D canvas that receives frames from SharedEngine
    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
    `
    this.ctx = this.canvas.getContext('2d')

    this.contentWrapper = document.createElement('div')
    this.contentWrapper.className = 'glass-content-wrapper'
    this.contentWrapper.style.cssText = `
      position: relative;
      z-index: 1;
    `

    this.element.appendChild(this.canvas)
    this.element.appendChild(this.contentWrapper)

    requestAnimationFrame(() => this._boot())
  }

  _boot() {
    this._syncSize()
    
    // Ensure SharedEngine knows about the source canvas
    const src = document.getElementById('webgpu-canvas')
    if (src) SharedEngine.init(src)

    this._startLoop()
  }

  _syncSize() {
    const rect = this.element.getBoundingClientRect()
    const w = Math.max(Math.ceil(rect.width), 1)
    const h = Math.max(Math.ceil(rect.height), 1)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  _startLoop() {
    const tick = () => {
      if (this.element.isConnected) {
        this._render()
        requestAnimationFrame(tick)
      }
    }
    requestAnimationFrame(tick)
  }

  _render() {
    const rect = this.element.getBoundingClientRect()
    
    // Only render if visible in viewport to save performance
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    this._syncSize()
    SharedEngine.render(this.ctx, rect, {
      borderRadius: this.borderRadius,
      tintOpacity: this.tintOpacity,
      blur: this.blur
    })
  }
}
