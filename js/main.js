(() => {
  'use strict';

  const page = document.querySelector('.s-page');
  const content = document.querySelector('.s-page__content');
  const composer = document.querySelector('[data-s-composer]');
  const composerMenu = document.querySelector('[data-s-composer-menu]');
  const sendUtilities = document.querySelector('[data-s-send-utilities]');
  const sendThemeUtility = document.querySelector('[data-s-utility="theme"]');
  const sendLanguageUtility = document.querySelector('[data-s-utility="language"]');
  const addButton = document.querySelector('.s-page__add');
  const input = document.querySelector('.s-page__composer-input');
  const submitButton = composer?.querySelector('button[type="submit"]');
  const logoParticleField = document.querySelector('[data-s-logo-particles]');
  const logoParticleCanvas = document.querySelector('[data-s-logo-particle-canvas]');
  const firstGroup = document.querySelector('[data-s-first-group]');
  const nextImageTextGroup = document.querySelector('[data-s-copy-group="1"]');
  const sectionTwoTextGroups = Array.from(document.querySelectorAll('[data-s-section-2-text]'));
  const majorSections = Array.from(document.querySelectorAll('[data-s-major-section]'));
  const galleryPreview = document.querySelector('[data-s-gallery-preview]');
  const getNavigableMajorSections = () => majorSections.filter((section) => getComputedStyle(section).display !== 'none');
  let mainSpacingFrame = 0;
  const scheduleMainContentSpacing = () => {
    if (!page?.classList.contains('s-page--main') || mainSpacingFrame) return;
    mainSpacingFrame = window.requestAnimationFrame(() => {
      mainSpacingFrame = 0;
      const x = Number.parseFloat(getComputedStyle(content).paddingInlineStart) || 16;
      const sectionOne = majorSections[0];
      const gallery = document.querySelector('[data-s-gallery-preview]');
      const contact = document.querySelector('.s-page__major-section--contact');
      const visibleBounds = (elements) => elements.map((element) => element.getBoundingClientRect())
        .filter((rect) => rect.width > 0 && rect.height > 0);
      if (!sectionOne || !gallery || !contact) return;

      gallery.style.marginBlockStart = '0px';
      contact.style.marginBlockStart = '0px';
      const sectionOneVisibleBounds = visibleBounds(
        Array.from(sectionOne.querySelectorAll('[data-s-main-section-1-image-card]'))
      );
      if (!sectionOneVisibleBounds.length) return;
      const sectionOneBottom = Math.max(...sectionOneVisibleBounds.map((rect) => rect.bottom + window.scrollY));
      const galleryStage = gallery.querySelector('[data-s-gallery-preview-action]');
      const galleryTop = galleryStage.getBoundingClientRect().top + window.scrollY;
      gallery.style.marginBlockStart = `${8 * x - (galleryTop - sectionOneBottom)}px`;

      const activeCopy = gallery.querySelector('.s-page__gallery-preview-copy > div:not([aria-hidden="true"])') || gallery.querySelector('.s-page__gallery-preview-copy > div');
      const cta = activeCopy?.querySelector('.s-page__gallery-preview-cta');
      const consultationCta = contact.querySelector('[data-s-contact-consultation-cta]');
      const consultationDotField = contact.querySelector('[data-s-consultation-dot-field]');
      const consultationText = contact.querySelector('.s-page__contact-consultation-text');
      if (consultationCta && consultationDotField) {
        const consultationFieldWidth = consultationCta.getBoundingClientRect().width;
        const consultationDotDiameter = 14.8;
        const originalGridStep = consultationFieldWidth / 8;
        const originalRowGap = Math.max(0, originalGridStep - consultationDotDiameter);
        const consultationFieldHeight = (consultationDotDiameter * 3) + (originalRowGap * 2);
        consultationDotField.style.setProperty('--s-consultation-dot-size', `${consultationFieldWidth}px`);
        consultationDotField.style.setProperty('--s-consultation-dot-height', `${consultationFieldHeight}px`);
        const formationCenterX = consultationFieldWidth / 2;
        const formationCenterY = consultationFieldHeight / 2;
        consultationDotField.querySelectorAll('.s-page__consultation-dot').forEach((dot) => {
          const row = Number(dot.dataset.dotRow) || 0;
          dot.style.setProperty('--dot-top', `${(consultationDotDiameter / 2) + (row * (consultationDotDiameter + originalRowGap))}px`);
          const formationIndex = Number(dot.dataset.formationIndex);
          if (Number.isInteger(formationIndex)) {
            const formationColumn = (formationIndex % 3) - 1;
            const formationRow = Math.floor(formationIndex / 3) - 1;
            dot.style.setProperty('--formation-left', `${formationCenterX + (formationColumn * originalGridStep)}px`);
            dot.style.setProperty('--formation-top', `${formationCenterY + (formationRow * originalGridStep)}px`);
          }
        });
        if (consultationText) {
          const contactRect = contact.getBoundingClientRect();
          const textRect = consultationText.getBoundingClientRect();
          const fieldHeight = consultationDotField.getBoundingClientRect().height;
          const consultationDotGap = x * 2;
          consultationDotField.style.setProperty(
            '--s-consultation-dot-top',
            `${textRect.top - contactRect.top - fieldHeight - consultationDotGap}px`
          );
        }
      }
      if (cta && consultationCta) {
        const consultationRect = consultationCta.getBoundingClientRect();
        cta.style.inlineSize = `${consultationRect.width}px`;
        cta.style.translate = '50% 0';
        const positionedRect = cta.getBoundingClientRect();
        const centerOffset = ((consultationRect.left + consultationRect.right) - (positionedRect.left + positionedRect.right)) / 2;
        cta.style.translate = `calc(50% + ${centerOffset}px) 0`;
      }
      const consultationStart = consultationDotField || contact.querySelector('[data-s-contact-consultation] .s-page__contact-consultation-text .s-page__group-title');
      if (cta && consultationStart) {
        const ctaBottom = cta.getBoundingClientRect().bottom + window.scrollY;
        const consultationTop = consultationStart.getBoundingClientRect().top + window.scrollY;
        contact.style.marginBlockStart = `${8 * x - (consultationTop - ctaBottom)}px`;
      }
    });
  };
  const localizedGroups = Array.from(document.querySelectorAll('[data-s-copy-group]'))
    .sort((first, second) => Number(first.dataset.sCopyGroup) - Number(second.dataset.sCopyGroup));
  const conversation = document.querySelector('[data-s-conversation]');
  const conversationFinal = document.querySelector('[data-s-conversation-final]');
  const conversationFinalCopy = document.querySelector('[data-s-conversation-final-copy]');
  const sections = Array.from(document.querySelectorAll('[data-s-section]')).map((element) => ({
    element,
    groups: Array.from(element.querySelectorAll('[data-s-group]'))
  }));
  const groups = sections.flatMap((section) => section.groups);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // No current route implements the retired focused /z composition.
  const isZPage = false;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  document.documentElement.classList.add('s-x-discrete-sections', 's-main-free-scroll');

  if (!page || !content || !composer || !composerMenu || !sendUtilities || !sendThemeUtility || !sendLanguageUtility || !addButton || !input || !submitButton || !logoParticleField || !logoParticleCanvas || !firstGroup || !conversation || !conversationFinal || !conversationFinalCopy || !sections.length || !majorSections.length || !localizedGroups.length) return;

  // Homepage ordinary content uses one shared reveal. The Gallery card stage
  // and Consultation dot field keep their dedicated motion systems.
  const homepageRevealTargets = [
    galleryPreview?.querySelector('.s-page__gallery-preview-copy')
  ].filter(Boolean);
  homepageRevealTargets.forEach((target) => target.classList.add('s-page__home-reveal'));
  if (homepageRevealTargets.length) {
    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
      homepageRevealTargets.forEach((target) => target.classList.add('is-home-revealed'));
    } else {
      const homepageRevealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-home-revealed');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15 });
      homepageRevealTargets.forEach((target) => homepageRevealObserver.observe(target));
    }
  }

  const consultationDotField = document.querySelector('[data-s-consultation-dot-field]');
  const consultationText = document.querySelector('[data-s-contact-consultation] .s-page__contact-consultation-text');
  const consultationGroup = document.querySelector('.s-page__flow-group--section-8-contact');
  if (consultationDotField && consultationText) {
    const consultationAction = consultationGroup?.querySelector('.s-page__contact-consultation-action');
    const consultationSeparator = consultationGroup?.querySelector('.s-page__contact-separator');
    const consultationRemainder = [
      ...Array.from(consultationGroup?.querySelectorAll('.s-page__contact-button, .s-page__legal-link, .s-page__rights-copy') || [])
    ].filter(Boolean);
    const revealContactRemainder = () => {
      consultationRemainder.forEach((element) => element.classList.add('is-contact-revealed'));
    };
    // Three-row source grid: nine columns, three evenly spaced rows.
    // These fixed indices intentionally keep the red activation pattern
    // irregular without introducing runtime randomness.
    const selectedDotIndices = [18, 10, 2, 21, 4, 14, 24, 7, 8];
    const selectedDots = [];
    const initialFieldWidth = consultationGroup?.querySelector('[data-s-contact-consultation-cta]')?.getBoundingClientRect().width || 220;
    const initialRowGap = Math.max(0, (initialFieldWidth / 8) - 14.8);
    for (let index = 0; index < 27; index += 1) {
      const dot = document.createElement('span');
      const gridX = index % 9;
      const gridY = Math.floor(index / 9);
      dot.className = 's-page__consultation-dot';
      dot.dataset.dotRow = String(gridY);
      dot.style.setProperty('--dot-left', `${gridX * 12.5}%`);
      dot.style.setProperty('--dot-top', `${(14.8 / 2) + (gridY * (14.8 + initialRowGap))}px`);
      const selectedIndex = selectedDotIndices.indexOf(index);
      if (selectedIndex >= 0) {
        dot.classList.add('is-selected');
        dot.dataset.formationIndex = String(selectedIndex);
        dot.style.setProperty('--blue-wave-delay', `${[140, 70, 140, 70, 0, 70, 140, 70, 140][selectedIndex]}ms`);
        selectedDots.push(dot);
      }
      consultationDotField.append(dot);
    }
    scheduleMainContentSpacing();

    consultationText.classList.add('is-dot-pending');
    // Contact controls are independent of the Consultation dot timeline.
    // Make them available immediately so direct Contact navigation never waits
    // for the title, CTA, or dot sequence.
    revealContactRemainder();

    const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
    const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(resolve));
    const waitForTransition = (element, properties, fallback) => new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        element.removeEventListener('transitionend', onEnd);
        window.clearTimeout(timeout);
        resolve();
      };
      const onEnd = (event) => {
        if (event.target === element && properties.includes(event.propertyName)) finish();
      };
      const timeout = window.setTimeout(finish, fallback);
      element.addEventListener('transitionend', onEnd);
    });

    const showConsultationTitle = () => {
      consultationText.classList.add('is-title-revealed');
    };
    const showConsultationDescription = () => {
      consultationText.classList.add('is-description-revealed');
    };
    const showConsultationRemainder = () => {
      consultationDotField.classList.add('is-complete');
      consultationText.classList.remove('is-dot-pending');
      consultationText.classList.add('is-dot-revealed');
      consultationAction?.classList.add('is-consultation-revealed');
    };
    const showConsultationSeparator = () => {
      consultationSeparator?.classList.add('is-consultation-revealed');
    };

    const redIntervals = [150, 125, 105, 90, 78, 67, 57, 49, 42];
    // Read the blue sequence in the rendered 3x3 formation: center, top-middle,
    // then the surrounding positions clockwise.
    const blueFormationOrder = [[1, 1], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0], [0, 0]];
    const selectedDotsByFormation = new Map(selectedDots.map((dot) => [Number(dot.dataset.formationIndex), dot]));
    const blueOrder = blueFormationOrder
      .map(([row, column]) => selectedDotsByFormation.get((row * 3) + column))
      .filter(Boolean);
    const runDotTimeline = async () => {
      consultationDotField.dataset.dotStage = 'red';
      let activeRedDot = null;
      for (let index = 0; index < selectedDots.length; index += 1) {
        const dot = selectedDots[index];
        activeRedDot?.classList.remove('is-red-active');
        dot.classList.add('is-red');
        dot.classList.add('is-red-active');
        activeRedDot = dot;
        await nextFrame();
        dot.classList.add('is-red-settled');
        await waitForTransition(dot, ['transform'], 180);
        if (index < selectedDots.length - 1) await wait(redIntervals[index]);
      }

      consultationDotField.dataset.dotStage = 'moving';
      selectedDots.forEach((dot) => dot.classList.remove('is-red-active'));
      consultationDotField.classList.add('is-organizing', 'is-gathering');
      await waitForTransition(selectedDots[0], ['top', 'left'], 620);

      consultationDotField.dataset.dotStage = 'red-hold';
      await wait(220);

      consultationDotField.dataset.dotStage = 'blue';
      let activeBlueDot = null;
      for (let index = 0; index < blueOrder.length; index += 1) {
        const dot = blueOrder[index];
        activeBlueDot?.classList.remove('is-blue-active');
        dot.classList.add('is-blue');
        dot.classList.add('is-blue-active');
        activeBlueDot = dot;
        if (index === 0) showConsultationTitle();
        if (index === 3) showConsultationDescription();
        await nextFrame();
        dot.classList.add('is-blue-settled');
        await waitForTransition(dot, ['transform', 'background-color'], 280);
        dot.classList.remove('is-red');
        if (index < blueOrder.length - 1) await wait([130, 110, 95, 82, 70, 60, 52, 45][index]);
      }
      selectedDots.forEach((dot) => dot.classList.remove('is-blue-active'));
      consultationDotField.classList.add('is-blue-finishing-wave');
      consultationDotField.dataset.dotStage = 'complete';
      showConsultationRemainder();
      if (consultationAction) await waitForTransition(consultationAction, ['opacity'], 520);
      showConsultationSeparator();
    };

    let consultationAnimationStarted = false;
    let consultationRevealCandidate = false;
    let consultationScrollSettleTimer = 0;
    const scheduleConsultationReveal = () => {
      window.clearTimeout(consultationScrollSettleTimer);
      consultationScrollSettleTimer = window.setTimeout(() => {
        consultationScrollSettleTimer = 0;
        if (consultationRevealCandidate) startConsultationDotAnimation();
      }, 450);
    };
    const handleConsultationScroll = () => {
      if (consultationRevealCandidate && !consultationAnimationStarted) scheduleConsultationReveal();
    };
    const handleConsultationScrollEnd = () => {
      if (consultationRevealCandidate && !consultationAnimationStarted) startConsultationDotAnimation();
    };
    const startConsultationDotAnimation = () => {
      if (consultationAnimationStarted) return;
      consultationAnimationStarted = true;
      window.clearTimeout(consultationScrollSettleTimer);
      window.removeEventListener('scroll', handleConsultationScroll);
      window.removeEventListener('scrollend', handleConsultationScrollEnd);
      if (reducedMotion.matches) {
        consultationDotField.dataset.dotStage = 'complete';
        consultationDotField.classList.add('is-complete', 'is-organizing', 'is-gathering');
        selectedDots.forEach((dot) => dot.classList.add('is-blue', 'is-blue-settled'));
        showConsultationTitle();
        showConsultationDescription();
        showConsultationRemainder();
        showConsultationSeparator();
        return;
      }
      runDotTimeline();
    };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries, observer) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        consultationRevealCandidate = true;
        scheduleConsultationReveal();
        observer.disconnect();
      }, { threshold: 0.75, rootMargin: '0px' }).observe(consultationDotField);
      window.addEventListener('scroll', handleConsultationScroll, { passive: true });
      window.addEventListener('scrollend', handleConsultationScrollEnd, { passive: true });
    } else {
      startConsultationDotAnimation();
    }
  }

  if (galleryPreview) {
    const previewStage = galleryPreview.querySelector('[data-s-gallery-preview-action]');
    const previewCards = Array.from(galleryPreview.querySelectorAll('[data-s-gallery-card]'));
    const previewSets = [
      ['assets/projects/alfares/10.png', 'assets/projects/alfares/01.png', 'assets/projects/alfares/11.png'],
      ['assets/projects/alsebteen/10.png', 'assets/projects/alsebteen/03.png', 'assets/projects/alsebteen/11.png'],
      ['assets/projects/velvet/10.png', 'assets/projects/velvet/01.png', 'assets/projects/velvet/11.png'],
      ['assets/projects/zone/10.png', 'assets/projects/zone/04.png', 'assets/projects/zone/11.png'],
      ['assets/projects/sda alrwaq/10.png', 'assets/projects/sda alrwaq/02.png', 'assets/projects/sda alrwaq/11.png']
    ];
    const previewImageCache = new Map();
    const getPreviewDeliverySource = (src, extension) => src.replace(/\.png$/i, `.${extension}`);
    const previewDurations = {
      reveal: 260,
      open: 420,
      hold: 500,
      close: 420
    };
    const previewCycleDuration = previewDurations.reveal
      + previewDurations.open
      + previewDurations.hold
      + previewDurations.close;
    let previewSetIndex = 0;
    let previewStarted = false;
    let previewActive = false;
    let previewTimer = 0;
    let previewRunToken = 0;
    let previewPulseFrame = 0;
    let previewNextReady = null;
    let previewPreloadTimer = 0;

    const waitForPreviewImage = (src) => {
      if (previewImageCache.has(src)) return previewImageCache.get(src);
      const image = new Image();
      image.decoding = 'async';
      const promise = new Promise((resolve) => {
        const finish = () => {
          Promise.resolve(typeof image.decode === 'function' ? image.decode() : undefined)
            .catch(() => {})
            .then(resolve);
        };
        image.addEventListener('load', finish, { once: true });
        image.addEventListener('error', finish, { once: true });
        image.src = src;
        if (image.complete) finish();
      });
      previewImageCache.set(src, promise);
      return promise;
    };
    const preloadPreviewSet = (index) => Promise.all(previewSets[index].map((src) => waitForPreviewImage(getPreviewDeliverySource(src, 'avif'))));
    const clearPreviewTimer = () => {
      if (previewTimer) window.clearTimeout(previewTimer);
      previewTimer = 0;
      if (previewPreloadTimer) window.clearTimeout(previewPreloadTimer);
      previewPreloadTimer = 0;
    };
    const queuePreview = (callback, delay, token) => {
      clearPreviewTimer();
      previewTimer = window.setTimeout(() => {
        previewTimer = 0;
        if (token === previewRunToken && previewActive) callback(token);
      }, reducedMotion.matches ? 0 : delay);
    };
    const setPreviewSources = (setIndex) => {
      previewCards.forEach((card, index) => {
        const image = card.querySelector('img');
        const source = card.querySelector('source[type="image/avif"]');
        const sourcePath = previewSets[setIndex][index];
        const avifPath = getPreviewDeliverySource(sourcePath, 'avif');
        const webpPath = getPreviewDeliverySource(sourcePath, 'webp');
        if (source) source.srcset = avifPath;
        if (image && image.src !== new URL(webpPath, document.baseURI).href) {
          image.src = webpPath;
        }
      });
    };
    const decodePreviewCards = () => Promise.all(previewCards.map((card) => {
      const image = card.querySelector('img');
      if (!image) return Promise.resolve();
      if (typeof image.decode === 'function') return image.decode().catch(() => {});
      return image.complete
        ? Promise.resolve()
        : new Promise((resolve) => image.addEventListener('load', resolve, { once: true }));
    }));
    const hidePreviewImmediately = () => {
      clearPreviewTimer();
      previewRunToken += 1;
      previewStage.classList.remove('is-cycling', 'is-fully-hidden');
      previewNextReady = null;
    };
    const beginReveal = async (token) => {
      if (!previewActive || token !== previewRunToken) return;
      await preloadPreviewSet(previewSetIndex);
      if (!previewActive || token !== previewRunToken) return;
      setPreviewSources(previewSetIndex);
      await decodePreviewCards();
      if (!previewActive || token !== previewRunToken) return;
      previewStage.classList.remove('is-fully-hidden');
      previewStage.classList.add('is-cycling');
      previewNextReady = null;
      previewPreloadTimer = window.setTimeout(() => {
        previewPreloadTimer = 0;
        if (previewActive && token === previewRunToken) {
          previewNextReady = preloadPreviewSet((previewSetIndex + 1) % previewSets.length);
        }
      }, reducedMotion.matches ? 0 : previewDurations.reveal + previewDurations.open);
      queuePreview(beginSwap, previewCycleDuration, token);
    };
    const beginSwap = async (token) => {
      if (!previewActive || token !== previewRunToken) return;
      const nextIndex = (previewSetIndex + 1) % previewSets.length;
      previewStage.classList.remove('is-cycling');
      previewStage.classList.add('is-fully-hidden');
      await (previewNextReady || preloadPreviewSet(nextIndex));
      if (!previewActive || token !== previewRunToken) return;
      previewSetIndex = nextIndex;
      setPreviewSources(previewSetIndex);
      await decodePreviewCards();
      if (!previewActive || token !== previewRunToken) return;
      previewStage.classList.remove('is-fully-hidden');
      previewNextReady = null;
      beginReveal(token);
    };
    const startPreview = () => {
      if (!previewActive) {
        previewActive = true;
        const token = ++previewRunToken;
        preloadPreviewSet(previewSetIndex).then(() => {
          if (previewActive && token === previewRunToken) beginReveal(token);
        });
      }
      previewStarted = true;
    };
    const stopPreview = () => {
      previewActive = false;
      hidePreviewImmediately();
    };
    window.OOXMEGalleryPreview = {
      restart: () => {
        previewSetIndex = 0;
        previewStarted = false;
        stopPreview();
        startPreview();
      }
    };
    if ('IntersectionObserver' in window) {
      const previewObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startPreview();
          } else if (previewStarted) {
            stopPreview();
          }
        });
      }, { threshold: 0.15 });
      previewObserver.observe(galleryPreview);
    } else {
      startPreview();
    }
    const pulsePreviewStage = () => {
      if (reducedMotion.matches) return;
      if (previewPulseFrame) window.cancelAnimationFrame(previewPulseFrame);
      previewStage.classList.remove('is-pulsing');
      previewPulseFrame = window.requestAnimationFrame(() => {
        previewPulseFrame = 0;
        previewStage.classList.add('is-pulsing');
      });
    };
    previewStage.addEventListener('pointerdown', pulsePreviewStage, { passive: true });
    previewStage.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-composer-pulse') previewStage.classList.remove('is-pulsing');
    });
  }

  const mainSectionOneImageCards = page.classList.contains('s-page--main')
    ? Array.from(page.querySelectorAll('[data-s-main-section-1-image-card]'))
    : [];
  if (mainSectionOneImageCards.length) {
    const waitForDecodedImage = (image) => {
      const decode = () => {
        try {
          return typeof image.decode === 'function'
            ? Promise.resolve(image.decode()).catch(() => {})
            : Promise.resolve();
        } catch (_) {
          return Promise.resolve();
        }
      };
      if (image.complete) return decode();
      return new Promise((resolve) => {
        image.addEventListener('load', () => { decode().then(resolve); }, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    };
    Promise.all([
      document.fonts?.ready || Promise.resolve(),
      ...mainSectionOneImageCards.map((card) => {
        const image = card.querySelector('img');
        return image ? waitForDecodedImage(image) : Promise.resolve();
      })
    ]).then(() => {
      mainSectionOneImageCards.forEach((card) => card.classList.add('is-ready'));
    });
  }

  const partnerNumberCard = page.classList.contains('s-page--main')
    ? page.querySelector('.s-page__section-3-image-frame--section-1-copy')
    : null;
  const partnerNumberNodes = partnerNumberCard
    ? Array.from(partnerNumberCard.querySelectorAll('.s-main-hero-number'))
    : [];
  const partnerNumberTarget = 500000;
  const partnerNumberDurationMs = 1100;
  let partnerNumberFrame = 0;
  let partnerNumberCountHasRun = false;
  const formatPartnerNumber = (value) => {
    const rounded = Math.max(0, Math.min(partnerNumberTarget, Math.round(value)));
    return rounded.toLocaleString('en-US').replace(/,/g, "'");
  };
  const setPartnerNumber = (value) => {
    const text = formatPartnerNumber(value);
    partnerNumberNodes.forEach((node) => { node.textContent = text; });
  };
  const cancelPartnerNumberAnimation = () => {
    if (partnerNumberFrame) window.cancelAnimationFrame(partnerNumberFrame);
    partnerNumberFrame = 0;
  };
  const setPartnerNumberDigits = (animate = true) => {
    partnerNumberNodes.forEach((node) => {
      node.classList.remove('is-digit-looping');
      node.replaceChildren();
      "500000".split('').forEach((digit, index) => {
        const digitNode = document.createElement('span');
        digitNode.className = 's-main-hero-digit';
        digitNode.style.setProperty('--s-main-digit-delay', `${index * 250}ms`);
        digitNode.textContent = digit;
        node.appendChild(digitNode);
        if (index === 2) {
          const apostrophe = document.createElement('span');
          apostrophe.className = 's-main-hero-apostrophe';
          apostrophe.setAttribute('aria-hidden', 'true');
          apostrophe.textContent = "'";
          node.appendChild(apostrophe);
        }
      });
    });
    if (animate) {
      window.requestAnimationFrame(() => {
        partnerNumberNodes.forEach((node) => node.classList.add('is-digit-looping'));
      });
    }
  };
  const animatePartnerNumber = () => {
    if (!partnerNumberNodes.length) return;
    if (partnerNumberCountHasRun) return;
    partnerNumberCountHasRun = true;
    cancelPartnerNumberAnimation();
    setPartnerNumber(0);
    if (reducedMotion.matches) {
      setPartnerNumber(partnerNumberTarget);
      setPartnerNumberDigits(false);
      return;
    }
    const startedAt = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / partnerNumberDurationMs);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setPartnerNumber(partnerNumberTarget * easedProgress);
      if (progress < 1) {
        partnerNumberFrame = window.requestAnimationFrame(step);
      } else {
        partnerNumberFrame = 0;
        setPartnerNumber(partnerNumberTarget);
        setPartnerNumberDigits();
      }
    };
    partnerNumberFrame = window.requestAnimationFrame(step);
  };
  if (partnerNumberNodes.length) {
    setPartnerNumber(0);
    if ('IntersectionObserver' in window) {
      const partnerNumberObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.target !== partnerNumberCard) return;
          if (entry.isIntersecting) animatePartnerNumber();
        });
      }, { threshold: 0.15 });
      partnerNumberObserver.observe(partnerNumberCard);
    } else {
      animatePartnerNumber();
    }
  }

  const maximumVisibleConversationMessages = 3;
  const replyDelayMs = 1000;
  const finalRevealDelayMs = 1600;
  const finalMessageDurationMs = 10000;
  const finalFadeOutDurationMs = 320;
  const englishReplies = [
    'Sorry, we don’t reply to messages for free.',
    'Hmm... it seems you didn’t read the previous message.',
    'Yes. Still the same answer.',
    'Are you seriously trying again?',
    'We have a better idea. Call us.',
    'Let’s make this easier - tap the + button.',
    '看来你还是没明白我们的意思。',
    'Please stop. You’re becoming very committed to this.',
    'One more message and we may have to alert the branding department.',
    'Your account has been dramatically, completely, and absolutely... suspended.'
  ];
  const arabicReplies = [
    'عذرًا، نحن لا نرد على الرسائل مجانًا.',
    'همم... يبدو انك لم تقرأ الرسالة السابقة.',
    'نعم. ما زالت الاجابة نفسها.',
    'احقًا تحاول مرة اخرى؟',
    'لدينا فكرة افضل. اتصل بنا.',
    'لنجعل الامر اسهل - اضغط زر +.',
    'يبدو انك ما زلت لا تفهم ما نقصده.',
    'من فضلك توقف. التزامك بالامر بدأ يصبح لافتًا.',
    'رسالة اخرى وقد نضطر - مازحين طبعًا - الى تنبيه قسم العلامة التجارية.',
    'تم تعليق حسابك بصورة درامية، وكاملة، ومطلقة... مزحة فقط.'
  ];
  const finalMessages = {
    en: 'Alright, we’re joking.\nThe ooxme conversation experience is still under development. Until it’s ready, reach us through our official channels and we’ll take it from there.',
    ar: 'حسنًا، نحن نمزح.\nتجربة المحادثة لدى اوكسوم ما تزال قيد التطوير. وحتى تصبح جاهزة، تواصل معنا عبر قنواتنا الرسمية، وسنتولى الامر من هناك.'
  };
  const pageCopy = {
    en: {
      groups: [
        [],
        ['Re-engineered\nBuilt for New Terrain', 'Discover Ooxme v4.0 system, designed for engineering, architectural, construction, contracting .. etc'],
        ['The numbers speak\nfor the work', 'Clear results reveal the value\nour work creates across sectors.'],
        ['Striking Designs\nFor Distinctive Projects', 'Thoughtful design shaped with\nprecision to advance your goals.'],
        ['Distinct Identities\nBuilt to Be Remembered', 'Distinct identities that make\nbrands clear, memorable, lasting.'],
        ['Let’s talk\nabout what’s next', 'A focused consultation to understand your business, identify the right direction, and define the next practical step.']
      ],
      menu: ['Home', 'Brand Management', 'Gallery', 'Store', 'Consultation', 'Contact'],
      inputPlaceholder: 'Type...',
      ask: 'Ask ooxme',
      addContext: 'Add context',
      submitQuestion: 'Submit question',
      conversation: 'Conversation',
      utilities: {
        label: 'Page utilities',
        switchToArabic: 'Switch to Arabic',
        switchToEnglish: 'Switch to English',
        switchToDay: 'Switch to Day Mode',
        switchToDark: 'Switch to Dark Mode'
      },
    },
    ar: {
      groups: [
        [],
        ['اعادة هندسة\nبني لتضاريس جديدة', 'تعرف على التحديث الرابع لنظام عمل اوكسوم، المخصص للمشاريع الهندسية، المعمارية، الانشائية والمقاولات وشبيهاتها'],
        ['الارقام تتحدث\nعن العمل', 'نتائج واضحة تكشف قيمة عملنا\nوتُبرز أثره في مختلف القطاعات.'],
        ['تصاميم ملفتة\nلمشاريع مميزة', 'تصميم مدروس، ينفذ بدقة\nليخدم أهدافك ويعزز مشروعك.'],
        ['هويات مميزة\nصممت لتبقى', 'هويات مميزة تجعل علامتك\nواضحة، راسخة، وسهلة التذكر.'],
        ['لنتحدث\nعن خطوتك القادمة', 'استشارة مركزة لفهم عملك، تحديد الاتجاه المناسب، والوصول الى الخطوة العملية التالية.']
      ],
      menu: ['الرئيسية', 'إدارة العلامة التجارية', 'المعرض', 'المتجر', 'الاستشارة', 'تواصل'],
      inputPlaceholder: 'اكتب...',
      ask: 'اسأل اوكسوم',
      addContext: 'اضف سياقًا',
      submitQuestion: 'ارسال السؤال',
      conversation: 'المحادثة',
      utilities: {
        label: 'ادوات الصفحة',
        switchToArabic: 'التبديل الى العربية',
        switchToEnglish: 'التبديل الى الانجليزية',
        switchToDay: 'التبديل الى الوضع النهاري',
        switchToDark: 'التبديل الى الوضع الداكن'
      },
    }
  };
  const getGroupCopy = (language, groupIndex) => pageCopy[language].groups[groupIndex];
  let keyboardFrame = 0;
  let firstGroupBaselineFrame = 0;
  let firstGroupBaselineLocked = false;
  let sectionTwoBaselineCorrectionLocked = false;
  let composerPulseFrame = 0;
  let zContentRevealFrame = 0;
  let zContentTransitionTimer = 0;
  let zActiveContentIndex = 0;
  let zFaceController = null;
  const secondaryNavPulseFrames = new Map();
  let addFlashTimer = 0;
  const sendUtilityPulseFrames = new Map();
  const imagePulseFrames = new Map();
  const pendingReplyTimers = new Set();
  let addRotated = false;
  let initializationReady = false;
  let initializationRun = 0;
  let lastKeyboardOverlap = 0;
  let replyIndex = 0;
  let conversationState = 'active';
  let finalVisibleTimer = 0;
  let finalResetTimer = 0;
  let pendingFinalRevealTimer = 0;
  let localizedGeometryFrame = 0;
  let portraitSectionLayoutFrame = 0;
  let portraitSectionLayoutTimer = 0;
  let finalScrollBufferFrame = 0;
  let majorSectionSettleFrame = 0;
  let majorSectionSettleReleaseFrame = 0;
  let majorSectionSettleTarget = null;
  let majorSectionSettleOwnsScroll = false;
  let majorSectionPointerActive = false;
  let majorSectionSettleStableFrames = 0;
  let discreteSectionInputLocked = false;
  let discreteSectionUnlockTimer = 0;
  let zSectionOneScrollFrame = 0;
  let zSectionOneLocked = false;
  let zSectionOneCompositionReady = false;
  let zSectionOneOriginalImageBottom = 0;
  let zSectionOneStateOneImageBottom = 0;
  let zSectionOneContentBoxHeight = 0;
  let zSectionOneTransitionDistance = 0;
  const zEndpointCaptureTolerancePx = .25;
  // Keep the endpoint immune to passive Safari rebound, but do not make a
  // deliberate reverse drag feel like it has to overcome a second threshold.
  const zEndpointReverseIntentDistancePx = 3;
  const zReleaseSettleDelayMs = 1000;
  const zReleaseSettleStartGraceMs = 120;
  let zEndpointLockScrollY = 0;
  let zEndpointPointerId = null;
  let zEndpointPointerStartY = 0;
  let zEndpointReverseIntent = false;
  let zReleaseSettleTimer = 0;
  let zReleaseSettleFrame = 0;
  let zReleaseSettleTarget = null;
  let zReleaseSettleLastScrollY = 0;
  let zReleaseSettleStableFrames = 0;
  let zReleaseSettleStartedAt = 0;
  let zReleasePointerActive = false;
  let zHeroGeometryFrozen = false;
  let zSecondaryNavOverflowFrame = 0;
  let zSecondaryNavAlignmentFrame = 0;
  let zSecondaryNavIndicatorReadyFrame = 0;
  let lastPageScrollTime = performance.now();
  let localizedGeometryWidth = document.documentElement.clientWidth;
  let localizedGeometryOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  let pauseLogoParticleForScroll = () => {};
  let conversationVisible = true;
  let activeTemporaryUi = 'none';
  const composerControls = Array.from(composer.querySelectorAll('button, input'));
  const inputLabel = composer.querySelector('.s-page__visually-hidden');
  document.querySelectorAll('[data-s-legal-placeholder]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
  let applyPageCopy = null;
  let manualThemeOverride = false;
  const arabicScriptPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

  const createZFaceController = () => {
    const face = addButton.querySelector(isZPage ? '[data-s-z-face]' : '[data-s-x-face]');
    const shell = face?.querySelector(isZPage ? '.s-page__z-face-shell' : '.s-page__x-face-shell');
    const eyes = face?.querySelector(isZPage ? '.s-page__z-face-eyes' : '.s-page__x-face-eyes');
    const eyeMotion = face?.querySelector(isZPage ? '.s-page__z-face-eye-motion' : '.s-page__x-face-eye-motion');
    if (!face || !shell || !eyes || !eyeMotion) return null;
    // The eye centers sit at 3.75/9.25 with a 1.85 radius in a 13-unit viewBox.
    // These limits retain a visible inner margin under every exclusive reaction.
    const gazeLimit = 1.1;
    const dragThreshold = 6;
    let pointer = null;
    let dragging = false;
    let tapping = false;
    let settling = false;
    let applyActive = false;
    let reaction = null;
    let reactionStartedAt = 0;
    let tapTimer = 0;
    let settleTimer = 0;
    let reactionTimer = 0;
    let animationFrame = 0;
    let previousTime = 0;
    let targetGaze = { x: 0, y: 0 };
    let currentGaze = { x: 0, y: 0 };

    const clearTimer = (timer) => {
      if (timer) window.clearTimeout(timer);
      return 0;
    };
    const setGaze = (x, y, normalize = true) => {
      const magnitude = Math.hypot(x, y);
      const scale = normalize && magnitude > 0 ? gazeLimit / Math.max(gazeLimit, magnitude) : 1;
      targetGaze = {
        x: Math.max(-gazeLimit, Math.min(gazeLimit, x * scale)),
        y: Math.max(-gazeLimit, Math.min(gazeLimit, y * scale))
      };
    };
    // A direct interaction is intentionally first: it temporarily wins over a
    // section reaction, while the reaction itself remains a single timed state.
    const getState = () => (dragging ? 'drag' : tapping ? 'tap' : reaction || (applyActive ? 'apply' : (settling ? 'settle' : 'idle')));
    const render = () => {
      const state = getState();
      face.dataset.faceState = state;
    };
    const lerp = (from, to, amount) => from + ((to - from) * amount);
    const tick = (time) => {
      const delta = Math.min(48, Math.max(1, time - (previousTime || time)));
      previousTime = time;
      const state = getState();
      const phase = time / 1000;
      const gazeEasing = 1 - Math.exp(-delta / (state === 'drag' ? 38 : 72));
      const gazeTarget = (state === 'tap' || state === 'drag') ? targetGaze : { x: 0, y: 0 };
      currentGaze.x = lerp(currentGaze.x, gazeTarget.x, gazeEasing);
      currentGaze.y = lerp(currentGaze.y, gazeTarget.y, gazeEasing);
      const reactionElapsed = reaction ? Math.max(0, time - reactionStartedAt) : 0;
      const enteringApply = state === 'apply-enter';
      const leavingApply = state === 'apply-exit';
      const bounce = enteringApply ? Math.sin(Math.min(1, reactionElapsed / 420) * Math.PI * 2) * .62 : 0;
      const shake = leavingApply ? Math.sin(Math.min(1, reactionElapsed / 340) * Math.PI * 4) * .68 : 0;
      const happyEyes = state === 'apply' || enteringApply;
      const blinkPhase = ((phase + .7) % 2) / 2;
      // Preserve the natural idle cadence while shortening only the close/open window.
      const blink = state === 'idle' ? 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .014, 2))) : 1;
      // Reactions are exclusive and zero-mean; eye bounds stay inside the fixed circle.
      shell.setAttribute('transform', `translate(${shake.toFixed(3)} ${bounce.toFixed(3)})`);
      eyes.setAttribute('transform', `translate(${currentGaze.x.toFixed(3)} ${currentGaze.y.toFixed(3)})`);
      // Apply's happy expression is a small lift only: eye geometry remains constant.
      const eyeLift = happyEyes ? -.22 : 0;
      const eyeTransform = state === 'idle'
        ? `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)`
        : `translate(0 ${eyeLift.toFixed(3)})`;
      eyeMotion.setAttribute('transform', eyeTransform);
      render();
      animationFrame = window.requestAnimationFrame(tick);
    };
    const centerGaze = () => setGaze(0, 0, false);
    const gazeAtPoint = (clientX, clientY) => {
      const rect = addButton.getBoundingClientRect();
      setGaze(clientX - (rect.left + rect.width / 2), clientY - (rect.top + rect.height / 2));
    };
    const begin = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (pointer) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
      dragging = false;
    };
    const move = (event) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!dragging && Math.hypot(dx, dy) < dragThreshold) return;
      if (!dragging) {
        dragging = true;
        tapping = false;
        settling = false;
        tapTimer = clearTimer(tapTimer);
        settleTimer = clearTimer(settleTimer);
      }
      setGaze(dx, dy);
      render();
    };
    const end = (event, cancelled = false) => {
      if (!pointer || event.pointerId !== pointer.id) return;
      const wasDragging = dragging;
      pointer = null;
      dragging = false;
      if (wasDragging) {
        tapping = false;
        settling = true;
        centerGaze();
        render();
        settleTimer = clearTimer(settleTimer);
        settleTimer = window.setTimeout(() => {
          settling = false;
          render();
        }, 480);
        return;
      }
      if (cancelled) {
        centerGaze();
        render();
        return;
      }
      tapping = true;
      settling = false;
      gazeAtPoint(event.clientX, event.clientY);
      render();
      tapTimer = clearTimer(tapTimer);
      tapTimer = window.setTimeout(() => {
        tapping = false;
        centerGaze();
        render();
      }, 380);
    };
    const rejectApply = () => {
      applyActive = false;
      reaction = 'apply-exit';
      reactionStartedAt = performance.now();
      reactionTimer = clearTimer(reactionTimer);
      centerGaze();
      reactionTimer = window.setTimeout(() => {
        reaction = null;
        centerGaze();
        render();
      }, 360);
    };
    const setApply = (active) => {
      if (active && !applyActive) {
        applyActive = true;
        reaction = 'apply-enter';
        reactionStartedAt = performance.now();
        reactionTimer = clearTimer(reactionTimer);
        if (!dragging && !tapping) centerGaze();
        reactionTimer = window.setTimeout(() => {
          reaction = null;
          render();
        }, 420);
      } else if (!active && applyActive) {
        rejectApply();
      }
      render();
    };
    render();
    animationFrame = window.requestAnimationFrame(tick);
    return { begin, move, end, setApply, rejectApply };
  };
  zFaceController = createZFaceController();

  const updateComposerInputLanguage = () => {
    const hasTypedText = input.value.trim().length > 0;
    const language = hasTypedText
      ? arabicScriptPattern.test(input.value) ? 'ar' : 'en'
      : document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const isArabic = language === 'ar';
    input.classList.toggle('is-arabic-input', isArabic);
    input.classList.toggle('is-english-input', !isArabic);
    input.lang = language;
    input.dir = isArabic ? 'rtl' : 'ltr';
  };

  const updateThemeToggleLabel = () => {
    const copy = pageCopy[document.documentElement.lang === 'ar' ? 'ar' : 'en'];
    sendThemeUtility.setAttribute('aria-label', document.documentElement.classList.contains('is-day-mode')
      ? copy.utilities.switchToDark
      : copy.utilities.switchToDay);
  };

  const applyLanguage = (next, { persist = true, emit = true } = {}) => {
    const language = next === 'ar' ? 'ar' : 'en';
    const copy = pageCopy[language];
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelector('.s-page__gallery-preview-copy--ar')?.setAttribute('aria-hidden', String(language !== 'ar'));
    document.querySelector('.s-page__gallery-preview-copy--en')?.setAttribute('aria-hidden', String(language !== 'en'));
    page.querySelector('.s-page__section-2-image-frame--section-1-copy[href]')?.setAttribute('aria-label', language === 'ar'
      ? 'افتح تحديث اوكسوم'
      : 'Open the OOXME update');
    partnerNumberCard?.setAttribute('aria-label', language === 'ar'
      ? 'تعرف على برنامج شركاء اوكسوم'
      : 'Explore the OOXME Partner Program');
    sendLanguageUtility.classList.toggle('is-active', language === 'en');
    sendLanguageUtility.setAttribute('aria-pressed', String(language === 'en'));
    sendLanguageUtility.setAttribute('aria-label', language === 'en' ? copy.utilities.switchToArabic : copy.utilities.switchToEnglish);
    applyPageCopy?.(language);
    updateComposerInputLanguage();
    updateThemeToggleLabel();
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language } }));
  };

  const applyTheme = (next, { manual = false } = {}) => {
    if (manual) manualThemeOverride = true;
    const isDayMode = next === 'day';
    document.documentElement.classList.toggle('is-day-mode', isDayMode);
    sendThemeUtility.classList.toggle('is-active', !isDayMode);
    sendThemeUtility.setAttribute('aria-pressed', String(!isDayMode));
    updateThemeToggleLabel();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDayMode ? '#FFFFFF' : '#000000');
  };

  // Each fresh page load begins in Arabic; the language control remains live.
  const initialLanguage = document.documentElement.lang === 'en' ? 'en' : 'ar';
  applyLanguage(initialLanguage, { persist: false, emit: false });
  applyTheme('dark');

  const isTemporaryUiInteraction = (target) => (
    composer.contains(target) || conversation.contains(target)
  );

  const setComposerMenuOpen = (isOpen) => {
    window.OOXMEHeader?.setMenuOpen(isOpen);
  };

  const setSendUtilitiesOpen = (isOpen) => {
    sendUtilities.classList.toggle('is-open', isOpen);
    sendUtilities.setAttribute('aria-hidden', String(!isOpen));
    sendUtilities.inert = !isOpen;
  };

  const setSendUtilityAvailability = (isAvailable) => {
    [sendThemeUtility, sendLanguageUtility].filter(Boolean).forEach((control) => {
      control.disabled = !isAvailable;
    });
  };

  const resetAddButton = () => {
    window.clearTimeout(addFlashTimer);
    addRotated = false;
    addButton.classList.remove('is-rotated', 'is-active');
    setComposerMenuOpen(false);
    setSendUtilitiesOpen(false);
    if (activeTemporaryUi === 'menu' || activeTemporaryUi === 'utilities') activeTemporaryUi = 'none';
  };

  const pulseComposer = () => {
    if (!initializationReady) return;
    if (composerPulseFrame) window.cancelAnimationFrame(composerPulseFrame);
    composer.classList.remove('is-pulsing');
    composerPulseFrame = window.requestAnimationFrame(() => {
      composerPulseFrame = 0;
      composer.classList.add('is-pulsing');
    });
  };

  composer.addEventListener('animationend', (event) => {
    if (event.animationName === 's-page-composer-pulse') composer.classList.remove('is-pulsing');
  });

  const pulseSendUtility = (control) => {
    const pendingFrame = sendUtilityPulseFrames.get(control);
    if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
    control.classList.remove('is-pulsing');
    const frame = window.requestAnimationFrame(() => {
      sendUtilityPulseFrames.delete(control);
      control.classList.add('is-pulsing');
    });
    sendUtilityPulseFrames.set(control, frame);
  };

  [sendThemeUtility, sendLanguageUtility].filter(Boolean).forEach((control) => {
    control.addEventListener('pointerdown', () => pulseSendUtility(control), { passive: true });
    control.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-send-utility-pulse') control.classList.remove('is-pulsing');
    });
  });

  [addButton, submitButton].forEach((control) => {
    control?.addEventListener('pointerdown', pulseComposer, { passive: true });
  });
  submitButton.addEventListener('pointerdown', (event) => event.preventDefault());

  [addButton, composerMenu, sendUtilities].forEach((control) => {
    control.addEventListener('pointerdown', (event) => event.stopPropagation());
    control.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
  });
  // The /rpn Top Bar treats its unoccupied bar surface as a single pulse
  // target. /x uses that same endpoint-only bar contract; /z retains its
  // established behavior.
  composer.addEventListener('pointerdown', (event) => {
    if (event.target === composer) pulseComposer();
  }, { passive: true });
  composerMenu.addEventListener('click', (event) => {
    const contactLink = event.target.closest('[data-s-menu-key="contact"]');
    if (contactLink) {
      event.preventDefault();
      const contactSection = majorSections.find((section) => section.matches('.s-page__major-section--contact'));
      const contactIndex = contactSection ? getNavigableMajorSections().indexOf(contactSection) : -1;
      activateTemporaryUi('none');
      if (contactIndex >= 0) transitionToMajorSection(contactIndex);
    }
    event.stopPropagation();
  });
  sendUtilities.addEventListener('click', (event) => event.stopPropagation());
  document.querySelector('[data-s-contact-consultation-cta]')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    window.location.assign('/consultation');
  });

  const contactButtons = Array.from(document.querySelectorAll('[data-s-contact]'));
  let pressedContactButton = null;
  const clearContactPress = () => {
    pressedContactButton?.classList.remove('is-pressing');
    pressedContactButton = null;
  };
  contactButtons.forEach((button) => {
    button.addEventListener('pointerdown', (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      clearContactPress();
      pressedContactButton = button;
      button.classList.add('is-pressing');
    }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
      button.addEventListener(eventName, clearContactPress, { passive: true });
    });
  });
  window.addEventListener('scroll', clearContactPress, { passive: true });
  window.addEventListener('blur', clearContactPress, { passive: true });

  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    activateTemporaryUi('none');
  });

  document.addEventListener('pointerdown', (event) => {
    if (isTemporaryUiInteraction(event.target)) return;
    activateTemporaryUi('none');
    if (document.activeElement === input) input.blur();
  }, { passive: true });
  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));
    const keyboardOverlap = document.activeElement === input
      ? Math.max(0, layoutHeight - window.visualViewport.height - window.visualViewport.offsetTop)
      : 0;
    if (Math.abs(keyboardOverlap - lastKeyboardOverlap) >= .01) {
      page.style.setProperty('--s-keyboard-offset', `${keyboardOverlap.toFixed(2)}px`);
      syncConversationInputBounds();
      scheduleStablePortraitSectionLayout();
    }
    lastKeyboardOverlap = keyboardOverlap;
  };

  const scheduleKeyboardOffset = () => {
    if (keyboardFrame) return;
    keyboardFrame = window.requestAnimationFrame(() => {
      keyboardFrame = 0;
      updateKeyboardOffset();
    });
  };

  const syncConversationInputBounds = () => {
    const conversationRect = conversation.getBoundingClientRect();
    const inputFieldRect = input.parentElement.getBoundingClientRect();
    conversation.style.paddingLeft = `${Math.max(0, inputFieldRect.left - conversationRect.left)}px`;
    conversation.style.paddingRight = `${Math.max(0, conversationRect.right - inputFieldRect.right)}px`;
  };

  const groupElements = localizedGroups.map((group) => Array.from(group.querySelectorAll('[data-s-reveal]')));
  const firstGroupObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.15 })
    : null;

  // Each composition keeps its first Text Group untouched; only its final item gains free space.
  const portraitSectionCompositions = [
    { first: firstGroup, last: logoParticleField, type: 'anchored' }
  ];

  const resetPortraitSectionLayout = ({ preserveFinalSettleSpace = false } = {}) => {
    document.documentElement.style.removeProperty('--s-portrait-measured-x');
    document.documentElement.removeAttribute('data-s-portrait-composer-top');
    document.documentElement.removeAttribute('data-s-portrait-viewport-height');
    document.documentElement.removeAttribute('data-s-portrait-section-top');
    document.documentElement.removeAttribute('data-s-portrait-reference-y');
    document.documentElement.style.removeProperty('--s-portrait-section-height');
    document.documentElement.style.removeProperty('--s-portrait-final-section-height');
    if (!preserveFinalSettleSpace) document.documentElement.style.removeProperty('--s-portrait-final-settle-space');
    majorSections.forEach((section) => {
      section.style.removeProperty('height');
      section.removeAttribute('data-s-portrait-overflow');
    });
    portraitSectionCompositions.forEach(({ first, last, type }) => {
      last.style.removeProperty('--s-portrait-bottom-up-offset');
      last.classList.remove('is-portrait-bottom-up');
      first.removeAttribute('data-s-portrait-final-gap');
      first.removeAttribute('data-s-portrait-final-y');
      first.removeAttribute('data-s-portrait-reference-delta');
      first.removeAttribute('data-s-portrait-live-gap');
      first.removeAttribute('data-s-portrait-layout');
      if (type === 'anchored') {
        last.style.removeProperty('bottom');
        last.classList.remove('is-portrait-composed');
      }
    });
  };

  const syncFinalScrollBuffer = () => {
    finalScrollBufferFrame = 0;
    if (!isZPage) {
      document.documentElement.style.removeProperty('--s-portrait-final-settle-space');
      return;
    }
    if (!window.matchMedia('(orientation: portrait)').matches) {
      document.documentElement.style.removeProperty('--s-portrait-final-settle-space');
      return;
    }

    // Read the complete final geometry before the single buffer write. The padding
    // is exactly the missing range, so it makes the target reachable without adding
    // a scrollable blank area beyond the settled final composition.
    const existingBuffer = Number.parseFloat(
      document.documentElement.style.getPropertyValue('--s-portrait-final-settle-space')
    ) || 0;
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const referenceY = Number.parseFloat(getComputedStyle(content).paddingTop) || 0;
    const finalSectionTop = majorSections[majorSections.length - 1].getBoundingClientRect().top;
    const contentBottom = content.getBoundingClientRect().bottom;
    const finalTarget = scrollY + finalSectionTop - referenceY;
    const maxScrollWithoutBuffer = scrollY + contentBottom - existingBuffer - viewportHeight;
    const requiredBuffer = Math.max(0, finalTarget - maxScrollWithoutBuffer + 1);
    if (Math.abs(requiredBuffer - existingBuffer) > .25) {
      document.documentElement.style.setProperty('--s-portrait-final-settle-space', `${requiredBuffer}px`);
    }
  };

  const scheduleFinalScrollBuffer = () => {
    if (finalScrollBufferFrame) return;
    finalScrollBufferFrame = window.requestAnimationFrame(syncFinalScrollBuffer);
  };

  const syncPortraitSectionLayout = () => {
    portraitSectionLayoutFrame = 0;
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    if (!isPortrait) {
      syncConversationInputBounds();
      resetPortraitSectionLayout();
      scheduleFirstGroupBaseline();
      return;
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const contentStyle = getComputedStyle(content);
    const x = Number.parseFloat(rootStyle.getPropertyValue('--s-x')) || 18;
    const viewportHeight = document.documentElement.clientHeight;
    const composerRect = composer.getBoundingClientRect();
    const conversationRect = conversation.getBoundingClientRect();
    const inputFieldRect = input.parentElement.getBoundingClientRect();
    const sectionViewportTop = Number.parseFloat(contentStyle.paddingTop) || 0;
    const desiredRelativeBottom = conversationRect.bottom - sectionViewportTop;
    const compositionGeometry = portraitSectionCompositions.map(({ first, last, type }) => {
      const firstRect = first.getBoundingClientRect();
      const lastRect = last.getBoundingClientRect();
      const currentOffset = type === 'anchored'
        ? 0
        : Number.parseFloat(last.style.getPropertyValue('--s-portrait-bottom-up-offset')) || 0;
      const naturalRelativeBottom = type === 'anchored'
        ? (firstRect.height * .5) + (lastRect.height * .5)
        : lastRect.bottom - firstRect.top - currentOffset;
      return {
        first,
        last,
        type,
        firstHeight: firstRect.height,
        naturalRelativeBottom,
        majorSection: first.closest('[data-s-major-section]')
      };
    });

    // All geometry reads are complete. From here to the next frame, only write.
    conversation.style.paddingLeft = `${Math.max(0, inputFieldRect.left - conversationRect.left)}px`;
    conversation.style.paddingRight = `${Math.max(0, conversationRect.right - inputFieldRect.right)}px`;
    document.documentElement.style.setProperty('--s-portrait-section-height', `${viewportHeight}px`);
    document.documentElement.style.setProperty('--s-portrait-final-section-height', `${desiredRelativeBottom}px`);
    document.documentElement.style.setProperty('--s-portrait-measured-x', `${x}px`);
    document.documentElement.setAttribute('data-s-portrait-composer-top', composerRect.top.toFixed(3));
    document.documentElement.setAttribute('data-s-portrait-viewport-height', `${viewportHeight}`);
    document.documentElement.setAttribute('data-s-portrait-section-top', sectionViewportTop.toFixed(3));
    document.documentElement.setAttribute('data-s-portrait-reference-y', conversationRect.bottom.toFixed(3));

    compositionGeometry.forEach(({ first, last, type, firstHeight, naturalRelativeBottom, majorSection }) => {
      majorSection.style.removeProperty('height');
      majorSection.removeAttribute('data-s-portrait-overflow');
      if (type === 'anchored') {
        last.style.setProperty('bottom', `${firstHeight - desiredRelativeBottom}px`);
        last.classList.add('is-portrait-composed');
      } else {
        last.style.setProperty('--s-portrait-bottom-up-offset', `${desiredRelativeBottom - naturalRelativeBottom}px`);
        last.classList.add('is-portrait-bottom-up');
      }

      first.setAttribute('data-s-portrait-layout', 'composed');
      first.setAttribute('data-s-portrait-final-gap', (composerRect.top - conversationRect.bottom).toFixed(3));
      first.setAttribute('data-s-portrait-final-y', conversationRect.bottom.toFixed(3));
      first.setAttribute('data-s-portrait-reference-delta', '0.000');
      if (first === firstGroup) first.setAttribute('data-s-portrait-live-gap', '0.000');
    });

    scheduleFinalScrollBuffer();
    scheduleFirstGroupBaseline();
  };

  const schedulePortraitSectionLayout = () => {
    window.clearTimeout(portraitSectionLayoutTimer);
    portraitSectionLayoutTimer = 0;
    if (portraitSectionLayoutFrame) return;
    portraitSectionLayoutFrame = window.requestAnimationFrame(syncPortraitSectionLayout);
  };

  const scheduleStablePortraitSectionLayout = () => {
    window.clearTimeout(portraitSectionLayoutTimer);
    portraitSectionLayoutTimer = window.setTimeout(() => {
      portraitSectionLayoutTimer = 0;
      if (performance.now() - lastPageScrollTime < 160) {
        scheduleStablePortraitSectionLayout();
        return;
      }
      schedulePortraitSectionLayout();
    }, 180);
  };

  const getMajorSectionReferenceY = () => (
    Number.parseFloat(getComputedStyle(content).paddingTop) || 0
  );

  const cancelMajorSectionSettle = ({ stopNativeScroll = false } = {}) => {
    if (majorSectionSettleFrame) window.cancelAnimationFrame(majorSectionSettleFrame);
    if (majorSectionSettleReleaseFrame) window.cancelAnimationFrame(majorSectionSettleReleaseFrame);
    majorSectionSettleFrame = 0;
    majorSectionSettleReleaseFrame = 0;
    const wasSettling = majorSectionSettleTarget !== null;
    majorSectionSettleTarget = null;
    majorSectionSettleStableFrames = 0;
    majorSectionSettleOwnsScroll = false;
    // Cancelling the watcher alone leaves a native `scrollTo({ behavior: 'smooth' })`
    // in flight. Freeze it at the live position before returning control to the user.
    if (stopNativeScroll && wasSettling) window.scrollTo({ top: window.scrollY, left: 0, behavior: 'auto' });
  };

  const finishMajorSectionSettle = () => {
    if (majorSectionSettleFrame) window.cancelAnimationFrame(majorSectionSettleFrame);
    majorSectionSettleFrame = 0;
    majorSectionSettleTarget = null;
    majorSectionSettleStableFrames = 0;
    // Keep ownership through the browser's final smooth-scroll event. Releasing on
    // the following frame prevents that event from arming a redundant settle timer.
    majorSectionSettleReleaseFrame = window.requestAnimationFrame(() => {
      majorSectionSettleReleaseFrame = 0;
      majorSectionSettleOwnsScroll = false;
    });
  };

  const watchMajorSectionSettle = () => {
    majorSectionSettleFrame = 0;
    if (majorSectionSettleTarget === null) return;
    if (Math.abs(window.scrollY - majorSectionSettleTarget) <= 1) {
      majorSectionSettleStableFrames += 1;
      if (majorSectionSettleStableFrames >= 2) {
        finishMajorSectionSettle();
        return;
      }
    } else {
      majorSectionSettleStableFrames = 0;
    }
    majorSectionSettleFrame = window.requestAnimationFrame(watchMajorSectionSettle);
  };

  const getNearestMajorSectionIndex = () => {
    const referenceY = getMajorSectionReferenceY();
    const navigableSections = getNavigableMajorSections();
    const sectionTops = navigableSections.map((section) => section.getBoundingClientRect().top);
    return sectionTops.reduce((candidate, top, index) => {
      const distance = Math.abs(top - referenceY);
      return !candidate || distance < candidate.distance ? { index, distance } : candidate;
    }, null);
  };

  const transitionToMajorSection = (targetIndex) => {
    if (isZPage || majorSectionSettleTarget !== null || discreteSectionInputLocked) return;
    const navigableSections = getNavigableMajorSections();
    const current = getNearestMajorSectionIndex();
    if (!current) return;
    const boundedTargetIndex = Math.max(0, Math.min(navigableSections.length - 1, targetIndex));
    if (boundedTargetIndex === current.index) return;
    const referenceY = getMajorSectionReferenceY();
    const scrollY = window.scrollY;
    const targetRect = navigableSections[boundedTargetIndex].getBoundingClientRect();
    const target = Math.max(0, Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      scrollY + targetRect.top - referenceY
    ));
    if (Math.abs(target - scrollY) <= 1) return;

    cancelMajorSectionSettle();
    majorSectionSettleTarget = target;
    majorSectionSettleOwnsScroll = true;
    discreteSectionInputLocked = true;
    window.clearTimeout(discreteSectionUnlockTimer);
    // Absorb wheel/trackpad momentum after one deliberate gesture so it cannot
    // spill into a second section transition.
    discreteSectionUnlockTimer = window.setTimeout(() => { discreteSectionInputLocked = false; }, 800);
    window.scrollTo({ top: target, left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    majorSectionSettleFrame = window.requestAnimationFrame(watchMajorSectionSettle);
  };

  const pulseImageSurface = (frame) => {
    const pending = imagePulseFrames.get(frame);
    if (pending) window.cancelAnimationFrame(pending);
    frame.classList.remove('is-pulsing');
    imagePulseFrames.set(frame, window.requestAnimationFrame(() => {
      imagePulseFrames.delete(frame);
      frame.classList.add('is-pulsing');
    }));
  };

  const imageInteractionFrames = Array.from(document.querySelectorAll('.s-page__image-interaction-card'));
  imageInteractionFrames.forEach((frame) => {
    let tapStart = null;
    frame.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse' || event.button === 0) {
        tapStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
      }
    }, { passive: true });
    frame.addEventListener('pointerup', (event) => {
      if (!tapStart || event.pointerId !== tapStart.id) return;
      const moved = Math.hypot(event.clientX - tapStart.x, event.clientY - tapStart.y);
      tapStart = null;
      if (moved <= 8) pulseImageSurface(frame);
    }, { passive: true });
    frame.addEventListener('pointercancel', () => { tapStart = null; }, { passive: true });
    frame.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-composer-pulse') frame.classList.remove('is-pulsing');
    });
  });

  document.querySelectorAll('[data-s-main-section-1-image-card][href]').forEach((card) => {
    let navigationPending = false;
    let navigationFallback = 0;
    let finishNavigation = null;
    card.addEventListener('click', (event) => {
      if ((event.button !== undefined && event.button !== 0)
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      if (navigationPending) return;
      navigationPending = true;

      const navigate = () => {
        if (!navigationPending) return;
        navigationPending = false;
        window.clearTimeout(navigationFallback);
        if (finishNavigation) card.removeEventListener('animationend', finishNavigation);
        window.location.assign(card.href);
      };

      if (reducedMotion.matches) {
        navigate();
        return;
      }

      finishNavigation = (animationEvent) => {
        if (animationEvent.target === card
          && animationEvent.animationName === 's-page-composer-pulse') navigate();
      };
      card.addEventListener('animationend', finishNavigation);
      navigationFallback = window.setTimeout(navigate, 260);
      if (!card.classList.contains('is-pulsing') && !imagePulseFrames.has(card)) pulseImageSurface(card);
    });
  });

  document.querySelectorAll('[data-s-image-arrow-route]').forEach((arrow) => {
    ['pointerdown', 'pointerup', 'touchstart', 'touchend'].forEach((eventName) => {
      arrow.addEventListener(eventName, (event) => event.stopPropagation(), { passive: true });
    });
    arrow.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (arrow.dataset.sImageArrowRoute) window.location.assign(arrow.dataset.sImageArrowRoute);
    });
  });

  const noteFlowScroll = () => {
    const now = performance.now();
    lastPageScrollTime = now;
    pauseLogoParticleForScroll();
    if (portraitSectionLayoutTimer) scheduleStablePortraitSectionLayout();
  };

  const setLocalizedText = (element, value) => {
    const fragment = document.createDocumentFragment();
    value.split('\n').forEach((line, index) => {
      const lineElement = document.createElement('span');
      lineElement.className = 's-page__reveal-line';
      lineElement.textContent = line;
      fragment.appendChild(lineElement);
    });
    element.replaceChildren(fragment);
  };

  const setRevealLineDelays = () => {
    groups.forEach((group) => {
      group.querySelectorAll('.s-page__reveal-line').forEach((line, index) => {
        line.style.setProperty('--s-reveal-delay', `${index * 110}ms`);
      });
    });
  };

  const measureLocalizedTextHeight = (element, value, language) => {
    const width = element.getBoundingClientRect().width;
    if (!width) return 0;
    const probe = element.cloneNode(false);
    probe.removeAttribute('id');
    probe.removeAttribute('data-s-reveal');
    probe.lang = language;
    probe.dir = language === 'ar' ? 'rtl' : 'ltr';
    probe.style.position = 'fixed';
    probe.style.inset = '0 auto auto -10000px';
    probe.style.width = `${width}px`;
    probe.style.maxWidth = 'none';
    probe.style.height = 'auto';
    probe.style.minHeight = '0';
    probe.style.margin = '0';
    probe.style.opacity = '1';
    probe.style.filter = 'none';
    probe.style.clipPath = 'none';
    probe.style.visibility = 'hidden';
    probe.style.pointerEvents = 'none';
    probe.style.transition = 'none';
    probe.style.fontFamily = language === 'ar'
      ? 'OOXMETosh, OOXMEScript, Arial, sans-serif'
      : 'OOXMEScript, OOXMEEnglish, Arial, sans-serif';
    setLocalizedText(probe, value);
    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
  };

  // Mirror /rpn's First Text Group source bounds: its live composer-menu width
  // becomes the content-box width, with the same menu chrome and 8px panel
  // inset removed before the title/body role styles are applied.
  const syncFirstGroupTextGeometry = () => {
    if (isZPage) return;
    const menuRect = composerMenu.getBoundingClientRect();
    if (!menuRect.width) return;
    const menuStyle = getComputedStyle(composerMenu);
    const borderStart = Number.parseFloat(menuStyle.borderInlineStartWidth) || 0;
    const borderEnd = Number.parseFloat(menuStyle.borderInlineEndWidth) || 0;
    const paddingStart = Number.parseFloat(menuStyle.paddingInlineStart) || 0;
    const paddingEnd = Number.parseFloat(menuStyle.paddingInlineEnd) || 0;
    const rpnPanelInset = 8;
    const textWidth = Math.max(0, menuRect.width - borderStart - borderEnd - paddingStart - paddingEnd - (rpnPanelInset * 2));
    const sourceStart = borderStart + paddingStart + rpnPanelInset;
    const sourceEnd = borderEnd + paddingEnd + rpnPanelInset;
    const isRtl = document.documentElement.lang === 'ar';
    [firstGroup, ...sectionTwoTextGroups, nextImageTextGroup].filter(Boolean).forEach((group) => {
      const groupRect = group.getBoundingClientRect();
      if (!groupRect.width) return;
      const inlineOffset = isRtl ? sourceEnd : sourceStart;
      const width = `${textWidth.toFixed(3)}px`;
      const offset = `${inlineOffset.toFixed(3)}px`;
      if (group === firstGroup) {
        group.style.setProperty('--s-x-first-group-text-width', width);
        group.style.setProperty('--s-x-first-group-text-inline-offset', offset);
      } else {
        group.style.setProperty('--s-x-rpn-image-text-width', width);
        group.style.setProperty('--s-x-rpn-image-text-inline-offset', offset);
      }
    });
  };

  // Section 2 keeps both localized copies mounted. Reserve the larger measured
  // copy height so changing language changes glyphs and direction only, never
  // the overlay box, image baseline, or section distribution.
  const syncSectionTwoCopyGeometry = () => {
    if (isZPage || !sectionTwoTextGroups.length) return;
    sectionTwoTextGroups.forEach((textGroup) => {
      const localizedCopies = Array.from(textGroup.querySelectorAll('[lang]'));
      if (!localizedCopies.length) return;
      const originalDisplays = localizedCopies.map((copy) => copy.style.display);
      let height = 0;
      localizedCopies.forEach((activeCopy) => {
        localizedCopies.forEach((copy) => { copy.style.display = copy === activeCopy ? 'block' : 'none'; });
        height = Math.max(height, activeCopy.getBoundingClientRect().height);
      });
      localizedCopies.forEach((copy, index) => { copy.style.display = originalDisplays[index]; });
      if (height) textGroup.style.height = `${Math.ceil(height)}px`;
    });
  };

  // The merged Contact section keeps one shared vertical box for both
  // languages. Reserve the larger rendered line box so Arabic font metrics
  // can change glyphs and direction without moving the section upward.
  const syncContactSectionCopyGeometry = () => {
    const contact = document.querySelector('[data-s-contact-consultation]');
    if (!contact) return;
    [
      contact.querySelector('.s-page__group-title'),
      contact.querySelector('.s-page__group-description')
    ].filter(Boolean).forEach((box) => {
      const copies = Array.from(box.querySelectorAll('[lang]'));
      if (copies.length < 2) return;
      const originalDisplays = copies.map((copy) => copy.style.display);
      let height = 0;
      copies.forEach((activeCopy) => {
        copies.forEach((copy) => { copy.style.display = copy === activeCopy ? 'block' : 'none'; });
        height = Math.max(height, activeCopy.getBoundingClientRect().height);
      });
      copies.forEach((copy, index) => { copy.style.display = originalDisplays[index]; });
      if (height) box.style.height = `${Math.ceil(height)}px`;
    });
  };

  const syncGalleryPreviewCopyGeometry = () => {
    const gallery = document.querySelector('[data-s-gallery-preview]');
    if (!gallery) return;
    const copies = Array.from(gallery.querySelectorAll('.s-page__gallery-preview-copy > div'));
    const originalParentDisplays = copies.map((copy) => copy.style.display);
    copies.forEach((copy) => { copy.style.display = 'block'; });
    ['.s-page__gallery-preview-title', '.s-page__gallery-preview-description'].forEach((selector) => {
      const nodes = copies.map((copy) => copy.querySelector(selector)).filter(Boolean);
      const originalDisplays = nodes.map((node) => node.style.display);
      let height = 0;
      nodes.forEach((activeNode) => {
        nodes.forEach((node) => { node.style.display = node === activeNode ? 'block' : 'none'; });
        height = Math.max(height, activeNode.getBoundingClientRect().height);
      });
      nodes.forEach((node, index) => { node.style.display = originalDisplays[index]; });
      if (height) nodes.forEach((node) => { node.style.height = `${Math.ceil(height)}px`; });
    });
    copies.forEach((copy, index) => { copy.style.display = originalParentDisplays[index]; });
  };

  // The original /x Composer used the layout viewport's bottom edge. Keep that
  // reference, then compensate only for the browser's fractional rendered
  // layout so the last visible edge of the First Text Group is exact.
  const syncFirstGroupBaseline = () => {
    firstGroupBaselineFrame = 0;
    if (isZPage || firstGroupBaselineLocked) return;
    const title = firstGroup.querySelector('.s-page__group-title');
    const baselineElement = title;
    if (!baselineElement || getComputedStyle(baselineElement).display === 'none') return;
    const pageStyle = getComputedStyle(page);
    // The Top Bar is positioned by the same --s-x token, so its rendered top
    // offset supplies the resolved X value without introducing another
    // viewport-reference calculation.
    const x = composer.getBoundingClientRect().top;
    const keyboardOffset = Number.parseFloat(pageStyle.getPropertyValue('--s-keyboard-offset')) || 0;
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    const baseline = (x * (portrait ? 1 : .5)) + keyboardOffset;
    const targetBottom = document.documentElement.clientHeight - baseline;
    const currentBottom = baselineElement.getBoundingClientRect().bottom;
    const difference = currentBottom - targetBottom;
    const correction = Number.parseFloat(firstGroup.style.getPropertyValue('--s-first-group-baseline-correction')) || 0;

    firstGroup.setAttribute('data-s-first-group-baseline', targetBottom.toFixed(3));
    firstGroup.setAttribute('data-s-first-group-bottom', currentBottom.toFixed(3));
    firstGroup.setAttribute('data-s-first-group-baseline-difference', difference.toFixed(3));
    if (Math.abs(difference) <= .005) {
      if (!sectionTwoBaselineCorrectionLocked) {
        page.style.setProperty('--s-section-2-bottom-baseline-correction', `${correction.toFixed(3)}px`);
        sectionTwoBaselineCorrectionLocked = true;
      }
      firstGroupBaselineLocked = true;
      return;
    }

    const nextCorrection = correction + difference;
    firstGroup.style.setProperty('--s-first-group-baseline-correction', `${nextCorrection.toFixed(3)}px`);
    if (!sectionTwoBaselineCorrectionLocked) {
      page.style.setProperty('--s-section-2-bottom-baseline-correction', `${nextCorrection.toFixed(3)}px`);
    }
    firstGroupBaselineFrame = window.requestAnimationFrame(syncFirstGroupBaseline);
  };

  const scheduleFirstGroupBaseline = () => {
    if (!firstGroupBaselineLocked && !firstGroupBaselineFrame) {
      firstGroupBaselineFrame = window.requestAnimationFrame(syncFirstGroupBaseline);
    }
  };

  const stabilizeLocalizedGeometry = () => {
    localizedGeometryFrame = 0;
    syncFirstGroupTextGeometry();
    syncSectionTwoCopyGeometry();
    syncContactSectionCopyGeometry();
    syncGalleryPreviewCopyGeometry();
    groupElements.forEach((elements, groupIndex) => {
      const englishGroup = getGroupCopy('en', groupIndex);
      const arabicGroup = getGroupCopy('ar', groupIndex);
      if (!englishGroup || !arabicGroup) return;
      elements.forEach((element, elementIndex) => {
        element.style.height = '';
        const height = Math.max(
          measureLocalizedTextHeight(element, englishGroup[elementIndex], 'en'),
          measureLocalizedTextHeight(element, arabicGroup[elementIndex], 'ar')
        );
        if (height) element.style.height = `${Math.ceil(height)}px`;
      });
    });
    schedulePortraitSectionLayout();
    scheduleFirstGroupBaseline();
  };

  const scheduleLocalizedGeometry = () => {
    if (localizedGeometryFrame) window.cancelAnimationFrame(localizedGeometryFrame);
    localizedGeometryFrame = window.requestAnimationFrame(stabilizeLocalizedGeometry);
  };

  applyPageCopy = (language) => {
    const copy = pageCopy[language];
    groupElements.forEach((elements, groupIndex) => {
      const localizedGroup = getGroupCopy(language, groupIndex);
      if (!localizedGroup) return;
      elements.forEach((element, elementIndex) => {
        setLocalizedText(element, localizedGroup[elementIndex]);
      });
    });
    input.placeholder = copy.inputPlaceholder;
    inputLabel.textContent = copy.ask;
    addButton.setAttribute('aria-label', language === 'ar' ? 'شخصية اوكسوم' : 'OOXME character');
    submitButton.setAttribute('aria-label', copy.submitQuestion);
    conversation.setAttribute('aria-label', copy.conversation);
    if (conversationFinal.classList.contains('is-visible')) {
      conversationFinalCopy.lang = language;
      conversationFinalCopy.dir = language === 'ar' ? 'rtl' : 'ltr';
      conversationFinalCopy.textContent = finalMessages[language];
    }
    setRevealLineDelays();
    scheduleLocalizedGeometry();
    scheduleMainContentSpacing();
  };
  applyPageCopy(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  document.fonts?.ready.then(() => {
    if (!isZPage) {
      firstGroupBaselineLocked = false;
      sectionTwoBaselineCorrectionLocked = false;
      scheduleLocalizedGeometry();
      schedulePortraitSectionLayout();
      scheduleMainContentSpacing();
      if (new URLSearchParams(window.location.search).get('section') === 'gallery' && galleryPreview) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => galleryPreview.scrollIntoView({ behavior: 'auto', block: 'center' }));
        });
      }
    }
  });
  if (isZPage) firstGroup.classList.add('is-visible');
  else if (firstGroupObserver) firstGroupObserver.observe(firstGroup);
  else firstGroup.classList.add('is-visible');
  schedulePortraitSectionLayout();
  scheduleMainContentSpacing();
  window.addEventListener('load', scheduleMainContentSpacing, { once: true });
  document.querySelectorAll('[data-s-main-section-1-image-card]').forEach((card) => {
    new MutationObserver(scheduleMainContentSpacing).observe(card, { attributes: true, attributeFilter: ['class'] });
  });
  document.querySelectorAll('img').forEach((image) => image.addEventListener('load', scheduleMainContentSpacing, { once: true }));
  window.addEventListener('load', () => {
    if (!isZPage) {
      schedulePortraitSectionLayout();
    }
  }, { once: true });

  const setupLogoParticleField = () => {
    const particleRenderScale = 3;
    const context = logoParticleCanvas.getContext('2d', { alpha: true });
    if (!context) return;

    const maskCanvas = document.createElement('canvas');
    const particleCanvas = document.createElement('canvas');
    const maskContext = maskCanvas.getContext('2d', { alpha: true });
    const particleContext = particleCanvas.getContext('2d', { alpha: true });
    if (!maskContext || !particleContext) return;

    const configureCanvasContexts = () => {
      [context, maskContext, particleContext].forEach((canvasContext) => {
        canvasContext.filter = 'none';
        canvasContext.imageSmoothingEnabled = true;
        canvasContext.imageSmoothingQuality = 'high';
        canvasContext.shadowBlur = 0;
      });
    };

    const logoMaskImage = new Image();
    const pointer = { x: 0, y: 0, strength: 0 };
    let particles = [];
    let width = 0;
    let height = 0;
    let renderedFrame = 0;
    let scrollResumeTimer = 0;
    let isInViewport = false;
    let isReady = false;
    let particleBuildStartedAt = null;

    const random = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);
    const stopRendering = () => {
      if (!renderedFrame) return;
      window.cancelAnimationFrame(renderedFrame);
      renderedFrame = 0;
    };

    const activatePointer = (event) => {
      const rect = logoParticleCanvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.x = ((event.clientX - rect.left) / rect.width) * width;
      pointer.y = ((event.clientY - rect.top) / rect.height) * height;
      pointer.strength = 1;
      startRendering();
    };

    const render = (timestamp) => {
      renderedFrame = 0;
      if (!isReady || !isInViewport || document.hidden) return;

      const time = timestamp * .001;
      const particleColor = document.documentElement.classList.contains('is-day-mode') ? [0, 0, 0] : [255, 255, 255];
      const interactionColor = [175, 145, 123];
      particleBuildStartedAt ??= timestamp;
      const fieldBuildProgress = Math.min(1, (timestamp - particleBuildStartedAt) / 2600);
      pointer.strength *= .945;

      particleContext.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        const distance = Math.hypot(particle.x - pointer.x, particle.y - pointer.y);
        const influence = pointer.strength > .004
          ? Math.max(0, 1 - distance / (148 * particle.pixelRatio)) * pointer.strength
          : 0;
        const twinkle = .82 + ((Math.sin((time * particle.speed) + particle.phase) + 1) * .09);
        const visibilityWave = (Math.sin((time * particle.visibilitySpeed) + particle.visibilityPhase) + 1) * .5;
        const minimumVisibility = .12 + (particle.edgeWeight * .72);
        const visibility = minimumVisibility + ((1 - minimumVisibility) * Math.pow(visibilityWave, 1.3));
        const lineBuildProgress = Math.max(0, Math.min(1, (fieldBuildProgress - particle.buildDelay) / .3));
        const buildEase = lineBuildProgress * lineBuildProgress * (3 - (2 * lineBuildProgress));
        const alpha = Math.min(1, (twinkle * visibility) + (influence * 1.05)) * buildEase;
        const radius = Math.max(.5, Math.round((particle.radius * (1 + influence * 1.25)) * 2) / 2);
        const localMotion = influence * particle.pixelRatio * 4.2;
        const interactionMix = Math.min(1, influence * 1.15);
        const red = Math.round(particleColor[0] + ((interactionColor[0] - particleColor[0]) * interactionMix));
        const green = Math.round(particleColor[1] + ((interactionColor[1] - particleColor[1]) * interactionMix));
        const blue = Math.round(particleColor[2] + ((interactionColor[2] - particleColor[2]) * interactionMix));
        const x = Math.round(particle.x + (Math.sin((time * particle.drift) + particle.phase) * localMotion));
        const y = Math.round(particle.y + (Math.cos((time * particle.drift * .8) + particle.phase) * localMotion));

        particleContext.beginPath();
        particleContext.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
        particleContext.arc(x, y, radius, 0, Math.PI * 2);
        particleContext.fill();
      });

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'source-over';
      context.drawImage(particleCanvas, 0, 0);
      context.globalCompositeOperation = 'destination-in';
      context.drawImage(maskCanvas, 0, 0);
      context.globalCompositeOperation = 'source-over';

      if (!reducedMotion.matches) startRendering();
    };

    const startRendering = () => {
      if (!isReady || !isInViewport || document.hidden || renderedFrame) return;
      renderedFrame = window.requestAnimationFrame(render);
    };

    pauseLogoParticleForScroll = () => {
      stopRendering();
      window.clearTimeout(scrollResumeTimer);
      scrollResumeTimer = window.setTimeout(startRendering, 120);
    };

    const resizeCanvas = () => {
      if (!logoMaskImage.naturalWidth) return;
      const rect = logoParticleCanvas.getBoundingClientRect();
      const pixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 4) * particleRenderScale;
      const nextWidth = Math.max(1, Math.round(rect.width * pixelRatio));
      const nextHeight = Math.max(1, Math.round(rect.height * pixelRatio));
      if (nextWidth === width && nextHeight === height && particles.length) return;

      width = nextWidth;
      height = nextHeight;
      [logoParticleCanvas, maskCanvas, particleCanvas].forEach((canvas) => {
        canvas.width = width;
        canvas.height = height;
      });
      configureCanvasContexts();
      maskContext.clearRect(0, 0, width, height);
      maskContext.drawImage(logoMaskImage, 0, 0, width, height);
      // The trademark is separate from the OOXME mark; exclude it before sampling and clipping.
      maskContext.clearRect(Math.floor(width * .855), 0, Math.ceil(width * .145), Math.ceil(height * .072));
      const maskPixels = maskContext.getImageData(0, 0, width, height).data;
      const isPhoneViewport = window.matchMedia('(max-width: 600px)').matches;
      const particleCount = isPhoneViewport
        ? Math.min(1320, Math.max(1100, Math.round((rect.width * rect.height) / 54)))
        : Math.min(880, Math.max(640, Math.round((rect.width * rect.height) / 87.5)));
      const edgeParticleCount = Math.round(particleCount * .6);
      const particleTargetCount = particleCount + edgeParticleCount;
      const particleRadius = isPhoneViewport ? [.56, .76] : [.46, .62];
      const alphaAt = (x, y) => {
        if (x < 0 || x >= width || y < 0 || y >= height) return 0;
        return maskPixels[((Math.floor(y) * width + Math.floor(x)) * 4) + 3];
      };
      const edgeWeightAt = (x, y) => {
        const edgeSearchRange = Math.max(6, Math.round(13 * pixelRatio));
        const directions = [[1, 0], [-1, 0], [0, 1], [0, -1], [.707, .707], [-.707, .707], [.707, -.707], [-.707, -.707]];
        let nearestEdge = edgeSearchRange;
        directions.forEach(([dx, dy]) => {
          for (let distance = 1; distance <= edgeSearchRange; distance += 1) {
            if (alphaAt(x + (dx * distance), y + (dy * distance)) < 160) {
              nearestEdge = Math.min(nearestEdge, distance);
              break;
            }
          }
        });
        return 1 - (nearestEdge / edgeSearchRange);
      };
      particles = [];
      particleBuildStartedAt = null;
      let attempts = 0;
      while (particles.length < particleTargetCount && attempts < particleTargetCount * 520) {
        attempts += 1;
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        if (maskPixels[((y * width + x) * 4) + 3] < 160) continue;
        const edgeWeight = edgeWeightAt(x, y);
        const edgeDensity = Math.pow(edgeWeight, .58);
        const isEdgeReinforcement = particles.length >= particleCount;
        if (isEdgeReinforcement) {
          if (Math.random() > (.12 + (edgeDensity * .88))) continue;
        } else if (Math.random() > (.22 + (edgeDensity * .78))) continue;
        particles.push({
          x,
          y,
          pixelRatio,
          radius: random(...particleRadius) * pixelRatio,
          edgeWeight,
          phase: random(0, Math.PI * 2),
          speed: random(3.4, 7.2),
          drift: random(.22, .6),
          buildDelay: random(0, .7),
          visibilityPhase: random(0, Math.PI * 2),
          visibilitySpeed: random(1.2, 2.8)
        });
      }
      isReady = true;
      startRendering();
    };

    logoParticleCanvas.addEventListener('pointermove', activatePointer, { passive: true });
    logoParticleCanvas.addEventListener('pointerdown', (event) => {
      event.stopPropagation();
      activatePointer(event);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopRendering();
      else startRendering();
    });
    new MutationObserver(startRendering).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(logoParticleField);
    else window.addEventListener('resize', resizeCanvas, { passive: true });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        isInViewport = entries.some((entry) => entry.isIntersecting);
        if (isInViewport) startRendering();
        else stopRendering();
      }, { threshold: .01 }).observe(logoParticleField);
    } else {
      isInViewport = true;
    }
    logoMaskImage.addEventListener('load', resizeCanvas, { once: true });
    logoMaskImage.src = 'assets/logo/Logo.png';
  };
  if (logoParticleField && logoParticleCanvas) setupLogoParticleField();

  sendThemeUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyTheme(document.documentElement.classList.contains('is-day-mode') ? 'dark' : 'day', { manual: true });
  });
  sendLanguageUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar');
  });

  const latinScriptPattern = /[A-Za-z]/u;
  const detectMessageLanguage = (message) => (arabicScriptPattern.test(message) ? 'ar' : 'en');
  const getMessageDirection = (message, language) => (
    arabicScriptPattern.test(message) && latinScriptPattern.test(message)
      ? 'auto'
      : language === 'ar' ? 'rtl' : 'ltr'
  );

  const setConversationVisibility = (isVisible) => {
    if (conversationVisible === isVisible) return;
    conversationVisible = isVisible;
    conversation.classList.toggle('is-chat-hidden', !isVisible);
    conversation.setAttribute('aria-hidden', String(!isVisible));
    syncPageTextForChat();
  };

  const syncPageTextForChat = () => {
    const hasVisibleBubbles = !conversation.classList.contains('is-chat-hidden')
      && Boolean(conversation.querySelector('.s-page__conversation-bubble:not(.is-exiting)'));
    page.classList.toggle('is-chat-active', hasVisibleBubbles);
    if (hasVisibleBubbles) setSendUtilitiesOpen(false);
    setSendUtilityAvailability(!hasVisibleBubbles);
  };

  const activateTemporaryUi = (nextState) => {
    const next = ['none', 'chat', 'menu', 'utilities'].includes(nextState)
      ? nextState
      : 'none';
    activeTemporaryUi = next;

    const menuIsActive = next === 'menu';
    // /rpn keeps the left endpoint independent from menu state. /x shares
    // that state treatment; only /z retains its legacy plus rotation.
    addRotated = menuIsActive && isZPage;
    addButton.classList.toggle('is-rotated', addRotated);
    submitButton.classList.toggle('is-active', menuIsActive);
    setComposerMenuOpen(menuIsActive);
    setSendUtilitiesOpen(next === 'utilities');
    setConversationVisibility(next === 'chat');

    if ((next === 'menu' || next === 'utilities') && document.activeElement === input) input.blur();
  };

  const closeConversationWithoutReset = () => {
    if (!conversationVisible) return;
    setConversationVisibility(false);
    if (activeTemporaryUi === 'chat') activeTemporaryUi = 'none';
  };

  document.addEventListener('click', (event) => {
    if (isTemporaryUiInteraction(event.target)) return;
    closeConversationWithoutReset();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    noteFlowScroll();
    closeConversationWithoutReset();
  }, { passive: true });

  const beginMajorSectionInteraction = () => {
    majorSectionPointerActive = true;
    cancelMajorSectionSettle({ stopNativeScroll: true });
  };
  const endMajorSectionInteraction = () => {
    majorSectionPointerActive = false;
  };

  document.addEventListener('pointerdown', (event) => {
    beginMajorSectionInteraction();
    zFaceController?.begin(event);
  }, { capture: true, passive: true });
  document.addEventListener('touchstart', (event) => {
    beginMajorSectionInteraction();
  }, { capture: true, passive: true });
  document.addEventListener('pointermove', (event) => {
    zFaceController?.move(event);
    if (event.pointerType === 'touch' || event.buttons !== 0) beginMajorSectionInteraction();
  }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => {
    beginMajorSectionInteraction();
  }, { capture: true, passive: true });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      endMajorSectionInteraction();
      if (eventName.startsWith('pointer')) {
        if (event.pointerType !== 'touch') {
        }
        zFaceController?.end(event, eventName === 'pointercancel');
      }
    }, { passive: true });
  });
  window.addEventListener('wheel', (event) => {
    if (!isZPage) {
      cancelMajorSectionSettle({ stopNativeScroll: true });
      return;
    }
    cancelMajorSectionSettle({ stopNativeScroll: true });
    majorSectionPointerActive = false;
    if (isZPage) {
      cancelZReleaseSettle({ stopNativeScroll: true });
      if (zSectionOneLocked && event.deltaY < 0) zEndpointReverseIntent = true;
    }
  }, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (!isZPage) return;
    if (![' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) return;
    majorSectionPointerActive = false;
    cancelMajorSectionSettle({ stopNativeScroll: true });
    if (isZPage) {
      cancelZReleaseSettle({ stopNativeScroll: true });
      if (zSectionOneLocked && ['ArrowUp', 'PageUp', 'Home'].includes(event.key)) zEndpointReverseIntent = true;
    }
  }, { passive: false });

  conversation.addEventListener('pointerdown', () => {
    if (conversationState !== 'finished' && conversationState !== 'resetting') activateTemporaryUi('chat');
  }, { passive: true });

  const setComposerInteractivity = (enabled) => {
    composerControls.forEach((control) => { control.disabled = !enabled; });
  };

  const exitOldestConversationBubble = () => {
    const visibleBubbles = Array.from(conversation.children).filter((bubble) => !bubble.classList.contains('is-exiting'));
    if (visibleBubbles.length < maximumVisibleConversationMessages) return;
    const oldestBubble = visibleBubbles[0];
    const conversationRect = conversation.getBoundingClientRect();
    const bubbleRect = oldestBubble.getBoundingClientRect();
    oldestBubble.style.top = `${bubbleRect.top - conversationRect.top}px`;
    oldestBubble.style.left = `${bubbleRect.left - conversationRect.left}px`;
    oldestBubble.style.width = `${bubbleRect.width}px`;
    oldestBubble.classList.add('is-exiting');
    window.setTimeout(() => oldestBubble.remove(), reducedMotion.matches ? 0 : 240);
  };

  const animateConversationShift = (previousPositions) => {
    if (reducedMotion.matches) return;
    const shiftedBubbles = [];
    previousPositions.forEach((previousTop, bubble) => {
      if (!bubble.isConnected || bubble.classList.contains('is-entering') || bubble.classList.contains('is-exiting')) return;
      const offset = previousTop - bubble.getBoundingClientRect().top;
      if (Math.abs(offset) < 1) return;
      bubble.classList.add('is-shifting');
      bubble.style.transform = `translateY(${offset}px)`;
      shiftedBubbles.push(bubble);
    });
    if (!shiftedBubbles.length) return;
    void conversation.offsetHeight;
    window.requestAnimationFrame(() => {
      shiftedBubbles.forEach((bubble) => { bubble.style.transform = ''; });
      window.setTimeout(() => shiftedBubbles.forEach((bubble) => bubble.classList.remove('is-shifting')), 260);
    });
  };

  const addConversationBubble = (message, speaker, language) => {
    syncConversationInputBounds();
    const previousPositions = new Map(
      Array.from(conversation.children)
        .filter((existingBubble) => !existingBubble.classList.contains('is-exiting'))
        .map((existingBubble) => [existingBubble, existingBubble.getBoundingClientRect().top])
    );
    exitOldestConversationBubble();
    const bubble = document.createElement('p');
    bubble.className = `s-page__conversation-bubble s-page__conversation-bubble--${speaker} is-entering`;
    bubble.lang = language;
    bubble.dir = getMessageDirection(message, language);
    bubble.textContent = message;
    bubble.addEventListener('animationend', () => bubble.classList.remove('is-entering'), { once: true });
    conversation.appendChild(bubble);
    syncPageTextForChat();
    animateConversationShift(previousPositions);
  };

  const resetConversationDemo = () => {
    resetPageToInitialState();
  };

  const revealConversationFinal = (language) => {
    window.clearTimeout(finalVisibleTimer);
    window.clearTimeout(finalResetTimer);
    activateTemporaryUi('none');
    conversationState = 'finished';
    resetAddButton();
    setComposerInteractivity(false);
    conversationFinalCopy.lang = language;
    conversationFinalCopy.dir = language === 'ar' ? 'rtl' : 'ltr';
    conversationFinalCopy.textContent = finalMessages[language];
    conversationFinal.setAttribute('aria-hidden', 'false');
    conversationFinal.classList.add('is-visible');
    input.value = '';
    updateComposerInputLanguage();
    input.blur();
    finalVisibleTimer = window.setTimeout(
      resetConversationDemo,
      finalMessageDurationMs
    );
  };

  input.addEventListener('pointerdown', () => {
    activateTemporaryUi('chat');
  }, { passive: true });

  input.addEventListener('focus', () => {
    activateTemporaryUi('chat');
  });

  input.addEventListener('input', () => {
    updateComposerInputLanguage();
    activateTemporaryUi('chat');
  });

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    // /x's right Top Bar endpoint now uses /rpn's exact menu toggle instead
    // of routing an empty bar interaction through the conversation flow.
    if (!isZPage) {
      activateTemporaryUi(activeTemporaryUi === 'menu' ? 'none' : 'menu');
      return;
    }
    const message = input.value.trim();
    if (isZPage && !message) {
      if (conversationVisible) return;
      activateTemporaryUi(activeTemporaryUi === 'menu' ? 'none' : 'menu');
      return;
    }
    if (!message) {
      if (conversationVisible) return;
      activateTemporaryUi(activeTemporaryUi === 'menu' ? 'none' : 'menu');
      return;
    }
    if (conversationState !== 'active') return;

    const language = detectMessageLanguage(message);
    const currentReplyIndex = replyIndex;
    const replies = language === 'ar' ? arabicReplies : englishReplies;
    activateTemporaryUi('chat');
    addConversationBubble(message, 'user', language);
    input.value = '';
    updateComposerInputLanguage();
    replyIndex += 1;
    if (replyIndex >= englishReplies.length) conversationState = 'awaiting-final';

    const replyTimer = window.setTimeout(() => {
      pendingReplyTimers.delete(replyTimer);
      addConversationBubble(replies[currentReplyIndex], 'ooxme', language);
      if (currentReplyIndex === englishReplies.length - 1) {
        pendingFinalRevealTimer = window.setTimeout(() => {
          pendingFinalRevealTimer = 0;
          revealConversationFinal(language);
        }, finalRevealDelayMs);
      }
    }, replyDelayMs);
    pendingReplyTimers.add(replyTimer);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      scheduleKeyboardOffset();
    }, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleKeyboardOffset, { passive: true });
  }

  const handleViewportGeometryChange = () => {
    scheduleMainContentSpacing();
    const nextWidth = document.documentElement.clientWidth;
    const nextOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    const layoutWidthChanged = Math.abs(nextWidth - localizedGeometryWidth) > .5;
    const orientationChanged = nextOrientation !== localizedGeometryOrientation;
    if (layoutWidthChanged || orientationChanged) {
      localizedGeometryWidth = nextWidth;
      localizedGeometryOrientation = nextOrientation;
      if (!isZPage) {
        firstGroupBaselineLocked = false;
        sectionTwoBaselineCorrectionLocked = false;
      }
      scheduleLocalizedGeometry();
    } else if (!window.visualViewport) {
      // Desktop height-only resizing is a genuine viewport resize. On mobile,
      // height-only changes are browser chrome motion and must not reposition a
      // revealed portrait composition while the page is moving.
      scheduleStablePortraitSectionLayout();
    }
    scheduleKeyboardOffset();
  };

  window.addEventListener('resize', handleViewportGeometryChange, { passive: true });
  window.addEventListener('orientationchange', () => {
    localizedGeometryWidth = document.documentElement.clientWidth;
    localizedGeometryOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    if (!isZPage) {
      firstGroupBaselineLocked = false;
      sectionTwoBaselineCorrectionLocked = false;
    }
    scheduleLocalizedGeometry();
    scheduleKeyboardOffset();
  }, { passive: true });

  const prepareZHeroTransition = ({ freeze = false } = {}) => {
    if (!isZPage || zHeroGeometryFrozen || window.scrollY > .5) return;
    if (localizedGeometryFrame) window.cancelAnimationFrame(localizedGeometryFrame);
    if (portraitSectionLayoutFrame) window.cancelAnimationFrame(portraitSectionLayoutFrame);
    if (zSecondaryNavAlignmentFrame) window.cancelAnimationFrame(zSecondaryNavAlignmentFrame);
    if (zSectionOneScrollFrame) window.cancelAnimationFrame(zSectionOneScrollFrame);
    localizedGeometryFrame = 0;
    portraitSectionLayoutFrame = 0;
    zSecondaryNavAlignmentFrame = 0;
    zSectionOneScrollFrame = 0;

    stabilizeLocalizedGeometry();
    if (portraitSectionLayoutFrame) window.cancelAnimationFrame(portraitSectionLayoutFrame);
    portraitSectionLayoutFrame = 0;
    syncPortraitSectionLayout();
    if (zSectionOneScrollFrame) window.cancelAnimationFrame(zSectionOneScrollFrame);
    zSectionOneScrollFrame = 0;

    syncZContentBoxHorizontalGeometry();
    syncZContentBoxHeight();
    syncZStateOneCompositionGeometry();
    syncZUnifiedTextAlignment();
    syncZApplyButtonGeometry();
    syncZSectionOneScroll();

    // Safari otherwise defers backing-layer creation for this mixed
    // transform/opacity/filter composition until its first scroll commit.
    // Mark and flush only the layers used by the /z hero transition while the
    // page is still at rest; later scroll frames only update their properties.
    zHeroCompositorLayers.forEach((layer) => {
      layer.classList.add('is-z-compositor-ready');
      const style = getComputedStyle(layer);
      void style.transform;
      void style.opacity;
      void style.filter;
      void style.webkitBackdropFilter;
      void layer.getBoundingClientRect();
    });
    document.documentElement.setAttribute('data-s-z-hero-geometry-ready', 'true');
    if (freeze) {
      zHeroGeometryFrozen = true;
      document.documentElement.setAttribute('data-s-z-hero-assets-stable', 'true');
    }
  };

  const initializeGroupOne = () => {
    initializationRun += 1;
    document.documentElement.classList.add('s-x-initializing');
    initializationReady = false;
    if (keyboardFrame) window.cancelAnimationFrame(keyboardFrame);
    if (composerPulseFrame) window.cancelAnimationFrame(composerPulseFrame);
    keyboardFrame = 0;
    composerPulseFrame = 0;
    if (isZPage) {
      cancelZReleaseSettle({ stopNativeScroll: true });
      zReleasePointerActive = false;
      zSectionOneLocked = false;
      zSectionOneCompositionReady = false;
      zSectionOneContentBoxHeight = 0;
      zSectionOneStateOneImageBottom = 0;
      zSectionOneTransitionDistance = 0;
      zEndpointLockScrollY = 0;
      zEndpointPointerId = null;
      zEndpointPointerStartY = 0;
      zEndpointReverseIntent = false;
      zHeroGeometryFrozen = false;
      document.documentElement.removeAttribute('data-s-z-hero-assets-stable');
      zSecondaryNav.classList.remove('is-z-content-interactive');
      zSecondaryNav.classList.add('is-z-transition-ready');
      zSecondaryNav.style.removeProperty('--s-z-secondary-nav-state-one-top');
      zSecondaryNav.style.removeProperty('--s-z-composition-progress');
      zSecondaryNav.style.removeProperty('--s-z-content-blur');
      page.style.removeProperty('--s-z-final-scroll-reserve');
      page.style.removeProperty('--s-z-transition-distance');
      syncZActiveContent(false);
      firstGroup.style.setProperty('--s-z-first-group-scroll-progress', '0');
      prepareZHeroTransition();
      const preparationRun = initializationRun;
      const heroFontsReady = document.fonts?.ready || Promise.resolve();
      const heroImageReady = imageMedia.complete && imageMedia.naturalWidth
        ? Promise.resolve()
        : (imageMedia.decode?.().catch(() => {}) || Promise.resolve());
      Promise.all([heroFontsReady, heroImageReady]).then(() => {
        if (initializationRun !== preparationRun || window.scrollY > .5) return;
        prepareZHeroTransition({ freeze: true });
      });
    }
    resetAddButton();
    activateTemporaryUi('none');
    composer.classList.remove('is-pulsing');
    lastKeyboardOverlap = 0;
    updateKeyboardOffset();
    initializationReady = true;
    syncConversationInputBounds();
    document.documentElement.classList.remove('s-x-initializing');
  };

  const resetPageToInitialState = () => {
    cancelMajorSectionSettle({ stopNativeScroll: true });
    window.clearTimeout(discreteSectionUnlockTimer);
    discreteSectionUnlockTimer = 0;
    discreteSectionInputLocked = false;
    majorSectionPointerActive = false;
    window.clearTimeout(portraitSectionLayoutTimer);
    portraitSectionLayoutTimer = 0;
    if (portraitSectionLayoutFrame) window.cancelAnimationFrame(portraitSectionLayoutFrame);
    if (finalScrollBufferFrame) window.cancelAnimationFrame(finalScrollBufferFrame);
    portraitSectionLayoutFrame = 0;
    finalScrollBufferFrame = 0;
    window.clearTimeout(finalVisibleTimer);
    window.clearTimeout(finalResetTimer);
    window.clearTimeout(pendingFinalRevealTimer);
    finalVisibleTimer = 0;
    finalResetTimer = 0;
    pendingFinalRevealTimer = 0;
    pendingReplyTimers.forEach((timer) => window.clearTimeout(timer));
    pendingReplyTimers.clear();
    sendUtilityPulseFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    sendUtilityPulseFrames.clear();
    imagePulseFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    imagePulseFrames.clear();
    document.querySelectorAll('.is-locked-shaking').forEach((notice) => notice.classList.remove('is-locked-shaking'));
    secondaryNavPulseFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    secondaryNavPulseFrames.clear();
    document.querySelectorAll('.is-pulsing').forEach((element) => element.classList.remove('is-pulsing'));
    composerMenu.querySelectorAll('.is-active').forEach((element) => element.classList.remove('is-active'));
    groups.forEach((group) => group.classList.remove('is-visible'));
    conversation.replaceChildren();
    conversationFinal.classList.remove('is-visible');
    conversationFinal.setAttribute('aria-hidden', 'true');
    conversationFinalCopy.textContent = '';
    conversationFinalCopy.removeAttribute('lang');
    conversationFinalCopy.removeAttribute('dir');
    replyIndex = 0;
    conversationState = 'active';
    manualThemeOverride = false;
    applyLanguage(initialLanguage, { persist: false, emit: false });
    applyTheme('dark');
    input.blur();
    input.value = '';
    updateComposerInputLanguage();
    setComposerInteractivity(true);
    activateTemporaryUi('none');
    resetAddButton();
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    initializeGroupOne();
    window.requestAnimationFrame(() => {
      firstGroup.classList.add('is-visible');
    });
  };

  window.addEventListener('pageshow', (event) => {
    const navigateToContact = window.location.hash === '#contact'
      || new URLSearchParams(window.location.search).get('section') === 'contact';
    // The initial page has already been initialized below. Re-running the
    // reset and scrollTo(0) here races the first user gesture and makes the
    // opening scroll feel stuck. Keep the reset for BFCache/history restores.
    if (!event.persisted && !navigateToContact) return;
    if (isZPage) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      initializeGroupOne();
    } else {
      // A history restore can preserve both scroll position and the live DOM.
      // /x deliberately treats every entry as a new visit instead.
      if (event.persisted) resetPageToInitialState();
      window.requestAnimationFrame(() => {
        if (!navigateToContact) {
          return;
        }
        document.fonts.ready.then(() => window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
          const contactSection = majorSections.find((section) => section.matches('.s-page__major-section--contact'));
          const contactIndex = contactSection ? getNavigableMajorSections().indexOf(contactSection) : -1;
          if (contactIndex >= 0) transitionToMajorSection(contactIndex);
        })));
      });
    }
  });
  initializeGroupOne();
})();
