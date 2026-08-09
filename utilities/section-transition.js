export const SECTION_TRANSITION = {
  threshold: 86,
  dragMultiplier: 0.52,
  edgeResistance: 0.18,
  duration: 620,
  wheelSettleDelay: 120,
};

export function viewportHeight() {
  return typeof window === 'undefined' ? 0 : window.innerHeight;
}
