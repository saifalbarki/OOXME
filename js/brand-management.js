(() => {
  'use strict';

  const page = document.querySelector('.s-page--brand-management');
  const content = document.querySelector('.s-page__content');
  const composer = document.querySelector('[data-s-composer]');
  const menu = document.querySelector('[data-s-composer-menu]');
  const utilities = document.querySelector('[data-s-send-utilities]');
  const addButton = document.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  const themeButton = document.querySelector('[data-s-utility="theme"]');
  const languageButton = document.querySelector('[data-s-utility="language"]');
  const firstGroup = document.querySelector('[data-s-first-group]');
  const title = document.querySelector('[data-s-first-typewriter]');
  const output = document.querySelector('[data-s-first-typewriter-output]');
  const textTwo = document.querySelector('[data-s-brand-text-two]');
  const textTwoOutput = document.querySelector('[data-s-brand-text-two-output]');
  const textThree = document.querySelector('[data-s-brand-text-three]');
  const textThreeOutput = document.querySelector('[data-s-brand-text-three-output]');
  const sectionTwoGroup = document.querySelector('[data-s-section-two-group]');
  const sectionTwoTitle = document.querySelector('[data-s-section-two-primary]');
  const sectionTwoTitleOutput = document.querySelector('[data-s-section-two-primary-output]');
  const sectionTwoHero = document.querySelector('[data-s-section-two-hero]');
  const sectionTwoHeroCursor = document.querySelector('[data-s-section-two-hero-cursor]');
  const serviceBoxes = Array.from(document.querySelectorAll('[data-s-service-box]'));
  const serviceStack = document.querySelector('.s-page__brand-management-service-stack');
  const serviceTitles = Array.from(document.querySelectorAll('[data-s-service-title]'));
  const serviceDescriptions = Array.from(document.querySelectorAll('[data-s-service-description]'));
  const serviceItemGroups = serviceBoxes.map((box) => Array.from(box.querySelectorAll('[data-s-service-item]')));
  const consultationTitle = document.querySelector('#brand-management-consultation-title');
  const consultationDescription = document.querySelector('.s-page__flow-group--consultation .s-page__group-description');
  const sectionOneCta = document.querySelector('[data-s-section-one-consultation-cta]');
  const sectionOneNextCopy = document.querySelector('[data-s-section-one-next-copy]');
  const sectionTwoCta = document.querySelector('[data-s-section-two-next-cta]');
  const sectionTwoNextCopy = document.querySelector('[data-s-section-two-next-copy]');
  const consultationCta = document.querySelector('[data-s-consultation-cta]');
  const majorSections = Array.from(document.querySelectorAll('[data-s-major-section]'));
  const menuItems = Array.from(document.querySelectorAll('.s-page__composer-menu-item'));
  if (!page || !content || !composer || !menu || !utilities || !addButton || !submitButton || !themeButton || !languageButton || !firstGroup || !title || !output || !textTwo || !textTwoOutput || !textThree || !textThreeOutput || !sectionTwoGroup || !sectionTwoTitle || !sectionTwoTitleOutput || !sectionTwoHero || !sectionTwoHeroCursor || !serviceStack || serviceBoxes.length !== 4 || serviceTitles.length !== 4 || serviceDescriptions.length !== 4 || serviceItemGroups.some((items) => items.length !== 4) || !sectionOneCta || !sectionOneNextCopy || !sectionTwoCta || !sectionTwoNextCopy || !consultationCta) return;

  const copy = {
    en: {
      menu: ['The Brand Management', 'The Gallery', 'The Consultation', 'The Store', 'Contact'],
      services: ['What do you get?'],
      serviceBoxes: [
        ['Core Brand Management', 'Integrated management and development of the brand to ensure clarity, consistency, and strong market positioning.', ['Brand Strategy & Positioning', 'Brand Identity Development', 'Monthly Brand Planning', 'Brand Performance Review']],
        ['Growth & Business Development', 'Developing the commercial side of the brand and building stronger opportunities for growth, sales, and expansion.', ['Business Development & Executive Consulting', 'Sales System Development', 'Offer Development', 'Customer Journey Development']],
        ['Content & Market Presence', 'Building a consistent and professional brand presence through content, production, and stronger market communication.', ['Social Media Management & Content Strategy', 'Photography & Videography', 'Creative Direction', 'Campaign Management']],
        ['Digital & Operational Support', 'Developing the digital and operational foundation the brand needs to work efficiently and scale with greater control.', ['Website & Digital Ecosystem', 'Business Verification & HR Support', 'Internal Systems Development', 'VIP Support & Dedicated Account Manager']]
      ],
      consultation: ['Are you ready?', 'Book a consultation to discuss your brand, priorities, and the right next step.', 'Book a Consultation'],
      sectionOneNext: 'Next: What will you get?',
      sectionTwoNext: 'Next: How do you start?',
      switchToArabic: 'Switch to Arabic', switchToEnglish: 'Switch to English',
      switchToDay: 'Switch to Day Mode', switchToDark: 'Switch to Dark Mode'
    },
    ar: {
      menu: ['إدارة العلامة التجارية', 'المعرض', 'الاستشارة', 'المتجر', 'تواصل'],
      services: ['ما الذي تحصل عليه؟'],
      serviceBoxes: [
        ['إدارة العلامة التجارية الأساسية', 'إدارة وتطوير متكاملان للعلامة التجارية لضمان الوضوح والاتساق ومكانة قوية في السوق.', ['استراتيجية وتموضع العلامة التجارية', 'تطوير هوية العلامة التجارية', 'التخطيط الشهري للعلامة التجارية', 'مراجعة أداء العلامة التجارية']],
        ['النمو وتطوير الاعمال', 'تطوير الجانب التجاري للعلامة وبناء فرص اقوى للنمو والمبيعات والتوسع.', ['تطوير الاعمال والاستشارات التنفيذية', 'تطوير نظام المبيعات', 'تطوير العروض', 'تطوير رحلة العميل']],
        ['المحتوى والحضور في السوق', 'بناء حضور ثابت واحترافي للعلامة من خلال المحتوى والانتاج وتواصل اقوى مع السوق.', ['ادارة التواصل الاجتماعي واستراتيجية المحتوى', 'التصوير الفوتوغرافي والفيديو', 'التوجيه الابداعي', 'ادارة الحملات']],
        ['الدعم الرقمي والتشغيلي', 'تطوير الاساس الرقمي والتشغيلي الذي تحتاجه العلامة للعمل بكفاءة والتوسع بتحكم اكبر.', ['الموقع والمنظومة الرقمية', 'دعم توثيق الاعمال والموارد البشرية', 'تطوير الانظمة الداخلية', 'دعم VIP ومدير حساب مخصص']]
      ],
      consultation: ['هل انت جاهز؟', 'احجز استشارة لمناقشة علامتك واولوياتك والخطوة التالية المناسبة.', 'احجز استشارة'],
      sectionOneNext: 'التالي: ما الذي ستحصل عليه؟',
      sectionTwoNext: 'التالي: كيف تبدأ؟',
      switchToArabic: 'التبديل الى العربية', switchToEnglish: 'التبديل الى الانجليزية',
      switchToDay: 'التبديل الى الوضع النهاري', switchToDark: 'التبديل الى الوضع الداكن'
    }
  };
  const sequence = {
    en: [
      'What is Brand Management?',
      'A premium, integrated service that goes far beyond marketing, photography, and advertising. These are only small parts of a broader system designed to develop businesses, companies, and projects into stronger, clearer, and more scalable brands. We build precise systems across management, presence, content, sales, customer experience, and growth to increase revenue, strengthen market reach, and establish a more powerful brand position built to scale locally and globally.',
      "Iraq's one and only brand management"
    ],
    ar: [
      'ما هي ادارة العلامة التجارية؟',
      'خدمة متكاملة ومتميزة تتجاوز بكثير التسويق والتصوير والاعلان. فهذه مجرد اجزاء صغيرة من نظام اوسع صمم لتطوير الاعمال والشركات والمشاريع وتحويلها الى علامات تجارية اقوى واوضح واكثر قابلية للتوسع. نبني انظمة دقيقة في الادارة والحضور والمحتوى والمبيعات وتجربة العميل والنمو لزيادة الايرادات، وتوسيع الوصول الى السوق، وبناء مكانة اقوى للعلامة التجارية وقابلة للتوسع محليا وعالميا.',
      'ادارة العلامة التجارية الواحد والوحيد في العراق'
    ]
  };
  let typeTimer = 0;
  let typeRun = 0;
  let sectionTwoHeroTimer = 0;
  let sectionTwoHeroRun = 0;
  let sectionTwoHeroLanguage = '';
  let baselineFrame = 0;
  let nextTextBaselineFrame = 0;
  let serviceStackFrame = 0;
  let baselineLocked = false;
  let sectionInputLocked = false;
  let sectionUnlockTimer = 0;
  let touchStart = null;
  const descriptionTypingDuration = 5000;

  document.documentElement.classList.add('s-x-discrete-sections');

  const schedule = (callback, delay, run) => {
    typeTimer = window.setTimeout(() => { if (run === typeRun) callback(); }, delay);
  };

  const syncDescriptionCursor = (stageOutput, cursor) => {
    if (!cursor) return;
    const range = document.createRange();
    range.selectNodeContents(stageOutput);
    const lineRects = Array.from(range.getClientRects());
    const lineRect = lineRects.at(-1);
    const runRect = cursor.parentElement?.getBoundingClientRect();
    if (!lineRect || !runRect) return;
    const cursorStyle = getComputedStyle(cursor);
    const gap = (Number.parseFloat(cursorStyle.getPropertyValue('--s-first-typewriter-cursor-gap')) || 0) * (Number.parseFloat(cursorStyle.fontSize) || 0);
    const isRtl = stageOutput.dir === 'rtl';
    const cursorX = isRtl
      ? lineRect.left - runRect.left - gap - cursor.getBoundingClientRect().width
      : lineRect.right - runRect.left + gap;
    cursor.style.insetInlineStart = 'auto';
    cursor.style.insetInlineEnd = 'auto';
    cursor.style.insetBlockStart = 'auto';
    cursor.style.left = `${cursorX.toFixed(3)}px`;
    cursor.style.top = `${(lineRect.top - runRect.top + (lineRect.height / 2)).toFixed(3)}px`;
  };

  const startSectionTwoHero = (force = false) => {
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    if (!force && sectionTwoHeroLanguage === language && sectionTwoHero.classList.contains('is-hero-complete')) return;
    window.clearTimeout(sectionTwoHeroTimer);
    sectionTwoHeroRun += 1;
    const run = sectionTwoHeroRun;
    const phrase = copy[language].services[0];
    let characterIndex = 0;
    sectionTwoHeroLanguage = language;
    sectionTwoHero.lang = language;
    sectionTwoHero.dir = 'ltr';
    sectionTwoTitleOutput.lang = language;
    sectionTwoTitleOutput.dir = language === 'ar' ? 'rtl' : 'ltr';
    sectionTwoTitleOutput.textContent = '';
    sectionTwoHero.classList.remove('is-cursor-visible', 'is-typewriter-prelude', 'is-hero-complete');
    sectionTwoHero.classList.add('is-cursor-visible', 'is-typewriter-prelude');
    const typeCharacter = () => {
      if (run !== sectionTwoHeroRun) return;
      characterIndex += 1;
      sectionTwoTitleOutput.textContent = phrase.slice(0, characterIndex);
      if (characterIndex < phrase.length) {
        sectionTwoHeroTimer = window.setTimeout(typeCharacter, 52);
        return;
      }
      sectionTwoHero.classList.remove('is-cursor-visible');
      sectionTwoHero.classList.add('is-hero-complete');
    };
    sectionTwoHeroTimer = window.setTimeout(() => {
      if (run !== sectionTwoHeroRun) return;
      sectionTwoHero.classList.remove('is-typewriter-prelude');
      typeCharacter();
    }, 1000);
  };

  const startTypewriter = () => {
    window.clearTimeout(typeTimer);
    typeRun += 1;
    const run = typeRun;
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const stages = [
      { element: title, output, phrase: sequence[language][0] },
      { element: textThree, output: textThreeOutput, phrase: sequence[language][1] },
      { element: textTwo, output: textTwoOutput, phrase: sequence[language][2] }
    ];
    stages.forEach((stage) => {
      stage.element.lang = language;
      stage.element.dir = language === 'ar' ? 'rtl' : 'ltr';
      stage.output.lang = language;
      stage.output.dir = language === 'ar' ? 'rtl' : 'ltr';
      stage.output.textContent = '';
      stage.element.classList.remove('is-cursor-visible', 'is-typewriter-prelude');
    });
    sectionOneCta.classList.remove('is-revealed');
    const typeStage = (stageIndex) => {
      const stage = stages[stageIndex];
      if (!stage) return;
      const { element, output: stageOutput, phrase } = stage;
      const isDescription = stage.element === textThree;
      const descriptionCursor = isDescription ? element.querySelector('[data-s-brand-text-three-cursor]') : null;
      if (descriptionCursor) {
        descriptionCursor.style.removeProperty('inset-inline-start');
        descriptionCursor.style.removeProperty('inset-inline-end');
        descriptionCursor.style.removeProperty('inset-block-start');
        descriptionCursor.style.removeProperty('left');
        descriptionCursor.style.removeProperty('top');
      }
      const interval = isDescription
        ? descriptionTypingDuration / Math.max(1, phrase.length - 1)
        : 52;
      let characterIndex = 0;
      element.classList.add('is-cursor-visible', 'is-typewriter-prelude');
      let stageStartedAt = 0;
      const typeCharacter = () => {
        if (isDescription) {
          const elapsed = performance.now() - stageStartedAt;
          const progressCharacters = Math.floor((elapsed / descriptionTypingDuration) * phrase.length);
          characterIndex = Math.min(phrase.length, Math.max(characterIndex + 1, progressCharacters));
        } else {
          characterIndex += 1;
        }
        stageOutput.textContent = phrase.slice(0, characterIndex);
        if (isDescription) syncDescriptionCursor(stageOutput, descriptionCursor);
        if (characterIndex < phrase.length) {
          const nextDelay = isDescription
            ? Math.max(0, Math.min(16, descriptionTypingDuration - (performance.now() - stageStartedAt)))
            : interval;
          return schedule(typeCharacter, nextDelay, run);
        }
        element.classList.remove('is-cursor-visible');
        if (stageIndex === stages.length - 1) {
          schedule(() => sectionOneCta.classList.add('is-revealed'), 1000, run);
          return;
        }
        schedule(() => typeStage(stageIndex + 1), 180, run);
      };
      schedule(() => {
        element.classList.remove('is-typewriter-prelude');
        stageStartedAt = performance.now();
        typeCharacter();
      }, 1000, run);
    };
    typeStage(0);
  };

  const syncTextGeometry = () => {
    const menuRect = menu.getBoundingClientRect();
    if (!menuRect.width) return;
    const style = getComputedStyle(menu);
    const borderStart = Number.parseFloat(style.borderInlineStartWidth) || 0;
    const borderEnd = Number.parseFloat(style.borderInlineEndWidth) || 0;
    const paddingStart = Number.parseFloat(style.paddingInlineStart) || 0;
    const paddingEnd = Number.parseFloat(style.paddingInlineEnd) || 0;
    const textWidth = Math.max(0, menuRect.width - borderStart - borderEnd - paddingStart - paddingEnd - 16);
    const inlineOffset = document.documentElement.lang === 'ar'
      ? borderEnd + paddingEnd + 8
      : borderStart + paddingStart + 8;
    [firstGroup, sectionTwoGroup].forEach((group) => {
      group.style.setProperty('--s-x-first-group-text-width', `${textWidth.toFixed(3)}px`);
      group.style.setProperty('--s-x-first-group-text-inline-offset', `${inlineOffset.toFixed(3)}px`);
    });
  };

  const syncBaseline = () => {
    baselineFrame = 0;
    if (baselineLocked) return;
    const topBar = composer.getBoundingClientRect();
    const titleRect = title.getBoundingClientRect();
    const x = topBar.top;
    const expectedTop = topBar.bottom + (x * 2);
    firstGroup.setAttribute('data-s-first-group-baseline', expectedTop.toFixed(3));
    firstGroup.setAttribute('data-s-first-group-bottom', titleRect.bottom.toFixed(3));
    firstGroup.setAttribute('data-s-first-group-baseline-difference', (titleRect.top - expectedTop).toFixed(3));
    baselineLocked = true;
  };

  const setLocalizedText = (element, value) => {
    const fragment = document.createDocumentFragment();
    value.split('\n').forEach((line) => {
      const lineElement = document.createElement('span');
      lineElement.className = 's-page__reveal-line';
      lineElement.textContent = line;
      fragment.appendChild(lineElement);
    });
    element.replaceChildren(fragment);
  };

  const measureLocalizedTextHeight = (element, value, language) => {
    const width = element.getBoundingClientRect().width;
    if (!width) return 0;
    const probe = element.cloneNode(false);
    probe.removeAttribute('id');
    probe.removeAttribute('data-s-reveal');
    probe.lang = language;
    probe.dir = language === 'ar' ? 'rtl' : 'ltr';
    probe.style.cssText = `position:fixed;inset:0 auto auto -10000px;width:${width}px;max-width:none;height:auto;min-height:0;margin:0;opacity:1;filter:none;clip-path:none;visibility:hidden;pointer-events:none;transition:none;font-family:${language === 'ar' ? 'OOXMETosh, OOXMEScript, Arial, sans-serif' : 'OOXMEScript, OOXMEEnglish, Arial, sans-serif'};`;
    setLocalizedText(probe, value);
    document.body.appendChild(probe);
    const height = probe.getBoundingClientRect().height;
    probe.remove();
    return height;
  };

  const syncConsultationGeometry = () => {
    if (!consultationTitle || !consultationDescription) return;
    ['height'].forEach((property) => {
      consultationTitle.style.removeProperty(property);
      consultationDescription.style.removeProperty(property);
    });
    const english = copy.en.consultation;
    const arabic = copy.ar.consultation;
    const titleHeight = Math.max(
      measureLocalizedTextHeight(consultationTitle, english[0], 'en'),
      measureLocalizedTextHeight(consultationTitle, arabic[0], 'ar')
    );
    const descriptionHeight = Math.max(
      measureLocalizedTextHeight(consultationDescription, english[1], 'en'),
      measureLocalizedTextHeight(consultationDescription, arabic[1], 'ar')
    );
    if (titleHeight) consultationTitle.style.height = `${Math.ceil(titleHeight)}px`;
    if (descriptionHeight) consultationDescription.style.height = `${Math.ceil(descriptionHeight)}px`;
  };

  const syncNextTextBaselines = () => {
    nextTextBaselineFrame = 0;
    if (majorSections.length !== 3) return;
    const referenceSection = majorSections[2].getBoundingClientRect();
    const referenceBottom = consultationCta.getBoundingClientRect().bottom - referenceSection.top;
    [[sectionOneNextCopy, 0], [sectionTwoNextCopy, 1]].forEach(([copyElement, sectionIndex]) => {
      copyElement.style.setProperty('--s-next-text-baseline-shift', '0px');
      const range = document.createRange();
      range.selectNodeContents(copyElement);
      const rects = Array.from(range.getClientRects());
      if (!rects.length) return;
      const textBottom = Math.max(...rects.map((rect) => rect.bottom));
      const targetBottom = majorSections[sectionIndex].getBoundingClientRect().top + referenceBottom;
      copyElement.style.setProperty('--s-next-text-baseline-shift', `${(targetBottom - textBottom).toFixed(3)}px`);
    });
  };

  const scheduleNextTextBaselineSync = () => {
    if (nextTextBaselineFrame) return;
    nextTextBaselineFrame = window.requestAnimationFrame(syncNextTextBaselines);
  };

  const syncServiceStackDistribution = () => {
    serviceStackFrame = 0;
    const section = majorSections[1];
    if (!section) return;
    const range = document.createRange();
    range.selectNodeContents(sectionTwoNextCopy);
    const textRects = Array.from(range.getClientRects());
    const x = Number.parseFloat(getComputedStyle(serviceStack).rowGap);
    if (!textRects.length || !Number.isFinite(x)) return;
    const nextTextTop = Math.min(...textRects.map((rect) => rect.top));
    const targetBoxFourBottom = nextTextTop - x;
    const sectionRect = section.getBoundingClientRect();
    serviceStack.style.bottom = `${(sectionRect.bottom - targetBoxFourBottom).toFixed(3)}px`;
  };

  const scheduleServiceStackDistribution = () => {
    if (serviceStackFrame) return;
    serviceStackFrame = window.requestAnimationFrame(syncServiceStackDistribution);
  };

  const layout = () => {
    syncTextGeometry();
    syncConsultationGeometry();
    baselineLocked = false;
    if (!baselineFrame) baselineFrame = window.requestAnimationFrame(syncBaseline);
    scheduleNextTextBaselineSync();
    scheduleServiceStackDistribution();
  };

  const updateLabels = () => {
    const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';
    const labels = copy[language];
    menuItems.forEach((item, index) => { item.querySelector('.s-page__composer-menu-label').textContent = labels.menu[index]; });
    const [servicesHeading] = labels.services;
    sectionTwoTitleOutput.textContent = servicesHeading;
    sectionTwoTitle.lang = language;
    sectionTwoTitle.dir = 'ltr';
    sectionTwoTitleOutput.lang = language;
    sectionTwoTitleOutput.dir = language === 'ar' ? 'rtl' : 'ltr';
    serviceBoxes.forEach((serviceBox, boxIndex) => {
      const [serviceHeading, serviceBody, serviceList] = labels.serviceBoxes[boxIndex];
      serviceBox.lang = language;
      serviceBox.dir = language === 'ar' ? 'rtl' : 'ltr';
      serviceTitles[boxIndex].textContent = serviceHeading;
      serviceDescriptions[boxIndex].textContent = serviceBody;
      serviceItemGroups[boxIndex].forEach((item, itemIndex) => { item.textContent = serviceList[itemIndex]; });
    });
    if (consultationTitle && consultationDescription) {
      const [consultationHeading, consultationBody, consultationButton] = labels.consultation;
      setLocalizedText(consultationTitle, consultationHeading);
      setLocalizedText(consultationDescription, consultationBody);
      sectionOneNextCopy.textContent = labels.sectionOneNext;
      sectionOneCta.lang = language;
      sectionOneCta.dir = language === 'ar' ? 'rtl' : 'ltr';
      sectionTwoNextCopy.textContent = labels.sectionTwoNext;
      sectionTwoCta.lang = language;
      sectionTwoCta.dir = language === 'ar' ? 'rtl' : 'ltr';
      consultationCta.textContent = consultationButton;
      consultationCta.lang = language;
      consultationCta.dir = language === 'ar' ? 'rtl' : 'ltr';
    }
    languageButton.classList.toggle('is-active', language === 'en');
    languageButton.setAttribute('aria-pressed', String(language === 'en'));
    languageButton.setAttribute('aria-label', language === 'en' ? labels.switchToArabic : labels.switchToEnglish);
    themeButton.setAttribute('aria-label', document.documentElement.classList.contains('is-day-mode') ? labels.switchToDark : labels.switchToDay);
  };

  const applyLanguage = (language) => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    updateLabels();
    startTypewriter();
    layout();
    if (activeSectionIndex() === 1) startSectionTwoHero(true);
  };
  const applyTheme = (theme) => {
    const isDay = theme === 'day';
    document.documentElement.classList.toggle('is-day-mode', isDay);
    themeButton.classList.toggle('is-active', !isDay);
    themeButton.setAttribute('aria-pressed', String(!isDay));
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDay ? '#FFFFFF' : '#000000');
    updateLabels();
  };

  const setOpen = (open) => {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    utilities.classList.toggle('is-open', open);
    utilities.setAttribute('aria-hidden', String(!open));
    submitButton.classList.toggle('is-active', open);
    if (open) composer.style.setProperty('--s-composer-menu-height', `${menu.offsetHeight}px`);
  };

  const sectionReferenceY = () => Number.parseFloat(getComputedStyle(content).paddingTop) || 0;

  const activeSectionIndex = () => majorSections.reduce((closest, section, index) => {
    const distance = Math.abs(section.getBoundingClientRect().top - sectionReferenceY());
    return !closest || distance < closest.distance ? { index, distance } : closest;
  }, null)?.index ?? 0;

  const transitionSection = (direction) => {
    if (!direction || sectionInputLocked || majorSections.length !== 3) return;
    const targetIndex = Math.max(0, Math.min(majorSections.length - 1, activeSectionIndex() + direction));
    const target = majorSections[targetIndex];
    if (!target || targetIndex === activeSectionIndex()) return;
    if (targetIndex === 1) startSectionTwoHero();
    sectionInputLocked = true;
    window.clearTimeout(sectionUnlockTimer);
    sectionUnlockTimer = window.setTimeout(() => { sectionInputLocked = false; }, 800);
    window.scrollTo({ top: window.scrollY + target.getBoundingClientRect().top - sectionReferenceY(), left: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };

  const setupFace = () => {
    const face = addButton.querySelector('[data-s-x-face]');
    const shell = face?.querySelector('.s-page__x-face-shell');
    const eyes = face?.querySelector('.s-page__x-face-eyes');
    const motion = face?.querySelector('.s-page__x-face-eye-motion');
    if (!face || !shell || !eyes || !motion) return;
    let pointer = null;
    let gaze = { x: 0, y: 0 };
    let target = { x: 0, y: 0 };
    const render = (time) => {
      gaze.x += (target.x - gaze.x) * .16;
      gaze.y += (target.y - gaze.y) * .16;
      const blinkPhase = ((time / 1000 + .7) % 5.6) / 5.6;
      const blink = 1 - (.84 * Math.exp(-Math.pow((blinkPhase - .72) / .022, 2)));
      eyes.setAttribute('transform', `translate(${gaze.x.toFixed(3)} ${gaze.y.toFixed(3)})`);
      motion.setAttribute('transform', `translate(0 6.5) scale(1 ${blink.toFixed(3)}) translate(0 -6.5)`);
      window.requestAnimationFrame(render);
    };
    addButton.addEventListener('pointerdown', (event) => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
    addButton.addEventListener('pointermove', (event) => {
      if (!pointer) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      const magnitude = Math.max(1, Math.hypot(dx, dy));
      target = { x: Math.max(-1.1, Math.min(1.1, dx / magnitude * 1.1)), y: Math.max(-1.1, Math.min(1.1, dy / magnitude * 1.1)) };
    }, { passive: true });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((name) => addButton.addEventListener(name, () => { pointer = null; target = { x: 0, y: 0 }; }, { passive: true }));
    window.requestAnimationFrame(render);
  };

  composer.addEventListener('submit', (event) => { event.preventDefault(); setOpen(!menu.classList.contains('is-open')); });
  composer.addEventListener('pointerdown', (event) => { if (event.target === composer) composer.classList.add('is-pulsing'); }, { passive: true });
  composer.addEventListener('animationend', () => composer.classList.remove('is-pulsing'));
  menuItems.forEach((item) => item.addEventListener('pointerdown', () => { item.classList.add('is-active'); window.setTimeout(() => item.classList.remove('is-active'), 120); }, { passive: true }));
  addButton.addEventListener('click', () => { window.location.assign('/x'); });
  themeButton.addEventListener('click', (event) => { event.stopPropagation(); applyTheme(document.documentElement.classList.contains('is-day-mode') ? 'dark' : 'day'); });
  languageButton.addEventListener('click', (event) => { event.stopPropagation(); applyLanguage(document.documentElement.lang === 'ar' ? 'en' : 'ar'); });
  sectionOneCta.addEventListener('click', (event) => { event.stopPropagation(); transitionSection(1); });
  sectionTwoCta.addEventListener('click', (event) => { event.stopPropagation(); transitionSection(1); });
  document.addEventListener('pointerdown', (event) => { if (!composer.contains(event.target)) setOpen(false); }, { passive: true });
  document.addEventListener('touchstart', (event) => {
    if (event.target.closest('[data-s-composer]')) return;
    const touch = event.changedTouches[0];
    if (touch) touchStart = { id: touch.identifier, y: touch.clientY };
  }, { capture: true, passive: true });
  document.addEventListener('touchmove', (event) => {
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === touchStart?.id);
    if (touch && touch.clientY !== touchStart.y) event.preventDefault();
  }, { capture: true, passive: false });
  document.addEventListener('touchend', (event) => {
    const touch = Array.from(event.changedTouches).find((item) => item.identifier === touchStart?.id);
    if (touch && Math.abs(touch.clientY - touchStart.y) >= 36) transitionSection(touch.clientY < touchStart.y ? 1 : -1);
    if (touch) touchStart = null;
  }, { capture: true, passive: true });
  window.addEventListener('wheel', (event) => {
    event.preventDefault();
    if (Math.abs(event.deltaY) >= 8) transitionSection(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });
  window.addEventListener('resize', layout, { passive: true });
  window.addEventListener('orientationchange', layout, { passive: true });

  applyLanguage('en');
  applyTheme('dark');
  setupFace();
  document.fonts?.ready.then(layout);
  window.requestAnimationFrame(() => document.documentElement.classList.remove('s-x-initializing'));
})();
