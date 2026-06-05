import { IPhone3D } from './IPhone3D';
import nssoScreen from '../assets/projects/nsso-mock.webp';

/**
 * Dev-only full-screen harness for verifying the scraped iPhone model in isolation
 * (bypasses the intro animation). Open `/?iphonePreview` on the dev server.
 * Uses inline sizing + a contrasting backdrop so a dark titanium phone is always visible.
 */
export function IPhone3DPreview() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(160deg, #c6cdd8 0%, #6b7686 55%, #2b3340 100%)',
      }}
    >
      <div style={{ width: 'min(46vh, 92vw)', height: '92vh' }}>
        <IPhone3D screenSrc={nssoScreen} ariaLabel="iPhone 3D preview" />
      </div>
    </div>
  );
}
