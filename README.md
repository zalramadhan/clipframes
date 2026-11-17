# clipframes

A WebGL transition library for the web, plus a demo gallery. Twenty-five
CapCut-style cuts — slide, glitch, luma wipe, film burn, ripple, flip, and more —
rendered live between two video clips. No export queue, no ffmpeg: each effect is
a fragment shader reading two textures.

## Run the demo

```bash
npm install
npm run dev
```

`npm run build` produces the static demo in `dist/`. `npm run build:lib` bundles
the library alone into `dist-lib/clipframes.js` (ES module, React external).

`npm run build:file` writes **`clipframes.html`** — one self-contained file with
the JS, CSS, both clips, and all posters inlined. Double-click it to open the
demo without a server or terminal.

## Use the library

```tsx
import { TransitionStage } from 'clipframes';

<TransitionStage
  from="/clips/a.mp4"
  to="/clips/b.mp4"
  effect="film-burn"
  duration={1100}
  intensity={0.7}
/>;
```

The component creates two muted looping videos, uploads them as WebGL textures,
and cycles `A → B → A`. To control the seam yourself, pass `progress` (0–1).

For custom render loops, use the framework-agnostic renderer:

```ts
import { TransitionRenderer, getTransition } from 'clipframes';

const renderer = new TransitionRenderer(canvas);
renderer.setEffect(getTransition('ripple'));
renderer.setSize(1280, 720);
renderer.render(videoA, videoB, progress, intensity);
```

### `TransitionStage` props

| Prop         | Type                     | Default | Notes                                          |
| ------------ | ------------------------ | ------- | ---------------------------------------------- |
| `from`       | `string`                 | —       | URL of the outgoing clip.                      |
| `to`         | `string`                 | —       | URL of the incoming clip.                      |
| `effect`     | `string`                 | —       | Any id from `TRANSITIONS`.                     |
| `duration`   | `number`                 | `1100`  | Length of one pass, in milliseconds.           |
| `intensity`  | `number`                 | `0.65`  | 0–1, used by shake / glow / split effects.     |
| `hold`       | `number`                 | `900`   | Hold time on each clip, in milliseconds.       |
| `loop`       | `boolean`                | `true`  | Cycle A → B → A.                               |
| `progress`   | `number \| null`         | `null`  | Pin the seam instead of playing.                |
| `onCycle`    | `() => void`             | —       | Fires after each full cycle.                   |
| `onProgress` | `(p: number) => void`    | —       | Throttled progress, for scrubbers.             |

### Exports

- `TRANSITIONS` — metadata for all 25 effects (`id`, `name`, `category`, `description`).
- `getTransition(id)` — lookup with a safe fallback.
- `TransitionRenderer` — canvas renderer; accepts videos, images, or canvases.
- `TransitionStage` — React wrapper with playback and resize handling.

## Effects

| Category | Effects                                                              |
| -------- | -------------------------------------------------------------------- |
| Motion   | Slide, Push Up, Zoom Punch, Spin Out, Whip Pan, Stretch              |
| Light    | Flash Cut, Light Leak, Film Burn, Luma Wipe, Clock Wipe              |
| Glitch   | Glitch, RGB Split, Pixelate, Scanline Tear                           |
| Wipe     | Blinds, Checker, Circle Wipe, Curtain, Tile Flip                     |
| Warp     | Ripple, Swirl, Zoom Blur, Kaleidoscope                               |
| 3D       | Flip 3D                                                              |

## Adding an effect

Each transition is a function in `src/lib/transitions.ts`:

```glsl
vec4 transition(vec2 uv) {
  float p = easeInOut(uProgress);   // 0 → 1
  return mix(fromAt(uv), toAt(uv), p);
}
```

Register it in the `TRANSITIONS` array with an `id`, `name`, `category`, and
`description`. The shared shader header already provides `fromAt`, `toAt`,
`centered`, `uncentered`, `rot2`, `noise21`, `hash21`, `easeInOut`, and the
`uIntensity` / `uResolution` uniforms.

## Notes

- WebGL 1 is enough; the renderer falls back to `mediump` where `highp` is missing.
- Videos must be same-origin or served with CORS headers — browsers refuse to
  upload cross-origin textures without them.
- Muted autoplay is required by browser policy; both demo clips are muted.
- The sample clips (`src/assets/clips/`) were generated in-house from canvas
  animations and encoded with ffmpeg. They are free to use with the demo.
- `clipframes.html` is a generated artifact; rebuild it with
  `npm run build:file` after changing the source.
- This package is not published to npm; `build:lib` creates the bundle locally.
