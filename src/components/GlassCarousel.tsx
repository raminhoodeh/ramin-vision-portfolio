import { useEffect, useRef, useState } from 'react';
import { createCarouselController } from './glass-carousel/createCarouselController';
import type { CarouselController, CarouselMode } from './glass-carousel/createCarouselController';
import './glass-carousel/glassCarousel.css';

type Product = {
  name: string; kind: string; focus: string; description: string;
  href: string; publicHref: string; publicLabel: string;
};

function ProductGlyph({ index }: { index: number }) {
  return (
    <span className="glass-carousel__glyph" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none">
        {index === 0 ? <><circle cx="32" cy="23" r="9" /><path d="M15 50c0-10 7-17 17-17s17 7 17 17" /><path d="M10 11h12M10 11v12M54 53H42M54 53V41" /></>
          : index === 1 ? <><circle cx="32" cy="32" r="23" /><path d="m42 20-5 17-16 7 6-18 15-6Z" /><path d="m27 26 10 11M32 4v5M32 55v5M4 32h5M55 32h5" /></>
          : <><path d="M43 10a23 23 0 1 0 10 35A24 24 0 0 1 43 10Z" /><path d="m47 21 2-6 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" /></>}
      </svg>
    </span>
  );
}

export function GlassCarousel({ products, labelledBy }: { products: readonly [Product, Product, Product]; labelledBy: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<CarouselController | null>(null);
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState<CarouselMode>('static');
  const enhanced = mode === 'ready';

  useEffect(() => {
    const stage = stageRef.current;
    const mount = mountRef.current;
    if (!stage || !mount) return;
    try {
      const controller = createCarouselController({
        stage, mount, cards: [...stage.querySelectorAll<HTMLElement>('[data-glass-index]')],
        initialIndex: selected, onSelect: setSelected, onMode: setMode,
      });
      controllerRef.current = controller;
      return () => { controller.dispose(); controllerRef.current = null; };
    } catch { setMode('fallback'); }
    // The controller owns the continuous position; selection does not recreate WebGL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="glass-carousel" role="region" aria-roledescription={enhanced ? 'carousel' : undefined} aria-labelledby={labelledBy} data-glass-mode={mode}>
      <p id={`${labelledBy}-instructions`} className="glass-carousel__hint" hidden={!enhanced}>
        <span className="glass-carousel__hint-desktop">Drag the glass or use the arrows to explore.</span>
        <span className="glass-carousel__hint-mobile">Swipe or use the arrows to explore.</span>
      </p>
      <div className="glass-carousel__stage" ref={stageRef} tabIndex={enhanced ? 0 : undefined}
        aria-label={enhanced ? 'Product cards. Use Left and Right arrow keys to browse.' : undefined}
        aria-describedby={enhanced ? `${labelledBy}-instructions` : undefined}>
        <div ref={mountRef} className="glass-carousel__canvas" aria-hidden="true" />
        <div className="glass-carousel__cards">
          {products.map((project, index) => {
            const active = !enhanced || selected === index;
            return (
              <article key={project.name} className="glass-carousel__card" data-glass-index={index} data-selected={selected === index}
                role="group" aria-roledescription={enhanced ? 'slide' : undefined}
                aria-label={`${index + 1} of ${products.length}: ${project.name}`} aria-hidden={active ? undefined : true}>
                <div className="glass-carousel__topline" data-glass-selectable>
                  <span>{project.kind}</span><span aria-hidden="true">0{index + 1}</span>
                </div>
                <ProductGlyph index={index} />
                <p className="glass-carousel__focus" data-glass-selectable>{project.focus}</p>
                <h3 data-glass-selectable><a href={project.href} tabIndex={active ? undefined : -1}>{project.name}</a></h3>
                <p className="glass-carousel__description" data-glass-selectable>{project.description}</p>
                <div className="glass-carousel__links">
                  <a href={project.href} aria-label={`Read the ${project.name} case study`} tabIndex={active ? undefined : -1}>
                    Case study <span aria-hidden="true">→</span>
                  </a>
                  <a href={project.publicHref} target="_blank" rel="noopener noreferrer" aria-label={`${project.publicLabel} in a new tab`} tabIndex={active ? undefined : -1}>
                    {project.publicLabel} <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="glass-carousel__controls" hidden={!enhanced}>
        <button type="button" className="glass-carousel__arrow" aria-label="Previous product" onClick={() => controllerRef.current?.step(-1)}><span aria-hidden="true">←</span></button>
        <div className="glass-carousel__selectors" aria-label="Choose a product">
          {products.map((product, index) => (
            <button type="button" key={product.name} className="glass-carousel__selector" aria-label={`Show ${product.name}`}
              aria-pressed={selected === index} onClick={() => controllerRef.current?.select(index)}>
              <span aria-hidden="true" />
            </button>
          ))}
        </div>
        <button type="button" className="glass-carousel__arrow" aria-label="Next product" onClick={() => controllerRef.current?.step(1)}><span aria-hidden="true">→</span></button>
      </div>
      <p className="glass-carousel__status" role="status" aria-live="polite" aria-atomic="true" hidden={!enhanced}>
        <span>{String(selected + 1).padStart(2, '0')} / {String(products.length).padStart(2, '0')}</span> {products[selected].name}
      </p>
    </div>
  );
}
