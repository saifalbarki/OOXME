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
  const groups = Array.from(document.querySelectorAll('.s-page__group'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (!page || !composer || !composerMenu || !addButton || !input || !submitButton || !conversation || !conversationFinal || !conversationFinalCopy || groups.length !== 3) return;

  const maximumVisibleMessages = 6;
  const replyDelayMs = 1000;
  const finalRevealDelayMs = 1600;
  const englishReplies = [
    'Sorry, we don’t reply to messages for free.',
    'Hmm... it seems you didn’t read the previous message.',
    'Yes. Still the same answer.',
    'Are you seriously trying again?',
    'We have a better idea. Call us.',
    'Let’s make this easier — tap the + button.',
    '看来你还是没明白我们的意思。',
    'Please stop. You’re becoming very committed to this.',
    'One more message and we may have to alert the branding department.',
    'Your account has been dramatically, completely, and absolutely... suspended.'
  ];
  const arabicReplies = [
    'عذرًا، نحن لا نردّ على الرسائل مجانًا.',
    'همم... يبدو أنك لم تقرأ الرسالة السابقة.',
    'نعم. ما زالت الإجابة نفسها.',
    'أحقًا تحاول مرة أخرى؟',
    'لدينا فكرة أفضل. اتصل بنا.',
    'لنجعل الأمر أسهل — اضغط زر +.',
    'يبدو أنك ما زلت لا تفهم ما نقصده.',
    'من فضلك توقّف. التزامك بالأمر بدأ يصبح لافتًا.',
    'رسالة أخرى وقد نضطر — مازحين طبعًا — إلى تنبيه قسم العلامة التجارية.',
    'تم تعليق حسابك بصورة درامية، وكاملة، ومطلقة... مزحة فقط.'
  ];
  const finalMessages = {
    en: 'Alright, we’re joking.\nThe OOXME conversation experience is still under development. Until it’s ready, reach us through our official channels and we’ll take it from there.',
    ar: 'حسنًا، نحن نمزح.\nتجربة المحادثة لدى OOXME ما تزال قيد التطوير. وحتى تصبح جاهزة، تواصل معنا عبر قنواتنا الرسمية، وسنتولى الأمر من هناك.'
  };
  let snapTimer = 0;
  let interactionState = 'idle';
  let isTouching = false;
  let activeGroupIndex = -1;
  let lastScrollY = window.scrollY;
  let lastScrollDirection = 1;
  let revealFrame = 0;
  const typingFrames = groups.map(() => 0);
  let initialGroupOnePending = true;
  const titleTypingCharactersPerSecond = 28;
  const preferredDescriptionCharacterIntervalMs = 45;
  const maximumDescriptionTypingDurationMs = 3000;
  let keyboardLockedGroup = -1;
  let addFlashTimer = 0;
  const menuItemFlashTimers = new WeakMap();
  let addRotated = false;
  let initializationReady = false;
  let initializationRun = 0;
  let suppressSettleUntil = 0;
  let lastKeyboardOverlap = 0;
  let replyIndex = 0;
  let conversationState = 'active';

  const isComposerMenuInteraction = (target) => (
    addButton.contains(target) || composerMenu.contains(target)
  );

  const isChatInteraction = (target) => (
    composer.contains(target) || conversation.contains(target) || conversationFinal.contains(target)
  );

  const pauseSettleForMenu = () => {
    window.clearTimeout(snapTimer);
    if (interactionState === 'settling') {
      window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    }
    interactionState = 'idle';
  };

  const suppressSettleForMenuInteraction = () => {
    suppressSettleUntil = performance.now() + 250;
  };

  const suppressSettleForChatInteraction = () => {
    suppressSettleUntil = Math.max(suppressSettleUntil, performance.now() + 500);
    window.clearTimeout(snapTimer);
    if (interactionState === 'settling') window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    interactionState = 'idle';
  };

  const setComposerMenuOpen = (isOpen) => {
    composerMenu.classList.toggle('is-open', isOpen);
    composerMenu.setAttribute('aria-hidden', String(!isOpen));
    if (isOpen) pauseSettleForMenu();
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
    window.clearTimeout(addFlashTimer);
    addButton.classList.add('is-active');
    addFlashTimer = window.setTimeout(() => addButton.classList.remove('is-active'), 120);
  });

  document.addEventListener('pointerdown', (event) => {
    if (isComposerMenuInteraction(event.target)) return;
    if (composerMenu.classList.contains('is-open')) {
      suppressSettleForMenuInteraction();
      resetAddButton();
    }
  }, { passive: true });
  window.addEventListener('scroll', () => {
    if (!composerMenu.classList.contains('is-open')) resetAddButton();
  }, { passive: true });
  const updateAnchorGap = () => {
    const x = parseFloat(getComputedStyle(page).getPropertyValue('--s-x')) || 18;
    page.style.setProperty('--s-anchor-gap', `${(x * 2).toFixed(2)}px`);
  };

  const snapToDirectionalGroup = () => {
    const anchorGap = parseFloat(getComputedStyle(page).getPropertyValue('--s-anchor-gap')) || 0;
    const currentIndex = activeGroupIndex >= 0 ? activeGroupIndex : 0;
    const targetIndex = Math.min(groups.length - 1, Math.max(0, currentIndex + (lastScrollDirection >= 0 ? 1 : -1)));
    const target = Math.max(0, groups[targetIndex].offsetTop - anchorGap);
    if (Math.abs(target - window.scrollY) < 1) return false;
    window.scrollTo({ top: target, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    return true;
  };

  const cancelSettle = () => {
    window.clearTimeout(snapTimer);
    if (interactionState === 'settling') {
      window.scrollTo({ top: window.scrollY, behavior: 'auto' });
    }
    interactionState = 'touching';
  };

  const scheduleSettle = () => {
    window.clearTimeout(snapTimer);
    if (!initializationReady || isTouching || keyboardLockedGroup >= 0 || composerMenu.classList.contains('is-open') || performance.now() < suppressSettleUntil) return;
    interactionState = 'momentum';
    snapTimer = window.setTimeout(() => {
      if (isTouching || keyboardLockedGroup >= 0 || composerMenu.classList.contains('is-open') || performance.now() < suppressSettleUntil) return;
      interactionState = 'settling';
      if (!snapToDirectionalGroup() || reducedMotion.matches) interactionState = 'idle';
    }, 600);
  };

  const updateKeyboardOffset = () => {
    if (!window.visualViewport) return;
    const layoutHeight = Math.max(1, Math.round(document.documentElement.clientHeight || window.innerHeight || 0));
    const keyboardOverlap = Math.max(0, layoutHeight - window.visualViewport.height - window.visualViewport.offsetTop);
    if (keyboardOverlap > 0 && keyboardLockedGroup < 0) keyboardLockedGroup = Math.max(0, activeGroupIndex);
    if (keyboardOverlap === 0 && lastKeyboardOverlap > 0) {
      keyboardLockedGroup = -1;
      suppressSettleForChatInteraction();
      lastScrollY = window.scrollY;
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
    if (scrollDirection) lastScrollDirection = scrollDirection > 0 ? 1 : -1;
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

  const trimConversation = () => {
    while (conversation.children.length > maximumVisibleMessages) conversation.firstElementChild?.remove();
    window.requestAnimationFrame(() => {
      while (conversation.scrollHeight > conversation.clientHeight && conversation.children.length > 2) {
        conversation.firstElementChild?.remove();
      }
    });
  };

  const addConversationBubble = (message, speaker, language) => {
    const bubble = document.createElement('p');
    bubble.className = `s-page__conversation-bubble s-page__conversation-bubble--${speaker}`;
    bubble.lang = language;
    bubble.dir = language === 'ar' ? 'rtl' : 'ltr';
    bubble.textContent = message;
    conversation.appendChild(bubble);
    trimConversation();
  };

  const revealConversationFinal = (language) => {
    conversationState = 'finished';
    conversationFinalCopy.lang = language;
    conversationFinalCopy.dir = language === 'ar' ? 'rtl' : 'ltr';
    conversationFinalCopy.textContent = finalMessages[language];
    conversationFinal.setAttribute('aria-hidden', 'false');
    conversationFinal.classList.add('is-visible');
    input.value = '';
    input.placeholder = language === 'ar' ? 'انتهت التجربة' : 'Demo complete';
    input.disabled = true;
    submitButton.disabled = true;
    input.blur();
    updateSubmitArrow();
    suppressSettleForChatInteraction();
  };

  input.addEventListener('focus', () => {
    updateSubmitArrow();
    keyboardLockedGroup = Math.max(0, activeGroupIndex);
    suppressSettleForChatInteraction();
  });

  input.addEventListener('blur', () => {
    updateSubmitArrow();
    if (lastKeyboardOverlap > 0) return;
    keyboardLockedGroup = -1;
    suppressSettleForChatInteraction();
    lastScrollY = window.scrollY;
  });

  input.addEventListener('input', updateSubmitArrow);
  updateSubmitArrow();

  composer.addEventListener('submit', (event) => {
    event.preventDefault();
    suppressSettleForChatInteraction();
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
    if (initializationReady && interactionState !== 'settling') scheduleSettle();
  }, { passive: true });
  window.addEventListener('scroll', () => {
    if (window.scrollY !== lastScrollY) scheduleRevealGroups();
  }, { passive: true });
  if ('onscrollend' in window) {
    window.addEventListener('scrollend', () => {
      if (interactionState === 'settling') interactionState = 'idle';
      else scheduleSettle();
    }, { passive: true });
  }

  const beginTouch = (event) => {
    if (isComposerMenuInteraction(event.target)) {
      suppressSettleForMenuInteraction();
      pauseSettleForMenu();
      return;
    }
    if (isChatInteraction(event.target)) {
      suppressSettleForChatInteraction();
      return;
    }
    isTouching = true;
    cancelSettle();
  };

  const endTouch = (event) => {
    isTouching = false;
    if (isComposerMenuInteraction(event.target) || isChatInteraction(event.target) || performance.now() < suppressSettleUntil) {
      interactionState = 'idle';
      return;
    }
    if (initializationReady) scheduleSettle();
  };

  window.addEventListener('pointerdown', beginTouch, { passive: true, capture: true });
  window.addEventListener('pointerup', endTouch, { passive: true, capture: true });
  window.addEventListener('pointercancel', endTouch, { passive: true, capture: true });
  window.addEventListener('touchstart', beginTouch, { passive: true, capture: true });
  window.addEventListener('touchend', endTouch, { passive: true, capture: true });
  window.addEventListener('touchcancel', endTouch, { passive: true, capture: true });
  window.addEventListener('wheel', () => {
    if (composerMenu.classList.contains('is-open')) {
      pauseSettleForMenu();
      return;
    }
    resetAddButton();
    if (interactionState === 'settling') cancelSettle();
    scheduleSettle();
  }, { passive: true });

  window.addEventListener('resize', updateAnchorGap, { passive: true });
  window.addEventListener('orientationchange', updateAnchorGap, { passive: true });
  updateAnchorGap();
  const initializeGroupOne = () => {
    const run = ++initializationRun;
    initializationReady = false;
    window.clearTimeout(snapTimer);
    interactionState = 'idle';
    resetAddButton();
    composer.classList.remove('is-pulsing');
    activeGroupIndex = -1;
    keyboardLockedGroup = -1;
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
      updateAnchorGap();
      updateKeyboardOffset();
      activeGroupIndex = 0;
      initialGroupOnePending = false;
      setGroupState(0, 'typing');
      lastScrollY = window.scrollY;
      initializationReady = true;
      document.documentElement.classList.remove('s-x-initializing');
    }));
  };
  window.addEventListener('pageshow', () => {
    if (!initializationReady) initializeGroupOne();
  }, { once: true });
  initializeGroupOne();
})();
