import Container from './container.js';

export function applyLiquidGlass() {
  // Give DOM a full render cycle to settle layout
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      _replaceCards('.timeline-card', 8)
      _replaceCards('.project-card', 8)
      _replaceCards('.teaching-card', 8)
    })
  })
}

function _replaceCards(selector, borderRadius) {
  document.querySelectorAll(selector).forEach(card => {
    // Skip if already converted
    if (card.dataset.glassApplied) return
    card.dataset.glassApplied = 'true'

    // Build container
    const container = new Container({ borderRadius, tintOpacity: 0.72, blur: 10.0 })

    // Move the card's inner content into the glass contentWrapper
    while (card.firstChild) {
      container.contentWrapper.appendChild(card.firstChild)
    }

    // Copy padding and layout classes from original card
    const computed = window.getComputedStyle(card)
    container.contentWrapper.style.padding = computed.padding
    container.contentWrapper.style.display = 'flex'
    container.contentWrapper.style.flexDirection = 'column'

    // Transfer classes and data attributes (so existing CSS selectors still match)
    card.className.split(' ').forEach(cls => {
      if (cls && cls !== 'glass-container') container.element.classList.add(cls)
    })
    Object.assign(container.element.dataset, card.dataset)
    if (card.id) container.element.id = card.id

    // Swap in DOM
    card.parentNode.replaceChild(container.element, card)
  })
}
