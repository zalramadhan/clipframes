import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CATEGORY_LABELS, TRANSITIONS, TransitionStage } from '../lib';
import { CLIP_A, CLIP_B } from './clips';

const pad = (value: number) => String(value).padStart(2, '0');

// Each live card owns a WebGL context and two video elements. Browsers drop
// the oldest context once a page holds more than ~16, so the pool is capped
// well under that; the cards use a 480x270 cut of the clips to keep the
// per-frame texture uploads cheap enough for a dozen simultaneous previews.
const MAX_LIVE = 12;
const liveSlots = new Set<object>();
const slotListeners = new Set<() => void>();

const notifySlots = () => {
  for (const listener of [...slotListeners]) listener();
};

function useLivePreview() {
  const ref = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setLive(true);
      return;
    }

    const slot = {};
    let visible = false;

    const sync = () => {
      if (visible) {
        if (!liveSlots.has(slot) && liveSlots.size < MAX_LIVE) liveSlots.add(slot);
        setLive(liveSlots.has(slot));
      } else {
        setLive(false);
        if (liveSlots.delete(slot)) notifySlots();
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(node);
    slotListeners.add(sync);

    return () => {
      observer.disconnect();
      slotListeners.delete(sync);
      if (liveSlots.delete(slot)) notifySlots();
    };
  }, []);

  return { ref, live };
}

type Props = {
  onOpen: (id: string) => void;
};

export default function Catalog({ onOpen }: Props) {
  return (
    <section id="effects" className="section wrap">
      <header className="section-head">
        <div>
          <p className="eyebrow">The index</p>
          <h2>
            Twenty-five ways
            <br />
            to leave a frame.
          </h2>
        </div>
        <p className="section-note">
          Every cut is a fragment shader reading two video textures. Open one to
          pause it, drag the seam, and copy the component.
        </p>
      </header>

      <ul className="catalog-grid">
        {TRANSITIONS.map((transition, index) => (
          <li key={transition.id}>
            <Card transition={transition} index={index} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Card({
  transition,
  index,
  onOpen,
}: {
  transition: (typeof TRANSITIONS)[number];
  index: number;
  onOpen: (id: string) => void;
}) {
  const { ref, live } = useLivePreview();

  return (
    <button
      type="button"
      className="card"
      onClick={() => onOpen(transition.id)}
      aria-label={`Open ${transition.name} transition`}
      style={
        {
          '--seam-a': `${49 + (index % 5) * 4}%`,
          '--seam-b': `${41 + (index % 4) * 4}%`,
        } as CSSProperties
      }
    >
      <span className="card-media" ref={ref}>
        <img
          className="card-a"
          src={CLIP_A.posters[index % CLIP_A.posters.length]}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <img
          className="card-b"
          src={CLIP_B.posters[(index + 1) % CLIP_B.posters.length]}
          alt=""
          loading="lazy"
          decoding="async"
        />
        {live ? (
          <span className="card-live" aria-hidden="true">
            <TransitionStage
              from={CLIP_A.preview}
              to={CLIP_B.preview}
              effect={transition.id}
              duration={1200}
              hold={700}
              intensity={0.7}
            />
          </span>
        ) : null}
        <span className="card-shade" />
        <span className="card-index">{pad(index + 1)}</span>
        <span className="card-cat">{CATEGORY_LABELS[transition.category]}</span>
      </span>
      <span className="card-meta">
        <span className="card-title">{transition.name}</span>
        <span className="card-arrow" aria-hidden="true">
          ↗
        </span>
      </span>
    </button>
  );
}
