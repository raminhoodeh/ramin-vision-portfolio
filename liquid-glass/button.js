import Container from './container.js';

export default class Button extends Container {
  constructor(options = {}) {
    const fontSize = parseInt(options.size) || 16
    const tintOpacity = options.tintOpacity !== undefined ? options.tintOpacity : 0.7

    super({
      borderRadius: options.borderRadius || 24,
      tintOpacity: tintOpacity,
      blur: options.blur || 12.0
    })

    this.element.classList.add('glass-button')
    if (options.type === 'circle') {
      this.element.classList.add('glass-button-circle')
    }
  }

  // Button-specific sizing logic if needed
  // But most buttons now just take size from contentWrapper padding
}
