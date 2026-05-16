const previewUrl = process.env.PREVIEW_URL ?? 'http://127.0.0.1:4182/';
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function get(path) {
  const url = new URL(path, previewUrl).toString();
  let response;
  try {
    response = await fetch(url, { cache: 'no-store' });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `${url} could not be reached (${reason}). Confirm the existing dev server is running and localhost network access is allowed for this command.`,
    );
  }

  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`);
  }
  return response.text();
}

try {
  const html = await get('/');
  assert(html.includes('<div id="root"></div>'), 'root HTML must include React mount node');
  assert(html.includes('src="/src/main.tsx"'), 'root HTML must load /src/main.tsx without stage query tags');
  assert(!html.includes('?t=stage'), 'root HTML must not include stage cache tags');

  const main = await get('/src/main.tsx');
  assert(main.includes('from "/src/App.tsx"') || main.includes("from './App'"), 'main.tsx must import App normally');
  assert(!main.includes('?t=stage'), 'main.tsx must not include stage cache tags');

  const app = await get('/src/App.tsx');
  assert(app.includes('/src/components/LiquidGlassJsNavShell.tsx'), 'App must import the liquid glass shell module');
  assert(app.includes('ExperienceEducationSection'), 'App must include ExperienceEducationSection');
  assert(!app.includes('?t=stage'), 'App module must not include stage cache tags');

  const glassShell = await get('/src/components/LiquidGlassJsNavShell.tsx');
  assert(glassShell.includes('/src/components/LiquidGlassJsNavShellReadable.tsx'), 'glass shell must re-export readable implementation normally');
  assert(!glassShell.includes('?t=stage'), 'glass shell must not include stage cache tags');

  const glassReadable = await get('/src/components/LiquidGlassJsNavShellReadable.tsx');
  assert(glassReadable.includes('prepareSharedSnapshotState'), 'liquid glass implementation must include shared snapshot state guard');
  assert(glassReadable.includes('floating mount failed'), 'liquid glass implementation must contain floating mount guard');
  assert(!glassReadable.includes('?t=stage'), 'liquid glass implementation must not include stage cache tags');
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

if (failures.length) {
  console.error(`Preview check failed for ${previewUrl}`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Preview check passed for ${previewUrl}`);
