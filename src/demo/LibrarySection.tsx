import { useState } from 'react';
import { copyText } from './copy';

const USAGE = `import { TransitionStage } from 'clipframes';

<TransitionStage
  from="/clips/a.mp4"
  to="/clips/b.mp4"
  effect="film-burn"
  duration={1100}
  intensity={0.7}
/>`;

const RENDERER = `import { TransitionRenderer, getTransition } from 'clipframes';

const renderer = new TransitionRenderer(canvas);
renderer.setEffect(getTransition('ripple'));

// inside your render loop
renderer.render(videoA, videoB, progress, intensity);`;

const PROPS = [
  ['from', 'string', 'URL of the outgoing clip.'],
  ['to', 'string', 'URL of the incoming clip.'],
  ['effect', 'string', 'Any id from TRANSITIONS, e.g. "glitch".'],
  ['duration', 'number', 'Length of one pass in milliseconds. Default 1100.'],
  ['intensity', 'number', '0–1 value used by shake, glow, and split effects.'],
  ['hold', 'number', 'Milliseconds to hold each clip. Default 900.'],
  ['loop', 'boolean', 'Cycle A → B → A. Default true.'],
  ['progress', 'number | null', 'Pin the seam at a fixed point instead of playing.'],
  ['onCycle', '() => void', 'Fires after each full cycle.'],
  ['onProgress', '(p: number) => void', 'Throttled progress, for scrubbers.'],
];

function CodeCard({ title, code }: { title: string; code: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    const ok = await copyText(code);
    setStatus(ok ? 'copied' : 'failed');
    window.setTimeout(() => setStatus('idle'), 1800);
  };

  return (
    <div className="code-card">
      <div className="code-head">
        <span className="eyebrow">{title}</span>
        <button type="button" className="btn btn-ghost btn-small" onClick={copy}>
          {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function LibrarySection() {
  return (
    <section id="library" className="section wrap">
      <header className="section-head">
        <div>
          <p className="eyebrow">The library</p>
          <h2>
            One component.
            <br />
            Twenty-five cuts.
          </h2>
        </div>
        <p className="section-note">
          The engine lives in <code>src/lib</code>: shaders, a framework-agnostic
          renderer, and a small React wrapper. React is the only peer dependency.
          No ffmpeg, no exported video — the seam is rendered live.
        </p>
      </header>

      <div className="library-grid">
        <CodeCard title="Drop-in component" code={USAGE} />
        <CodeCard title="Bring your own loop" code={RENDERER} />
      </div>

      <div className="api">
        <h3>TransitionStage props</h3>
        <div className="api-scroll">
          <table>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>What it does</th>
              </tr>
            </thead>
            <tbody>
              {PROPS.map(([name, type, description]) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td className="api-type">{type}</td>
                  <td>{description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="library-foot">
        Build the package with <code>npm run build:lib</code>. The renderer accepts
        any <code>TexImageSource</code> — video elements, images, or canvases — so it
        also works for stills and generated frames.
      </p>
    </section>
  );
}
