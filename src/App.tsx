import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import Hero from './demo/Hero';
import Catalog from './demo/Catalog';
import LibrarySection from './demo/LibrarySection';
import { TRANSITIONS } from './lib';

// The modal is only needed once someone opens an effect, so its code stays out
// of the initial bundle. Pointer/key intent starts the download early enough
// that the dialog still opens without a visible pause.
const EffectModal = lazy(() => import('./demo/EffectModal'));

function idFromHash(): string | null {
  const raw = window.location.hash.replace(/^#\/?/, '').trim();
  return raw && TRANSITIONS.some((item) => item.id === raw) ? raw : null;
}

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(() => idFromHash());

  useEffect(() => {
    const onHashChange = () => setActiveId(idFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const preload = () => {
      void import('./demo/EffectModal');
    };
    window.addEventListener('pointerdown', preload, { once: true, passive: true });
    window.addEventListener('keydown', preload, { once: true });
    return () => {
      window.removeEventListener('pointerdown', preload);
      window.removeEventListener('keydown', preload);
    };
  }, []);

  const open = useCallback((id: string) => {
    window.location.hash = `/${id}`;
  }, []);

  const close = useCallback(() => {
    try {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      );
    } catch {
      window.location.hash = '';
    }
    setActiveId(null);
  }, []);

  const active = activeId
    ? TRANSITIONS.find((item) => item.id === activeId) ?? null
    : null;

  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <a className="brand" href="#top" aria-label="clipframes, back to top">
            <span className="brand-mark" aria-hidden="true">
              <i />
              <i />
            </span>
            clipframes
          </a>
          <nav className="site-nav" aria-label="Sections">
            <a href="#effects">Effects</a>
            <a href="#library">Library</a>
            <a
              href="https://github.com/zalramadhan"
              target="_blank"
              rel="noreferrer noopener"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </header>

      <main>
        <Hero onOpen={open} />
        <Catalog onOpen={open} />
        <LibrarySection />

        <section className="about wrap">
          <p className="eyebrow">About the seam</p>
          <div className="about-grid">
            <h2>
              A transition is
              <br />
              just two textures
              <br />
              and a progress value.
            </h2>
            <div className="about-copy">
              <p>
                Every effect in clipframes is a fragment shader that samples the
                outgoing clip and the incoming clip, then decides which pixel
                belongs to which frame. No timeline, no export, no rendering
                queue — the cut happens in the browser at display resolution.
              </p>
              <p>
                The demo clips were generated in-house: a warm dusk and a cool
                sea, both six seconds long. Open any cut, pause it, and drag
                through the seam frame by frame to see exactly where the shader
                switches.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div className="footer-intro">
            <span className="brand">
              <span className="brand-mark" aria-hidden="true">
                <i />
                <i />
              </span>
              clipframes
            </span>
            <p>Transitions for the web, rendered on the GPU.</p>
            <p className="footer-credit">
              Dibuat oleh{' '}
              <a
                href="https://instagram.com/zalsomeone"
                target="_blank"
                rel="noreferrer noopener"
              >
                zalsomeone
              </a>
            </p>
          </div>

          <div className="footer-side">
            <nav className="footer-social" aria-label="Social media">
              <a
                href="https://instagram.com/zalsomeone"
                target="_blank"
                rel="noreferrer noopener"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle className="fill" cx="17.4" cy="6.6" r="1.2" />
                </svg>
                <span>
                  <em>Instagram</em>
                  <small>@zalsomeone</small>
                </span>
              </a>
              <a
                href="https://github.com/zalramadhan"
                target="_blank"
                rel="noreferrer noopener"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    className="fill"
                    d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
                  />
                </svg>
                <span>
                  <em>GitHub</em>
                  <small>zalramadhan</small>
                </span>
              </a>
            </nav>

            <div className="footer-meta">
              <span className="mono">REACT · WEBGL · NO EXPORT</span>
              <span className="mono">© 2026 · ZALSOMEONE</span>
            </div>
          </div>
        </div>
      </footer>

      {active ? (
        <Suspense fallback={null}>
          <EffectModal key={active.id} effect={active} onClose={close} />
        </Suspense>
      ) : null}
    </>
  );
}
