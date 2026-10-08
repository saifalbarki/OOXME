(() => {
  'use strict';

  const root = document.documentElement;
  const viewport = window.visualViewport;
  const body = document.body;
  let frame = 0;
  let cancelActiveConversationFlip = () => {};
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
    cancelActiveConversationFlip();
    if (frame) return;
    frame = window.requestAnimationFrame(measureVisibleArea);
  };

  const measureBubbleRise = () => {
    const bar = document.querySelector('.s-check-composer-field');
    const send = document.querySelector('.s-check-composer-send');
    const sharedGap = bar && send ? Math.max(0, bar.getBoundingClientRect().right - send.getBoundingClientRect().right) : 8;
    const x = Number.parseFloat(getComputedStyle(root).getPropertyValue('--s-check-x')) || 0;
    const spacingReduction = Math.max(0, x - sharedGap);
    setCheckVar('--s-check-shared-gap', `${sharedGap}px`);
    setCheckVar('--s-check-spacing-reduction', `${spacingReduction}px`);
  };

  const scheduleBubbleMeasure = () => {
    cancelActiveConversationFlip();
    return window.requestAnimationFrame(measureBubbleRise);
  };

  measureVisibleArea();
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('orientationchange', scheduleMeasure, { passive: true });
  viewport?.addEventListener('resize', scheduleMeasure, { passive: true });
  viewport?.addEventListener('scroll', scheduleMeasure, { passive: true });
  window.addEventListener('resize', scheduleBubbleMeasure, { passive: true });
  window.addEventListener('orientationchange', scheduleBubbleMeasure, { passive: true });
  viewport?.addEventListener('resize', scheduleBubbleMeasure, { passive: true });

  const form = document.querySelector('[data-s-check-composer]');
  form?.addEventListener('submit', (event) => event.preventDefault());

  const progressToggle = document.querySelector('[data-s-check-progress-toggle]');
  const progressCard = document.querySelector('[data-s-check-progress-card]');
  const progressCopy = {
    en: {
      current: 'Your Current Progress',
      question: 'Question',
      section: 'Section',
      totalSections: 'Total Sections',
      totalQuestions: 'Total Questions',
      show: 'Show progress',
      hide: 'Hide progress'
    },
    ar: {
      current: 'تقدمك الحالي هو',
      question: 'السؤال',
      section: 'القسم',
      totalSections: 'عدد الاقسام الاجمالي',
      totalQuestions: 'عدد الاسئلة الاجمالي',
      show: 'عرض التقدم',
      hide: 'إخفاء التقدم'
    }
  };
  const getProgressData = () => {
    if (assessment) {
      const item = getAssessmentItem();
      const lastSection = assessment.sections.at(-1);
      return {
        demo: false,
        sectionNumber: item?.section.number || lastSection?.number || 0,
        sectionName: item?.section.name || lastSection?.name || { en: '', ar: '' },
        totalSections: assessment.sections.length,
        currentQuestion: Math.min(assessmentState.cursor + 1, assessmentQuestionTotal),
        totalQuestions: assessmentQuestionTotal,
        question: item?.question?.prompt?.en || ''
      };
    }
    const supplied = window.ooxmeProgress && typeof window.ooxmeProgress === 'object' ? window.ooxmeProgress : {};
    const suppliedSectionName = supplied.sectionName || {};
    const sectionNumber = supplied.sectionNumber ?? 0;
    const currentQuestion = Number(supplied.currentQuestion ?? 0);
    const totalQuestions = Number(supplied.totalQuestions ?? 0);
    const totalSections = Number(supplied.totalSections ?? 0);
    return {
      demo: false,
      sectionNumber,
      sectionName: typeof suppliedSectionName === 'string' ? { en: suppliedSectionName, ar: suppliedSectionName } : suppliedSectionName,
      totalSections: Number.isFinite(totalSections) ? totalSections : 0,
      currentQuestion: Number.isFinite(currentQuestion) ? currentQuestion : 0,
      totalQuestions: Number.isFinite(totalQuestions) ? totalQuestions : 0,
      question: supplied.question || ''
    };
  };
  const renderProgress = () => {
    if (!progressCard) return;
    const language = root.lang === 'en' ? 'en' : 'ar';
    const labels = progressCopy[language];
    const progress = getProgressData();
    progressCard.lang = language;
    progressCard.dir = language === 'ar' ? 'rtl' : 'ltr';
    progressCard.setAttribute('aria-label', `${labels.question} ${progress.currentQuestion} - ${labels.section} ${progress.sectionNumber}`);
    progressCard.querySelector('[data-s-check-progress-kicker]').textContent = labels.current;
    progressCard.querySelector('[data-s-check-progress-question-label]').textContent = labels.question;
    progressCard.querySelector('[data-s-check-progress-question-number]').textContent = progress.currentQuestion;
    progressCard.querySelector('[data-s-check-progress-section-label]').textContent = labels.section;
    progressCard.querySelector('[data-s-check-progress-section-number]').textContent = progress.sectionNumber;
    progressCard.querySelector('[data-s-check-progress-total-sections-label]').textContent = labels.totalSections;
    progressCard.querySelector('[data-s-check-progress-total-sections]').textContent = progress.totalSections;
    progressCard.querySelector('[data-s-check-progress-total-questions-label]').textContent = labels.totalQuestions;
    progressCard.querySelector('[data-s-check-progress-total-questions]').textContent = progress.totalQuestions;
  };
  const setProgressOpen = (open) => {
    if (!progressToggle || !progressCard || !optionsPanel) return;
    const lockedHeight = getProgressLockHeight();
    if (open) {
      optionsPanel.hidden = false;
      optionsPanel.style.height = `${lockedHeight}px`;
      setCheckVar('--s-check-options-panel-height', `${lockedHeight}px`);
    }
    body?.classList.toggle('is-progress-open', open);
    progressToggle.setAttribute('aria-expanded', String(open));
    progressToggle.setAttribute('aria-label', (root.lang === 'en' ? progressCopy.en : progressCopy.ar)[open ? 'hide' : 'show']);
    renderProgress();
    progressCard.setAttribute('aria-hidden', String(!open));
    optionsPanel.querySelector('.s-check-options-panel-list')?.setAttribute('aria-hidden', String(open));
    optionsPanel.classList.toggle('is-progress-mode', open);
    if (!open) {
      optionsPanel.style.height = 'auto';
      const optionsHeight = Math.ceil(optionsPanel.getBoundingClientRect().height);
      if (optionsHeight > 0) {
        optionsPanel.style.height = `${optionsHeight}px`;
        setCheckVar('--s-check-options-panel-height', `${optionsHeight}px`);
      }
    }
  };
  progressToggle?.addEventListener('click', () => setProgressOpen(!body?.classList.contains('is-progress-open')));

  const testBubble = document.querySelector('[data-s-check-test-bubble]');
  const optionsPanel = document.querySelector('[data-s-check-options-panel]');
  const testOptions = [...document.querySelectorAll('[data-s-check-test-option]')];
  const assessment = window.OOXME_ASSESSMENT;
  const assessmentState = {
    cursor: 0,
    answers: new Map(),
    history: [],
    transitioning: false,
    transitionTimer: null,
    commitTimer: null
  };
  const assessmentQuestionTotal = assessment ? assessment.sections.reduce((total, section) => total + section.questions.length, 0) : 0;
  let optionsPanelMeasureFrame = 0;
  let firstOptionsPanelHeight = 0;
  const getAssessmentItem = (cursor = assessmentState.cursor) => {
    if (!assessment) return null;
    let offset = cursor;
    for (const section of assessment.sections) {
      if (offset < section.questions.length) return { section, question: section.questions[offset], index: cursor };
      offset -= section.questions.length;
    }
    return null;
  };
  const getAssessmentLabel = (language, kind, number) => {
    const labels = language === 'ar'
      ? { question: 'السؤال', option: 'الخيار', complete: 'اكتمل التقييم' }
      : { question: 'Question', option: 'Option', complete: 'Assessment complete' };
    return `${labels[kind]} ${number}`;
  };
  const getAssessmentQuestionText = (language, item) => item?.question?.prompt?.[language] || getAssessmentLabel(language, 'question', item.index + 1);
  const getAssessmentOptionText = (language, option) => option?.label?.[language] || getAssessmentLabel(language, 'option', option.number);
  const syncOptionsPanelGeometry = () => {
    if (!optionsPanel) return 0;
    const viewport = document.querySelector('[data-s-check-viewport]');
    const leftControl = document.querySelector('[data-s-check-progress-toggle]');
    const rightControl = document.querySelector('.s-check-composer-send');
    if (!viewport || !leftControl || !rightControl) return 0;
    const viewportRect = viewport.getBoundingClientRect();
    const leftRect = leftControl.getBoundingClientRect();
    const rightRect = rightControl.getBoundingClientRect();
    const leftCenter = leftRect.left + (leftRect.width / 2) - viewportRect.left;
    const rightCenter = rightRect.left + (rightRect.width / 2) - viewportRect.left;
    const approvedMaximum = Math.max(0, rightCenter - leftCenter);
    optionsPanel.style.left = `${Math.round((leftCenter + rightCenter) / 2)}px`;
    optionsPanel.style.right = 'auto';
    optionsPanel.style.width = `${Math.floor(approvedMaximum)}px`;
    optionsPanel.style.maxWidth = `${Math.floor(approvedMaximum)}px`;
    optionsPanel.dataset.sCheckGeometryReady = 'true';
    return approvedMaximum;
  };
  const renderAssessmentOptions = (language, item, { disabled = false, preserveSelection = false } = {}) => {
    if (!optionsPanel || !item) return;
    optionsPanel.lang = language;
    optionsPanel.dir = language === 'ar' ? 'rtl' : 'ltr';
    optionsPanel.setAttribute('aria-hidden', 'false');
    optionsPanel.hidden = false;
    testOptions.forEach((optionNode, index) => {
      const option = item.question.options[index];
      optionNode.disabled = disabled;
      optionNode.querySelector('[data-s-check-test-option-label]').textContent = getAssessmentOptionText(language, option);
      if (!preserveSelection) {
        optionNode.setAttribute('aria-checked', 'false');
        optionNode.classList.remove('is-selected', 'is-unselected-fading', 'is-selected-fading');
      }
    });
  };
  const measureOptionsPanelHeight = () => {
    if (!optionsPanel) return;
    syncOptionsPanelGeometry();
    if (body?.classList.contains('is-progress-open') || optionsPanel.classList.contains('is-progress-mode')) {
      const lockedHeight = optionsPanel.getBoundingClientRect().height;
      if (lockedHeight > 0) {
        optionsPanel.style.height = `${lockedHeight}px`;
        setCheckVar('--s-check-options-panel-height', `${lockedHeight}px`);
      }
      return;
    }
    optionsPanel.style.height = 'auto';
    const height = optionsPanel.getBoundingClientRect().height;
    if (height > 0) {
      setCheckVar('--s-check-options-panel-height', `${height}px`);
      if (assessmentState.cursor === 0 && !body?.classList.contains('is-progress-open')) {
        firstOptionsPanelHeight = height;
      }
    }
  };
  const getProgressLockHeight = () => {
    const visibleOptionsHeight = optionsPanel.hidden || optionsPanel.classList.contains('is-progress-mode')
      ? 0
      : optionsPanel.getBoundingClientRect().height;
    const cssHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue('--s-check-options-panel-height')) || 0;
    return visibleOptionsHeight || firstOptionsPanelHeight || cssHeight || 148;
  };
  const scheduleOptionsPanelMeasure = () => {
    if (optionsPanelMeasureFrame) return;
    optionsPanelMeasureFrame = window.requestAnimationFrame(() => {
      optionsPanelMeasureFrame = 0;
      measureOptionsPanelHeight();
    });
  };
  const historyNode = document.querySelector('[data-s-check-assessment-history]');
  const historyList = historyNode?.querySelector('[data-s-check-history-list]');
  const currentAssessmentFace = document.querySelector('[data-s-check-test-face]');
  const stagedAnswer = document.querySelector('[data-s-check-staged-answer]');
  const stagedAnswerText = stagedAnswer?.querySelector('[data-s-check-staged-answer-text]');
  const liveTurn = document.createElement('div');
  liveTurn.className = 's-check-live-turn';
  if (currentAssessmentFace && testBubble) liveTurn.append(currentAssessmentFace, testBubble);
  if (historyNode) historyNode.append(liveTurn, stagedAnswer);
  const conversationScrollController = {
    scrollToLatestInstant() {
      if (!historyNode) return;
      historyNode.scrollTop = Math.max(0, historyNode.scrollHeight - historyNode.clientHeight);
    }
  };
  const setAssessmentFlipKeys = (item) => {
    const questionId = item?.question?.id || 'assessment-complete';
    if (currentAssessmentFace) currentAssessmentFace.dataset.sCheckFlipKey = `${questionId}:oxo-face`;
    if (testBubble) testBubble.dataset.sCheckFlipKey = `${questionId}:question`;
  };
  const updateStagedAnswer = (language, previous) => {
    if (!stagedAnswer || !stagedAnswerText || !previous) return;
    const questionId = previous.question.id;
    stagedAnswer.lang = language;
    // Keep the physical answer row LTR so the bubble/avatar order stays
    // identical to the committed user row; the text node still owns RTL/LTR.
    stagedAnswer.dir = 'ltr';
    stagedAnswerText.lang = language;
    stagedAnswerText.dir = language === 'ar' ? 'rtl' : 'ltr';
    stagedAnswerText.textContent = getAssessmentOptionText(language, previous.option);
    const answerBubble = stagedAnswer.querySelector('[data-s-check-staged-answer-text]');
    const answerFace = stagedAnswer.querySelector('.s-check-staged-answer-face');
    stagedAnswer.dataset.sCheckFlipKey = `${questionId}:answer-row`;
    answerBubble?.removeAttribute('data-s-check-flip-key');
    answerFace?.removeAttribute('data-s-check-flip-key');
  };
  const captureConversationLayout = () => {
    const layout = new Map();
    historyNode?.querySelectorAll('[data-s-check-flip-key]').forEach((node) => {
      const key = node.dataset.sCheckFlipKey;
      if (key) layout.set(key, node.getBoundingClientRect());
    });
    return layout;
  };
  let activeFlipNodes = [];
  let activeFlipFrame = 0;
  let activeFlipTimer = 0;
  cancelActiveConversationFlip = () => {
    if (activeFlipFrame) window.cancelAnimationFrame(activeFlipFrame);
    if (activeFlipTimer) window.clearTimeout(activeFlipTimer);
    activeFlipFrame = 0;
    activeFlipTimer = 0;
    activeFlipNodes.forEach(({ node }) => {
      node.style.removeProperty('transition');
      node.style.removeProperty('transform');
      node.style.removeProperty('opacity');
    });
    activeFlipNodes = [];
  };
  const animateConversationLayout = (beforeLayout) => {
    if (!historyNode || !beforeLayout) return;
    cancelActiveConversationFlip();
    conversationScrollController.scrollToLatestInstant();
    const animatedNodes = [];
    historyNode.querySelectorAll('[data-s-check-flip-key]').forEach((node) => {
      const key = node.dataset.sCheckFlipKey;
      if (!key) return;
      const before = beforeLayout.get(key);
      const after = node.getBoundingClientRect();
      const dx = before ? before.left - after.left : 0;
      const dy = before ? before.top - after.top : 14;
      node.style.transition = 'none';
      node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      if (!before) node.style.opacity = '0';
      animatedNodes.push({ node, entering: !before });
    });
    if (!animatedNodes.length) return;
    activeFlipNodes = animatedNodes;
    activeFlipFrame = window.requestAnimationFrame(() => {
      activeFlipFrame = 0;
      animatedNodes.forEach(({ node, entering }) => {
        node.style.transition = 'transform .32s cubic-bezier(.22, .61, .36, 1), opacity .22s ease';
        node.style.transform = 'translate3d(0, 0, 0)';
        if (entering) node.style.opacity = '1';
      });
      activeFlipTimer = window.setTimeout(() => {
        cancelActiveConversationFlip();
      }, 380);
    });
  };
  const renderAssessmentHistory = (language) => {
    if (!historyList) return;
    historyNode?.classList.toggle('has-history', assessmentState.history.length > 0);
    historyList.innerHTML = assessmentState.history.map((previous) => `
      <div class="s-check-assessment-turn">
        <div class="s-check-assessment-oxo-row">
          <div class="s-check-assessment-oxo-face s-page__icon-button" data-s-check-flip-key="${previous.question.id}:oxo-face" aria-hidden="true"><svg class="s-page__x-top-bar-eyes" viewBox="0 0 13 13" aria-hidden="true" focusable="false"><g class="s-page__x-face-shell"><g class="s-page__x-face-eyes"><g class="s-page__x-face-eye-motion"><circle cx="3.75" cy="6.5" r="1.85" /><circle cx="9.25" cy="6.5" r="1.85" /></g></g></g></svg></div>
          <div class="s-check-ooxo-bubble s-check-assessment-oxo-bubble" data-s-check-flip-key="${previous.question.id}:question" data-s-check-bubble="history-oxo" lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">${getAssessmentQuestionText(language, { question: previous.question, index: previous.index })}</div>
        </div>
        <div class="s-check-assessment-user-row" data-s-check-flip-key="${previous.question.id}:answer-row">
          <div class="s-check-ooxo-bubble s-check-assessment-user-bubble" data-s-check-bubble="history-user" lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">${getAssessmentOptionText(language, previous.option)}</div>
          <div class="s-check-assessment-user-face s-page__icon-button" aria-hidden="true"><span class="s-check-user-avatar-initial">A</span></div>
        </div>
      </div>
    `).join('');
  };
  const renderAssessment = () => {
    if (!assessment || !testBubble) return;
    const language = root.lang === 'en' ? 'en' : 'ar';
    if (assessmentState.transitioning) {
      const previous = assessmentState.history.at(-1);
      setAssessmentFlipKeys({ question: previous.question });
      testBubble.lang = language;
      testBubble.dir = language === 'ar' ? 'rtl' : 'ltr';
      testBubble.querySelector('[data-s-check-test-question]').textContent = getAssessmentQuestionText(language, { question: previous.question, index: previous.index });
      updateStagedAnswer(language, previous);
      renderAssessmentOptions(language, { question: previous.question }, { disabled: true, preserveSelection: true });
      renderProgress();
      scheduleOptionsPanelMeasure();
      return;
    }
    const item = getAssessmentItem();
    const questionNode = testBubble.querySelector('[data-s-check-test-question]');
    const labels = language === 'ar' ? { complete: 'اكتمل التقييم' } : { complete: 'Assessment complete' };
    if (item) {
      setAssessmentFlipKeys(item);
      questionNode.textContent = getAssessmentQuestionText(language, item);
      renderAssessmentOptions(language, item);
      scheduleOptionsPanelMeasure();
    } else {
      setAssessmentFlipKeys(null);
      questionNode.textContent = labels.complete;
      optionsPanel?.setAttribute('aria-hidden', 'true');
      if (optionsPanel) optionsPanel.hidden = true;
    }
    renderAssessmentHistory(language);
    testBubble.lang = language;
    testBubble.dir = language === 'ar' ? 'rtl' : 'ltr';
    renderProgress();
    scheduleBubbleMeasure();
  };
  const recordAssessmentAnswer = (optionIndex) => {
    if (assessmentState.transitioning) return;
    const item = getAssessmentItem();
    if (!item) return;
    const option = item.question.options[optionIndex];
    if (!option) return;
    if (assessmentState.answers.has(item.question.id)) return;
    assessmentState.answers.set(item.question.id, option.id);
    assessmentState.history.push({ index: item.index, question: item.question, option });
    assessmentState.transitioning = true;
    const language = root.lang === 'en' ? 'en' : 'ar';
    testBubble.querySelector('[data-s-check-test-question]').textContent = getAssessmentQuestionText(language, item);
    testOptions.forEach((optionNode, index) => {
      optionNode.disabled = true;
      optionNode.setAttribute('aria-checked', String(index === optionIndex));
      optionNode.classList.toggle('is-selected', index === optionIndex);
      optionNode.classList.toggle('is-unselected-fading', index !== optionIndex);
      optionNode.classList.remove('is-selected-fading');
    });
    optionsPanel?.classList.add('is-options-selecting');
    updateStagedAnswer(language, assessmentState.history.at(-1));
    scheduleBubbleMeasure();
    window.clearTimeout(assessmentState.transitionTimer);
    assessmentState.transitionTimer = window.setTimeout(() => {
      testOptions[optionIndex]?.classList.add('is-selected-fading');
      stagedAnswer?.classList.add('is-visible');
    }, 260);
    window.clearTimeout(assessmentState.commitTimer);
    assessmentState.commitTimer = window.setTimeout(() => {
      const beforeLayout = captureConversationLayout();
      assessmentState.cursor += 1;
      assessmentState.transitioning = false;
      stagedAnswer?.classList.remove('is-visible');
      optionsPanel?.classList.remove('is-options-selecting');
      renderAssessment();
      optionsPanel?.classList.add('is-options-entering');
      animateConversationLayout(beforeLayout);
      window.setTimeout(() => optionsPanel?.classList.remove('is-options-entering'), 520);
    }, 500);
  };
  testOptions.forEach((option) => {
    option.addEventListener('click', () => recordAssessmentAnswer(testOptions.indexOf(option)));
  });

  const copy = {
    en: { placeholder: 'Type...' },
    ar: { placeholder: 'اكتب...' }
  };
  const applyCopy = () => {
    const language = root.lang === 'en' ? 'en' : 'ar';
    const labels = copy[language];
    const input = form?.querySelector('input');
    const bubbles = [...document.querySelectorAll('[data-s-check-bubble]')];
    if (testBubble) {
      testBubble.lang = language;
      testBubble.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
    if (input) {
      input.placeholder = labels.placeholder;
      input.lang = language;
      input.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
    bubbles.forEach((bubble) => {
      bubble.lang = language;
      bubble.dir = language === 'ar' ? 'rtl' : 'ltr';
    });
    scheduleBubbleMeasure();
    renderAssessment();
    scheduleOptionsPanelMeasure();
    if (progressToggle) progressToggle.setAttribute('aria-label', (root.lang === 'en' ? progressCopy.en : progressCopy.ar)[body?.classList.contains('is-progress-open') ? 'hide' : 'show']);
  };
  applyCopy();
  measureOptionsPanelHeight();
  document.fonts?.ready.then(() => {
    scheduleBubbleMeasure();
    scheduleOptionsPanelMeasure();
  });
  window.addEventListener('resize', scheduleOptionsPanelMeasure, { passive: true });
  window.addEventListener('orientationchange', scheduleOptionsPanelMeasure, { passive: true });
  viewport?.addEventListener('resize', scheduleOptionsPanelMeasure, { passive: true });
  if ('ResizeObserver' in window) {
    const panelGeometryObserver = new ResizeObserver(scheduleOptionsPanelMeasure);
    const composerRow = document.querySelector('[data-s-check-composer]');
    if (composerRow) panelGeometryObserver.observe(composerRow);
    if (progressToggle) panelGeometryObserver.observe(progressToggle);
    const composerSend = document.querySelector('.s-check-composer-send');
    if (composerSend) panelGeometryObserver.observe(composerSend);
  }
  if (historyNode && 'MutationObserver' in window) {
    const conversationObserver = new MutationObserver(scheduleBubbleMeasure);
    conversationObserver.observe(historyNode, { childList: true, subtree: true, characterData: true });
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
