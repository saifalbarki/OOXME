(() => {
  'use strict';

  const page = document.querySelector('.s-page');
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
  const groups = Array.from(document.querySelectorAll('.s-page__group'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!page || !composer || !composerMenu || !sendUtilities || !sendThemeUtility || !sendLanguageUtility || !addButton || !input || !submitButton || !conversation || !conversationFinal || !conversationFinalCopy || groups.length !== 3) return;

  const maximumVisibleConversationMessages = 3;
  const replyDelayMs = 1000;
  const finalRevealDelayMs = 1600;
  const finalMessageDurationMs = 10000;
  const finalFadeOutDurationMs = 320;
  const chatInactivityDelayMs = 3000;
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
        ['Welcome to ooxme', 'We are Iraq’s first and only premium brand management service, built to transform ambitious businesses into globally competitive brands through sharper positioning, stronger market presence, sustainable growth, and greater revenue potential.'],
        ['Clarity across every moving part.', 'Built to keep direction visible while the details keep moving.'],
        ['Move from thought\nto next step.', 'Start with a question.']
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
        ['اهلًا بك في اوكسوم', 'نحن اول خدمة متميزة لادارة العلامات التجارية في العراق، صممنا لتحويل الاعمال الطموحة الى علامات تنافس عالميًا عبر تموضع اوضح، وحضور اقوى في السوق، ونمو مستدام، وقدرة اكبر على زيادة الايرادات.'],
        ['وضوح في كل جزء متحرك.', 'صممنا لنحافظ على وضوح الاتجاه بينما تستمر التفاصيل في الحركة.'],
        ['من الفكرة\nالى الخطوة التالية.', 'ابدأ بسؤال.']
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
  let sendUtilitiesOpen = false;
  let initializationReady = false;
  let initializationRun = 0;
  let lastKeyboardOverlap = 0;
  let replyIndex = 0;
  let conversationState = 'active';
  let finalVisibleTimer = 0;
  let finalResetTimer = 0;
  let chatInactivityTimer = 0;
  let conversationVisible = true;
  const composerControls = Array.from(composer.querySelectorAll('button, input'));
  const inputLabel = composer.querySelector('.s-page__visually-hidden');
  const menuLabels = Array.from(composerMenu.querySelectorAll('.s-page__composer-menu-label'));
  let applyPageCopy = null;

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

  const applyTheme = (next) => {
    const isDayMode = next === 'day';
    document.documentElement.classList.toggle('is-day-mode', isDayMode);
    sendThemeUtility.classList.toggle('is-active', !isDayMode);
    sendThemeUtility.setAttribute('aria-pressed', String(!isDayMode));
    updateThemeToggleLabel();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDayMode ? '#FFFFFF' : '#000000');
  };

  let initialLanguage = 'en';
  try { initialLanguage = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(initialLanguage, { persist: false, emit: false });
  applyTheme('dark');

  const isComposerMenuInteraction = (target) => (
    addButton.contains(target) || composerMenu.contains(target) || sendUtilities.contains(target)
  );

  const setComposerMenuOpen = (isOpen) => {
    composerMenu.classList.toggle('is-open', isOpen);
    composerMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const setSendUtilitiesOpen = (isOpen) => {
    sendUtilitiesOpen = isOpen;
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
      if (event.animationName === 's-page-send-utility-pulse') control.classList.remove('is-pulsing');
    });
  });

  [addButton, input, submitButton].forEach((control) => {
    control?.addEventListener('pointerdown', pulseComposer, { passive: true });
  });

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
    setSendUtilitiesOpen(false);
    addRotated = !addRotated;
    addButton.classList.toggle('is-rotated', addRotated);
    setComposerMenuOpen(addRotated);
    if (addRotated) pauseConversationForMenu();
    window.clearTimeout(addFlashTimer);
    addButton.classList.add('is-active');
    addFlashTimer = window.setTimeout(() => addButton.classList.remove('is-active'), 120);
  });

  document.addEventListener('pointerdown', (event) => {
    if (isComposerMenuInteraction(event.target)) return;
    if (composerMenu.classList.contains('is-open')) {
      resetAddButton();
    }
  }, { passive: true });
  const measureGroupGeometry = () => {
    const pageStyles = getComputedStyle(page);
    groupHandoffSpacing = parseFloat(pageStyles.getPropertyValue('--s-x')) || 18;
    groupComposerTriggerTop = composer.getBoundingClientRect().top - groupHandoffSpacing;
    const scrollPosition = window.scrollY;
    const measurements = groups.map((group, index) => {
      const rect = group.getBoundingClientRect();
      const appliedOffset = Number.isFinite(groupTransformOffsets[index])
        ? groupTransformOffsets[index]
        : 0;
      return {
        top: rect.top + scrollPosition - appliedOffset,
        height: rect.height
      };
    });
    const anchorPosition = measurements[0].top;
    groupGeometry = measurements.map((measurement, index) => ({
      top: measurement.top,
      height: measurement.height,
      pinStart: index === 0 ? 0 : measurement.top - anchorPosition,
      pinEnd: index === groups.length - 1
        ? Number.POSITIVE_INFINITY
        : measurements[index + 1].top - anchorPosition - groupHandoffSpacing
    }));
    groupGeometryDirty = false;
  };

  const getGroupPushOffset = (index, scrollPosition) => {
    const geometry = groupGeometry[index];
    return Math.max(0, Math.min(scrollPosition - geometry.pinStart, geometry.pinEnd - geometry.pinStart));
  };

  const updateGroupPushPositions = (scrollPosition) => {
    groups.forEach((group, index) => {
      const offset = getGroupPushOffset(index, scrollPosition);
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
        const top = geometry.top - scrollPosition + getGroupPushOffset(index, scrollPosition);
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

  const getTypingRate = (element, characterCount) => {
    if (document.documentElement.lang === 'ar') {
      if (!element.classList.contains('s-page__group-description')) return titleTypingWordsPerSecond;
      return 1000 / getArabicDescriptionWordInterval(characterCount);
    }
    if (!element.classList.contains('s-page__group-description')) return titleTypingCharactersPerSecond;
    return 1000 / getDescriptionCharacterInterval(characterCount);
  };

  const getTypingDurationMs = (element, characterCount) => {
    if (document.documentElement.lang === 'ar') {
      if (!element.classList.contains('s-page__group-description')) {
        return (characterCount / titleTypingWordsPerSecond) * 1000;
      }
      return getArabicDescriptionWordInterval(characterCount) * Math.max(0, characterCount - 1);
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
      elements.forEach((element, elementIndex) => {
        element.classList.remove('is-typing', 'is-visible', 'is-fading');
        setLocalizedText(element, copy.groups[groupIndex][elementIndex]);
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
    applyTheme(document.documentElement.classList.contains('is-day-mode') ? 'dark' : 'day');
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

  const clearChatInactivityTimer = () => {
    window.clearTimeout(chatInactivityTimer);
    chatInactivityTimer = 0;
  };

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

  const scheduleChatInactivity = () => {
    clearChatInactivityTimer();
    if (conversationState === 'finished' || conversationState === 'resetting' || composerMenu.classList.contains('is-open')) return;
    chatInactivityTimer = window.setTimeout(() => {
      chatInactivityTimer = 0;
      setConversationVisibility(false);
    }, chatInactivityDelayMs);
  };

  const markChatActive = () => {
    clearChatInactivityTimer();
    if (conversationState === 'finished' || conversationState === 'resetting' || composerMenu.classList.contains('is-open')) return;
    setConversationVisibility(true);
    scheduleChatInactivity();
  };

  const pauseConversationForMenu = () => {
    clearChatInactivityTimer();
    setConversationVisibility(false);
  };

  conversation.addEventListener('pointerdown', () => markChatActive(), { passive: true });

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
    clearChatInactivityTimer();
    setConversationVisibility(true);
    conversationFinal.classList.remove('is-visible');
    conversationFinal.setAttribute('aria-hidden', 'true');
    conversation.replaceChildren();
    syncPageTextForChat();
    replyIndex = 0;
    conversationState = 'resetting';
    applyLanguage('en', { emit: false });
    applyTheme('dark');
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
    clearChatInactivityTimer();
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

  input.addEventListener('focus', () => {
    setSendUtilitiesOpen(false);
    markChatActive();
    lockActiveGroupForKeyboard();
  });

  input.addEventListener('blur', () => {
    if (lastKeyboardOverlap > 0) return;
    releaseKeyboardGroupLock();
  });

  input.addEventListener('input', () => {
    setSendUtilitiesOpen(false);
    markChatActive();
  });

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    markChatActive();
    const message = input.value.trim();
    if (!message) {
      setSendUtilitiesOpen(!sendUtilitiesOpen);
      return;
    }
    if (conversationState !== 'active') return;

    setSendUtilitiesOpen(false);
    const language = detectMessageLanguage(message);
    const currentReplyIndex = replyIndex;
    const replies = language === 'ar' ? arabicReplies : englishReplies;
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
    setSendUtilitiesOpen(false);
    scheduleScrollVisuals();
  }, { passive: true });
  window.addEventListener('resize', () => {
    groupGeometryDirty = true;
    scheduleKeyboardOffset();
    scheduleScrollVisuals();
  }, { passive: true });
  window.addEventListener('orientationchange', () => {
    groupGeometryDirty = true;
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
