export const SECTION_TRANSITION = {
  threshold: 86,
  dragMultiplier: 0.52,
  edgeResistance: 0.18,
  duration: 620,
  wheelSettleDelay: 120,
};

export function gestureOffset(distance, atBoundary = false) {
  return distance * (atBoundary ? SECTION_TRANSITION.edgeResistance : SECTION_TRANSITION.dragMultiplier);
}

export function crossesSectionThreshold(distance) {
  return Math.abs(distance) >= SECTION_TRANSITION.threshold;
}

export function viewportHeight() {
  return typeof window === 'undefined' ? 0 : window.innerHeight;
}
