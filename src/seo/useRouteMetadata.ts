import { useEffect } from 'react';
import { getPageMetadata, getStructuredData, serializeStructuredData } from './routes.mjs';

export function useRouteMetadata(pathname: string) {
  useEffect(() => {
    const metadata = getPageMetadata(pathname);
    document.title = metadata.title;
    const setMeta = (attribute: 'name' | 'property', key: string, value: string) => {
      const tags = [...document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`)];
      let tag = tags[0];
      tags.slice(1).forEach((duplicate) => duplicate.remove());
      if (!tag) { tag = document.createElement('meta'); tag.setAttribute(attribute, key); document.head.appendChild(tag); }
      tag.content = value;
    };
    setMeta('name', 'description', metadata.description);
    setMeta('name', 'robots', metadata.robots);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:site_name', 'Ramin Hoodeh');
    setMeta('property', 'og:title', metadata.title);
    setMeta('property', 'og:description', metadata.description);
    setMeta('property', 'og:image', metadata.image);
    setMeta('property', 'og:image:alt', metadata.title);
    setMeta('property', 'og:image:width', '1200');
    setMeta('property', 'og:image:height', '630');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', metadata.title);
    setMeta('name', 'twitter:description', metadata.description);
    setMeta('name', 'twitter:image', metadata.image);
    setMeta('name', 'twitter:image:alt', metadata.title);
    const canonicals = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')];
    let canonical = canonicals[0];
    canonicals.slice(1).forEach((duplicate) => duplicate.remove());
    if (metadata.canonical) {
      if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
      canonical.href = metadata.canonical;
      setMeta('property', 'og:url', metadata.canonical);
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
    const scripts = [...document.head.querySelectorAll<HTMLScriptElement>('#portfolio-structured-data')];
    let script = scripts[0];
    scripts.slice(1).forEach((duplicate) => duplicate.remove());
    const structuredData = getStructuredData(pathname);
    if (structuredData) {
      if (!script) { script = document.createElement('script'); script.id = 'portfolio-structured-data'; document.head.appendChild(script); }
      script.type = 'application/ld+json';
      script.textContent = serializeStructuredData(structuredData);
    } else script?.remove();
  }, [pathname]);
}
