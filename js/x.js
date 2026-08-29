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
  const submitButton = composer?.querySelector('.s-page__submit');
  const logoParticleField = document.querySelector('[data-s-logo-particles]');
  const logoParticleCanvas = document.querySelector('[data-s-logo-particle-canvas]');
  const imageFrame = document.querySelector('[data-s-image-frame]');
  const imageCopy = document.querySelector('[data-s-image-copy]');
  const conversation = document.querySelector('[data-s-conversation]');
  const conversationFinal = document.querySelector('[data-s-conversation-final]');
  const conversationFinalCopy = document.querySelector('[data-s-conversation-final-copy]');
  const sections = Array.from(document.querySelectorAll('[data-s-section]')).map((element) => ({
    element,
    groups: Array.from(element.querySelectorAll(':scope > [data-s-group]'))
  }));
  const groups = sections.flatMap((section) => section.groups);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const systemThemePreference = window.matchMedia('(prefers-color-scheme: dark)');

  if (!page || !content || !composer || !composerMenu || !sendUtilities || !sendThemeUtility || !sendLanguageUtility || !addButton || !input || !submitButton || !logoParticleField || !logoParticleCanvas || !imageFrame || !imageCopy || !conversation || !conversationFinal || !conversationFinalCopy || !sections.length || sections.some((section) => section.groups.length !== 3)) return;

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
        ['Welcome\nOur Next Client', 'Iraq’s one and only brand management service\nPremium business development service'],
        ['Re-engineered\nBuilt for New Terrain', 'Discover the fourth update to the OOXME operating system, designed for engineering, architectural, construction, contracting, and similar businesses.'],
        ['From Businesses\nTo Global Brands', 'Take the next step and contact us. You’ll be impressed!']
      ],
      menu: ['The Brand management', 'The Gallery', 'The Consultation', 'The Dashboard', 'Other'],
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
      }
    },
    ar: {
      groups: [
        ['مرحبــا\nعميلنا القادم', 'ادارة العلامات التجارية الواحد والوحيد في العراق\nخدمة بريميوم لتطوير الاعمال'],
        ['إعادة هندسة\nبني لتضاريس جديدة', 'تعرف على التحديث الرابع لنظام عمل اوكسوم، المخصص للمشاريع الهندسية، المعمارية، الانشائية والمقاولات وشبيهاتها'],
        ['من انشطة تجارية\nالى علامات عالمية', 'خذ الخطوة التالية وتواصل معنا، سوف تنبهر!']
      ],
      menu: ['ادارة العلامة التجارية', 'المعرض', 'الاستشارة', 'لوحة التحكم', 'اخرى'],
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
      }
    }
  };
  let keyboardFrame = 0;
  let composerPulseFrame = 0;
  let composerMenuPulseFrame = 0;
  let addFlashTimer = 0;
  const menuItemFlashTimers = new WeakMap();
  const sendUtilityPulseFrames = new WeakMap();
  let addRotated = false;
  let initializationReady = false;
  let initializationRun = 0;
  let lastKeyboardOverlap = 0;
  let replyIndex = 0;
  let conversationState = 'active';
  let finalVisibleTimer = 0;
  let finalResetTimer = 0;
  let conversationVisible = true;
  let activeTemporaryUi = 'none';
  const composerControls = Array.from(composer.querySelectorAll('button, input'));
  const inputLabel = composer.querySelector('.s-page__visually-hidden');
  const menuLabels = Array.from(composerMenu.querySelectorAll('.s-page__composer-menu-label'));
  let applyPageCopy = null;
  let manualThemeOverride = false;
  const arabicScriptPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

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
    sendLanguageUtility.classList.toggle('is-active', language === 'en');
    sendLanguageUtility.setAttribute('aria-pressed', String(language === 'en'));
    sendLanguageUtility.setAttribute('aria-label', language === 'en' ? copy.utilities.switchToArabic : copy.utilities.switchToEnglish);
    applyPageCopy?.(language);
    updateComposerInputLanguage();
    updateThemeToggleLabel();
    if (persist) {
      try { localStorage.setItem('ooxme-language', language); } catch (_) {}
    }
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

  const applySystemTheme = () => {
    if (manualThemeOverride) return;
    applyTheme(systemThemePreference.matches ? 'dark' : 'day');
  };

  let initialLanguage = 'en';
  try { initialLanguage = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(initialLanguage, { persist: false, emit: false });
  applyTheme('dark');
  systemThemePreference.addEventListener?.('change', applySystemTheme);

  const isTemporaryUiInteraction = (target) => (
    composer.contains(target) || conversation.contains(target)
  );

  const setComposerMenuOpen = (isOpen) => {
    composerMenu.classList.toggle('is-open', isOpen);
    composerMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const setSendUtilitiesOpen = (isOpen) => {
    sendUtilities.classList.toggle('is-open', isOpen);
    sendUtilities.setAttribute('aria-hidden', String(!isOpen));
  };

  const setSendUtilityAvailability = (isAvailable) => {
    [sendThemeUtility, sendLanguageUtility].forEach((control) => {
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

  const pulseComposerMenu = () => {
    if (!initializationReady) return;
    if (composerMenuPulseFrame) window.cancelAnimationFrame(composerMenuPulseFrame);
    composerMenu.classList.remove('is-pulsing');
    composerMenuPulseFrame = window.requestAnimationFrame(() => {
      composerMenuPulseFrame = 0;
      composerMenu.classList.add('is-pulsing');
    });
  };

  composerMenu.addEventListener('animationend', (event) => {
    if (event.animationName === 's-page-composer-menu-pulse') composerMenu.classList.remove('is-pulsing');
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

  [sendThemeUtility, sendLanguageUtility].forEach((control) => {
    control.addEventListener('pointerdown', () => pulseSendUtility(control), { passive: true });
    control.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-composer-menu-pulse') control.classList.remove('is-pulsing');
    });
  });

  [addButton, input, submitButton].forEach((control) => {
    control?.addEventListener('pointerdown', pulseComposer, { passive: true });
  });
  submitButton.addEventListener('pointerdown', (event) => event.preventDefault());

  [addButton, composerMenu, sendUtilities].forEach((control) => {
    control.addEventListener('pointerdown', (event) => event.stopPropagation());
    control.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
  });
  composerMenu.addEventListener('click', (event) => event.stopPropagation());
  sendUtilities.addEventListener('click', (event) => event.stopPropagation());
  composerMenu.querySelectorAll('.s-page__composer-menu-item').forEach((item) => {
    item.addEventListener('pointerdown', () => {
      pulseComposerMenu();
      window.clearTimeout(menuItemFlashTimers.get(item));
      item.classList.add('is-active');
      menuItemFlashTimers.set(item, window.setTimeout(() => item.classList.remove('is-active'), 120));
    }, { passive: true });
  });

  addButton.addEventListener('click', (event) => {
    if (!initializationReady) return;
    event.stopPropagation();
    if (activeTemporaryUi === 'menu') {
      activateTemporaryUi('none');
    } else {
      activateTemporaryUi('menu');
    }
    window.clearTimeout(addFlashTimer);
    addButton.classList.add('is-active');
    addFlashTimer = window.setTimeout(() => addButton.classList.remove('is-active'), 120);
  });

  document.addEventListener('pointerdown', (event) => {
    if (isTemporaryUiInteraction(event.target)) return;
    activateTemporaryUi('none');
    if (document.activeElement === input) input.blur();
  }, { passive: true });
  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));
    const keyboardOverlap = Math.max(0, layoutHeight - window.visualViewport.height - window.visualViewport.offsetTop);
    if (Math.abs(keyboardOverlap - lastKeyboardOverlap) >= .01) {
      page.style.setProperty('--s-keyboard-offset', `${keyboardOverlap.toFixed(2)}px`);
    }
    lastKeyboardOverlap = keyboardOverlap;
    syncConversationInputBounds();
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

  const syncImageCopyVisibility = () => {
    const imageRect = imageFrame.getBoundingClientRect();
    const composerRect = composer.getBoundingClientRect();
    const isVisible = imageRect.top <= composerRect.top;
    imageFrame.closest('[data-s-group]')?.classList.toggle('is-image-copy-visible', isVisible);
    imageCopy.setAttribute('aria-hidden', String(!isVisible));
  };

  const groupElements = groups.map((group) => Array.from(group.querySelectorAll('[data-s-reveal]')));
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.15 })
    : null;

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

  applyPageCopy = (language) => {
    const copy = pageCopy[language];
    groupElements.forEach((elements, groupIndex) => {
      const localizedGroup = copy.groups[groupIndex];
      if (!localizedGroup) return;
      elements.forEach((element, elementIndex) => {
        setLocalizedText(element, localizedGroup[elementIndex]);
      });
    });
    menuLabels.forEach((label, index) => { label.textContent = copy.menu[index]; });
    input.placeholder = copy.inputPlaceholder;
    inputLabel.textContent = copy.ask;
    addButton.setAttribute('aria-label', copy.addContext);
    submitButton.setAttribute('aria-label', copy.submitQuestion);
    conversation.setAttribute('aria-label', copy.conversation);
    if (conversationFinal.classList.contains('is-visible')) {
      conversationFinalCopy.lang = language;
      conversationFinalCopy.dir = language === 'ar' ? 'rtl' : 'ltr';
      conversationFinalCopy.textContent = finalMessages[language];
    }
    setRevealLineDelays();
  };
  applyPageCopy(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  syncImageCopyVisibility();
  groups.forEach((group) => {
    if (revealObserver) revealObserver.observe(group);
    else {
      group.classList.add('is-visible');
    }
  });

  const setupLogoParticleField = () => {
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
      const interactionColor = [48, 132, 255];
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

    const resizeCanvas = () => {
      if (!logoMaskImage.naturalWidth) return;
      const rect = logoParticleCanvas.getBoundingClientRect();
      const pixelRatio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 4);
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
    logoMaskImage.src = 'assets/logo/OX-001-LOGO-black.png';
  };
  setupLogoParticleField();

  let imageCopyFrame = 0;
  const requestImageCopyVisibilitySync = () => {
    if (imageCopyFrame) return;
    imageCopyFrame = window.requestAnimationFrame(() => {
      imageCopyFrame = 0;
      syncImageCopyVisibility();
    });
  };
  window.addEventListener('scroll', requestImageCopyVisibilitySync, { passive: true });
  window.addEventListener('resize', requestImageCopyVisibilitySync, { passive: true });
  window.visualViewport?.addEventListener('resize', requestImageCopyVisibilitySync, { passive: true });

  sendThemeUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyTheme(document.documentElement.classList.contains('is-day-mode') ? 'dark' : 'day', { manual: true });
  });
  sendLanguageUtility.addEventListener('click', (event) => {
    event.stopPropagation();
    applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar');
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'ooxme-language' && event.newValue) {
      applyLanguage(event.newValue, { persist: false });
    }
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
    addRotated = menuIsActive;
    addButton.classList.toggle('is-rotated', menuIsActive);
    setComposerMenuOpen(menuIsActive);
    setSendUtilitiesOpen(next === 'utilities');
    setConversationVisibility(next === 'chat');

    if ((next === 'menu' || next === 'utilities') && document.activeElement === input) input.blur();
  };

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
    window.clearTimeout(finalVisibleTimer);
    finalVisibleTimer = 0;
    activateTemporaryUi('none');
    conversationFinal.classList.remove('is-visible');
    conversationFinal.setAttribute('aria-hidden', 'true');
    conversation.replaceChildren();
    syncPageTextForChat();
    replyIndex = 0;
    conversationState = 'resetting';
    applyLanguage('en', { emit: false });
    manualThemeOverride = false;
    applySystemTheme();
    input.blur();
    input.value = '';
    updateComposerInputLanguage();
    input.placeholder = pageCopy[document.documentElement.lang === 'ar' ? 'ar' : 'en'].inputPlaceholder;
    resetAddButton();
    initializeGroupOne();
    window.clearTimeout(finalResetTimer);
    finalResetTimer = window.setTimeout(() => {
      conversationFinalCopy.textContent = '';
      conversationFinalCopy.removeAttribute('lang');
      conversationFinalCopy.removeAttribute('dir');
      setComposerInteractivity(true);
      conversationState = 'active';
    }, reducedMotion.matches ? 0 : finalFadeOutDurationMs);
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
    lockActiveGroupForKeyboard();
  });

  input.addEventListener('blur', () => {
    if (lastKeyboardOverlap > 0) return;
    releaseKeyboardGroupLock();
  });

  input.addEventListener('input', () => {
    updateComposerInputLanguage();
    activateTemporaryUi('chat');
  });

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const message = input.value.trim();
    if (!message) {
      activateTemporaryUi(activeTemporaryUi === 'utilities' ? 'none' : 'utilities');
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

    window.setTimeout(() => {
      addConversationBubble(replies[currentReplyIndex], 'ooxme', language);
      if (currentReplyIndex === englishReplies.length - 1) {
        window.setTimeout(() => revealConversationFinal(language), finalRevealDelayMs);
      }
    }, replyDelayMs);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleKeyboardOffset, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleKeyboardOffset, { passive: true });
  }

  window.addEventListener('resize', () => {
    syncConversationInputBounds();
    scheduleKeyboardOffset();
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    syncConversationInputBounds();
    scheduleKeyboardOffset();
  }, { passive: true });
  const initializeGroupOne = () => {
    initializationRun += 1;
    document.documentElement.classList.add('s-x-initializing');
    initializationReady = false;
    if (keyboardFrame) window.cancelAnimationFrame(keyboardFrame);
    if (composerPulseFrame) window.cancelAnimationFrame(composerPulseFrame);
    if (composerMenuPulseFrame) window.cancelAnimationFrame(composerMenuPulseFrame);
    keyboardFrame = 0;
    composerPulseFrame = 0;
    composerMenuPulseFrame = 0;
    resetAddButton();
    composer.classList.remove('is-pulsing');
    lastKeyboardOverlap = 0;
    updateKeyboardOffset();
    initializationReady = true;
    syncConversationInputBounds();
    document.documentElement.classList.remove('s-x-initializing');
  };
  window.addEventListener('pageshow', () => {
    if (!initializationReady) initializeGroupOne();
  }, { once: true });
  initializeGroupOne();
})();
