(() => {
  const root = document.documentElement;
  const applyLanguage = (language) => {
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[language]; });
  };
  let language = 'en';
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(language);
  window.addEventListener('storage', (event) => {
    if (event.key === 'ooxme-language') applyLanguage(event.newValue === 'ar' ? 'ar' : 'en');
  });

  const selector = document.querySelector('[data-studio-selector]');
  if (!selector) return;
  const workGallery = document.querySelector('[data-studio-work-gallery]');
  const clientCopy = document.querySelector('[data-studio-client-copy]');

  selector.querySelectorAll('[data-studio-option]').forEach((button) => button.addEventListener('click', () => {
    selector.dataset.active = button.dataset.studioOption;
    selector.querySelectorAll('[data-studio-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
    if (workGallery) workGallery.hidden = button.dataset.studioOption !== 'work';
    if (clientCopy) clientCopy.hidden = button.dataset.studioOption !== 'client';
  }));

  if (!workGallery) return;

  // The exact Basra Mall source sequence used by the Portfolio Story deck.
  const images = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13',
    'photo_9_2026-08-02_22-22-30', 'photo_10_2026-08-02_22-22-30', 'photo_11_2026-08-02_22-22-30',
    'photo_12_2026-08-02_22-22-30', 'photo_13_2026-08-02_22-22-30', 'photo_14_2026-08-02_22-22-30',
    'photo_15_2026-08-02_22-22-30', 'photo_16_2026-08-02_22-22-30', 'photo_17_2026-08-02_22-22-30',
    'photo_18_2026-08-02_22-22-30', 'photo_19_2026-08-02_22-22-30', 'photo_20_2026-08-02_22-22-30',
    'photo_21_2026-08-02_22-22-30', 'photo_22_2026-08-02_22-22-30', 'photo_23_2026-08-02_22-22-30',
    'photo_24_2026-08-02_22-22-30', 'photo_30_2026-08-02_22-22-30', 'photo_31_2026-08-02_22-22-30',
    'photo_32_2026-08-02_22-22-30'
  ].map((name) => `assets/projects/mall albasri/design/optimized/${name}.webp`);
  const gallery = workGallery.querySelector('[data-studio-project-gallery]');
  const viewport = gallery.querySelector('.project-gallery-viewport');
  const rail = gallery.querySelector('.project-gallery-track');
  const card = document.querySelector('.studio-card');
  const state = { index: 0, manualDirection: 1, dragging: false };
  const landscapeQuery = window.matchMedia('(min-aspect-ratio: 4 / 3)');
  const circularDistance = (index, center, count) => {
    let distance = index - center;
    if (distance > count / 2) distance -= count;
    if (distance < -count / 2) distance += count;
    return distance;
  };
  const deckIndexAt = (index, direction, depth, count) => (index + direction * depth + count * 8) % count;
  const interpolateDepth = (values, depth) => {
    const lower = Math.max(0, Math.min(values.length - 1, Math.floor(depth)));
    const upper = Math.min(values.length - 1, lower + 1);
    return values[lower] + (values[upper] - values[lower]) * (depth - lower);
  };
  const slides = images.map((src) => {
    const image = new Image();
    image.className = 'project-gallery-slide';
    image.src = src;
    image.alt = '';
    image.draggable = false;
    rail.append(image);
    return image;
  });
  const renderPortrait = (dragX = 0) => {
    const viewportHeight = viewport.clientHeight;
    const activeHeight = slides[state.index]?.offsetHeight || viewportHeight;
    if (!viewportHeight || !activeHeight) return;
    const layerExposure = Math.min(16, Math.max(9, activeHeight * .04));
    const availableRise = Math.max(0, viewportHeight - activeHeight);
    const maxDepth = Math.min(4, images.length - 1, Math.floor(availableRise / layerExposure));
    const range = Math.max(72, viewport.clientWidth * .24);
    const dragProgress = Math.min(1, Math.abs(dragX) / range);
    const direction = dragX ? (dragX < 0 ? 1 : -1) : state.manualDirection;
    const rotation = Math.max(-4, Math.min(4, (dragX / range) * 4));
    const visible = new Map([[state.index, 0]]);
    for (let depth = 1; depth <= maxDepth; depth += 1) visible.set(deckIndexAt(state.index, direction, depth, images.length), depth - dragProgress);
    slides.forEach((slide, index) => {
      const depth = visible.get(index);
      if (depth === undefined) {
        Object.assign(slide.style, { opacity: '0', visibility: 'hidden', pointerEvents: 'none', zIndex: '0', filter: 'none', boxShadow: 'none' });
        return;
      }
      const scale = Math.max(.76, 1 - depth * .06);
      const translateY = -((1 - scale) * activeHeight + depth * layerExposure);
      const isActive = index === state.index;
      const blur = interpolateDepth([0, .35, .8, 1.4, 2], depth);
      const shadowOffset = interpolateDepth([6, 5, 4, 3, 2], depth);
      const shadowBlur = interpolateDepth([18, 14, 10, 8, 6], depth);
      const shadowOpacity = interpolateDepth([.14, .11, .08, .05, .025], depth);
      Object.assign(slide.style, {
        visibility: 'visible', opacity: `${interpolateDepth([1, .95, .83, .66, .42], depth)}`,
        zIndex: `${100 - Math.round(depth * 10)}`, pointerEvents: isActive ? 'auto' : 'none',
        transform: `translate3d(calc(-50% + ${isActive ? dragX : 0}px), ${translateY}px, 0) rotate(${isActive ? rotation : 0}deg) scale(${scale})`,
        filter: blur ? `blur(${blur}px)` : 'none', boxShadow: `0 ${shadowOffset}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`,
        transition: state.dragging ? 'none' : 'transform .34s cubic-bezier(.22, .75, .3, 1), opacity .34s ease, filter .34s ease, box-shadow .34s ease'
      });
    });
  };
  const renderLandscape = (center = state.index) => {
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    if (!viewportWidth || !viewportHeight) return;
    const activeWidth = viewportHeight * 9 / 16;
    const sideScale = .3;
    const sideWidth = activeWidth * sideScale;
    const smallGap = Math.min(16, Math.max(8, viewportWidth * .012));
    const focusGap = Math.min(80, Math.max(36, viewportWidth * .05));
    const firstSideOffset = activeWidth / 2 + focusGap + sideWidth / 2;
    const remainingWidth = Math.max(0, viewportWidth / 2 - firstSideOffset);
    const visibleLevels = Math.min(images.length - 1, 1 + Math.floor(remainingWidth / (sideWidth + smallGap)));
    slides.forEach((slide, index) => {
      const distance = circularDistance(index, center, images.length);
      const depth = Math.abs(distance);
      const sign = Math.sign(distance) || 1;
      if (depth > visibleLevels + .05) {
        const offscreenOffset = firstSideOffset + (visibleLevels + 1) * (sideWidth + smallGap);
        Object.assign(slide.style, { opacity: '0', visibility: 'hidden', pointerEvents: 'none', zIndex: '0', filter: 'none', boxShadow: 'none', transform: `translate3d(calc(-50% + ${sign * offscreenOffset}px), 0, 0) scale(${sideScale})`, transition: 'none' });
        return;
      }
      const horizontalOffset = depth <= 1 ? depth * firstSideOffset : firstSideOffset + (depth - 1) * (sideWidth + smallGap);
      const scale = .3 + .7 * Math.max(0, 1 - depth);
      Object.assign(slide.style, {
        visibility: 'visible', opacity: `${Math.max(.56, 1 - depth * .14)}`, zIndex: `${100 - Math.round(depth * 10)}`,
        pointerEvents: depth < .5 ? 'auto' : 'none', filter: 'none', boxShadow: 'none',
        transform: `translate3d(calc(-50% + ${sign * horizontalOffset}px), 0, 0) scale(${scale})`,
        transition: state.dragging ? 'none' : 'transform .38s cubic-bezier(.22, .61, .36, 1), opacity .3s ease'
      });
    });
  };
  const render = (center) => (landscapeQuery.matches ? renderLandscape(center) : renderPortrait(center));
  const containGallery = () => {
    viewport.style.removeProperty('height');
    gallery.style.removeProperty('--story-active-height');
    if (!landscapeQuery.matches) {
      // Preserve the Portfolio Story crop while letting the portrait card span
      // the Studio group from one exact X inset to the other.
      gallery.style.setProperty('--story-active-height', `${viewport.clientWidth * 16 / 9}px`);
      return;
    }
    const cardStyle = getComputedStyle(card);
    const availableHeight = card.clientHeight
      - Number.parseFloat(cardStyle.paddingTop)
      - Number.parseFloat(cardStyle.paddingBottom)
      - selector.offsetHeight
      - Number.parseFloat(cardStyle.rowGap);
    const sourceHeight = viewport.offsetHeight;
    if (sourceHeight <= availableHeight) return;
    const height = Math.max(0, availableHeight);
    gallery.style.setProperty('--story-active-height', `${height}px`);
    viewport.style.height = `${height}px`;
  };
  const move = (direction) => {
    state.manualDirection = direction;
    state.index = (state.index + direction + images.length) % images.length;
    render();
  };
  let gesture;
  gallery.addEventListener('pointerdown', (event) => {
    gesture = { x: event.clientX, lastX: event.clientX, lastTime: performance.now(), pointerId: event.pointerId };
    state.dragging = true;
    gallery.setPointerCapture?.(event.pointerId);
  });
  gallery.addEventListener('pointermove', (event) => {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    if (landscapeQuery.matches) {
      const range = Math.max(96, viewport.clientWidth * .34);
      renderLandscape(state.index + Math.max(-1, Math.min(1, -dx / range)));
    } else renderPortrait(dx);
    gesture.lastX = event.clientX;
    gesture.lastTime = performance.now();
    event.preventDefault();
  }, { passive: false });
  const finishGesture = (event) => {
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const elapsed = Math.max(1, performance.now() - gesture.lastTime);
    const velocity = (event.clientX - gesture.lastX) / elapsed;
    const threshold = landscapeQuery.matches ? Math.max(96, viewport.clientWidth * .34) : Math.max(52, Math.min(96, viewport.clientWidth * .2));
    const direction = Math.abs(dx) >= threshold || (Math.abs(velocity) > (landscapeQuery.matches ? .42 : .45) && Math.abs(dx) > 12) ? (dx < 0 ? 1 : -1) : 0;
    state.dragging = false;
    if (direction) move(direction);
    else render();
    gesture = null;
  };
  gallery.addEventListener('pointerup', finishGesture);
  gallery.addEventListener('pointercancel', () => { state.dragging = false; gesture = null; render(); });
  window.addEventListener('resize', () => { containGallery(); render(); });
  landscapeQuery.addEventListener('change', () => { containGallery(); render(); });
  window.requestAnimationFrame(() => { containGallery(); render(); });
  window.setInterval(() => { if (!workGallery.hidden) move(state.manualDirection); }, 2000);
})();
