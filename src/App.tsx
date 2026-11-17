import { useCallback, useEffect, useState } from 'react';
import Hero from './demo/Hero';
import Catalog from './demo/Catalog';
import EffectModal from './demo/EffectModal';
import LibrarySection from './demo/LibrarySection';
import { TRANSITIONS } from './lib';

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
            <a href="https://github.com" target="_blank" rel="noreferrer">
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
          <div>
            <span className="brand">
              <span className="brand-mark" aria-hidden="true">
                <i />
                <i />
              </span>
              clipframes
            </span>
            <p>Transitions for the web, rendered on the GPU.</p>
          </div>
          <div className="footer-meta">
            <span className="mono">REACT · WEBGL · NO EXPORT</span>
            <span className="mono">© 2026</span>
          </div>
        </div>
      </footer>

      {active ? (
        <EffectModal key={active.id} effect={active} onClose={close} />
      ) : null}
    </>
  );
}
