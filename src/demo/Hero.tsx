import { useState } from 'react';
import {
  CATEGORY_LABELS,
  TRANSITIONS,
  TransitionStage,
} from '../lib';
import { CLIP_A, CLIP_B } from './clips';
import { isLightDevice } from '../lib/device';

const pad = (value: number) => String(value).padStart(2, '0');

type Props = {
  onOpen: (id: string) => void;
};

export default function Hero({ onOpen }: Props) {
  const [index, setIndex] = useState(0);
  const [light] = useState(() => isLightDevice());
  const current = TRANSITIONS[index];

  const advance = () => setIndex((value) => (value + 1) % TRANSITIONS.length);

  const random = () => {
    setIndex((value) => {
      if (TRANSITIONS.length < 2) return value;
      let next = value;
      while (next === value) next = Math.floor(Math.random() * TRANSITIONS.length);
      return next;
    });
  };

  return (
    <section className="hero wrap" id="top">
      <div className="hero-copy">
        <p className="eyebrow">
          <span className="dot" />
          WebGL transition library
        </p>
        <h1>
          Make the cut
          <br />
          <span className="accent">disappear.</span>
        </h1>
        <p className="lede">
          Twenty-five GPU transitions between two clips. Scrub the seam, tune
          the motion, then take the component.
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href="#effects">
            Browse transitions
          </a>
          <button type="button" className="btn btn-ghost" onClick={random}>
            Random cut
          </button>
        </div>
        <dl className="hero-stats">
          <div>
            <dt>Transitions</dt>
            <dd>{TRANSITIONS.length}</dd>
          </div>
          <div>
            <dt>Engine</dt>
            <dd>WebGL</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>React only</dd>
          </div>
        </dl>
      </div>

      <div className="hero-stage">
        <div className="stage">
          <TransitionStage
            from={light ? CLIP_A.preview : CLIP_A.video}
            to={light ? CLIP_B.preview : CLIP_B.video}
            effect={current.id}
            duration={1100}
            intensity={0.7}
            onCycle={advance}
            label={`${current.name} transition between ${CLIP_A.name} and ${CLIP_B.name}`}
          />
          <div className="stage-ui">
            <span className="stage-live">
              <i />
              Live preview
            </span>
            <span className="stage-count">
              {pad(index + 1)} / {pad(TRANSITIONS.length)}
            </span>
            <div className="stage-caption">
              <span className="stage-cat">{CATEGORY_LABELS[current.category]}</span>
              <span className="stage-name">{current.name}</span>
            </div>
            <span className="stage-clips">
              {CLIP_A.name} → {CLIP_B.name}
            </span>
          </div>
        </div>
        <div className="stage-foot">
          <span className="mono">AUTO-CYCLING ALL {TRANSITIONS.length} CUTS</span>
          <button type="button" className="text-link" onClick={() => onOpen(current.id)}>
            Open in playground ↗
          </button>
        </div>
      </div>
    </section>
  );
}
