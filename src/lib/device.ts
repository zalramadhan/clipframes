// Phones and low-end machines get the cheap path: no live shader previews in
// the catalog, a capped backing-store resolution, and a lower frame budget.
export function isLightDevice(): boolean {
  if (typeof window === 'undefined') return false;

  const nav = navigator as Navigator & { deviceMemory?: number };
  const small = window.matchMedia('(max-width: 720px)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const fewCores = (nav.hardwareConcurrency ?? 8) <= 4;
  const lowMemory = (nav.deviceMemory ?? 8) <= 4;

  return small || (coarse && (fewCores || lowMemory));
}
