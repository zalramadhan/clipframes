import { useEffect, useRef, type CSSProperties } from 'react';
import { isLightDevice } from './device';
import { TransitionRenderer } from './renderer';
import { getTransition } from './transitions';

export type TransitionStageProps = {
  /** URL of the outgoing clip. */
  from: string;
  /** URL of the incoming clip. */
  to: string;
  /** Transition id, e.g. "glitch". See TRANSITIONS. */
  effect: string;
  /** Length of a single pass in milliseconds. */
  duration?: number;
  /** 0–1, pushed into effects that use it. */
  intensity?: number;
  /** Hold time on each clip before/after the cut, in milliseconds. */
  hold?: number;
  /** Loop the A → B → A cycle. */
  loop?: boolean;
  /** Pin the transition to a fixed progress (0–1) instead of playing. */
  progress?: number | null;
  className?: string;
  style?: CSSProperties;
  /** Called after each full A → B → A cycle, useful for cycling effects. */
  onCycle?: () => void;
  /** Receives the animated progress (throttled), for scrubbers. */
  onProgress?: (progress: number) => void;
  label?: string;
};

export function TransitionStage({
  from,
  to,
  effect,
  duration = 1100,
  intensity = 0.65,
  hold = 900,
  loop = true,
  progress = null,
  className,
  style,
  onCycle,
  onProgress,
  label,
}: TransitionStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fromRef = useRef<HTMLVideoElement>(null);
  const toRef = useRef<HTMLVideoElement>(null);
  const rendererRef = useRef<TransitionRenderer | null>(null);

  const effectRef = useRef(effect);
  const durationRef = useRef(duration);
  const intensityRef = useRef(intensity);
  const holdRef = useRef(hold);
  const loopRef = useRef(loop);
  const progressRef = useRef(progress);
  const onCycleRef = useRef(onCycle);
  const onProgressRef = useRef(onProgress);

  effectRef.current = effect;
  durationRef.current = duration;
  intensityRef.current = intensity;
  holdRef.current = hold;
  loopRef.current = loop;
  progressRef.current = progress;
  onCycleRef.current = onCycle;
  onProgressRef.current = onProgress;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: TransitionRenderer;
    try {
      renderer = new TransitionRenderer(canvas);
    } catch (error) {
      console.error(error);
      return;
    }
    rendererRef.current = renderer;
    renderer.setEffect(getTransition(effectRef.current));

    const light = isLightDevice();
    const maxPixels = light ? 960 : 1920;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, light ? 1 : 2);
      let width = Math.max(1, rect.width * ratio);
      let height = Math.max(1, rect.height * ratio);
      if (width > maxPixels) {
        const scale = maxPixels / width;
        width *= scale;
        height *= scale;
      }
      renderer.setSize(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const videos = [fromRef.current, toRef.current].filter(
      (video): video is HTMLVideoElement => Boolean(video),
    );
    for (const video of videos) video.muted = true;

    let frame = 0;
    let running = false;
    let onscreen = true;
    const start = performance.now();
    let lastCycle = 0;
    let lastReport = 0;
    let lastDraw = 0;
    const minFrameTime = light ? 1000 / 30 : 0;

    const tick = (now: number) => {
      frame = 0;
      if (!running) return;
      if (now - lastDraw < minFrameTime) {
        frame = requestAnimationFrame(tick);
        return;
      }
      lastDraw = now;

      const pass = Math.max(160, durationRef.current);
      const pause = Math.max(80, holdRef.current);
      const cycle = pass * 2 + pause * 2;
      const elapsed = now - start;
      const cycleIndex = Math.floor(elapsed / cycle);

      if (cycleIndex !== lastCycle) {
        lastCycle = cycleIndex;
        if (cycleIndex > 0) onCycleRef.current?.();
      }

      let p: number;
      if (progressRef.current !== null) {
        p = progressRef.current;
      } else if (!loopRef.current) {
        p = Math.min(1, Math.max(0, (elapsed - pause) / pass));
      } else {
        const t = elapsed % cycle;
        if (t < pause) p = 0;
        else if (t < pause + pass) p = (t - pause) / pass;
        else if (t < pause * 2 + pass) p = 1;
        else p = 1 - (t - pause * 2 - pass) / pass;
      }

      const clamped = Math.min(1, Math.max(0, p));
      renderer.render(
        fromRef.current,
        toRef.current,
        clamped,
        intensityRef.current,
      );
      if (now - lastReport > 120) {
        lastReport = now;
        onProgressRef.current?.(clamped);
      }
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldRun = onscreen && !document.hidden;
      if (shouldRun === running) return;
      running = shouldRun;
      if (running) {
        for (const video of videos) void video.play().catch(() => {});
        if (!frame) frame = requestAnimationFrame(tick);
      } else {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        for (const video of videos) video.pause();
      }
    };

    const visibility = new IntersectionObserver(
      (entries) => {
        onscreen = entries.some((entry) => entry.isIntersecting);
        sync();
      },
      { threshold: 0.01 },
    );
    visibility.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener('visibilitychange', sync);
      renderer.dispose();
      rendererRef.current = null;
      for (const video of videos) video.pause();
    };
  }, []);

  useEffect(() => {
    rendererRef.current?.setEffect(getTransition(effect));
  }, [effect]);

  useEffect(() => {
    for (const video of [fromRef.current, toRef.current]) {
      if (video) void video.play().catch(() => {});
    }
  }, [from, to]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        background: '#000',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label ?? `Transition preview: ${effect}`}
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
      <video
        ref={fromRef}
        src={from}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
      <video
        ref={toRef}
        src={to}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
}
