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

  if (!page || !content || !composer || !composerMenu || !sendUtilities || !sendThemeUtility || !sendLanguageUtility || !addButton || !input || !submitButton || !conversation || !conversationFinal || !conversationFinalCopy || !sections.length || sections.some((section) => section.groups.length !== 3)) return;

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
        ['Welcome to ooxme', 'Premium brand management and business development.'],
        ['Premium Service.', 'Your partner in managing and developing your business into a global brand.'],
        ['Be among the first.', 'Just like OOXME, make your business the first and only one in its field.']
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
  let activeGroupIndex = -1;
  let lastScrollY = window.scrollY;
  let scrollFrame = 0;
  let keyboardFrame = 0;
  let initializationFrame = 0;
  let composerPulseFrame = 0;
  let composerMenuPulseFrame = 0;
  let groupGeometryDirty = true;
  let groupGeometry = [];
  let sectionGeometry = [];
  let sharedAnchorViewportTop = null;
  let groupHandoffSpacing = 18;
  let groupComposerTriggerTop = 0;
  const groupTransformOffsets = groups.map(() => Number.NaN);
  const typingFrames = groups.map(() => 0);
  const typingProgress = groups.map(() => []);
  let initialGroupOnePending = true;
  const titleTypingCharactersPerSecond = 28;
  const titleTypingWordsPerSecond = 5;
  const preferredDescriptionCharacterIntervalMs = 45;
  const preferredArabicDescriptionWordIntervalMs = 150;
  const maximumDescriptionTypingDurationMs = 3000;
  let keyboardLockedGroup = -1;
  let keyboardLockedScrollY = 0;
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
  applySystemTheme();
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
  const getStableLayoutMetrics = (element) => {
    let top = 0;
    let current = element;
    while (current) {
      top += current.offsetTop;
      current = current.offsetParent;
    }
    return { top, height: element.offsetHeight };
  };

  const measureGroupGeometry = () => {
    groupHandoffSpacing = Number.parseFloat(getComputedStyle(content).paddingLeft) || 18;
    groupComposerTriggerTop = composer.getBoundingClientRect().top - groupHandoffSpacing;
    const scrollPosition = window.scrollY;
    const measurements = groups.map((group) => {
      const metrics = getStableLayoutMetrics(group);
      return {
        top: metrics.top,
        height: metrics.height,
        bottom: metrics.top + metrics.height
      };
    });
    let sectionTimelineStart = 0;
    sectionGeometry = sections.map((section, sectionIndex) => {
      const sectionMeasurements = section.groups.map((group) => measurements[groups.indexOf(group)]);
      const sectionHeight = section.element.offsetHeight;
      const anchorTop = sectionMeasurements[0].top;
      if (sharedAnchorViewportTop === null) sharedAnchorViewportTop = sectionMeasurements[0].top - scrollPosition;
      const anchorViewportTop = sharedAnchorViewportTop;
      const finalGroups = sectionMeasurements.reduce((finalized, measurement, index) => {
        const top = index === 0
          ? anchorTop
          : finalized[index - 1].top + finalized[index - 1].height + groupHandoffSpacing;
        finalized.push({ top, height: measurement.height });
        return finalized;
      }, []);
      const contentHeight = finalGroups.at(-1).top + finalGroups.at(-1).height - anchorTop;
      const overflowAmount = Math.max(0, anchorViewportTop + contentHeight - window.innerHeight);
      const entryDistance = window.innerHeight;
      const initialGroupAnchored = sectionIndex === 0;
      const entryStart = initialGroupAnchored
        ? sectionTimelineStart - entryDistance
        : sectionTimelineStart;
      const groupCompletion = entryStart + (entryDistance * section.groups.length);
      const holdStart = groupCompletion + overflowAmount;
      const pushStart = holdStart + (window.innerHeight * .2);
      const pushDistance = sectionIndex < sections.length - 1 ? window.innerHeight : 0;
      sectionTimelineStart = pushStart + pushDistance;
      return {
        element: section.element,
        groupElements: section.groups,
        groups: finalGroups,
        anchorTop,
        anchorViewportTop,
        height: sectionHeight,
        contentHeight,
        groupSpacing: groupHandoffSpacing,
        overflowAmount,
        entryDistance,
        entryStart,
        initialGroupAnchored,
        groupCompletion,
        overflowStart: groupCompletion,
        overflowEnd: groupCompletion + overflowAmount,
        holdStart,
        holdDistance: window.innerHeight * .2,
        pushStart,
        pushDistance,
        pushEnd: pushStart + pushDistance,
        pushProgress: 0,
        holdProgress: 0,
        overflowProgress: 0,
        phase: 'entry'
      };
    });
    groupGeometry = measurements.map((measurement, index) => ({
      top: measurement.top,
      height: measurement.height
    }));
    groupGeometryDirty = false;
  };

  const getGroupScrollOffset = (index, scrollPosition) => {
    const sectionIndex = sections.findIndex((section) => section.groups.includes(groups[index]));
    const section = sectionGeometry[sectionIndex];
    if (!section) return 0;
    const groupIndex = section.groupElements.indexOf(groups[index]);
    const rawTop = groupGeometry[index].top;
    const finalTop = section.anchorViewportTop
      + section.groups[groupIndex].top - section.anchorTop;
    const belowViewportTop = window.innerHeight + section.groupSpacing;
    const entryStart = section.entryStart + (groupIndex * section.entryDistance);
    const entryEnd = entryStart + section.entryDistance;
    const overflowProgress = Math.max(0, Math.min(section.overflowAmount, scrollPosition - section.overflowStart));
    const holdProgress = Math.max(0, Math.min(section.holdDistance, scrollPosition - section.holdStart));
    const pushProgress = Math.max(0, Math.min(section.pushDistance, scrollPosition - section.pushStart));
    section.overflowProgress = overflowProgress;
    section.holdProgress = holdProgress;
    section.pushProgress = pushProgress;
    section.phase = scrollPosition >= section.holdStart + section.holdDistance
      ? 'boundary'
      : holdProgress > 0 || section.overflowAmount === 0 && scrollPosition >= section.holdStart
        ? 'hold'
        : overflowProgress > 0
          ? 'overflow'
          : pushProgress > 0
            ? 'push'
          : 'entry';
    let targetViewportTop = belowViewportTop;

    if (scrollPosition >= entryEnd) {
      targetViewportTop = finalTop;
    } else if (scrollPosition > entryStart) {
      const progress = (scrollPosition - entryStart) / section.entryDistance;
      targetViewportTop = belowViewportTop + ((finalTop - belowViewportTop) * progress);
    }

    targetViewportTop -= overflowProgress;

    if (scrollPosition >= section.pushStart) {
      targetViewportTop -= pushProgress;
    }

    if (scrollPosition >= section.holdStart + section.holdDistance) {
      targetViewportTop += section.holdStart + section.holdDistance - scrollPosition;
    }
    return targetViewportTop + scrollPosition - rawTop;
  };

  const updateGroupPushPositions = (scrollPosition) => {
    groups.forEach((group, index) => {
      const offset = getGroupScrollOffset(index, scrollPosition);
      if (Math.abs(groupTransformOffsets[index] - offset) < .01) return;
      groupTransformOffsets[index] = offset;
      group.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  };

  const updateRevealGroups = (scrollPosition) => {
    const scrollDirection = scrollPosition - lastScrollY;
    lastScrollY = scrollPosition;
    const crossed = groupGeometry
      .map((geometry, index) => {
        const top = geometry.top - scrollPosition + getGroupScrollOffset(index, scrollPosition);
        return { index, top, bottom: top + geometry.height };
      })
      .filter(({ top, bottom }) => top <= groupComposerTriggerTop && bottom > groupComposerTriggerTop);
    if (!crossed.length) return;
    const target = (scrollDirection < 0 ? crossed[0] : crossed[crossed.length - 1]).index;
    if (target === activeGroupIndex) return;
    if (activeGroupIndex >= 0) setGroupState(activeGroupIndex, 'fading');
    activeGroupIndex = target;
    initialGroupOnePending = false;
    setGroupState(target, 'typing');
  };

  const updateScrollVisuals = () => {
    scrollFrame = 0;
    if (!initializationReady) return;
    if (keyboardLockedGroup >= 0) {
      maintainKeyboardGroupPosition();
      return;
    }
    if (groupGeometryDirty) measureGroupGeometry();
    const scrollPosition = window.scrollY;
    updateGroupPushPositions(scrollPosition);
    updateRevealGroups(scrollPosition);
  };

  const scheduleScrollVisuals = () => {
    if (!initializationReady || scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateScrollVisuals);
  };

  const lockActiveGroupForKeyboard = () => {
    if (keyboardLockedGroup >= 0) return;
    keyboardLockedGroup = Math.max(0, activeGroupIndex);
    keyboardLockedScrollY = window.scrollY;
  };

  const maintainKeyboardGroupPosition = () => {
    if (keyboardLockedGroup < 0 || Math.abs(window.scrollY - keyboardLockedScrollY) < 1) return;
    window.scrollTo({ top: keyboardLockedScrollY, behavior: 'auto' });
  };

  const releaseKeyboardGroupLock = () => {
    keyboardLockedGroup = -1;
    keyboardLockedScrollY = 0;
    lastScrollY = window.scrollY;
    groupGeometryDirty = true;
    scheduleScrollVisuals();
  };

  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));
    const keyboardOverlap = Math.max(0, layoutHeight - window.visualViewport.height - window.visualViewport.offsetTop);
    if (keyboardOverlap > 0) {
      lockActiveGroupForKeyboard();
      maintainKeyboardGroupPosition();
    }
    if (keyboardOverlap === 0 && lastKeyboardOverlap > 0) {
      releaseKeyboardGroupLock();
    }
    if (Math.abs(keyboardOverlap - lastKeyboardOverlap) >= .01) {
      page.style.setProperty('--s-keyboard-offset', `${keyboardOverlap.toFixed(2)}px`);
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
    const inputRect = input.getBoundingClientRect();
    conversation.style.paddingLeft = `${Math.max(0, inputRect.left - conversationRect.left)}px`;
    conversation.style.paddingRight = `${Math.max(0, conversationRect.right - inputRect.right)}px`;
  };

  const groupElements = groups.map((group) => Array.from(group.querySelectorAll('[data-s-reveal]')));
  let typingCharacters = [];

  const prepareTypingCharacters = (language = document.documentElement.lang) => {
    const useWordReveal = language === 'ar';
    groupElements.flat().forEach((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach((textNode) => {
        const fragment = document.createDocumentFragment();
        const units = useWordReveal
          ? textNode.nodeValue.split(/(\s+)/u)
          : Array.from(textNode.nodeValue);
        units.forEach((unit) => {
          if (useWordReveal && /^\s+$/u.test(unit)) {
            fragment.appendChild(document.createTextNode(unit));
            return;
          }
          const span = document.createElement('span');
          span.className = useWordReveal ? 's-page__typing-word' : 's-page__typing-character';
          span.textContent = unit;
          fragment.appendChild(span);
        });
        textNode.parentNode.replaceChild(fragment, textNode);
      });
    });
    typingCharacters = groupElements.map((elements) => elements.map((element) =>
      Array.from(element.querySelectorAll('.s-page__typing-character, .s-page__typing-word'))
    ));
    groupElements.flat().forEach((element) => {
      const units = Math.max(1, element.querySelectorAll('.s-page__typing-character, .s-page__typing-word').length);
      element.style.setProperty('--s-typing-steps', String(units));
      element.style.setProperty('--s-typing-duration', `${(getTypingDurationMs(element, units) / 1000).toFixed(2)}s`);
      if (useWordReveal) {
        const duration = getArabicWordRevealDurationMs(element, units);
        element.querySelectorAll('.s-page__typing-word').forEach((word) => {
          word.style.setProperty('--s-arabic-word-reveal-duration', `${duration}ms`);
        });
      }
    });
  };

  const stopGroupTyping = (index, hideCharacters = false) => {
    if (typingFrames[index]) window.cancelAnimationFrame(typingFrames[index]);
    typingFrames[index] = 0;
    const charactersByElement = typingCharacters[index] || [];
    typingProgress[index] = charactersByElement.map(() => 0);
    if (hideCharacters) {
      charactersByElement.flat().forEach((character) => character.classList.remove('is-revealed'));
    }
  };

  const getDescriptionCharacterInterval = (characterCount) => (
    Math.min(preferredDescriptionCharacterIntervalMs, maximumDescriptionTypingDurationMs / Math.max(1, characterCount - 1))
  );

  const getArabicDescriptionWordInterval = (wordCount) => (
    Math.min(preferredArabicDescriptionWordIntervalMs, maximumDescriptionTypingDurationMs / Math.max(1, wordCount - 1))
  );

  const getArabicWordRevealDurationMs = (element, wordCount) => (
    element.classList.contains('s-page__group-description')
      ? getArabicDescriptionWordInterval(wordCount)
      : 1000 / titleTypingWordsPerSecond
  );

  const getTypingRate = (element, characterCount) => {
    if (document.documentElement.lang === 'ar') {
      return 1000 / getArabicWordRevealDurationMs(element, characterCount);
    }
    if (!element.classList.contains('s-page__group-description')) return titleTypingCharactersPerSecond;
    return 1000 / getDescriptionCharacterInterval(characterCount);
  };

  const getTypingDurationMs = (element, characterCount) => {
    if (document.documentElement.lang === 'ar') {
      return getArabicWordRevealDurationMs(element, characterCount) * Math.max(0, characterCount - 1);
    }
    if (!element.classList.contains('s-page__group-description')) {
      return (characterCount / titleTypingCharactersPerSecond) * 1000;
    }
    return getDescriptionCharacterInterval(characterCount) * Math.max(0, characterCount - 1);
  };

  const startGroupTyping = (index) => {
    stopGroupTyping(index, true);
    if (reducedMotion.matches) {
      typingCharacters[index].flat().forEach((character) => character.classList.add('is-revealed'));
      return;
    }
    const startedAt = performance.now();
    const typeNextCharacters = (now) => {
      let complete = true;
      typingCharacters[index].forEach((characters, elementIndex) => {
        const element = groupElements[index][elementIndex];
        const typingRate = getTypingRate(element, characters.length);
        const visibleCount = Math.floor(((now - startedAt) / 1000) * typingRate) + 1;
        const nextCount = Math.min(visibleCount, characters.length);
        const revealedCount = typingProgress[index][elementIndex] || 0;
        for (let characterIndex = revealedCount; characterIndex < nextCount; characterIndex += 1) {
          characters[characterIndex].classList.add('is-revealed');
        }
        typingProgress[index][elementIndex] = nextCount;
        if (nextCount < characters.length) complete = false;
      });
      typingFrames[index] = complete ? 0 : window.requestAnimationFrame(typeNextCharacters);
    };
    typingFrames[index] = window.requestAnimationFrame(typeNextCharacters);
  };

  const setGroupState = (index, state) => {
    groupElements[index].forEach((element) => {
      element.classList.remove('is-typing', 'is-visible', 'is-fading');
      if (state === 'typing') element.classList.add(reducedMotion.matches ? 'is-visible' : 'is-typing');
      if (state === 'visible') element.classList.add('is-visible');
      if (state === 'fading') element.classList.add('is-fading');
    });
    if (state === 'typing') startGroupTyping(index);
    if (state === 'fading') stopGroupTyping(index, false);
  };

  const setLocalizedText = (element, value) => {
    const fragment = document.createDocumentFragment();
    value.split('\n').forEach((line, index) => {
      if (index) fragment.appendChild(document.createElement('br'));
      fragment.appendChild(document.createTextNode(line));
    });
    element.replaceChildren(fragment);
  };

  applyPageCopy = (language) => {
    const copy = pageCopy[language];
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    typingFrames.forEach((_, index) => stopGroupTyping(index));
    groupElements.forEach((elements, groupIndex) => {
      const localizedGroup = copy.groups[groupIndex];
      if (!localizedGroup) return;
      elements.forEach((element, elementIndex) => {
        element.classList.remove('is-typing', 'is-visible', 'is-fading');
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
    prepareTypingCharacters(language);
    if (!initializationReady || activeGroupIndex < 0) return;

    setGroupState(activeGroupIndex, 'typing');
    typingCharacters[activeGroupIndex].forEach((characters) => {
      characters[0]?.classList.add('is-revealed');
    });
    groupGeometryDirty = true;
    scheduleScrollVisuals();
  };
  applyPageCopy(document.documentElement.lang === 'ar' ? 'ar' : 'en');

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

  groupElements.flat().forEach((element) => element.classList.remove('is-visible'));

  const arabicScriptPattern = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;
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

  window.addEventListener('scroll', () => {
    if (activeTemporaryUi === 'menu' || activeTemporaryUi === 'utilities') activateTemporaryUi('none');
    scheduleScrollVisuals();
  }, { passive: true });
  window.addEventListener('resize', () => {
    groupGeometryDirty = true;
    syncConversationInputBounds();
    scheduleKeyboardOffset();
    scheduleScrollVisuals();
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    groupGeometryDirty = true;
    syncConversationInputBounds();
    scheduleKeyboardOffset();
    scheduleScrollVisuals();
  }, { passive: true });
  document.fonts?.ready.then(() => {
    groupGeometryDirty = true;
    scheduleScrollVisuals();
  });
  const initializeGroupOne = () => {
    const run = ++initializationRun;
    document.documentElement.classList.add('s-x-initializing');
    initializationReady = false;
    if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
    if (keyboardFrame) window.cancelAnimationFrame(keyboardFrame);
    if (initializationFrame) window.cancelAnimationFrame(initializationFrame);
    if (composerPulseFrame) window.cancelAnimationFrame(composerPulseFrame);
    if (composerMenuPulseFrame) window.cancelAnimationFrame(composerMenuPulseFrame);
    scrollFrame = 0;
    keyboardFrame = 0;
    initializationFrame = 0;
    composerPulseFrame = 0;
    composerMenuPulseFrame = 0;
    resetAddButton();
    composer.classList.remove('is-pulsing');
    activeGroupIndex = -1;
    keyboardLockedGroup = -1;
    keyboardLockedScrollY = 0;
    lastKeyboardOverlap = 0;
    initialGroupOnePending = true;
    lastScrollY = 0;
    groupGeometryDirty = true;
    groupTransformOffsets.fill(Number.NaN);
    window.scrollTo({ top: 0, behavior: 'auto' });
    groupElements.forEach((elements, index) => {
      stopGroupTyping(index, true);
      elements.forEach((element) => element.classList.remove('is-visible', 'is-typing', 'is-fading'));
    });
    initializationFrame = window.requestAnimationFrame(() => {
      initializationFrame = window.requestAnimationFrame(() => {
        initializationFrame = 0;
        if (run !== initializationRun) return;
        window.scrollTo({ top: 0, behavior: 'auto' });
        updateKeyboardOffset();
        activeGroupIndex = 0;
        initialGroupOnePending = false;
        setGroupState(0, 'typing');
        lastScrollY = window.scrollY;
        initializationReady = true;
        syncConversationInputBounds();
        measureGroupGeometry();
        updateGroupPushPositions(window.scrollY);
        document.documentElement.classList.remove('s-x-initializing');
      });
    });
  };
  window.addEventListener('pageshow', () => {
    if (!initializationReady) initializeGroupOne();
  }, { once: true });
  initializeGroupOne();
})();
