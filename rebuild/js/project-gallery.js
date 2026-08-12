const root = document.documentElement;
const experience = document.querySelector('.project-experience');
const panelTrack = document.querySelector('[data-project-track]');
const isDesignedCollection = document.body.classList.contains('brands-designed-page');
const isUniqueWorksCollection = document.body.classList.contains('unique-works-page');
const isSecondaryCollection = isDesignedCollection || isUniqueWorksCollection;
const primaryAlBasriPanel = document.querySelector('[data-project-key="al-basri"]');
primaryAlBasriPanel.classList.add('project-panel--al-basri-primary');
const isAlBasriMallPanel = (panel) => !isSecondaryCollection && panel.dataset.projectKey === 'al-basri';
if (isAlBasriMallPanel(primaryAlBasriPanel)) primaryAlBasriPanel.classList.add('project-panel--al-basri-mall');
if (!isSecondaryCollection) {
  const remainingAlBasriPanel = primaryAlBasriPanel.cloneNode(true);
  remainingAlBasriPanel.classList.remove('is-active', 'project-panel--al-basri-primary', 'project-panel--al-basri-mall');
  remainingAlBasriPanel.dataset.projectKey = 'al-basri-remaining';
  primaryAlBasriPanel.after(remainingAlBasriPanel);
}
const panels = [...document.querySelectorAll('.project-panel')];
panels.forEach((panel) => panel.querySelector('.master-panel-content')?.classList.add('has-simplified-text-hierarchy'));
const managedDescriptions = {
  'al-basri': { en: 'The opening visual for Al Basri Commercial Group, shown in its complete original composition.', ar: 'المشهد الافتتاحي لمجموعة البصري التجارية، ويعرض هوية المشروع بتكوينها الاصلي الكامل.' },
  'al-basri-remaining': { en: 'The remaining Al Basri visuals document the identity through supporting compositions and project applications.', ar: 'مشاهد البصري المتبقية توثق هوية المشروع عبر تكوينات مساندة وتطبيقات مختلفة.' },
  'al-hafadhi': { en: 'Selected visuals for Al Hafadhi Complex show the project identity through its core compositions and communication pieces.', ar: 'مشاهد مختارة لمجمع الحفاظي تعرض هوية المشروع عبر تكويناته الرئيسية ومواد التواصل.' },
  lccd: { en: 'LCCD project visuals show the identity system across its principal compositions and branded applications.', ar: 'مشاهد مشروع إل سي سي دي تعرض نظام الهوية عبر التكوينات الرئيسية والتطبيقات المعتمدة.' }
};
managedDescriptions['al-basri'].en = 'A sequence of original Al Basri Commercial Group portraits, showing the project identity in full across its opening compositions and visual details.';
managedDescriptions['al-basri'].ar = 'سلسلة من مشاهد البصري الاصلية تعرض هوية مجموعة البصري التجارية كاملة عبر التكوينات الافتتاحية والتفاصيل البصرية.';
const designedDescriptions = {
  'al-basri': { en: 'Al-Fayhaa Eyewear identity visuals, presented through the project’s core brand compositions and details.', ar: 'مشاهد هوية عوينات الفيحاء تعرض تكوينات العلامة الرئيسية وتفاصيلها البصرية.' },
  'al-basri-remaining': { en: 'Fatima Faloos Clinic brand visuals, showing the project identity across its principal applications.', ar: 'مشاهد هوية عيادة فاطمة فلوس تعرض تطبيقات المشروع وتكويناته الرئيسية.' },
  lccd: { en: 'Al-Arjwan Company visual identity work, shown across the project’s selected compositions.', ar: 'مشاهد هوية شركة الارجوان تعرض التكوينات المختارة الخاصة بالمشروع.' }
};
const uniqueWorksDescriptions = {
  'al-basri': { en: 'Sawa University visual identity work, presented through the project’s selected brand compositions.', ar: 'مشاهد هوية جامعة ساوا تعرض التكوينات المختارة الخاصة بالمشروع.' },
  'al-basri-remaining': { en: 'Viir Hair Care identity visuals, showing the project’s distinctive visual system and applications.', ar: 'مشاهد هوية فير للعناية بالشعر تعرض النظام البصري وتطبيقاته المختارة.' },
  lccd: { en: 'Dr. Hameed Ibrahim identity work, shown through the project’s core visual compositions.', ar: 'مشاهد هوية الدكتور حميد ابراهيم تعرض التكوينات البصرية الرئيسية للمشروع.' }
};
const descriptions = isDesignedCollection ? designedDescriptions : (isUniqueWorksCollection ? uniqueWorksDescriptions : managedDescriptions);
panels.forEach((panel) => {
  const isMall = isAlBasriMallPanel(panel);
  const label = panel.querySelector('.master-panel-label') || document.createElement('p');
  const title = panel.querySelector('h1');
  if (isMall) {
    label.dataset.en = 'Portfolio';
    label.dataset.ar = 'بورتفوليو';
    label.textContent = label.dataset.en;
    title.dataset.en = 'Some Distinctive Story Designs';
    title.dataset.ar = 'بعض التصاميم المميزة للستوري';
    title.textContent = title.dataset.en;
  } else {
    // Remove the label element so the project title takes its actual layout
    // row instead of leaving a hidden Text 1 space behind.
    label.remove();
  }
  const copy = isMall
    ? { en: 'A selection of Story designs created for Al Basri Mall.', ar: 'مجموعة من تصاميم الستوري المختارة التي صممت لمول البصري.' }
    : descriptions[panel.dataset.projectKey];
  const description = document.createElement('p');
  description.dataset.en = copy.en;
  description.dataset.ar = copy.ar;
  description.textContent = copy.en;
  panel.querySelector('h1').after(description);
});
if (!isSecondaryCollection) {
  const hyperAlBasriPanel = document.querySelector('[data-project-key="al-basri-remaining"]');
  const title = hyperAlBasriPanel.querySelector('h1');
  title.dataset.en = 'Hyper Al-Basri';
  title.dataset.ar = 'هايبر البصري';
  title.textContent = title.dataset.en;
}
const alBasriHijabImages = [
  'photo_1_2026-08-11_13-31-55.jpg',
  'photo_2_2026-08-11_13-31-55.jpg',
  'photo_3_2026-08-11_13-31-55.jpg',
  'photo_4_2026-08-11_13-31-55.jpg'
].map((name) => `assets/projects/hijab/${name}`);
const alBasriMallImages = [
    '01','02','03','04','05','06','07','08','09','10','11','12','13',
    'photo_9_2026-08-02_22-22-30','photo_10_2026-08-02_22-22-30','photo_11_2026-08-02_22-22-30','photo_12_2026-08-02_22-22-30','photo_13_2026-08-02_22-22-30','photo_14_2026-08-02_22-22-30','photo_15_2026-08-02_22-22-30','photo_16_2026-08-02_22-22-30','photo_17_2026-08-02_22-22-30','photo_18_2026-08-02_22-22-30','photo_19_2026-08-02_22-22-30','photo_20_2026-08-02_22-22-30','photo_21_2026-08-02_22-22-30','photo_22_2026-08-02_22-22-30','photo_23_2026-08-02_22-22-30','photo_24_2026-08-02_22-22-30','photo_30_2026-08-02_22-22-30','photo_31_2026-08-02_22-22-30','photo_32_2026-08-02_22-22-30'
].map((name) => `assets/projects/mall albasri/design/optimized/${name}.webp`);
const projects = {
  'al-basri': [...alBasriHijabImages, ...alBasriMallImages],
  'al-basri-remaining': [
    '02','03','04','05','06','07','08','09','10','11','12','13',
    'photo_9_2026-08-02_22-22-30','photo_10_2026-08-02_22-22-30','photo_11_2026-08-02_22-22-30','photo_12_2026-08-02_22-22-30','photo_13_2026-08-02_22-22-30','photo_14_2026-08-02_22-22-30','photo_15_2026-08-02_22-22-30','photo_16_2026-08-02_22-22-30','photo_17_2026-08-02_22-22-30','photo_18_2026-08-02_22-22-30','photo_19_2026-08-02_22-22-30','photo_20_2026-08-02_22-22-30','photo_21_2026-08-02_22-22-30','photo_22_2026-08-02_22-22-30','photo_23_2026-08-02_22-22-30','photo_24_2026-08-02_22-22-30','photo_30_2026-08-02_22-22-30','photo_31_2026-08-02_22-22-30','photo_32_2026-08-02_22-22-30'
  ].map((name) => `assets/projects/mall albasri/design/optimized/${name}.webp`),
  'al-hafadhi': ['01','02','03','680834647_122233464092281512_299915486816428091_n','684893097_122234226248281512_430410977583519269_n','698751446_122235750074281512_7371237273873805886_n','699516729_122235739868281512_2873624234432086234_n','703010242_122236095194281512_6497023410256649022_n'].map((name) => `assets/projects/hfadhi/optimized/${name}.webp`),
  lccd: ['01','02','03','04'].map((name) => `assets/projects/lccd/optimized/${name}.webp`)
};
const designedProjects = {
  'al-basri': ['01','02','03','04'].map((name) => `assets/projects/alfayhaa/optimized/${name}.webp`),
  'al-basri-remaining': ['01','02','03','04'].map((name) => `assets/projects/fatimah/optimized/${name}.webp`),
  lccd: ['01','02','03','04'].map((name) => `assets/projects/arjwan/optimized/${name}.webp`)
};
const uniqueWorksProjects = {
  'al-basri': ['01','02','03','04'].map((name) => `assets/projects/Certificate/optimized/${name}.webp`),
  'al-basri-remaining': ['01','02','03','04','05','06'].map((name) => `assets/projects/viir/optimized/${name}.webp`),
  lccd: ['01','02'].map((name) => `assets/projects/hi/optimized/${name}.webp`)
};
const hyperAlBasriPortraitImages = [
  'assets/projects/hyper albasri/brand/optimized/01.webp', 'assets/projects/hyper albasri/brand/optimized/02.webp', 'assets/projects/hyper albasri/brand/optimized/03.webp',
  'assets/projects/hyper albasri/design/optimized/01.webp', 'assets/projects/hyper albasri/design/optimized/02.webp', 'assets/projects/hyper albasri/design/optimized/03.webp',
  'assets/projects/hyper albasri/photography/optimized/653705022_1373056574838158_4992073475210285288_n.webp', 'assets/projects/hyper albasri/photography/optimized/653705874_1373056748171474_8006362445612856687_n.webp', 'assets/projects/hyper albasri/photography/optimized/654230895_1373056528171496_3696531319146315376_n.webp', 'assets/projects/hyper albasri/photography/optimized/671863192_1397305842413231_7550947854691800551_n.webp', 'assets/projects/hyper albasri/photography/optimized/672086151_1397306872413128_4590329499495353294_n.webp', 'assets/projects/hyper albasri/photography/optimized/673998107_1397307595746389_3323947891888520029_n.webp', 'assets/projects/hyper albasri/photography/optimized/678292381_1402988008511681_8793644078490454581_n.webp', 'assets/projects/hyper albasri/photography/optimized/678414739_1402987855178363_3648089962308335357_n.webp'
];
const portraitLayoutQuery = window.matchMedia('(max-aspect-ratio: 4 / 3)');
const imagesForPanel = (panel) => isDesignedCollection ? designedProjects[panel.dataset.projectKey] : (isUniqueWorksCollection ? uniqueWorksProjects[panel.dataset.projectKey] : (panel.dataset.projectKey === 'al-basri-remaining' ? hyperAlBasriPortraitImages : projects[panel.dataset.projectKey]));
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchInput = document.querySelector('[data-search-input]');
const searchSuggestion = document.querySelector('[data-search-suggestion]');
const managedWideProjectLabels = {
  'al-basri': { en: 'Al-Basri Trading Group - Al-Basri Mall', ar: 'مجموعة البصري التجارية - مول البصري' },
  'al-basri-remaining': { en: 'Al-Basri Trading Group - Hyper Al-Basri', ar: 'مجموعة البصري التجارية - هايبر البصري' },
  'al-hafadhi': { en: 'Al-Hafadhi Complex', ar: 'مجمع الحفاظي' },
  lccd: { en: 'LCCD', ar: 'إل سي سي دي' }
};
const designedWideProjectLabels = {
  'al-basri': { en: 'Al-Fayhaa Eyewear', ar: 'عوينات الفيحاء' },
  'al-basri-remaining': { en: 'Fatima Faloos Clinic', ar: 'عيادة فاطمة فلوس' },
  lccd: { en: 'Al-Arjwan Company', ar: 'شركة الارجوان' }
};
const uniqueWorksWideProjectLabels = {
  'al-basri': { en: 'Sawa University', ar: 'جامعة ساوا' },
  'al-basri-remaining': { en: 'Viir Hair Care', ar: 'فير للعناية بالشعر' },
  lccd: { en: 'Dr. Hameed Ibrahim', ar: 'الدكتور حميد ابراهيم' }
};
const wideProjectLabels = isDesignedCollection ? designedWideProjectLabels : (isUniqueWorksCollection ? uniqueWorksWideProjectLabels : managedWideProjectLabels);
const applyWideProjectLabels = () => {};
const applyLanguage = (language) => {
  root.lang = language;
  root.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[language]; });
  searchInput.placeholder = searchInput.dataset[`${language}Placeholder`];
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.setAttribute('aria-label', language === 'ar' ? 'التبديل الى الانجليزية' : 'Switch to Arabic'));
  applyWideProjectLabels();
  try { localStorage.setItem('ooxme-language', language); } catch (_) {}
};
let language = 'en';
try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
applyLanguage(language);
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar')));
window.addEventListener('resize', applyWideProjectLabels);
let currentPanel = 0;
let panelTimer;
panelTrack.style.height = `${panels.length * 100}dvh`;
const revealPanel = (index) => panels.forEach((panel, number) => {
  const active = number === index;
  panel.classList.toggle('is-active', active);
  if (active) panel.querySelector('[data-project-gallery]')?.dispatchEvent(new CustomEvent('ooxme:gallery-activated', { bubbles: true }));
});
const moveToPanel = (index) => {
  const target = Math.max(0, Math.min(panels.length - 1, index));
  if (target === currentPanel) return;
  currentPanel = target;
  panels.forEach((panel) => panel.classList.remove('is-active'));
  panelTrack.style.transform = `translateY(${-currentPanel * 100}dvh)`;
  window.clearTimeout(panelTimer);
  panelTimer = window.setTimeout(() => revealPanel(currentPanel), 620);
};
window.OOXMEMasterPanelDrag?.register({ experience, track: panelTrack, panels, getIndex: () => currentPanel, moveTo: moveToPanel });
revealPanel(currentPanel);
document.querySelectorAll('[data-next-project]').forEach((button) => button.addEventListener('click', () => moveToPanel(currentPanel + 1)));
const galleries = new Map();
const galleryAutoplayDuration = 2000;
const primaryGallery = document.querySelector('.project-panel--al-basri-primary [data-project-gallery]');
const landscapeGalleryQuery = window.matchMedia('(min-aspect-ratio: 4 / 3)');
const isAlBasriMallGallery = (gallery) => gallery === primaryGallery && !isSecondaryCollection;
const isAlBasriMallPresentation = (gallery) => isAlBasriMallGallery(gallery);
const isAlBasriMallPortraitDeck = (gallery) => isAlBasriMallPresentation(gallery) && !landscapeGalleryQuery.matches;
const isSquareDepthDeck = (gallery) => !isAlBasriMallGallery(gallery) && Boolean(galleries.get(gallery)?.isSquareDeck);
const isPortraitDepthDeck = (gallery) => isSquareDepthDeck(gallery) || isAlBasriMallPortraitDeck(gallery);
const removeAlBasriMallPagination = (state) => {
  state.dots.replaceChildren();
  state.dots.classList.add('is-al-basri-mall-pagination-removed');
  state.dots.setAttribute('aria-hidden', 'true');
};
const publishGalleryProgress = (gallery, state, { reset = false } = {}) => {
  // Publish the active slide separately from the shared per-slide timer.
  gallery.dataset.activeImageIndex = `${state.index}`;
  gallery.dataset.totalImages = `${state.images.length}`;
  gallery.dispatchEvent(new CustomEvent('ooxme:gallery-progress', { bubbles: true, detail: { reset } }));
};
const restartGalleryProgress = (gallery, state) => {
  window.cancelAnimationFrame(state.progressFrame);
  state.progressStartedAt = performance.now();
  gallery.dataset.autoplayProgress = '0';
  const tick = (now) => {
    if (!gallery.closest('.project-panel')?.classList.contains('is-active')) return;
    const progress = Math.min(1, (now - state.progressStartedAt) / galleryAutoplayDuration);
    gallery.dataset.autoplayProgress = `${progress}`;
    if (progress < 1) state.progressFrame = window.requestAnimationFrame(tick);
  };
  state.progressFrame = window.requestAnimationFrame(tick);
};
const removeSquarePagination = (state) => {
  state.dots.replaceChildren();
  state.dots.classList.remove('project-gallery-progress-track');
  state.dots.classList.add('is-square-pagination-removed');
  state.dots.setAttribute('aria-hidden', 'true');
};
const populateGallery = (gallery, images, state) => {
  state.images = images;
  state.index = 0;
  state.cloneOffset = images.length > 1 ? 1 : 0;
  state.physicalIndex = state.cloneOffset;
  state.imageRatios = new Map();
  state.isSquareDeck = false;
  gallery.classList.remove('is-square-depth-deck');
  state.dots.classList.remove('is-square-pagination-removed');
  state.dots.classList.remove('is-al-basri-mall-pagination-removed');
  state.dots.removeAttribute('aria-hidden');
  state.rail.replaceChildren();
  state.dots.replaceChildren();
  if (isAlBasriMallGallery(gallery)) removeAlBasriMallPagination(state);
  publishGalleryProgress(gallery, state, { reset: true });
  const physicalImages = images.length > 1 ? [images[images.length - 1], ...images, images[0]] : images;
  physicalImages.forEach((src) => {
    const image = new Image();
    image.className = 'project-gallery-slide';
    image.src = src;
    image.alt = '';
    image.draggable = false;
    image.addEventListener('load', () => {
      state.imageRatios.set(src, image.naturalWidth / image.naturalHeight);
      if (state.imageRatios.size === state.images.length) {
        state.isSquareDeck = !isAlBasriMallGallery(gallery) && [...state.imageRatios.values()].every((ratio) => Math.abs(ratio - 1) <= .04);
        gallery.classList.toggle('is-square-depth-deck', state.isSquareDeck);
        if (state.isSquareDeck) {
          removeSquarePagination(state);
          renderSquareDepthDeck(gallery);
        }
      }
      window.requestAnimationFrame(() => syncWideGalleryCentering(gallery));
    });
    state.rail.append(image);
  });
  if (isAlBasriMallGallery(gallery)) return;
  images.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'project-gallery-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Image ${index + 1}`);
    dot.addEventListener('click', () => setGalleryImage(gallery, index));
    state.dots.append(dot);
  });
};
panels.forEach((panel) => {
  const gallery = panel.querySelector('[data-project-gallery]');
  const images = imagesForPanel(panel);
  const rail = gallery.querySelector('.project-gallery-track');
  const dots = gallery.querySelector('.project-gallery-dots');
  const state = { images: [], index: 0, physicalIndex: 0, cloneOffset: 0, rail, dots, viewport: gallery.querySelector('.project-gallery-viewport'), manualDirection: null, wrapTimer: null, progressFrame: 0, progressStartedAt: 0, arcDragging: false, arcDragX: 0, deckDragging: false, deckDragX: 0, imageRatios: new Map(), isSquareDeck: false };
  galleries.set(gallery, state);
  populateGallery(gallery, images, state);
  dots.addEventListener('pointerdown', (event) => dots.setPointerCapture?.(event.pointerId));
  dots.addEventListener('pointerup', (event) => {
    if (isSquareDepthDeck(gallery) || isAlBasriMallGallery(gallery)) return;
    if (event.target.closest('.project-gallery-dot')) return;
    const dot = [...dots.children].reduce((nearest, candidate) => {
      const currentDistance = Math.abs(candidate.getBoundingClientRect().left + candidate.getBoundingClientRect().width / 2 - event.clientX);
      const nearestDistance = nearest ? Math.abs(nearest.getBoundingClientRect().left + nearest.getBoundingClientRect().width / 2 - event.clientX) : Infinity;
      return currentDistance < nearestDistance ? candidate : nearest;
    }, null);
    if (dot) setGalleryImage(gallery, [...dots.children].indexOf(dot));
  });
  dots.addEventListener('pointercancel', (event) => {
    if (dots.hasPointerCapture?.(event.pointerId)) dots.releasePointerCapture(event.pointerId);
  });
});
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
const renderSquareDepthDeck = (gallery, dragX = 0) => {
  if (!isSquareDepthDeck(gallery)) return false;
  const state = galleries.get(gallery);
  const count = state.images.length;
  if (!count || !state.viewport.clientWidth) return true;

  const range = Math.max(72, state.viewport.clientWidth * .24);
  const progress = Math.min(1, Math.abs(dragX) / range);
  const direction = dragX
    ? (dragX < 0 ? 1 : -1)
    : (state.manualDirection ?? 1);
  const cardSize = state.viewport.clientWidth;
  const layerExposure = Math.min(16, Math.max(9, cardSize * .04));
  const availableRise = Math.max(0, state.viewport.clientHeight - cardSize);
  const maxDepth = Math.min(4, count - 1, Math.floor(availableRise / layerExposure));
  const rotation = Math.max(-4, Math.min(4, (dragX / range) * 4));
  const visible = new Map();
  visible.set(state.index, 0);
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    const imageIndex = deckIndexAt(state.index, direction, depth, count);
    visible.set(imageIndex, depth - progress);
  }

  state.rail.style.transform = 'none';
  state.rail.style.transition = 'none';
  state.rail.querySelectorAll('.project-gallery-slide').forEach((slide, physicalIndex) => {
    const imageIndex = physicalIndex - state.cloneOffset;
    const depth = visible.get(imageIndex);
    if (imageIndex < 0 || imageIndex >= count || depth === undefined) {
      slide.style.opacity = '0';
      slide.style.visibility = 'hidden';
      slide.style.pointerEvents = 'none';
      slide.style.zIndex = '0';
      slide.style.filter = 'none';
      slide.style.boxShadow = 'none';
      return;
    }
    const scale = Math.max(.76, 1 - depth * .06);
    // Offset the scale reduction first, then add a deliberate exposed strip.
    // This keeps every rear card's rounded top edge visible rather than hidden
    // behind the larger card in front of it.
    const translateY = -((1 - scale) * cardSize + depth * layerExposure);
    const isActive = imageIndex === state.index;
    const translateX = isActive ? dragX : 0;
    const rotate = isActive ? rotation : 0;
    const opacity = interpolateDepth([1, .95, .83, .66, .42], depth);
    const blur = interpolateDepth([0, .35, .8, 1.4, 2], depth);
    const shadowOffset = interpolateDepth([6, 5, 4, 3, 2], depth);
    const shadowBlur = interpolateDepth([18, 14, 10, 8, 6], depth);
    const shadowOpacity = interpolateDepth([.14, .11, .08, .05, .025], depth);
    slide.style.visibility = 'visible';
    slide.style.opacity = `${opacity}`;
    slide.style.pointerEvents = isActive ? 'auto' : 'none';
    slide.style.zIndex = `${100 - Math.round(depth * 10)}`;
    slide.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg) scale(${scale})`;
    slide.style.filter = blur ? `blur(${blur}px)` : 'none';
    slide.style.boxShadow = `0 ${shadowOffset}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`;
    slide.style.transition = state.deckDragging || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'none'
      : 'transform .34s cubic-bezier(.22, .75, .3, 1), opacity .34s ease, filter .34s ease, box-shadow .34s ease';
  });
  return true;
};
const renderAlBasriMallStoryDeck = (gallery, dragX = 0) => {
  const state = galleries.get(gallery);
  const count = state.images.length;
  const viewportHeight = state.viewport.clientHeight;
  const activeHeight = state.rail.children[state.cloneOffset]?.offsetHeight || viewportHeight;
  if (!count || !viewportHeight || !activeHeight) return true;

  // This mirrors the square-image deck's depth hierarchy while retaining the
  // Story card's approved active dimensions and portrait aspect ratio.
  const layerExposure = Math.min(16, Math.max(9, activeHeight * .04));
  const availableRise = Math.max(0, viewportHeight - activeHeight);
  const maxDepth = Math.min(4, count - 1, Math.floor(availableRise / layerExposure));
  const range = Math.max(72, state.viewport.clientWidth * .24);
  const dragProgress = Math.min(1, Math.abs(dragX) / range);
  const direction = dragX
    ? (dragX < 0 ? 1 : -1)
    : (state.manualDirection ?? 1);
  const rotation = Math.max(-4, Math.min(4, (dragX / range) * 4));
  const visible = new Map([[state.index, 0]]);
  for (let depth = 1; depth <= maxDepth; depth += 1) {
    visible.set(deckIndexAt(state.index, direction, depth, count), depth - dragProgress);
  }
  state.rail.style.transform = 'none';
  state.rail.style.transition = 'none';
  state.rail.querySelectorAll('.project-gallery-slide').forEach((slide, physicalIndex) => {
    const imageIndex = physicalIndex - state.cloneOffset;
    const depth = visible.get(imageIndex);
    if (imageIndex < 0 || imageIndex >= count || depth === undefined) {
      slide.style.opacity = '0';
      slide.style.visibility = 'hidden';
      slide.style.pointerEvents = 'none';
      slide.style.zIndex = '0';
      slide.style.filter = 'none';
      slide.style.boxShadow = 'none';
      return;
    }
    const scale = Math.max(.76, 1 - depth * .06);
    const translateY = -((1 - scale) * activeHeight + depth * layerExposure);
    const isActive = imageIndex === state.index;
    const opacity = interpolateDepth([1, .95, .83, .66, .42], depth);
    const blur = interpolateDepth([0, .35, .8, 1.4, 2], depth);
    const shadowOffset = interpolateDepth([6, 5, 4, 3, 2], depth);
    const shadowBlur = interpolateDepth([18, 14, 10, 8, 6], depth);
    const shadowOpacity = interpolateDepth([.14, .11, .08, .05, .025], depth);
    slide.style.visibility = 'visible';
    slide.style.opacity = `${opacity}`;
    slide.style.zIndex = `${100 - Math.round(depth * 10)}`;
    slide.style.pointerEvents = isActive ? 'auto' : 'none';
    slide.style.transform = `translate3d(calc(-50% + ${isActive ? dragX : 0}px), ${translateY}px, 0) rotate(${isActive ? rotation : 0}deg) scale(${scale})`;
    slide.style.filter = blur ? `blur(${blur}px)` : 'none';
    slide.style.boxShadow = `0 ${shadowOffset}px ${shadowBlur}px rgba(0, 0, 0, ${shadowOpacity})`;
    slide.style.transition = state.deckDragging ? 'none' : 'transform .34s cubic-bezier(.22, .75, .3, 1), opacity .34s ease, filter .34s ease, box-shadow .34s ease';
  });
  return true;
};
const renderAlBasriMallLandscapeRow = (gallery, center = galleries.get(gallery)?.index ?? 0) => {
  const state = galleries.get(gallery);
  const count = state.images.length;
  const viewportWidth = state.viewport.clientWidth;
  const viewportHeight = state.viewport.clientHeight;
  if (!count || !viewportWidth || !viewportHeight) return true;

  const activeWidth = viewportHeight * 9 / 16;
  const sideScale = .3;
  const sideWidth = activeWidth * sideScale;
  const smallGap = Math.min(16, Math.max(8, viewportWidth * .012));
  const focusGap = Math.min(80, Math.max(36, viewportWidth * .05));
  const firstSideOffset = activeWidth / 2 + focusGap + sideWidth / 2;
  const remainingWidth = Math.max(0, viewportWidth / 2 - firstSideOffset);
  const visibleLevels = Math.min(count - 1, 1 + Math.floor(remainingWidth / (sideWidth + smallGap)));

  state.rail.style.transform = 'none';
  state.rail.style.transition = 'none';
  state.rail.querySelectorAll('.project-gallery-slide').forEach((slide, physicalIndex) => {
    const imageIndex = physicalIndex - state.cloneOffset;
    if (imageIndex < 0 || imageIndex >= count) {
      slide.style.opacity = '0';
      slide.style.visibility = 'hidden';
      slide.style.pointerEvents = 'none';
      return;
    }
    const distance = circularDistance(imageIndex, center, count);
    const depth = Math.abs(distance);
    if (depth > visibleLevels + .05) {
      const sign = Math.sign(distance) || 1;
      const offscreenOffset = firstSideOffset + (visibleLevels + 1) * (sideWidth + smallGap);
      slide.style.opacity = '0';
      slide.style.visibility = 'hidden';
      slide.style.pointerEvents = 'none';
      slide.style.zIndex = '0';
      slide.style.filter = 'none';
      slide.style.boxShadow = 'none';
      slide.style.transform = `translate3d(calc(-50% + ${sign * offscreenOffset}px), 0, 0) scale(${sideScale})`;
      slide.style.transition = 'none';
      return;
    }
    const sign = Math.sign(distance);
    const horizontalOffset = depth <= 1
      ? depth * firstSideOffset
      : firstSideOffset + (depth - 1) * (sideWidth + smallGap);
    const scale = .3 + .7 * Math.max(0, 1 - depth);
    slide.style.visibility = 'visible';
    slide.style.opacity = `${Math.max(.56, 1 - depth * .14)}`;
    slide.style.zIndex = `${100 - Math.round(depth * 10)}`;
    slide.style.pointerEvents = depth < .5 ? 'auto' : 'none';
    slide.style.filter = 'none';
    slide.style.boxShadow = 'none';
    slide.style.transform = `translate3d(calc(-50% + ${sign * horizontalOffset}px), 0, 0) scale(${scale})`;
    slide.style.transition = state.arcDragging ? 'none' : 'transform .38s cubic-bezier(.22, .61, .36, 1), opacity .3s ease';
  });
  return true;
};
const renderAlBasriMallPresentation = (gallery, center = galleries.get(gallery)?.index ?? 0) => {
  if (!isAlBasriMallPresentation(gallery)) return false;
  gallery.classList.add('is-al-basri-mall-story');
  return landscapeGalleryQuery.matches
    ? renderAlBasriMallLandscapeRow(gallery, center)
    : renderAlBasriMallStoryDeck(gallery);
};
const renderPortraitDepthDeck = (gallery, dragX = 0) => {
  if (isAlBasriMallPortraitDeck(gallery)) return renderAlBasriMallStoryDeck(gallery, dragX);
  return renderSquareDepthDeck(gallery, dragX);
};
const clearAlBasriMallPresentation = (gallery) => {
  if (gallery !== primaryGallery) return;
  const state = galleries.get(gallery);
  gallery.classList.remove('is-al-basri-mall-story');
  state.rail.style.transform = '';
  state.rail.style.transition = '';
  state.rail.querySelectorAll('.project-gallery-slide').forEach((slide) => {
    ['opacity', 'visibility', 'pointer-events', 'z-index', 'transform', 'transition', 'filter', 'box-shadow'].forEach((property) => slide.style.removeProperty(property));
  });
};
const placeGalleryAtPhysicalIndex = (gallery, physicalIndex, smooth = true) => {
  const state = galleries.get(gallery);
  const target = state.rail.children[physicalIndex];
  if (!target) return;
  if (renderAlBasriMallPresentation(gallery)) return;
  if (renderSquareDepthDeck(gallery)) return;
  const wideProjectGallery = window.matchMedia('(min-aspect-ratio: 4 / 3)').matches;
  if (wideProjectGallery) {
    if (smooth) state.viewport.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    else state.viewport.scrollLeft = target.offsetLeft;
    return;
  }
  state.rail.style.transition = smooth ? '' : 'none';
  state.rail.style.transform = `translateX(${-physicalIndex * 100}%)`;
  if (!smooth) window.requestAnimationFrame(() => { state.rail.style.transition = ''; });
};
const updateGalleryDots = (state, { wrap = false } = {}) => {
  if (state.isSquareDeck) return;
  [...state.dots.children].forEach((dot, index) => dot.classList.toggle('is-active', index === state.index));
};
const normalizeGalleryWrap = (gallery) => {
  const state = galleries.get(gallery);
  const imageCount = state.images.length;
  if (imageCount < 2) return;
  window.clearTimeout(state.wrapTimer);
  if (state.physicalIndex !== 0 && state.physicalIndex !== imageCount + 1) return;
  state.wrapTimer = window.setTimeout(() => {
    state.physicalIndex = state.physicalIndex === 0 ? imageCount : 1;
    placeGalleryAtPhysicalIndex(gallery, state.physicalIndex, false);
  }, 550);
};
const setGalleryImage = (gallery, requested) => {
  const state = galleries.get(gallery);
  const imageCount = state.images.length;
  if (imageCount < 2) {
    updateGalleryDots(state);
    publishGalleryProgress(gallery, state);
    return;
  }
  if (state.physicalIndex === 0) { state.physicalIndex = imageCount; placeGalleryAtPhysicalIndex(gallery, imageCount, false); }
  if (state.physicalIndex === imageCount + 1) { state.physicalIndex = 1; placeGalleryAtPhysicalIndex(gallery, 1, false); }
  const forward = requested === state.index + 1;
  const backward = requested === state.index - 1;
  if (forward || backward) {
    const direction = forward ? 1 : -1;
    const wraps = (direction === 1 && state.index === imageCount - 1) || (direction === -1 && state.index === 0);
    state.index = (state.index + direction + imageCount) % imageCount;
    state.physicalIndex += direction;
    placeGalleryAtPhysicalIndex(gallery, state.physicalIndex);
    updateGalleryDots(state, { wrap: wraps });
    publishGalleryProgress(gallery, state, { reset: true });
    restartGalleryProgress(gallery, state);
    normalizeGalleryWrap(gallery);
    return;
  }
  state.index = (requested + imageCount) % imageCount;
  state.physicalIndex = state.index + 1;
  placeGalleryAtPhysicalIndex(gallery, state.physicalIndex);
  updateGalleryDots(state);
  publishGalleryProgress(gallery, state, { reset: true });
  restartGalleryProgress(gallery, state);
};
const syncWideGalleryCentering = (gallery) => {
  const state = galleries.get(gallery);
  if (isAlBasriMallPresentation(gallery)) {
    renderAlBasriMallPresentation(gallery);
    return;
  }
  if (isSquareDepthDeck(gallery)) {
    renderSquareDepthDeck(gallery);
    return;
  }
  const isWide = window.matchMedia('(min-aspect-ratio: 4 / 3)').matches;
  const firstRealSlide = state.rail.children[state.cloneOffset];
  const gap = Number.parseFloat(getComputedStyle(state.rail).gap) || 0;
  const realStripWidth = firstRealSlide ? firstRealSlide.getBoundingClientRect().width * state.images.length + gap * Math.max(0, state.images.length - 1) : 0;
  gallery.classList.toggle('is-centered', Boolean(isWide && realStripWidth <= state.viewport.clientWidth));
};
galleries.forEach((_, gallery) => setGalleryImage(gallery, 0));
panelTrack.addEventListener('ooxme:gallery-activated', (event) => {
  const gallery = event.target.closest('[data-project-gallery]');
  const state = galleries.get(gallery);
  if (state) restartGalleryProgress(gallery, state);
});
galleries.forEach((state, gallery) => {
  if (gallery.closest('.project-panel')?.classList.contains('is-active')) restartGalleryProgress(gallery, state);
});
window.requestAnimationFrame(() => galleries.forEach((_, gallery) => syncWideGalleryCentering(gallery)));
window.setTimeout(() => galleries.forEach((_, gallery) => syncWideGalleryCentering(gallery)), 700);
window.addEventListener('resize', () => galleries.forEach((_, gallery) => syncWideGalleryCentering(gallery)));
landscapeGalleryQuery.addEventListener('change', () => {
  const state = galleries.get(primaryGallery);
  placeGalleryAtPhysicalIndex(primaryGallery, state.physicalIndex, false);
  syncWideGalleryCentering(primaryGallery);
});
let portraitSourceActive = portraitLayoutQuery.matches;
const refreshSecondAlBasriGallery = () => {
  if (portraitSourceActive === portraitLayoutQuery.matches) return;
  portraitSourceActive = portraitLayoutQuery.matches;
  const panel = document.querySelector('[data-project-key="al-basri-remaining"]');
  const gallery = panel.querySelector('[data-project-gallery]');
  const state = galleries.get(gallery);
  const images = imagesForPanel(panel);
  populateGallery(gallery, images, state);
  setGalleryImage(gallery, 0);
  window.requestAnimationFrame(() => syncWideGalleryCentering(gallery));
};
portraitLayoutQuery.addEventListener('change', refreshSecondAlBasriGallery);
window.setInterval(() => {
  if (!primaryGallery.closest('.project-panel').classList.contains('is-active')) return;
  const state = galleries.get(primaryGallery);
  if (state.arcDragging || state.deckDragging) return;
  const direction = state.manualDirection ?? 1;
  setGalleryImage(primaryGallery, state.index + direction);
}, 2000);
window.setInterval(() => {
  const activeGallery = document.querySelector('.project-panel.is-active [data-project-gallery]');
  if (!activeGallery || activeGallery === primaryGallery) return;
  const state = galleries.get(activeGallery);
  // Existing landscape autoplay now serves portrait too when the active gallery
  // is the shared square deck. Non-square portrait galleries stay unchanged.
  if (!window.matchMedia('(min-aspect-ratio: 4 / 3)').matches && !isSecondaryCollection && !isSquareDepthDeck(activeGallery)) return;
  if (state.deckDragging) return;
  const direction = state.manualDirection ?? 1;
  setGalleryImage(activeGallery, state.index + direction);
}, 2000);
let galleryGesture = null;
document.querySelectorAll('[data-project-gallery]').forEach((gallery) => {
  gallery.addEventListener('pointerdown', (event) => {
    const state = galleries.get(gallery);
    if (isPortraitDepthDeck(gallery)) state.deckDragging = true;
    else if (isAlBasriMallPresentation(gallery)) state.arcDragging = true;
    galleryGesture = { gallery, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: performance.now(), pointerId: event.pointerId };
    gallery.setPointerCapture?.(event.pointerId);
  });
  gallery.addEventListener('pointermove', (event) => {
    if (!galleryGesture || galleryGesture.gallery !== gallery || galleryGesture.pointerId !== event.pointerId) return;
    const state = galleries.get(gallery);
    const dx = event.clientX - galleryGesture.x;
    if (isPortraitDepthDeck(gallery)) {
      state.deckDragX = dx;
      renderPortraitDepthDeck(gallery, dx);
    } else if (isAlBasriMallPresentation(gallery)) {
      state.arcDragX = dx;
      const range = Math.max(96, state.viewport.clientWidth * .34);
      const center = state.index + Math.max(-1, Math.min(1, -dx / range));
      renderAlBasriMallPresentation(gallery, center);
    } else return;
    galleryGesture.lastX = event.clientX;
    galleryGesture.lastTime = performance.now();
    event.preventDefault();
    event.stopPropagation();
  }, { passive: false });
  gallery.addEventListener('pointerup', (event) => {
    if (!galleryGesture || galleryGesture.pointerId !== event.pointerId) return;
    const state = galleries.get(gallery);
    const dx = event.clientX - galleryGesture.x;
    const dy = event.clientY - galleryGesture.y;
    if (isPortraitDepthDeck(gallery)) {
      const threshold = Math.max(52, Math.min(96, state.viewport.clientWidth * .2));
      const elapsed = Math.max(1, performance.now() - galleryGesture.lastTime);
      const velocity = (event.clientX - galleryGesture.lastX) / elapsed;
      const direction = Math.abs(dx) >= threshold || (Math.abs(velocity) > .45 && Math.abs(dx) > 12)
        ? (dx < 0 ? 1 : -1)
        : 0;
      state.deckDragging = false;
      state.deckDragX = 0;
      if (direction) {
        state.manualDirection = direction;
        setGalleryImage(gallery, state.index + direction);
      } else renderPortraitDepthDeck(gallery);
      galleryGesture = null;
      return;
    }
    if (isAlBasriMallPresentation(gallery)) {
      const range = Math.max(96, state.viewport.clientWidth * .34);
      const progress = Math.max(-1, Math.min(1, -dx / range));
      const elapsed = Math.max(1, performance.now() - galleryGesture.lastTime);
      const velocity = (event.clientX - galleryGesture.lastX) / elapsed;
      let direction = Math.round(progress);
      if (!direction && Math.abs(velocity) > .42 && Math.abs(dx) > 12) direction = velocity < 0 ? 1 : -1;
      state.arcDragging = false;
      state.arcDragX = 0;
      if (direction) {
        state.manualDirection = direction;
        setGalleryImage(gallery, state.index + direction);
      } else {
        renderAlBasriMallPresentation(gallery);
      }
      galleryGesture = null;
      return;
    }
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 12) {
      if (Math.abs(dx) > Math.abs(dy)) {
        const direction = dx < 0 ? 1 : -1;
        if (gallery === primaryGallery || isSecondaryCollection || window.matchMedia('(min-aspect-ratio: 4 / 3)').matches) galleries.get(gallery).manualDirection = direction;
        setGalleryImage(gallery, galleries.get(gallery).index + direction);
      }
      else return;
    }
    galleryGesture = null;
  });
  gallery.addEventListener('pointercancel', () => {
    if (isPortraitDepthDeck(gallery)) {
      const state = galleries.get(gallery);
      state.deckDragging = false;
      state.deckDragX = 0;
      renderPortraitDepthDeck(gallery);
    }
    if (isAlBasriMallPresentation(gallery)) {
      const state = galleries.get(gallery);
      state.arcDragging = false;
      state.arcDragX = 0;
      renderAlBasriMallPresentation(gallery);
    }
    galleryGesture = null;
  });
});
let searchCloseTimer;
const resizeSearchInput = () => { searchInput.style.height = '24px'; searchInput.style.height = `${searchInput.scrollHeight}px`; searchOverlay.querySelector('.search-overlay-field').style.height = `${Math.max(48, searchInput.scrollHeight + 24)}px`; };
const updateSearchState = () => { const query = searchInput.value.trim(); searchOverlay.classList.toggle('is-typing', Boolean(query)); searchSuggestion.hidden = !query; if (query) searchSuggestion.textContent = root.lang === 'ar' ? `اقتراح: «${query}»` : `Search for “${query}”`; resizeSearchInput(); };
const setSearchOpen = (open) => { window.clearTimeout(searchCloseTimer); if (open) { searchOverlay.hidden = false; updateSearchState(); window.requestAnimationFrame(() => searchOverlay.classList.add('is-open')); return; } searchOverlay.classList.remove('is-open'); searchCloseTimer = window.setTimeout(() => { searchOverlay.hidden = true; }, 1450); };
document.querySelectorAll('[data-search-toggle]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); setSearchOpen(searchOverlay.hidden); }));
searchOverlay.addEventListener('click', () => setSearchOpen(false));
searchOverlay.querySelectorAll('a, label, [data-search-suggestion]').forEach((element) => element.addEventListener('click', (event) => event.stopPropagation()));
searchInput.addEventListener('input', updateSearchState);
