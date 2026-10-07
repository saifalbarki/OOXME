(() => {
  'use strict';

  const root = document.documentElement;
  const viewport = window.visualViewport;
  const body = document.body;
  let frame = 0;
  const setCheckVar = (name, value) => {
    root.style.setProperty(name, value);
    body?.style.setProperty(name, value);
  };

  const measureVisibleArea = () => {
    frame = 0;
    const width = Math.max(1, viewport?.width || root.clientWidth || window.innerWidth);
    const height = Math.max(1, viewport?.height || root.clientHeight || window.innerHeight);
    const left = viewport?.offsetLeft || 0;
    const top = viewport?.offsetTop || 0;
    root.style.setProperty('--s-check-vv-left', `${left}px`);
    root.style.setProperty('--s-check-vv-top', `${top}px`);
    root.style.setProperty('--s-check-vv-width', `${width}px`);
    root.style.setProperty('--s-check-vv-height', `${height}px`);
    root.style.setProperty('--s-check-x', `${Math.max(18, (width - 660) / 4)}px`);
  };

  const scheduleMeasure = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(measureVisibleArea);
  };

  const measureBubbleRise = () => {
    const lower = document.querySelector('[data-s-check-bubble="lower"]');
    const upper = document.querySelector('[data-s-check-bubble="upper"]');
    const testBubble = document.querySelector('[data-s-check-test-bubble]');
    const lowerHeight = lower?.getBoundingClientRect().height || 32;
    const upperHeight = upper?.getBoundingClientRect().height || 32;
    const testHeight = testBubble?.getBoundingClientRect().height || 32;
    const bar = document.querySelector('.s-check-composer-field');
    const send = document.querySelector('.s-check-composer-send');
    const baseBottom = Number.parseFloat(lower ? getComputedStyle(lower).bottom : '') || 0;
    const sharedGap = bar && send ? Math.max(0, bar.getBoundingClientRect().right - send.getBoundingClientRect().right) : 8;
    const x = Number.parseFloat(getComputedStyle(root).getPropertyValue('--s-check-x')) || 0;
    const spacingReduction = Math.max(0, x - sharedGap);
    const viewportRect = document.querySelector('.s-check-viewport')?.getBoundingClientRect();
    const visibleCenter = viewportRect ? (viewportRect.left + (viewportRect.width / 2)) : ((viewport?.offsetLeft || 0) + ((viewport?.width || root.clientWidth || window.innerWidth) / 2));
    const lowerRect = lower?.getBoundingClientRect();
    const upperRect = upper?.getBoundingClientRect();
    const lowerFaceRect = document.querySelector('.s-page__add')?.getBoundingClientRect();
    const centeredBubbles = body?.classList.contains('is-bubble-centered');
    const upperFullWidth = upperRect ? (centeredBubbles ? upperRect.width + (x * 2) : upperRect.width) : 0;
    const upperWidth = Math.max(1, upperFullWidth - (x * 2));
    const upperLeft = upperRect ? upperRect.right - upperWidth : 0;
    const upperFaceBottom = baseBottom + lowerHeight + x + upperHeight - 32;
    const bubbleWidth = lowerRect?.width || upperRect?.width || 0;
    const bubbleHalfWidth = bubbleWidth / 2;
    const lowerBubbleLeft = lowerFaceRect ? lowerFaceRect.right + sharedGap : lowerRect?.left;
    const bubbleCenterOffset = lowerBubbleLeft == null ? 0 : (lowerBubbleLeft + bubbleHalfWidth) - visibleCenter;
    const conversationLeft = lowerRect && upperRect ? Math.min(lowerRect.left, upperRect.left) : 0;
    const conversationRight = lowerRect && upperRect ? Math.max(lowerRect.right, upperRect.right) : 0;
    const conversationWidth = conversationRight - conversationLeft;
    const shellRect = document.querySelector('.s-check-viewport')?.getBoundingClientRect();
    setCheckVar('--s-check-bubble-rise', `${Math.max(0, lowerHeight - 32)}px`);
    setCheckVar('--s-check-lower-height', `${lowerHeight}px`);
    setCheckVar('--s-check-upper-height', `${upperHeight}px`);
    setCheckVar('--s-check-test-height', `${testHeight}px`);
    setCheckVar('--s-check-base-bottom', `${baseBottom}px`);
    setCheckVar('--s-check-shared-gap', `${sharedGap}px`);
    setCheckVar('--s-check-spacing-reduction', `${spacingReduction}px`);
    setCheckVar('--s-check-bubble-center-axis', `${visibleCenter}px`);
    if (bubbleWidth > 0) {
      setCheckVar('--s-check-bubble-width', `${bubbleWidth}px`);
      setCheckVar('--s-check-bubble-half-width', `${bubbleHalfWidth}px`);
      setCheckVar('--s-check-bubble-center-offset', `${bubbleCenterOffset}px`);
      body?.classList.add('is-bubble-centered');
    }
    if (upperRect) {
      setCheckVar('--s-check-upper-width', `${upperWidth}px`);
      setCheckVar('--s-check-upper-left', `${upperLeft}px`);
      setCheckVar('--s-check-upper-face-bottom', `${upperFaceBottom}px`);
    }
    if (conversationWidth > 0) {
      if (shellRect) {
        setCheckVar('--s-check-conversation-left', `${conversationLeft - shellRect.left}px`);
        setCheckVar('--s-check-conversation-right', `${shellRect.right - conversationRight}px`);
      }
      body?.classList.add('is-conversation-width-matched');
      window.requestAnimationFrame(() => {
        const composerRect = document.querySelector('.s-check-composer-row')?.getBoundingClientRect();
        if (!composerRect) return;
        const leftDelta = composerRect.left - conversationLeft;
        const rightDelta = composerRect.right - conversationRight;
        if (Math.abs(leftDelta) > .001 || Math.abs(rightDelta) > .001) {
          const leftInset = Number.parseFloat(getComputedStyle(body).getPropertyValue('--s-check-conversation-left')) || 0;
          const rightInset = Number.parseFloat(getComputedStyle(body).getPropertyValue('--s-check-conversation-right')) || 0;
          setCheckVar('--s-check-conversation-left', `${leftInset - leftDelta}px`);
          setCheckVar('--s-check-conversation-right', `${rightInset + rightDelta}px`);
        }
      });
    }
  };

  const scheduleBubbleMeasure = () => window.requestAnimationFrame(measureBubbleRise);

  measureVisibleArea();
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('orientationchange', scheduleMeasure, { passive: true });
  viewport?.addEventListener('resize', scheduleMeasure, { passive: true });
  viewport?.addEventListener('scroll', scheduleMeasure, { passive: true });
  window.addEventListener('resize', scheduleBubbleMeasure, { passive: true });
  window.addEventListener('orientationchange', scheduleBubbleMeasure, { passive: true });

  const form = document.querySelector('[data-s-check-composer]');
  form?.addEventListener('submit', (event) => event.preventDefault());

  const testBubble = document.querySelector('[data-s-check-test-bubble]');
  const testOptions = [...document.querySelectorAll('[data-s-check-test-option]')];
  testOptions.forEach((option) => {
    option.addEventListener('click', () => {
      testOptions.forEach((candidate) => {
        const selected = candidate === option;
        candidate.setAttribute('aria-checked', String(selected));
      });
    });
  });

  const copy = {
    en: { placeholder: 'Type...' },
    ar: { placeholder: 'اكتب...' }
  };
  const bubbleCopy = {
    en: 'This is a deliberately long placeholder sentence used to verify the bubble’s maximum right boundary.',
    ar: 'هذه جملة مؤقتة طويلة للتحقق من الحد الأقصى الأيمن لفقاعة المحادثة.'
  };
  const testCopy = {
    en: {
      question: 'Which placeholder direction should this test conversation take when the interface needs a deliberately long question to verify natural wrapping and vertical growth?',
      options: [
        'Use the first long placeholder choice to represent a calm, direct, and carefully measured answer.',
        'Use the second long placeholder choice to test a longer response with additional wrapping.',
        'Use the third long placeholder choice to confirm that only one selection can remain active.'
      ]
    },
    ar: {
      question: 'أي اتجاه مؤقت يجب أن تتخذه هذه المحادثة الاختبارية عندما نحتاج إلى سؤال طويل للتحقق من الالتفاف الطبيعي والنمو الرأسي؟',
      options: [
        'استخدم الخيار المؤقت الأول لتمثيل إجابة هادئة ومباشرة ومدروسة بعناية.',
        'استخدم الخيار المؤقت الثاني لاختبار إجابة أطول مع التفاف إضافي للنص.',
        'استخدم الخيار المؤقت الثالث للتأكد من بقاء اختيار واحد فقط نشطاً.'
      ]
    }
  };
  const applyCopy = () => {
    const language = root.lang === 'en' ? 'en' : 'ar';
    const labels = copy[language];
    const testLabels = testCopy[language];
    const input = form?.querySelector('input');
    const bubbles = [...document.querySelectorAll('[data-s-check-bubble]')];
    if (testBubble) {
      testBubble.lang = language;
      testBubble.dir = language === 'ar' ? 'rtl' : 'ltr';
      testBubble.querySelector('[data-s-check-test-question]').textContent = testLabels.question;
      [...testBubble.querySelectorAll('[data-s-check-test-option-label]')].forEach((label, index) => {
        label.textContent = testLabels.options[index];
      });
    }
    if (input) {
      input.placeholder = labels.placeholder;
      input.lang = language;
      input.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
    bubbles.forEach((bubble) => {
      bubble.textContent = bubbleCopy[language];
      bubble.lang = language;
      bubble.dir = language === 'ar' ? 'rtl' : 'ltr';
      scheduleBubbleMeasure();
    });
  };
  applyCopy();
  const bubbles = [...document.querySelectorAll('[data-s-check-bubble]')];
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleBubbleMeasure);
    bubbles.forEach((bubble) => observer.observe(bubble));
    if (testBubble) observer.observe(testBubble);
  }
  const testFace = document.querySelector('[data-s-check-test-face]');
  const testShell = testFace?.querySelector('.s-page__x-face-shell');
  const testEyes = testFace?.querySelector('.s-page__x-face-eyes');
  const testEyeMotion = testFace?.querySelector('.s-page__x-face-eye-motion');
  let testAnimationFrame = 0;
  const animateTestFace = (time) => {
    if (!testShell || !testEyes || !testEyeMotion) return;
    const blinkPhase = (((time / 1000) + .7) % 2) / 2;
    const blink = 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .014, 2)));
    testShell.setAttribute('transform', 'translate(0 0)');
    testEyes.setAttribute('transform', 'translate(0 0)');
    testEyeMotion.setAttribute('transform', `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)`);
    testAnimationFrame = window.requestAnimationFrame(animateTestFace);
  };
  if (testFace) testAnimationFrame = window.requestAnimationFrame(animateTestFace);
  window.addEventListener('pagehide', () => {
    if (testAnimationFrame) window.cancelAnimationFrame(testAnimationFrame);
  }, { once: true });
  window.addEventListener('ooxme-language-change', applyCopy);
})();
