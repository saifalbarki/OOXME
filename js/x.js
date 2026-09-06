(() => {
  'use strict';

  const page = document.querySelector('.s-page');
  const content = document.querySelector('.s-page__content');
  const composer = document.querySelector('[data-s-composer]');
  const composerMenu = document.querySelector('[data-s-composer-menu]');
  const composerMenuPanel = document.querySelector('[data-s-composer-menu-panel]');
  const sendUtilities = document.querySelector('[data-s-send-utilities]');
  const sendStatusUtility = document.querySelector('[data-s-utility="status"]');
  const sendThemeUtility = document.querySelector('[data-s-utility="theme"]');
  const sendLanguageUtility = document.querySelector('[data-s-utility="language"]');
  const addButton = document.querySelector('.s-page__add');
  const input = document.querySelector('.s-page__composer-input');
  const submitButton = composer?.querySelector('button[type="submit"]');
  const utilitySmileButton = composerMenuPanel?.querySelector('.s-page__composer-menu-panel-control');
  const logoParticleField = document.querySelector('[data-s-logo-particles]');
  const logoParticleCanvas = document.querySelector('[data-s-logo-particle-canvas]');
  const zHeroImage = document.querySelector('.s-page__z-hero-image');
  const imageFrame = document.querySelector('[data-s-image-frame]');
  const imageCopy = document.querySelector('[data-s-image-copy]');
  const imageMedia = imageFrame?.querySelector('[data-s-flow-item]');
  const numbersMetrics = document.querySelector('[data-s-numbers-metrics]');
  const numberMetricItems = Array.from(document.querySelectorAll('[data-s-number-metric]'));
  const squareLogoStage = document.querySelector('[data-s-square-logo-stage]');
  const consultationCta = document.querySelector('[data-s-consultation-cta]');
  const firstGroup = document.querySelector('[data-s-first-group]');
  const zSecondaryNav = document.querySelector('[data-s-z-secondary-nav]');
  const zSecondaryNavRail = document.querySelector('[data-s-z-secondary-nav-rail]');
  const zSecondaryNavIndicator = document.querySelector('[data-s-z-secondary-nav-indicator]');
  const zSecondaryNavItems = Array.from(document.querySelectorAll('[data-s-z-secondary-nav-item]'));
  const zContentSlot = document.querySelector('[data-s-z-content-slot]');
  const zDescription = document.querySelector('[data-s-z-description]');
  const zDescriptionDate = zDescription?.querySelector('.s-page__z-description-date');
  const zRequirements = document.querySelector('[data-s-z-requirements]');
  const zRewards = document.querySelector('[data-s-z-rewards]');
  const zApply = document.querySelector('[data-s-z-apply]');
  const zApplyButtons = Array.from(document.querySelectorAll('[data-s-z-apply] button'));
  const majorSections = Array.from(document.querySelectorAll('[data-s-major-section]'));
  const flowGroups = Array.from(document.querySelectorAll('[data-s-flow-group]'));
  const flowItems = flowGroups.flatMap((group) => Array.from(group.querySelectorAll('[data-s-flow-item]')))
    .filter((item) => item !== imageCopy);
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
  const isZPage = page?.classList.contains('s-page--z') ?? false;

  // This controller is shared by the full /x composition and the focused /z
  // composition. Optional later-section affordances are deliberately guarded so
  // a page may include only its relevant sections without creating a parallel UI.
  if (!page || !content || !composer || !composerMenu || (!isZPage && !composerMenuPanel) || !sendUtilities || !sendStatusUtility || !sendThemeUtility || !sendLanguageUtility || !addButton || !input || !submitButton || (!isZPage && !utilitySmileButton) || (!isZPage && (!logoParticleField || !logoParticleCanvas)) || (isZPage && (!zSecondaryNav || !zSecondaryNavRail || !zSecondaryNavIndicator || !zContentSlot || !zDescription || !zRequirements || !zRewards || !zApply || zSecondaryNavItems.length !== 4)) || !imageFrame || !imageMedia || !imageCopy || !firstGroup || !conversation || !conversationFinal || !conversationFinalCopy || !sections.length || !majorSections.length || (!isZPage && (!flowGroups.length || !flowItems.length)) || !localizedGroups.length) return;

  const maximumVisibleConversationMessages = 3;
  const replyDelayMs = 1000;
  const finalRevealDelayMs = 1600;
  const finalMessageDurationMs = 10000;
  const finalFadeOutDurationMs = 320;
  const flowBaselineDurationMs = 1000;
  const flowMinimumDurationMs = 520;
  const flowThresholdHysteresisPx = 8;
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
        ['Re-engineered\nBuilt for New Terrain', 'Discover Ooxme v4.0 system, designed for engineering, architectural, construction, contracting .. etc'],
        ['The numbers speak\nfor the work', 'Real results that summarize what we’ve achieved across different businesses and brands.'],
        ['Striking Designs\nFor Distinctive Projects', 'We design with an exceptional, precise, and remarkably clean approach that serves your goals and reflects the value of your projects.'],
        ['Distinct Identities\nBuilt to Be Remembered', 'A selection of focused marks, shaped with clarity, character, and lasting recognition.'],
        ['Let’s talk\nabout what’s next', 'A focused consultation to understand your business, identify the right direction, and define the next practical step.']
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
      },
      consultationCta: 'Book a Consultation'
    },
    ar: {
      groups: [
        ['مرحبــا\nعميلنا القادم', 'ادارة العلامات التجارية الواحد والوحيد في العراق\nخدمة بريميوم لتطوير الاعمال'],
        ['إعادة هندسة\nبني لتضاريس جديدة', 'تعرف على التحديث الرابع لنظام عمل اوكسوم، المخصص للمشاريع الهندسية، المعمارية، الانشائية والمقاولات وشبيهاتها'],
        ['الأرقام تتحدث\nعن العمل', 'نتائج حقيقية تلخص ما حققناه مع أعمال وعلامات مختلفة.'],
        ['تصاميم ملفتة\nلمشاريع مميزة', 'نصمم بأسلوب استثنائي، دقيق، ونظيف للغاية بما يخدم أهدافكم ويعكس قيمة مشاريعكم.'],
        ['هويات مميزة\nصممت لتبقى', 'مجموعة من العلامات المركزة، صممت بوضوح، وشخصية، وحضور راسخ.'],
        ['لنتحدث\nعن خطوتك القادمة', 'استشارة مركزة لفهم عملك، تحديد الاتجاه المناسب، والوصول إلى الخطوة العملية التالية.']
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
      },
      consultationCta: 'احجز استشارة'
    }
  };
  const zFirstGroupCopy = {
    en: ['Welcome\nOur Next Partner', 'OOXME RPN is open to apply\nJoin us and get exclusive advantages and rewards'],
    ar: ['مرحبــا\nشريكنا القادم', 'شبكة شركاء الإحالة لأوكسوم متاحة الآن للتقديم\nانضم إلينا واستفد من مزايا ومكافآت حصرية.']
  };
  const zMainMenuCopy = {
    en: ['The Brand Management', 'The Consultation', 'The Gallery', 'The Store', 'Contact'],
    ar: ['إدارة العلامة التجارية', 'الاستشارة', 'المعرض', 'المتجر', 'تواصل']
  };
  const getGroupCopy = (language, groupIndex) => (
    isZPage && groupIndex === 0 ? zFirstGroupCopy[language] : pageCopy[language].groups[groupIndex]
  );
  let keyboardFrame = 0;
  let composerPulseFrame = 0;
  let zContentRevealFrame = 0;
  let zContentTransitionTimer = 0;
  let zActiveContentIndex = 0;
  let zFaceController = null;
  const secondaryNavPulseFrames = new Map();
  let composerMenuPulseFrame = 0;
  let composerMenuCloseTimer = 0;
  let addFlashTimer = 0;
  const menuItemFlashTimers = new Map();
  const sendUtilityPulseFrames = new Map();
  const marqueeItemPulseFrames = new Map();
  const squareLogoPulseFrames = new Map();
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
  let majorSectionSettleTimer = 0;
  let majorSectionSettleFrame = 0;
  let majorSectionSettleReleaseFrame = 0;
  let majorSectionSettleTarget = null;
  let majorSectionSettleOwnsScroll = false;
  let majorSectionPointerActive = false;
  let majorSectionSettleStableFrames = 0;
  const majorSectionSettleDelayMs = 3000;
  let flowFrame = 0;
  let zSectionOneScrollFrame = 0;
  let zSectionOneLocked = false;
  let zSectionOneCompositionReady = false;
  let zSectionOneOriginalImageBottom = 0;
  let zSectionOneStateOneImageBottom = 0;
  let zSectionOneContentBoxHeight = 0;
  let zSectionOneTransitionDistance = 0;
  let zHeroGeometryFrozen = false;
  let zSecondaryNavOverflowFrame = 0;
  let zSecondaryNavAlignmentFrame = 0;
  let zSecondaryNavIndicatorReadyFrame = 0;
  let imageCopyRevealTimer = 0;
  const metricCountFrames = new Map();
  const metricCountTimers = new Map();
  let flowVisibleCount = 0;
  let flowTargetCount = 0;
  let lastFlowScrollY = window.scrollY;
  let lastFlowScrollTime = performance.now();
  let lastPageScrollTime = performance.now();
  let flowScrollVelocity = 0;
  let localizedGeometryWidth = document.documentElement.clientWidth;
  let localizedGeometryOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  let pauseLogoParticleForScroll = () => {};
  const flowCrossed = flowItems.map(() => false);
  let conversationVisible = true;
  let activeTemporaryUi = 'none';
  const composerControls = Array.from(composer.querySelectorAll('button, input'));
  const inputLabel = composer.querySelector('.s-page__visually-hidden');
  const menuLabels = Array.from(composerMenu.querySelectorAll('.s-page__composer-menu-label'));
  let applyPageCopy = null;
  let manualThemeOverride = false;
  const arabicScriptPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

  const zPanels = [zDescription, zRequirements, zRewards, zApply];
  const zPanelClasses = [['is-z-description-attached', 'is-z-description-revealed'], ['is-z-requirements-attached', 'is-z-requirements-revealed'], ['is-z-rewards-attached', 'is-z-rewards-revealed'], ['is-z-apply-attached', 'is-z-apply-revealed']];

  const syncZContentBoxHorizontalGeometry = () => {
    if (!isZPage) return;
    const menuRect = composerMenu.getBoundingClientRect();
    zSecondaryNav.style.setProperty('--s-z-secondary-nav-left', `${menuRect.left.toFixed(3)}px`);
    zSecondaryNav.style.setProperty('--s-z-secondary-nav-width', `${menuRect.width.toFixed(3)}px`);
  };

  const syncZApplyButtonGeometry = () => {
    if (!isZPage || !zSecondaryNav.classList.contains('is-z-transition-ready')) return;
    const selector = zSecondaryNavItems[zActiveContentIndex];
    if (!selector) return;
    const boxRect = zSecondaryNav.getBoundingClientRect();
    const selectorRect = selector.getBoundingClientRect();
    const selectorInset = selectorRect.top - boxRect.top;
    zSecondaryNav.style.setProperty('--s-z-active-selector-width', `${selectorRect.width.toFixed(3)}px`);
    zSecondaryNav.setAttribute('data-s-z-selector-top-inset', selectorInset.toFixed(3));

  };

  const syncZContentBoxHeight = () => {
    if (!isZPage) return;
    // The box height is part of the scroll travel and therefore immutable once
    // a transition has begun. Re-measuring mid-travel would move the endpoint.
    if (zSectionOneCompositionReady && window.scrollY > .5) return;
    zSecondaryNav.classList.add('is-z-measuring');
    let largestContentHeight = 0;
    let largestPanelIndex = 0;
    zPanels.forEach((panel, index) => {
      panel.classList.add('is-z-measuring-panel');
      const localizedCopies = Array.from(panel.children).filter((copy) => copy.hasAttribute('lang'));
      const originalDisplays = localizedCopies.map((copy) => copy.style.display);
      let panelHeight = 0;
      localizedCopies.forEach((activeCopy) => {
        localizedCopies.forEach((copy) => { copy.style.display = copy === activeCopy ? (panel === zApply ? 'flex' : 'block') : 'none'; });
        panelHeight = Math.max(panelHeight, Math.ceil(panel.scrollHeight));
      });
      localizedCopies.forEach((copy, copyIndex) => { copy.style.display = originalDisplays[copyIndex]; });
      panel.setAttribute('data-s-z-natural-height', `${panelHeight}`);
      if (panelHeight > largestContentHeight) {
        largestContentHeight = panelHeight;
        largestPanelIndex = index;
      }
      panel.classList.remove('is-z-measuring-panel');
    });
    zSecondaryNav.classList.remove('is-z-measuring');
    zSecondaryNav.setAttribute('data-s-z-largest-panel', ['Description', 'Requirements', 'Rewards', 'Apply'][largestPanelIndex]);
    zSecondaryNav.setAttribute('data-s-z-largest-content-height', `${largestContentHeight}`);
    const boxStyle = getComputedStyle(zSecondaryNav);
    const boxChromeHeight = ['paddingTop', 'paddingBottom', 'borderTopWidth', 'borderBottomWidth']
      .reduce((total, property) => total + (Number.parseFloat(boxStyle[property]) || 0), 0);
    const boxRowGap = Number.parseFloat(boxStyle.rowGap) || 0;
    const contentBoxHeight = Math.ceil((zSecondaryNavRail.offsetHeight || 36) + boxRowGap + largestContentHeight + boxChromeHeight);
    zSecondaryNav.style.setProperty('--s-z-content-box-height', `${contentBoxHeight}px`);

  };

  // The Description title is the concrete inner-text boundary of the unified
  // box. Reuse its live border-box geometry instead of approximating an inset.
  const syncZUnifiedTextAlignment = () => {
    if (!isZPage) return;
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const source = zDescription.querySelector(`.s-page__z-description-copy[lang="${language}"] h2`);
    if (!source) return;
    const sourceRect = source.getBoundingClientRect();
    const firstGroupRect = firstGroup.getBoundingClientRect();
    const imageRect = zHeroImage.getBoundingClientRect();
    if (!sourceRect.width || !firstGroupRect.width || !imageRect.width) return;
    const isRtl = language === 'ar';
    const firstOffset = isRtl
      ? firstGroupRect.right - sourceRect.right
      : sourceRect.left - firstGroupRect.left;
    const imageOffset = isRtl
      ? imageRect.right - sourceRect.right
      : sourceRect.left - imageRect.left;
    firstGroup.style.setProperty('--s-z-content-text-width', `${sourceRect.width.toFixed(3)}px`);
    firstGroup.style.setProperty('--s-z-content-text-inline-offset', `${firstOffset.toFixed(3)}px`);
    imageCopy.style.setProperty('--s-z-content-text-width', `${sourceRect.width.toFixed(3)}px`);
    imageCopy.style.setProperty('--s-z-content-text-inline-offset', `${imageOffset.toFixed(3)}px`);
    firstGroup.setAttribute('data-s-z-content-text-left', sourceRect.left.toFixed(3));
    firstGroup.setAttribute('data-s-z-content-text-right', sourceRect.right.toFixed(3));
    imageCopy.setAttribute('data-s-z-content-text-left', sourceRect.left.toFixed(3));
    imageCopy.setAttribute('data-s-z-content-text-right', sourceRect.right.toFixed(3));
  };

  const syncZStateOneCompositionGeometry = () => {
    if (!isZPage || zSectionOneLocked) return;
    if (zSectionOneCompositionReady && window.scrollY > .5) return;
    const x = composer.getBoundingClientRect().left || 18;
    const imageRect = zHeroImage.getBoundingClientRect();
    // Remove the dormant 6px entrance transform before measuring the box.
    // Otherwise its transformed rect makes the State 1 gap six pixels short.
    zSecondaryNav.classList.add('is-z-transition-ready');
    const boxRect = zSecondaryNav.getBoundingClientRect();
    const desiredBoxTop = imageRect.bottom + x;
    const resolvedTop = zSecondaryNav.offsetTop + desiredBoxTop - boxRect.top;
    zSecondaryNav.style.setProperty('--s-z-secondary-nav-state-one-top', `${resolvedTop.toFixed(3)}px`);

    const positionedBoxRect = zSecondaryNav.getBoundingClientRect();
    zSectionOneOriginalImageBottom = imageRect.bottom + window.scrollY;
    zSectionOneStateOneImageBottom = imageRect.bottom;
    zSectionOneContentBoxHeight = positionedBoxRect.height;
    // The rendered State 1 geometry is the only movement authority. The page's
    // dynamic viewport-sized scroll surface below makes this exact distance the
    // native scroll maximum, including while mobile browser chrome changes.
    const measuredTravel = positionedBoxRect.bottom - imageRect.bottom;
    zSectionOneTransitionDistance = Math.max(1, Math.round(measuredTravel));
    page.style.setProperty('--s-z-transition-distance', `${zSectionOneTransitionDistance}px`);
    zSectionOneCompositionReady = true;
    firstGroup.setAttribute('data-s-z-state-one-text-image-gap', (imageRect.top - firstGroup.querySelector('.s-page__group-description').getBoundingClientRect().bottom).toFixed(3));
    firstGroup.setAttribute('data-s-z-state-one-image-box-gap', (positionedBoxRect.top - imageRect.bottom).toFixed(3));
    firstGroup.setAttribute('data-s-z-original-image-baseline', zSectionOneOriginalImageBottom.toFixed(3));
    firstGroup.setAttribute('data-s-z-state-one-image-bottom', zSectionOneStateOneImageBottom.toFixed(3));
    syncZActiveContent(true);
  };

  const resetZSecondaryNavAlignment = () => {
    if (!isZPage) return;
    if (zSecondaryNavAlignmentFrame) window.cancelAnimationFrame(zSecondaryNavAlignmentFrame);
    zSecondaryNavAlignmentFrame = window.requestAnimationFrame(() => {
      zSecondaryNavAlignmentFrame = 0;
      syncZContentBoxHorizontalGeometry();
      syncZContentBoxHeight();
      syncZStateOneCompositionGeometry();
      syncZUnifiedTextAlignment();
      syncZApplyButtonGeometry();
    });
  };

  const syncZActiveContent = (attached = zSectionOneLocked) => {
    if (!isZPage) return;
    if (zContentRevealFrame) window.cancelAnimationFrame(zContentRevealFrame);
    if (zContentTransitionTimer) window.clearTimeout(zContentTransitionTimer);
    zContentRevealFrame = 0;
    zContentTransitionTimer = 0;
    const outgoingIndex = zPanels.findIndex((panel, index) => panel.classList.contains(zPanelClasses[index][0]) && panel.classList.contains(zPanelClasses[index][1]));
    zPanels.forEach((panel) => panel.classList.remove('is-z-panel-exiting'));
    if (!attached || ![0, 1, 2, 3].includes(zActiveContentIndex)) {
      zPanels.forEach((panel, index) => panel.classList.remove(...zPanelClasses[index]));
      return;
    }
    const target = zPanels[zActiveContentIndex];
    const [attachedClass, revealedClass] = zPanelClasses[zActiveContentIndex];
    const revealTarget = () => {
      zPanels.forEach((panel, index) => panel.classList.remove(...zPanelClasses[index]));
      target.classList.add(attachedClass);
      if (target === zDescription) syncZApplyButtonGeometry();
      zContentRevealFrame = window.requestAnimationFrame(() => {
        zContentRevealFrame = 0;
        if (!zSecondaryNav.classList.contains('is-z-transition-ready') || zPanels[zActiveContentIndex] !== target) return;
        target.classList.add(revealedClass);
        if (target === zDescription) {
          syncZApplyButtonGeometry();
          // The reveal class changes opacity/transform on this frame. Re-run
          // once after styles have committed so the final text edge is used.
          window.requestAnimationFrame(() => syncZApplyButtonGeometry());
        }
      });
    };
    if (outgoingIndex !== -1 && zPanels[outgoingIndex] !== target) {
      const outgoing = zPanels[outgoingIndex];
      outgoing.classList.remove(zPanelClasses[outgoingIndex][1]);
      outgoing.classList.add('is-z-panel-exiting');
      zContentTransitionTimer = window.setTimeout(() => {
        zContentTransitionTimer = 0;
        outgoing.classList.remove('is-z-panel-exiting');
        revealTarget();
      }, 180);
      return;
    }
    revealTarget();
  };

  const pulsePageSurface = (element) => {
    if (!element) return;
    const pendingFrame = secondaryNavPulseFrames.get(element);
    if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
    element.classList.remove('is-pulsing');
    const frame = window.requestAnimationFrame(() => {
      secondaryNavPulseFrames.delete(element);
      element.classList.add('is-pulsing');
    });
    secondaryNavPulseFrames.set(element, frame);
  };

  const createZFaceController = () => {
    const face = addButton.querySelector('[data-s-z-face]');
    const shell = face?.querySelector('.s-page__z-face-shell');
    const eyes = face?.querySelector('.s-page__z-face-eyes');
    const eyeMotion = face?.querySelector('.s-page__z-face-eye-motion');
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
      const blinkPhase = ((phase + .7) % 5.6) / 5.6;
      // Preserve the natural idle cadence while shortening only the close/open window.
      const blink = state === 'idle' ? 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .022, 2))) : 1;
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

  if (isZPage) {
    zFaceController = createZFaceController();
    let heroTapStart = null;
    const pulseZHero = () => {
      pulsePageSurface(zHeroImage);
    };
    zHeroImage.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      heroTapStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    }, { passive: true });
    zHeroImage.addEventListener('pointerup', (event) => {
      if (!heroTapStart || event.pointerId !== heroTapStart.pointerId) return;
      const moved = Math.hypot(event.clientX - heroTapStart.x, event.clientY - heroTapStart.y);
      heroTapStart = null;
      if (moved <= 8) pulseZHero();
    }, { passive: true });
    zHeroImage.addEventListener('pointercancel', () => { heroTapStart = null; }, { passive: true });
    zHeroImage.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-composer-pulse') zHeroImage.classList.remove('is-pulsing');
    });
    let swipeStart = null;
    let zLastHorizontalSwipeAt = -Infinity;
    const suppressSwipeClick = () => { zLastHorizontalSwipeAt = performance.now(); };
    const consumeSwipeClickSuppression = () => (
      performance.now() - zLastHorizontalSwipeAt < 250
    );
    const setZActiveSection = (index) => {
      zActiveContentIndex = (index + zSecondaryNavItems.length) % zSecondaryNavItems.length;
      zSecondaryNavItems.forEach((item, itemIndex) => {
        const active = itemIndex === zActiveContentIndex;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      syncZActiveContent(zSecondaryNav.classList.contains('is-z-transition-ready'));
      syncZApplyButtonGeometry();
      zFaceController?.setApply(zActiveContentIndex === 3);
    };
    const beginSwipe = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      swipeStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    };
    const finishSwipe = (event) => {
      if (!swipeStart || event.pointerId !== swipeStart.pointerId) return;
      const deltaX = event.clientX - swipeStart.x;
      const deltaY = event.clientY - swipeStart.y;
      swipeStart = null;
      if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.25) return;
      suppressSwipeClick();
      const movesForward = document.documentElement.dir === 'rtl' ? deltaX > 0 : deltaX < 0;
      setZActiveSection(zActiveContentIndex + (movesForward ? 1 : -1));
      pulsePageSurface(zSecondaryNav);
    };
    [zSecondaryNavRail, zContentSlot].forEach((target) => {
      target.addEventListener('pointerdown', beginSwipe, { passive: true });
      target.addEventListener('pointerup', finishSwipe, { passive: true });
      target.addEventListener('pointercancel', () => { swipeStart = null; }, { passive: true });
    });
    zSecondaryNavItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        if (consumeSwipeClickSuppression()) return;
        setZActiveSection(index);
        pulsePageSurface(zSecondaryNav);
      });
    });
    zApplyButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (consumeSwipeClickSuppression()) return;
        pulsePageSurface(zSecondaryNav);
        const destination = button.getAttribute('data-s-z-apply-destination');
        if (destination) window.setTimeout(() => { window.location.assign(destination); }, 180);
      });
    });
    zSecondaryNav.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-composer-menu-pulse') zSecondaryNav.classList.remove('is-pulsing');
    });
    resetZSecondaryNavAlignment();
  }

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
    resetZSecondaryNavAlignment();
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

  let initialLanguage = 'en';
  // /z always begins in English; its language control remains an explicit,
  // session-local user action rather than a restored automatic preference.
  if (!isZPage) {
    try { initialLanguage = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  }
  applyLanguage(initialLanguage, { persist: false, emit: false });
  applyTheme('dark');

  const isTemporaryUiInteraction = (target) => (
    composer.contains(target) || conversation.contains(target)
  );

  const setComposerMenuOpen = (isOpen) => {
    window.clearTimeout(composerMenuCloseTimer);
    composerMenuCloseTimer = 0;
    if (isOpen) {
      composer.style.setProperty('--s-composer-menu-height', `${composerMenu.offsetHeight}px`);
      composerMenu.classList.add('is-open');
      composerMenu.setAttribute('aria-hidden', 'false');
      composerMenuPanel?.classList.add('is-open');
      composerMenuPanel?.setAttribute('aria-hidden', 'false');
      return;
    }

    const menuWasOpen = composerMenu.classList.contains('is-open');
    composerMenuPanel?.classList.remove('is-open');
    composerMenuPanel?.setAttribute('aria-hidden', 'true');
    if (!menuWasOpen) {
      composerMenu.setAttribute('aria-hidden', 'true');
      return;
    }

    composerMenuCloseTimer = window.setTimeout(() => {
      composerMenuCloseTimer = 0;
      composerMenu.classList.remove('is-open');
      composerMenu.setAttribute('aria-hidden', 'true');
    }, 60);
  };

  const setSendUtilitiesOpen = (isOpen) => {
    sendUtilities.classList.toggle('is-open', isOpen);
    sendUtilities.setAttribute('aria-hidden', String(!isOpen));
  };

  const setSendUtilityAvailability = (isAvailable) => {
    [sendStatusUtility, sendThemeUtility, sendLanguageUtility].forEach((control) => {
      control.disabled = !isAvailable;
    });
  };

  const resetAddButton = () => {
    window.clearTimeout(addFlashTimer);
    addRotated = false;
    addButton.classList.remove('is-rotated', 'is-active');
    if (isZPage) submitButton.classList.remove('is-active');
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

  const pulseMarqueeItem = (image) => {
    const pendingFrame = marqueeItemPulseFrames.get(image);
    if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
    image.classList.remove('is-pulsing');
    const frame = window.requestAnimationFrame(() => {
      marqueeItemPulseFrames.delete(image);
      image.classList.add('is-pulsing');
    });
    marqueeItemPulseFrames.set(image, frame);
  };

  document.querySelectorAll('.s-page__marquee').forEach((marquee) => {
    marquee.addEventListener('pointerdown', (event) => {
      const image = event.target.closest('.s-page__marquee img');
      if (image && marquee.contains(image)) pulseMarqueeItem(image);
    }, { passive: true });
    marquee.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-marquee-item-pulse' && event.target.matches('.s-page__marquee img')) {
        event.target.classList.remove('is-pulsing');
      }
    });

    const images = Array.from(marquee.querySelectorAll('img'));
    const settleImage = (image) => {
      if (image.complete) return image.decode?.().catch(() => {}) || Promise.resolve();
      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      });
    };
    Promise.all(images.map(settleImage)).then(() => marquee.classList.add('is-marquee-ready'));
  });

  const pulseSquareLogo = (logo) => {
    const pendingFrame = squareLogoPulseFrames.get(logo);
    if (pendingFrame) window.cancelAnimationFrame(pendingFrame);
    logo.classList.remove('is-pulsing');
    const frame = window.requestAnimationFrame(() => {
      squareLogoPulseFrames.delete(logo);
      logo.classList.add('is-pulsing');
    });
    squareLogoPulseFrames.set(logo, frame);
  };

  squareLogoStage?.addEventListener('pointerdown', (event) => {
    const logo = event.target.closest('.s-page__square-logo');
    if (logo && squareLogoStage.contains(logo)) pulseSquareLogo(logo);
  }, { passive: true });
  squareLogoStage?.addEventListener('animationend', (event) => {
    if (event.animationName !== 's-page-square-logo-pulse') return;
    event.target.closest('.s-page__square-logo')?.classList.remove('is-pulsing');
  });

  [sendStatusUtility, sendThemeUtility, sendLanguageUtility].forEach((control) => {
    control.addEventListener('pointerdown', () => pulseSendUtility(control), { passive: true });
    control.addEventListener('animationend', (event) => {
      if (event.animationName === 's-page-composer-menu-pulse') control.classList.remove('is-pulsing');
    });
  });

  [addButton, input, submitButton, utilitySmileButton].forEach((control) => {
    control?.addEventListener('pointerdown', pulseComposer, { passive: true });
  });
  submitButton.addEventListener('pointerdown', (event) => event.preventDefault());

  [addButton, composerMenu, composerMenuPanel, sendUtilities].filter(Boolean).forEach((control) => {
    control.addEventListener('pointerdown', (event) => event.stopPropagation());
    control.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
  });
  // /z keeps the shared bar feedback for an empty-surface tap, without
  // changing /x's established empty-area behavior or triggering any action.
  composer.addEventListener('pointerdown', (event) => {
    if (page.classList.contains('s-page--z') && event.target === composer) pulseComposer();
  }, { passive: true });
  composerMenu.addEventListener('click', (event) => event.stopPropagation());
  composerMenuPanel?.addEventListener('click', (event) => event.stopPropagation());
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
    if (isZPage) {
      window.clearTimeout(addFlashTimer);
      addButton.classList.add('is-active');
      addFlashTimer = window.setTimeout(() => addButton.classList.remove('is-active'), 120);
      return;
    }
    if (conversationVisible) {
      window.clearTimeout(addFlashTimer);
      addButton.classList.add('is-active');
      addFlashTimer = window.setTimeout(() => addButton.classList.remove('is-active'), 120);
      return;
    }
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

  const getFlowDuration = (item) => {
    if (reducedMotion.matches) return 0;
    const minimumDuration = item.dataset.sFlowKind === 'text'
      ? 720
      : flowMinimumDurationMs;
    return Math.round(Math.max(
      minimumDuration,
      flowBaselineDurationMs - Math.min(flowBaselineDurationMs - minimumDuration, flowScrollVelocity * 180)
    ));
  };

  const getVisibleFlowDuration = (item, rect) => (
    rect.bottom >= window.innerHeight * -.25 && rect.top <= window.innerHeight * 1.25
      ? getFlowDuration(item)
      : 0
  );

  const syncFlowGroupState = (group) => {
    const hasVisibleItem = Array.from(group.querySelectorAll('[data-s-flow-item]'))
      .some((item) => item.classList.contains('is-visible'));
    group.classList.toggle('is-visible', hasVisibleItem);
    group.setAttribute('aria-hidden', String(!hasVisibleItem));
  };

  const setImageCopyVisibility = (isVisible) => {
    window.clearTimeout(imageCopyRevealTimer);
    imageCopyRevealTimer = 0;
    if (!isVisible) {
      imageCopy.classList.remove('is-visible');
      imageCopy.setAttribute('aria-hidden', 'true');
      return;
    }
    imageCopyRevealTimer = window.setTimeout(() => {
      imageCopyRevealTimer = 0;
      imageCopy.classList.add('is-visible');
      imageCopy.setAttribute('aria-hidden', 'false');
    }, 250);
  };

  const cancelMetricCounts = () => {
    metricCountTimers.forEach((timer) => window.clearTimeout(timer));
    metricCountTimers.clear();
    metricCountFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    metricCountFrames.clear();
  };

  const countMetric = (metric) => {
    const value = metric.querySelector('[data-s-metric-value]');
    const target = Number(value?.dataset.sMetricTarget);
    if (!value || !Number.isFinite(target)) return;
    value.textContent = '0+';
    if (reducedMotion.matches) {
      value.textContent = `${target}+`;
      return;
    }

    const duration = 1000;
    const startedAt = performance.now();
    const render = (timestamp) => {
      const progress = Math.min(1, (timestamp - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      value.textContent = `${Math.round(target * eased)}+`;
      if (progress < 1) {
        metricCountFrames.set(metric, window.requestAnimationFrame(render));
      } else {
        metricCountFrames.delete(metric);
      }
    };
    metricCountFrames.set(metric, window.requestAnimationFrame(render));
  };

  const setMetricCountsActive = (isActive) => {
    cancelMetricCounts();
    if (!isActive) return;
    numberMetricItems.forEach((metric, index) => {
      const timer = window.setTimeout(() => {
        metricCountTimers.delete(metric);
        countMetric(metric);
      }, index * 180);
      metricCountTimers.set(metric, timer);
    });
  };

  const setFlowItemVisibility = (item, isVisible, duration) => {
    item.style.setProperty('--s-flow-duration', `${duration}ms`);
    item.classList.toggle('is-visible', isVisible);
    item.setAttribute('aria-hidden', String(!isVisible));
    if (item === imageMedia) setImageCopyVisibility(isVisible);
    if (item === numbersMetrics) setMetricCountsActive(isVisible);
    syncFlowGroupState(item.closest('[data-s-flow-group]'));
  };

  const syncFlowTarget = () => {
    flowFrame = 0;
    const composerTop = composer.getBoundingClientRect().top;
    const itemRects = flowItems.map((item) => item.getBoundingClientRect());
    itemRects.forEach((itemRect, index) => {
      flowCrossed[index] = flowCrossed[index]
        ? itemRect.top <= composerTop + flowThresholdHysteresisPx
        : itemRect.top <= composerTop;
    });
    let crossedCount = 0;
    while (crossedCount < flowCrossed.length && flowCrossed[crossedCount]) crossedCount += 1;
    flowTargetCount = crossedCount > 0
      ? Math.min(flowItems.length, crossedCount + 1)
      : 0;

    // Geometry is read above as one batch. Apply every required visibility change
    // in this same frame so fast scrolling cannot leave lower sections queued behind.
    if (flowVisibleCount < flowTargetCount) {
      for (let index = flowVisibleCount; index < flowTargetCount; index += 1) {
        setFlowItemVisibility(flowItems[index], true, getVisibleFlowDuration(flowItems[index], itemRects[index]));
      }
    } else if (flowVisibleCount > flowTargetCount) {
      for (let index = flowVisibleCount - 1; index >= flowTargetCount; index -= 1) {
        setFlowItemVisibility(flowItems[index], false, getVisibleFlowDuration(flowItems[index], itemRects[index]));
      }
    }
    flowVisibleCount = flowTargetCount;
    flowScrollVelocity *= .72;
  };

  const scheduleFlowSync = () => {
    if (flowFrame) return;
    flowFrame = window.requestAnimationFrame(syncFlowTarget);
  };

  // Each composition keeps its first Text Group untouched; only its final item gains free space.
  const portraitSectionCompositions = [
    { first: firstGroup, last: isZPage ? zHeroImage : logoParticleField, type: 'anchored' },
    { first: document.querySelector('[data-s-copy-group="1"]'), last: document.querySelector('.s-page__flow-group--image') },
    { first: document.querySelector('[data-s-copy-group="2"]'), last: document.querySelector('.s-page__flow-group--numbers') },
    { first: document.querySelector('[data-s-copy-group="3"]'), last: document.querySelector('.s-page__flow-group--strips') },
    { first: document.querySelector('[data-s-copy-group="4"]'), last: document.querySelector('.s-page__flow-group--logos') },
    { first: document.querySelector('.s-page__flow-group--consultation'), last: consultationCta }
  ].filter(({ first, last }) => first && last);

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

  const syncZFirstGroupTextGap = () => {
    if (!isZPage) return;
    const title = firstGroup.querySelector('.s-page__group-title');
    const description = firstGroup.querySelector('.s-page__group-description');
    if (!title || !description || !zHeroImage) return;
    const imageRect = zHeroImage.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const descriptionRect = description.getBoundingClientRect();
    const x = composer.getBoundingClientRect().left || 18;
    const currentShift = Number.parseFloat(firstGroup.style.getPropertyValue('--s-z-first-group-shift')) || 0;
    const naturalDescriptionBottom = descriptionRect.bottom - currentShift;
    const shift = imageRect.top - naturalDescriptionBottom - x;
    if (!firstGroup.hasAttribute('data-s-z-original-y')) {
      firstGroup.setAttribute('data-s-z-original-y', (titleRect.top - currentShift).toFixed(3));
    }
    firstGroup.style.setProperty('--s-z-first-group-shift', `${shift.toFixed(3)}px`);
    firstGroup.setAttribute('data-s-z-final-y', (titleRect.top + shift).toFixed(3));
    firstGroup.setAttribute('data-s-z-text-image-gap', x.toFixed(3));
  };

  // /z uses one normalized progress value for its two-state composition. The
  // travel equals the box height plus X, so the box's final bottom edge lands
  // exactly on the image's original first-view baseline.
  const syncZSectionOneScroll = () => {
    zSectionOneScrollFrame = 0;
    if (!isZPage || !zHeroImage) return;

    const scrollY = window.scrollY;
    if (!zSectionOneCompositionReady) {
      syncZContentBoxHorizontalGeometry();
      syncZContentBoxHeight();
      syncZStateOneCompositionGeometry();
      syncZApplyButtonGeometry();
    }
    if (!zSectionOneCompositionReady || zSectionOneTransitionDistance <= 0) return;

    const progress = Math.min(1, Math.max(0, scrollY / zSectionOneTransitionDistance));
    const remainingBlur = (1 - progress) * 12;
    const endpointReached = progress === 1;
    firstGroup.style.setProperty('--s-z-first-group-scroll-progress', progress.toFixed(4));
    zSecondaryNav.style.setProperty('--s-z-composition-progress', progress.toFixed(4));
    zSecondaryNav.style.setProperty('--s-z-content-blur', `${remainingBlur.toFixed(3)}px`);
    zSecondaryNav.classList.toggle('is-z-content-interactive', progress > .05);

    if (endpointReached !== zSectionOneLocked) {
      zSectionOneLocked = endpointReached;
      if (!endpointReached) zFaceController?.rejectApply();
      else zSecondaryNav.setAttribute('data-s-z-final-content-baseline', zSectionOneStateOneImageBottom.toFixed(3));
    }

    firstGroup.setAttribute('data-s-z-text-scroll-progress', progress.toFixed(4));
    zSecondaryNav.setAttribute('data-s-z-composition-progress', progress.toFixed(4));
  };

  const scheduleZSectionOneScroll = () => {
    if (!isZPage || zSectionOneScrollFrame) return;
    zSectionOneScrollFrame = window.requestAnimationFrame(syncZSectionOneScroll);
  };

  const syncPortraitSectionLayout = () => {
    portraitSectionLayoutFrame = 0;
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    if (!isPortrait) {
      syncConversationInputBounds();
      resetPortraitSectionLayout();
      syncZFirstGroupTextGap();
      scheduleZSectionOneScroll();
      scheduleFlowSync();
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
      const overflows = type !== 'anchored' && naturalRelativeBottom > desiredRelativeBottom + .5;
      if (overflows) {
        const requiredOverflow = naturalRelativeBottom - desiredRelativeBottom;
        majorSection.style.setProperty('height', `${viewportHeight + requiredOverflow}px`);
        majorSection.setAttribute('data-s-portrait-overflow', requiredOverflow.toFixed(3));
        last.style.removeProperty('--s-portrait-bottom-up-offset');
        last.classList.remove('is-portrait-bottom-up');
        first.setAttribute('data-s-portrait-layout', 'natural-overflow');
        first.setAttribute('data-s-portrait-final-gap', (composerRect.top - (sectionViewportTop + naturalRelativeBottom)).toFixed(3));
        first.setAttribute('data-s-portrait-final-y', (sectionViewportTop + naturalRelativeBottom).toFixed(3));
        first.setAttribute('data-s-portrait-reference-delta', (desiredRelativeBottom - naturalRelativeBottom).toFixed(3));
        first.removeAttribute('data-s-portrait-live-gap');
        return;
      }

      majorSection.style.removeProperty('height');
      majorSection.removeAttribute('data-s-portrait-overflow');
      if (type === 'anchored') {
        if (!(isZPage && zSectionOneLocked && last === zHeroImage)) {
          last.style.setProperty('bottom', `${firstHeight - desiredRelativeBottom}px`);
          last.classList.add('is-portrait-composed');
        }
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

    syncZFirstGroupTextGap();
    scheduleFinalScrollBuffer();
    scheduleZSectionOneScroll();
    scheduleFlowSync();
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

  const getMajorSectionSettleThreshold = () => {
    const x = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--s-x')) || 18;
    return Math.min(180, Math.max(120, x * 8));
  };

  const cancelMajorSectionSettle = ({ stopNativeScroll = false } = {}) => {
    window.clearTimeout(majorSectionSettleTimer);
    majorSectionSettleTimer = 0;
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

  const settleNearestMajorSection = () => {
    majorSectionSettleTimer = 0;
    if (majorSectionPointerActive || majorSectionSettleTarget !== null) return;

    const referenceY = getMajorSectionReferenceY();
    const scrollY = window.scrollY;
    const sectionTops = majorSections.map((section) => section.getBoundingClientRect().top);
    const nearest = sectionTops.reduce((candidate, top) => {
      const distance = Math.abs(top - referenceY);
      return !candidate || distance < candidate.distance ? { top, distance } : candidate;
    }, null);
    if (!nearest || nearest.distance > getMajorSectionSettleThreshold()) return;

    const target = Math.max(0, Math.min(
      document.documentElement.scrollHeight - window.innerHeight,
      scrollY + nearest.top - referenceY
    ));
    if (Math.abs(target - scrollY) <= 1) return;

    // A timer can only start one settle, and every settle owns one watcher.
    cancelMajorSectionSettle();
    majorSectionSettleTarget = target;
    majorSectionSettleOwnsScroll = true;
    window.scrollTo({ top: target, left: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    majorSectionSettleFrame = window.requestAnimationFrame(watchMajorSectionSettle);
  };

  const scheduleMajorSectionSettle = () => {
    if (majorSectionPointerActive || majorSectionSettleTarget !== null || majorSectionSettleOwnsScroll) return;
    window.clearTimeout(majorSectionSettleTimer);
    majorSectionSettleTimer = window.setTimeout(settleNearestMajorSection, majorSectionSettleDelayMs);
  };

  const noteFlowScroll = () => {
    const now = performance.now();
    lastPageScrollTime = now;
    const nextScrollY = window.scrollY;
    const elapsed = Math.max(1, now - lastFlowScrollTime);
    const instantaneousVelocity = Math.abs(nextScrollY - lastFlowScrollY) / elapsed;
    flowScrollVelocity = (flowScrollVelocity * .35) + (instantaneousVelocity * .65);
    lastFlowScrollY = nextScrollY;
    lastFlowScrollTime = now;
    pauseLogoParticleForScroll();
    scheduleZSectionOneScroll();
    if (portraitSectionLayoutTimer) scheduleStablePortraitSectionLayout();
    scheduleFlowSync();
  };

  const resetFlowRevealState = () => {
    window.clearTimeout(imageCopyRevealTimer);
    setMetricCountsActive(false);
    if (flowFrame) window.cancelAnimationFrame(flowFrame);
    flowFrame = 0;
    flowVisibleCount = 0;
    flowTargetCount = 0;
    flowScrollVelocity = 0;
    lastFlowScrollY = 0;
    lastFlowScrollTime = performance.now();
    flowCrossed.fill(false);
    flowItems.forEach((item) => {
      item.classList.remove('is-visible');
      item.setAttribute('aria-hidden', 'true');
      item.style.removeProperty('--s-flow-duration');
    });
    setImageCopyVisibility(false);
    flowGroups.forEach((group) => {
      group.classList.remove('is-visible');
      group.setAttribute('aria-hidden', 'true');
    });
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

  const stabilizeLocalizedGeometry = () => {
    localizedGeometryFrame = 0;
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
    scheduleFlowSync();
    schedulePortraitSectionLayout();
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
    const menuCopy = isZPage ? zMainMenuCopy[language] : copy.menu;
    menuLabels.forEach((label, index) => { label.textContent = menuCopy[index]; });
    if (zSecondaryNav) {
      zSecondaryNav.setAttribute('aria-label', language === 'ar' ? 'التنقل بين الأقسام' : 'Section navigation');
    }
    if (consultationCta) {
      consultationCta.textContent = copy.consultationCta;
      consultationCta.lang = language;
      consultationCta.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
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
    scheduleLocalizedGeometry();
  };
  applyPageCopy(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  document.fonts?.ready.then(() => {
    if (!isZPage) {
      scheduleLocalizedGeometry();
      schedulePortraitSectionLayout();
    }
  });
  if (firstGroupObserver) firstGroupObserver.observe(firstGroup);
  else firstGroup.classList.add('is-visible');
  if (isZPage) {
    imageMedia.classList.add('is-visible');
    setImageCopyVisibility(true);
  }
  flowGroups.forEach((group) => group.setAttribute('aria-hidden', 'true'));
  scheduleFlowSync();
  schedulePortraitSectionLayout();
  window.addEventListener('load', () => {
    if (!isZPage) schedulePortraitSectionLayout();
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
    logoMaskImage.src = 'assets/logo/OX-001-LOGO-black.png';
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
    addRotated = menuIsActive && !isZPage;
    addButton.classList.toggle('is-rotated', addRotated);
    if (isZPage) submitButton.classList.toggle('is-active', menuIsActive);
    setComposerMenuOpen(menuIsActive);
    setSendUtilitiesOpen(next === 'utilities' || (isZPage && menuIsActive));
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
    if (!isZPage && !majorSectionSettleOwnsScroll) scheduleMajorSectionSettle();
  }, { passive: true });

  const beginMajorSectionInteraction = () => {
    majorSectionPointerActive = true;
    cancelMajorSectionSettle({ stopNativeScroll: true });
  };
  const endMajorSectionInteraction = () => {
    majorSectionPointerActive = false;
    if (!isZPage) scheduleMajorSectionSettle();
  };

  document.addEventListener('pointerdown', (event) => {
    beginMajorSectionInteraction();
    zFaceController?.begin(event);
  }, { capture: true, passive: true });
  document.addEventListener('touchstart', beginMajorSectionInteraction, { capture: true, passive: true });
  document.addEventListener('pointermove', (event) => {
    zFaceController?.move(event);
    if (event.pointerType === 'touch' || event.buttons !== 0) beginMajorSectionInteraction();
  }, { capture: true, passive: true });
  document.addEventListener('touchmove', beginMajorSectionInteraction, { capture: true, passive: true });
  ['pointerup', 'pointercancel', 'touchend', 'touchcancel'].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      endMajorSectionInteraction();
      if (eventName.startsWith('pointer')) zFaceController?.end(event, eventName === 'pointercancel');
    }, { passive: true });
  });
  window.addEventListener('wheel', () => {
    cancelMajorSectionSettle({ stopNativeScroll: true });
    majorSectionPointerActive = false;
    if (!isZPage) scheduleMajorSectionSettle();
  }, { passive: true });
  window.addEventListener('keydown', (event) => {
    if (![' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) return;
    if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) return;
    majorSectionPointerActive = false;
    cancelMajorSectionSettle({ stopNativeScroll: true });
    if (!isZPage) scheduleMajorSectionSettle();
  }, { passive: true });

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
    const message = input.value.trim();
    if (isZPage && !message) {
      if (conversationVisible) return;
      activateTemporaryUi(activeTemporaryUi === 'menu' ? 'none' : 'menu');
      return;
    }
    if (!message) {
      if (conversationVisible) return;
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
    const nextWidth = document.documentElement.clientWidth;
    const nextOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
    const layoutWidthChanged = Math.abs(nextWidth - localizedGeometryWidth) > .5;
    const orientationChanged = nextOrientation !== localizedGeometryOrientation;
    if (layoutWidthChanged || orientationChanged) {
      localizedGeometryWidth = nextWidth;
      localizedGeometryOrientation = nextOrientation;
      scheduleLocalizedGeometry();
      resetZSecondaryNavAlignment();
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
    scheduleLocalizedGeometry();
    resetZSecondaryNavAlignment();
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

    // Resolve all startup style/compositor work before the first input frame.
    void zSecondaryNav.getBoundingClientRect();
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
    if (composerMenuPulseFrame) window.cancelAnimationFrame(composerMenuPulseFrame);
    keyboardFrame = 0;
    composerPulseFrame = 0;
    composerMenuPulseFrame = 0;
    if (isZPage) {
      zSectionOneLocked = false;
      zSectionOneCompositionReady = false;
      zSectionOneContentBoxHeight = 0;
      zSectionOneStateOneImageBottom = 0;
      zSectionOneTransitionDistance = 0;
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

  const inactivityResetDelayMs = 30000;
  let inactivityResetTimer = 0;

  const resetPageToInitialState = () => {
    cancelMajorSectionSettle({ stopNativeScroll: true });
    window.clearTimeout(portraitSectionLayoutTimer);
    portraitSectionLayoutTimer = 0;
    if (portraitSectionLayoutFrame) window.cancelAnimationFrame(portraitSectionLayoutFrame);
    if (finalScrollBufferFrame) window.cancelAnimationFrame(finalScrollBufferFrame);
    portraitSectionLayoutFrame = 0;
    finalScrollBufferFrame = 0;
    window.clearTimeout(inactivityResetTimer);
    window.clearTimeout(finalVisibleTimer);
    window.clearTimeout(finalResetTimer);
    window.clearTimeout(pendingFinalRevealTimer);
    inactivityResetTimer = 0;
    finalVisibleTimer = 0;
    finalResetTimer = 0;
    pendingFinalRevealTimer = 0;
    pendingReplyTimers.forEach((timer) => window.clearTimeout(timer));
    pendingReplyTimers.clear();
    sendUtilityPulseFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    sendUtilityPulseFrames.clear();
    marqueeItemPulseFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    marqueeItemPulseFrames.clear();
    squareLogoPulseFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    squareLogoPulseFrames.clear();
    secondaryNavPulseFrames.forEach((frame) => window.cancelAnimationFrame(frame));
    secondaryNavPulseFrames.clear();
    menuItemFlashTimers.forEach((timer) => window.clearTimeout(timer));
    menuItemFlashTimers.clear();
    document.querySelectorAll('.is-pulsing').forEach((element) => element.classList.remove('is-pulsing'));
    composerMenu.querySelectorAll('.is-active').forEach((element) => element.classList.remove('is-active'));
    groups.forEach((group) => group.classList.remove('is-visible'));
    resetFlowRevealState();
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
      if (isZPage) {
        imageMedia.classList.add('is-visible');
        setImageCopyVisibility(true);
      }
      scheduleFlowSync();
    });
    inactivityResetTimer = window.setTimeout(resetPageToInitialState, inactivityResetDelayMs);
  };

  const noteInteraction = () => {
    if (!initializationReady) return;
    window.clearTimeout(inactivityResetTimer);
    inactivityResetTimer = window.setTimeout(resetPageToInitialState, inactivityResetDelayMs);
  };

  ['pointerdown', 'mousemove', 'touchstart', 'click', 'keydown', 'input'].forEach((eventName) => {
    document.addEventListener(eventName, noteInteraction, { passive: true });
  });
  window.addEventListener('scroll', noteInteraction, { passive: true });

  window.addEventListener('pageshow', () => {
    if (!initializationReady) initializeGroupOne();
  }, { once: true });
  initializeGroupOne();
  noteInteraction();
})();
