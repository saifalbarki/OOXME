(() => {
  const root = document.documentElement;
  const searchOverlay = document.querySelector('[data-search-overlay]');
  const searchInput = document.querySelector('[data-search-input]');
  const suggestion = document.querySelector('[data-search-suggestion]');
  const servicesGrid = document.querySelector('[data-services-grid]');
  const tiles = [...document.querySelectorAll('[data-service-tile]')];
  const descriptions = [
    ['Creates the visual and verbal foundations that make a brand distinctive, consistent, and easy to recognise.', 'يبني الأسس البصرية واللفظية التي تجعل العلامة مميزة ومتسقة وسهلة التعرّف.'],
    ['Plans and improves digital channels so they generate measurable attention, leads, and business growth.', 'يخطط القنوات الرقمية ويحسنها لتوليد اهتمام قابل للقياس وفرص نمو للأعمال.'],
    ['Moves business processes and customer experiences into practical, connected digital ways of working.', 'ينقل العمليات وتجارب العملاء إلى أساليب عمل رقمية عملية ومترابطة.'],
    ['Builds a consistent social media presence through clear themes, regular content, and audience engagement.', 'يبني حضوراً متسقاً على وسائل التواصل عبر محاور واضحة ومحتوى منتظم وتفاعل مع الجمهور.'],
    ['Designs and develops the technical tools, automations, and platforms that support digital operations.', 'يصمم ويطور الأدوات والأتمتة والمنصات التقنية التي تدعم العمليات الرقمية.'],
    ['Produces focused visual and written content that communicates a brand clearly across its key channels.', 'ينتج محتوى بصرياً وكتابياً مركزاً يوضح العلامة عبر قنواتها الأساسية.'],
    ['Maps and improves the workflows, roles, and operating routines that keep a business running clearly.', 'يرسم ويحسن سير العمل والأدوار والإجراءات التشغيلية التي تحافظ على وضوح سير الأعمال.'],
    ['Develops campaign concepts, messages, and rollouts that turn a defined objective into coordinated action.', 'يطور مفاهيم الحملات ورسائلها وتنفيذها لتحويل الهدف المحدد إلى عمل منسق.'],
    ['Strengthens team capability through role clarity, people processes, and practical talent development.', 'يعزز قدرة الفريق عبر وضوح الأدوار وعمليات الأفراد وتطوير المواهب بشكل عملي.']
  ];
  const prices = [
    ['Starting from $449', 'تبدأ من 449$'],
    ['Starting from $449', 'تبدأ من 449$'],
    ['Starting from $749', 'تبدأ من 749$'],
    ['Starting from $349/month', 'تبدأ من 349$/شهرياً'],
    ['Starting from $649', 'تبدأ من 649$'],
    ['Starting from $299', 'تبدأ من 299$'],
    ['Starting from $599', 'تبدأ من 599$'],
    ['Starting from $349 + ad spend', 'تبدأ من 349$ + ميزانية الإعلانات'],
    ['Starting from $299', 'تبدأ من 299$']
  ];
  let language = 'en';
  let expandedTile = null;
  let closing = false;
  let gesture = null;
  let suppressTileClick = false;
  const motionDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 420;
  try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  document.querySelectorAll('[data-service-close]').forEach((button) => button.remove());
  tiles.forEach((tile) => tile.setAttribute('aria-expanded', 'false'));
  tiles.forEach((tile, index) => {
    const description = tile.querySelector('.service-tile-expanded-content p');
    const price = tile.querySelector('.service-tile-price');
    description.dataset.en = descriptions[index][0];
    description.dataset.ar = descriptions[index][1];
    price.dataset.en = prices[index][0];
    price.dataset.ar = prices[index][1];
  });
  const applyLanguage = (next) => {
    language = next;
    root.lang = next;
    root.dir = next === 'ar' ? 'rtl' : 'ltr';
    document.title = next === 'ar' ? '\u0627\u0648\u0643\u0633\u0648\u0645 — \u0627\u0644\u062e\u062f\u0645\u0627\u062a' : 'OOXME — Services';
    document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[next]; });
    searchInput.placeholder = searchInput.dataset[`${next}Placeholder`];
    document.querySelectorAll('[data-language-toggle]').forEach((button) => button.setAttribute('aria-label', next === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'));
    try { localStorage.setItem('ooxme-language', next); } catch (_) {}
  };
  const ease = (progress) => 1 - Math.pow(1 - progress, 3);
  const rectAt = (from, to, progress) => {
    const amount = ease(progress);
    const fromCenterX = from.left + from.width / 2;
    const fromCenterY = from.top + from.height / 2;
    const toCenterX = to.left + to.width / 2;
    const toCenterY = to.top + to.height / 2;
    const width = from.width + (to.width - from.width) * amount;
    const height = from.height + (to.height - from.height) * amount;
    const centerX = fromCenterX + (toCenterX - fromCenterX) * amount;
    const centerY = fromCenterY + (toCenterY - fromCenterY) * amount;
    return { left: centerX - width / 2, top: centerY - height / 2, width, height };
  };
  const overlap = (first, second) => {
    const width = Math.max(0, Math.min(first.left + first.width, second.left + second.width) - Math.max(first.left, second.left));
    const height = Math.max(0, Math.min(first.top + first.height, second.top + second.height) - Math.max(first.top, second.top));
    return Math.min(1, (width * height) / (second.width * second.height));
  };
  const freezeTiles = (others, grid) => others.forEach(({ tile, rect }) => {
    tile.style.setProperty('--service-tile-left', `${rect.left - grid.left}px`);
    tile.style.setProperty('--service-tile-top', `${rect.top - grid.top}px`);
    tile.style.setProperty('--service-tile-width', `${rect.width}px`);
    tile.style.setProperty('--service-tile-height', `${rect.height}px`);
  });
  const releaseTiles = (others) => others.forEach(({ tile }) => {
    tile.style.removeProperty('--service-tile-left');
    tile.style.removeProperty('--service-tile-top');
    tile.style.removeProperty('--service-tile-width');
    tile.style.removeProperty('--service-tile-height');
    tile.style.opacity = '';
  });
  const scaledRadius = (radius, factor) => radius.replace(/([\d.]+)px/g, (_, value) => `${Number(value) * factor}px`);
  const animateFlip = (element, from, to, duration = motionDuration, reverse = false) => {
    const offsetX = to.left + to.width / 2 - (from.left + from.width / 2);
    const offsetY = to.top + to.height / 2 - (from.top + from.height / 2);
    const scaleX = to.width / from.width;
    const scaleY = to.height / from.height;
    const frames = reverse
      ? [{ transform: 'translate(0, 0) scale(1, 1)' }, { transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})` }]
      : [{ transform: `translate(${-offsetX}px, ${-offsetY}px) scale(${1 / scaleX}, ${1 / scaleY})` }, { transform: 'translate(0, 0) scale(1, 1)' }];
    if (element.matches('[data-service-tile]')) {
      const radius = getComputedStyle(element).borderRadius;
      const compensatedRadius = scaledRadius(radius, reverse ? 1 / Math.min(scaleX, scaleY) : Math.max(scaleX, scaleY));
      frames[0].borderRadius = reverse ? radius : compensatedRadius;
      frames[1].borderRadius = reverse ? compensatedRadius : radius;
    }
    return element.animate(frames,
    { duration, easing: 'cubic-bezier(.22, .61, .36, 1)', fill: reverse ? 'forwards' : 'none' });
  };
  const animateCoverage = (tile, from, to, others, reverse = false) => new Promise((resolve) => {
    const duration = motionDuration;
    const started = performance.now();
    tile.style.transformOrigin = 'center center';
    const animation = animateFlip(tile, from, to, duration, reverse);
    if (!duration) {
      others.forEach(({ tile: other }) => { other.style.opacity = reverse ? '1' : '0'; });
      animation.finished.finally(() => resolve(animation));
      return;
    }
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const current = reverse ? rectAt(from, to, progress) : rectAt(from, to, progress);
      others.forEach(({ tile: other, rect }) => { other.style.opacity = `${1 - overlap(current, rect)}`; });
      if (progress < 1) window.requestAnimationFrame(tick);
      else { animation.finished.finally(() => resolve(animation)); }
    };
    window.requestAnimationFrame(tick);
  });
  const openTile = async (tile) => {
    if (expandedTile || closing || !tile) return;
    const from = tile.getBoundingClientRect();
    const icon = tile.querySelector(':scope > img');
    const iconFrom = icon.getBoundingClientRect();
    const grid = servicesGrid.getBoundingClientRect();
    const others = tiles.filter((other) => other !== tile && getComputedStyle(other).display !== 'none').map((other) => ({ tile: other, rect: other.getBoundingClientRect() }));
    servicesGrid.style.setProperty('--services-expanded-height', `${grid.height}px`);
    freezeTiles(others, grid);
    expandedTile = tile;
    tile.setAttribute('aria-expanded', 'true');
    tile.classList.add('is-expanded');
    servicesGrid.classList.add('is-expanded');
    const to = tile.getBoundingClientRect();
    const iconTo = icon.getBoundingClientRect();
    const iconAnimation = animateFlip(icon, iconFrom, iconTo);
    window.requestAnimationFrame(() => tile.classList.add('is-content-visible'));
    const openingAnimation = await animateCoverage(tile, from, to, others);
    openingAnimation.cancel();
    iconAnimation.cancel();
  };
  const closeTile = async () => {
    if (!expandedTile || closing) return;
    closing = true;
    const tile = expandedTile;
    tile.classList.add('is-closing');
    tile.classList.remove('is-content-visible');
    const from = tile.getBoundingClientRect();
    const icon = tile.querySelector(':scope > img');
    const iconFrom = icon.getBoundingClientRect();
    tile.classList.remove('is-expanded');
    servicesGrid.classList.remove('is-expanded');
    const to = tile.getBoundingClientRect();
    tile.classList.add('is-expanded');
    servicesGrid.classList.add('is-expanded');
    const others = tiles.filter((other) => other !== tile && getComputedStyle(other).display !== 'none').map((other) => ({ tile: other, rect: other.getBoundingClientRect() }));
    const iconTo = icon.getBoundingClientRect();
    const iconAnimation = animateFlip(icon, iconFrom, iconTo, motionDuration, true);
    const closingAnimation = await animateCoverage(tile, from, to, others, true);
    tile.classList.remove('is-expanded');
    tile.classList.remove('is-closing');
    servicesGrid.classList.remove('is-expanded');
    closingAnimation.cancel();
    iconAnimation.cancel();
    servicesGrid.style.removeProperty('--services-expanded-height');
    releaseTiles(others);
    tile.setAttribute('aria-expanded', 'false');
    expandedTile = null;
    closing = false;
    tile.focus();
  };
  const closeSearch = () => {
    searchOverlay.classList.remove('is-open');
    window.setTimeout(() => { searchOverlay.hidden = true; }, 1450);
  };
  const updateSearch = () => {
    const query = searchInput.value.trim();
    searchOverlay.classList.toggle('is-typing', Boolean(query));
    suggestion.hidden = !query;
    if (query) suggestion.textContent = root.lang === 'ar' ? `اقتراح: «${query}»` : `Search for “${query}”`;
  };
  applyLanguage(language);
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => applyLanguage(language === 'ar' ? 'en' : 'ar')));
  tiles.forEach((tile) => {
    tile.addEventListener('pointerdown', (event) => {
      if (tile !== expandedTile || event.button !== 0) return;
      gesture = { tile, pointerId: event.pointerId, x: event.clientX, y: event.clientY, moved: false };
      tile.setPointerCapture?.(event.pointerId);
    });
    tile.addEventListener('pointermove', (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 18) gesture.moved = true;
    });
    tile.addEventListener('pointerup', (event) => {
      if (!gesture || gesture.pointerId !== event.pointerId) return;
      if (gesture.moved) { suppressTileClick = true; closeTile(); }
      gesture = null;
    });
    tile.addEventListener('pointercancel', () => { gesture = null; });
    tile.addEventListener('click', (event) => {
      if (suppressTileClick) { suppressTileClick = false; return; }
      if (tile === expandedTile) {
        if (!event.target.closest('button, a, input, select, textarea, label, summary, [role="link"], [contenteditable="true"]')) closeTile();
      } else openTile(tile);
    });
    tile.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      if (tile === expandedTile) closeTile();
      else openTile(tile);
    });
  });
  document.addEventListener('click', (event) => {
    if (!expandedTile || closing || suppressTileClick) return;
    if (event.target.closest('button, a, input, select, textarea, label, summary, [role="button"], [role="link"], [contenteditable="true"]')) return;
    if (event.target.closest('[data-service-tile]')) return;
    closeTile();
  });
  document.querySelectorAll('[data-search-toggle]').forEach((button) => button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (searchOverlay.hidden) {
      searchOverlay.hidden = false;
      window.requestAnimationFrame(() => searchOverlay.classList.add('is-open'));
    } else closeSearch();
  }));
  searchOverlay.addEventListener('click', closeSearch);
  searchOverlay.querySelectorAll('a, label').forEach((element) => element.addEventListener('click', (event) => event.stopPropagation()));
  searchInput.addEventListener('input', updateSearch);
})();
