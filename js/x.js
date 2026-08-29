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
  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));
    const keyboardOverlap = Math.max(0, layoutHeight - window.visualViewport.height - window.visualViewport.offsetTop);
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
      if (index) fragment.appendChild(document.createElement('br'));
      fragment.appendChild(document.createTextNode(line));
    });
    element.replaceChildren(fragment);
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
  };
  applyPageCopy(document.documentElement.lang === 'ar' ? 'ar' : 'en');
  groupElements.flat().forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add('is-visible');
  });

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
