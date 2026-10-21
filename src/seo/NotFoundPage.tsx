export function NotFoundPage() {
  return (
    <section style={{ maxWidth: '54rem', margin: 'auto', padding: '5rem 1.5rem 9rem', color: '#26384d' }}>
      <p>404 · Page not found</p>
      <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.1, marginBlock: '1rem' }}>This page is missing.</h1>
      <p style={{ lineHeight: 1.8 }}>The address may have changed. You can explore my work, products or contact me below.</p>
      <nav aria-label="Find a portfolio page" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '2rem' }}>
        <a href="/">Home</a><a href="/experience-education">Work</a><a href="/projects">Products</a><a href="/contact">Contact</a>
      </nav>
    </section>
  );
}
