# Parked 3D Layer

The live portfolio entrypoint now runs from `src/main.tsx` and does not import the Three.js scene.

The previous 3D work is intentionally left in the repository for a later selective pass:

- `main.js` - original Three.js scene, scroll camera, postprocessing, and model choreography.
- `environment.js` - section-by-section lighting and atmosphere presets.
- `particles.js` - particle formations and rock sampling helpers.
- `rock-state.js` - material/emissive state transitions.
- `liquid-glass/` - canvas-based glass/refraction experiments.
- `gl/`, `draco/`, `basis/` - model and loader assets.
- `scrape-output/`, `overall-structure-context.md`, `performance-efficiency-guidelines.md`, `scrape-skill.md` - notes and source analysis.

When the base portfolio is finalized, use these as references for one or two restrained 3D moments rather than rebuilding the whole page around 3D.
