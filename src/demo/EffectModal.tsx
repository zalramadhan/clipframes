import { useEffect, useRef, useState } from 'react';
import {
  CATEGORY_LABELS,
  TRANSITIONS,
  TransitionStage,
  type TransitionDef,
} from '../lib';
import { CLIP_A, CLIP_B } from './clips';
import { copyText } from './copy';

const pad = (value: number) => String(value).padStart(2, '0');

type Props = {
  effect: TransitionDef;
  onClose: () => void;
};

export default function EffectModal({ effect, onClose }: Props) {
  const index = TRANSITIONS.findIndex((item) => item.id === effect.id);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const [duration, setDuration] = useState(1100);
  const [intensity, setIntensity] = useState(0.65);
  const [playing, setPlaying] = useState(true);
  const [scrub, setScrub] = useState(0);
  const [live, setLive] = useState(0);
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  const shown = playing ? live : scrub;

  const snippet = `import { TransitionStage } from 'clipframes';

<TransitionStage
  from="/clips/ember.mp4"
  to="/clips/tide.mp4"
  effect="${effect.id}"
  duration={${duration}}
  intensity={${intensity.toFixed(2)}}
/>`;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter(
        (element) => !element.hasAttribute('disabled') && element.offsetParent !== null,
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  useEffect(() => {
    setStatus('idle');
  }, [effect.id, duration, intensity]);

  const copy = async () => {
    const ok = await copyText(snippet);
    setStatus(ok ? 'copied' : 'failed');
    window.setTimeout(() => setStatus('idle'), 1800);
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cf-modal-title"
        ref={panelRef}
      >
        <header className="modal-head">
          <div>
            <p className="eyebrow">
              {pad(index + 1)} / {pad(TRANSITIONS.length)} ·{' '}
              {CATEGORY_LABELS[effect.category]}
            </p>
            <h2 id="cf-modal-title">{effect.name}</h2>
            <p className="modal-desc">{effect.description}</p>
          </div>
          <button
            type="button"
            ref={closeRef}
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="modal-stage">
          <TransitionStage
            from={CLIP_A.video}
            to={CLIP_B.video}
            effect={effect.id}
            duration={duration}
            intensity={intensity}
            progress={playing ? null : scrub}
            onProgress={playing ? setLive : undefined}
            label={`${effect.name} transition preview`}
          />
          <div className="stage-overlay">
            <span className="mono">{CLIP_A.name} → {CLIP_B.name}</span>
            <span className="mono">{Math.round(shown * 100)}%</span>
          </div>
        </div>

        <div className="modal-controls">
          <div className="control">
            <span className="control-label">Playback</span>
            <button
              type="button"
              className="btn btn-primary btn-small"
              onClick={() => setPlaying((value) => !value)}
            >
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>

          <label className="control">
            <span className="control-label">
              Progress <em>{Math.round(shown * 100)}%</em>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(shown * 100)}
              onChange={(event) => {
                const value = Number(event.target.value) / 100;
                setPlaying(false);
                setScrub(value);
                setLive(value);
              }}
            />
          </label>

          <label className="control">
            <span className="control-label">
              Duration <em>{duration}ms</em>
            </span>
            <input
              type="range"
              min={400}
              max={2600}
              step={50}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
            />
          </label>

          <label className="control">
            <span className="control-label">
              Intensity <em>{Math.round(intensity * 100)}%</em>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(intensity * 100)}
              onChange={(event) => setIntensity(Number(event.target.value) / 100)}
            />
          </label>
        </div>

        <div className="modal-code">
          <div className="code-head">
            <span className="eyebrow">Usage</span>
            <button type="button" className="btn btn-ghost btn-small" onClick={copy}>
              {status === 'copied'
                ? 'Copied'
                : status === 'failed'
                  ? 'Copy failed'
                  : 'Copy code'}
            </button>
          </div>
          <pre>
            <code>{snippet}</code>
          </pre>
          <p className="code-note">
            The stage plays A → B → A on its own. Pass <code>progress</code> to
            drive it from a timeline instead.
          </p>
        </div>
      </div>
    </div>
  );
}
