(() => {
  'use strict';

  const page = document.querySelector('.s-page');
  const composer = document.querySelector('[data-s-composer]');
  const composerMenu = document.querySelector('[data-s-composer-menu]');
  const addButton = document.querySelector('.s-page__add');
  const input = document.querySelector('.s-page__composer-input');
  const submitButton = composer?.querySelector('.s-page__submit');
  const conversation = document.querySelector('[data-s-conversation]');
  const conversationFinal = document.querySelector('[data-s-conversation-final]');
  const conversationFinalCopy = document.querySelector('[data-s-conversation-final-copy]');
  const languageToggle = document.querySelector('[data-s-language-toggle]');
  const themeToggle = document.querySelector('[data-s-theme-toggle]');
  const groups = Array.from(document.querySelectorAll('.s-page__group'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!page || !composer || !composerMenu || !addButton || !input || !submitButton || !conversation || !conversationFinal || !conversationFinalCopy || !languageToggle || !themeToggle || groups.length !== 3) return;

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
    'عذرــًا، نحن لا نرد على الرسائل مجانــًا.',
    'همم... يبدو انك لم تقرأ الرسالة السابقة.',
    'نعم. ما زالت الاجابة نفسها.',
    'احقــًا تحاول مرة اخرى؟',
    'لدينا فكرة افضل. اتصل بنا.',
    'لنجعل الامر اسهل - اضغط زر +.',
    'يبدو انك ما زلت لا تفهم ما نقصده.',
    'من فضلك توقف. التزامك بالامر بدأ يصبح لافتــًا.',
    'رسالة اخرى وقد نضطر - مازحين طبعــًا - الى تنبيه قسم العلامة التجارية.',
    'تم تعليق حسابك بصورة درامية، وكاملة، ومطلقة... مزحة فقط.'
  ];
  const finalMessages = {
    en: 'Alright, we’re joking.\nThe ooxme conversation experience is still under development. Until it’s ready, reach us through our official channels and we’ll take it from there.',
    ar: 'حسنــًا، نحن نمزح.\nتجربة المحادثة لدى اوكسوم ما تزال قيد التطوير. وحتى تصبح جاهزة، تواصل معنا عبر قنواتنا الرسمية، وسنتولى الامر من هناك.'
  };
  let activeGroupIndex = -1;
  let lastScrollY = window.scrollY;
  let revealFrame = 0;
  let groupPushFrame = 0;
  const typingFrames = groups.map(() => 0);
  let initialGroupOnePending = true;
  const titleTypingCharactersPerSecond = 28;
  const preferredDescriptionCharacterIntervalMs = 45;
  const maximumDescriptionTypingDurationMs = 3000;
  let keyboardLockedGroup = -1;
  let keyboardLockedScrollY = 0;
  let addFlashTimer = 0;
  const menuItemFlashTimers = new WeakMap();
  let addRotated = false;
  let initializationReady = false;
  let initializationRun = 0;
  let lastKeyboardOverlap = 0;
  let replyIndex = 0;
  let conversationState = 'active';
  let finalVisibleTimer = 0;
  let finalResetTimer = 0;
  let chatInactivityTimer = 0;
  const initialInputPlaceholder = input.placeholder;
  const composerControls = Array.from(composer.querySelectorAll('button, input'));

  const applyLanguage = (next, { persist = true, emit = true } = {}) => {
    const language = next === 'ar' ? 'ar' : 'en';
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    languageToggle.classList.toggle('is-active', language === 'en');
    languageToggle.setAttribute('aria-pressed', String(language === 'en'));
    languageToggle.setAttribute('aria-label', language === 'en' ? 'Switch to Arabic' : 'Switch to English');
    if (persist) {
      try { localStorage.setItem('ooxme-language', language); } catch (_) {}
    }
    if (emit) window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language } }));
  };

  const applyTheme = (next) => {
    const isDayMode = next === 'day';
    document.documentElement.classList.toggle('is-day-mode', isDayMode);
    themeToggle.classList.toggle('is-active', !isDayMode);
    themeToggle.setAttribute('aria-pressed', String(!isDayMode));
    themeToggle.setAttribute('aria-label', isDayMode ? 'Switch to Dark Mode' : 'Switch to Day Mode');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDayMode ? '#FFFFFF' : '#000000');
  };

  let initialLanguage = 'en';
  try { initialLanguage = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
  applyLanguage(initialLanguage, { persist: false, emit: false });
  applyTheme('dark');

  languageToggle.addEventListener('click', () => applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar'));
  themeToggle.addEventListener('click', () => applyTheme(document.documentElement.classList.contains('is-day-mode') ? 'dark' : 'day'));
  window.addEventListener('storage', (event) => {
    if (event.key === 'ooxme-language') applyLanguage(event.newValue, { persist: false, emit: false });
  });

  const isComposerMenuInteraction = (target) => (
    addButton.contains(target) || composerMenu.contains(target)
  );

  const setComposerMenuOpen = (isOpen) => {
    composerMenu.classList.toggle('is-open', isOpen);
    composerMenu.setAttribute('aria-hidden', String(!isOpen));
  };

  const resetAddButton = () => {
    window.clearTimeout(addFlashTimer);
    addRotated = false;
    addButton.classList.remove('is-rotated', 'is-active');
    setComposerMenuOpen(false);
  };

  const pulseComposer = () => {
    if (!initializationReady) return;
    composer.classList.remove('is-pulsing');
    void composer.offsetWidth;
    composer.classList.add('is-pulsing');
  };

  composer.addEventListener('animationend', (event) => {
    if (event.animationName === 's-page-composer-pulse') composer.classList.remove('is-pulsing');
  });

  const pulseComposerMenu = () => {
    if (!initializationReady) return;
    composerMenu.classList.remove('is-pulsing');
    void composerMenu.offsetWidth;
    composerMenu.classList.add('is-pulsing');
  };

  composerMenu.addEventListener('animationend', (event) => {
    if (event.animationName === 's-page-composer-menu-pulse') composerMenu.classList.remove('is-pulsing');
  });

  [addButton, input, submitButton].forEach((control) => {
    control?.addEventListener('pointerdown', pulseComposer, { passive: true });
  });

  [addButton, composerMenu].forEach((control) => {
    control.addEventListener('pointerdown', (event) => event.stopPropagation());
    control.addEventListener('touchstart', (event) => event.stopPropagation(), { passive: true });
  });
  composerMenu.addEventListener('click', (event) => event.stopPropagation());
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
  window.addEventListener('scroll', () => {
    if (!composerMenu.classList.contains('is-open')) resetAddButton();
  }, { passive: true });
  const updateGroupPushPositions = () => {
    groupPushFrame = 0;
    if (!initializationReady || keyboardLockedGroup >= 0) return;
    const handoffSpacing = parseFloat(getComputedStyle(page).getPropertyValue('--s-x')) || 18;
    const anchorPosition = groups[0].offsetTop;
    const groupPositions = groups.map((group) => group.offsetTop);
    const scrollPosition = window.scrollY;

    groups.forEach((group, index) => {
      const pinStart = index === 0 ? 0 : groupPositions[index] - anchorPosition;
      const pinEnd = index === groups.length - 1
        ? Number.POSITIVE_INFINITY
        : groupPositions[index + 1] - anchorPosition - handoffSpacing;
      const pinnedDistance = Math.max(0, Math.min(scrollPosition - pinStart, pinEnd - pinStart));
      group.style.transform = `translate3d(0, ${pinnedDistance.toFixed(2)}px, 0)`;
    });
  };

  const scheduleGroupPushPositions = () => {
    if (!initializationReady || keyboardLockedGroup >= 0 || groupPushFrame) return;
    groupPushFrame = window.requestAnimationFrame(updateGroupPushPositions);
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
    scheduleGroupPushPositions();
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
    page.style.setProperty('--s-keyboard-offset', `${keyboardOverlap.toFixed(2)}px`);
    lastKeyboardOverlap = keyboardOverlap;
  };

  const groupElements = groups.map((group) => Array.from(group.querySelectorAll('[data-s-reveal]')));
  groupElements.flat().forEach((element) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      Array.from(textNode.nodeValue).forEach((character) => {
        const span = document.createElement('span');
        span.className = 's-page__typing-character';
        span.textContent = character;
        fragment.appendChild(span);
      });
      textNode.parentNode.replaceChild(fragment, textNode);
    });
  });
  const typingCharacters = groupElements.map((elements) => elements.map((element) =>
    Array.from(element.querySelectorAll('.s-page__typing-character'))
  ));

  const stopGroupTyping = (index, hideCharacters = false) => {
    if (typingFrames[index]) window.cancelAnimationFrame(typingFrames[index]);
    typingFrames[index] = 0;
    if (hideCharacters) {
      typingCharacters[index].flat().forEach((character) => character.classList.remove('is-revealed'));
    }
  };

  const getDescriptionCharacterInterval = (characterCount) => (
    Math.min(preferredDescriptionCharacterIntervalMs, maximumDescriptionTypingDurationMs / Math.max(1, characterCount - 1))
  );

  const getTypingRate = (element, characterCount) => {
    if (!element.classList.contains('s-page__group-description')) return titleTypingCharactersPerSecond;
    return 1000 / getDescriptionCharacterInterval(characterCount);
  };

  const getTypingDurationMs = (element, characterCount) => {
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
        for (let characterIndex = 0; characterIndex < nextCount; characterIndex += 1) {
          characters[characterIndex].classList.add('is-revealed');
        }
        if (nextCount < characters.length) complete = false;
      });
      typingFrames[index] = complete ? 0 : window.requestAnimationFrame(typeNextCharacters);
    };
    typingFrames[index] = window.requestAnimationFrame(typeNextCharacters);
  };

  groupElements.flat().forEach((element) => {
    const characters = Math.max(1, Array.from(element.textContent.trim()).length);
    element.style.setProperty('--s-typing-steps', String(characters));
    element.style.setProperty('--s-typing-duration', `${(getTypingDurationMs(element, characters) / 1000).toFixed(2)}s`);
  });

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

  const updateRevealGroups = () => {
    revealFrame = 0;
    if (!initializationReady) return;
    const scrollY = window.scrollY;
    const scrollDirection = scrollY - lastScrollY;
    lastScrollY = scrollY;
    if (keyboardLockedGroup >= 0) return;
    const x = parseFloat(getComputedStyle(page).getPropertyValue('--s-x')) || 18;
    const triggerLine = composer.getBoundingClientRect().top - x;
    const visibleGroups = groups.map((group, index) => ({ index, rect: group.getBoundingClientRect() }))
      .filter(({ rect }) => rect.bottom > 0 && rect.top < (window.innerHeight || document.documentElement.clientHeight));
    if (!visibleGroups.length) return;
    const crossed = visibleGroups.filter(({ rect }) => rect.top <= triggerLine && rect.bottom > triggerLine);
    if (!crossed.length) return;
    const target = (scrollDirection < 0 ? crossed[0] : crossed[crossed.length - 1]).index;
    if (target === activeGroupIndex) return;
    if (activeGroupIndex >= 0) setGroupState(activeGroupIndex, 'fading');
    activeGroupIndex = target;
    if (target === 0 && initialGroupOnePending) {
      initialGroupOnePending = false;
      setGroupState(0, 'typing');
    } else {
      initialGroupOnePending = false;
      setGroupState(target, 'typing');
    }
  };

  const scheduleRevealGroups = () => {
    if (!initializationReady) return;
    if (!revealFrame) revealFrame = window.requestAnimationFrame(updateRevealGroups);
  };

  groupElements.flat().forEach((element) => element.classList.remove('is-visible'));

  const detectMessageLanguage = (message) => (
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u.test(message) ? 'ar' : 'en'
  );

  const updateSubmitArrow = () => {
    const isReadyToSend = document.activeElement === input || Boolean(input.value.trim());
    submitButton.classList.toggle('is-send-ready', isReadyToSend);
  };

  const clearChatInactivityTimer = () => {
    window.clearTimeout(chatInactivityTimer);
    chatInactivityTimer = 0;
  };

  const setConversationVisibility = (isVisible) => {
    conversation.classList.toggle('is-chat-hidden', !isVisible);
    conversation.setAttribute('aria-hidden', String(!isVisible));
    syncPageTextForChat();
  };

  const syncPageTextForChat = () => {
    const hasVisibleBubbles = !conversation.classList.contains('is-chat-hidden')
      && Boolean(conversation.querySelector('.s-page__conversation-bubble:not(.is-exiting)'));
    page.classList.toggle('is-chat-active', hasVisibleBubbles);
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
    bubble.dir = language === 'ar' ? 'rtl' : 'ltr';
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
    input.blur();
    input.value = '';
    input.placeholder = initialInputPlaceholder;
    submitButton.classList.remove('is-send-ready');
    resetAddButton();
    initializeGroupOne();
    window.clearTimeout(finalResetTimer);
    finalResetTimer = window.setTimeout(() => {
      conversationFinalCopy.textContent = '';
      conversationFinalCopy.removeAttribute('lang');
      conversationFinalCopy.removeAttribute('dir');
      setComposerInteractivity(true);
      conversationState = 'active';
      updateSubmitArrow();
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
    updateSubmitArrow();
    finalVisibleTimer = window.setTimeout(
      resetConversationDemo,
      finalMessageDurationMs
    );
  };

  input.addEventListener('focus', () => {
    markChatActive();
    updateSubmitArrow();
    lockActiveGroupForKeyboard();
  });

  input.addEventListener('blur', () => {
    updateSubmitArrow();
    if (lastKeyboardOverlap > 0) return;
    releaseKeyboardGroupLock();
  });

  input.addEventListener('input', () => {
    markChatActive();
    updateSubmitArrow();
  });
  updateSubmitArrow();

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    markChatActive();
    const message = input.value.trim();
    if (!message) {
      input.focus({ preventScroll: true });
      updateSubmitArrow();
      return;
    }
    if (conversationState !== 'active') return;

    const language = detectMessageLanguage(message);
    const currentReplyIndex = replyIndex;
    const replies = language === 'ar' ? arabicReplies : englishReplies;
    addConversationBubble(message, 'user', language);
    input.value = '';
    updateSubmitArrow();
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
    window.visualViewport.addEventListener('resize', updateKeyboardOffset, { passive: true });
    window.visualViewport.addEventListener('scroll', updateKeyboardOffset, { passive: true });
  }

  window.addEventListener('scroll', () => {
    if (keyboardLockedGroup >= 0) {
      maintainKeyboardGroupPosition();
      return;
    }
    scheduleGroupPushPositions();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    if (window.scrollY !== lastScrollY) scheduleRevealGroups();
  }, { passive: true });
  window.addEventListener('resize', scheduleGroupPushPositions, { passive: true });
  window.addEventListener('orientationchange', scheduleGroupPushPositions, { passive: true });
  const initializeGroupOne = () => {
    const run = ++initializationRun;
    document.documentElement.classList.add('s-x-initializing');
    initializationReady = false;
    if (revealFrame) window.cancelAnimationFrame(revealFrame);
    if (groupPushFrame) window.cancelAnimationFrame(groupPushFrame);
    revealFrame = 0;
    groupPushFrame = 0;
    resetAddButton();
    composer.classList.remove('is-pulsing');
    activeGroupIndex = -1;
    keyboardLockedGroup = -1;
    keyboardLockedScrollY = 0;
    lastKeyboardOverlap = 0;
    initialGroupOnePending = true;
    lastScrollY = 0;
    window.scrollTo({ top: 0, behavior: 'auto' });
    groupElements.forEach((elements, index) => {
      stopGroupTyping(index, true);
      elements.forEach((element) => element.classList.remove('is-visible', 'is-typing', 'is-fading'));
    });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (run !== initializationRun) return;
      window.scrollTo({ top: 0, behavior: 'auto' });
      updateKeyboardOffset();
      activeGroupIndex = 0;
      initialGroupOnePending = false;
      setGroupState(0, 'typing');
      lastScrollY = window.scrollY;
      initializationReady = true;
      updateGroupPushPositions();
      document.documentElement.classList.remove('s-x-initializing');
    }));
  };
  window.addEventListener('pageshow', () => {
    if (!initializationReady) initializeGroupOne();
  }, { once: true });
  initializeGroupOne();
})();
