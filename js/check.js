(() => {
  'use strict';

  const root = document.documentElement;
  const viewport = window.visualViewport;
  const body = document.body;
  const conversationLayer = document.querySelector('[data-s-check-conversation-layer]');
  const conversationScroll = document.querySelector('[data-s-check-conversation-scroll]');
  let frame = 0;
  const setCheckVar = (name, value) => {
    root.style.setProperty(name, value);
    body?.style.setProperty(name, value);
  };

  const measureVisibleArea = () => {
    frame = 0;
    const width = Math.max(1, viewport?.width || root.clientWidth || window.innerWidth);
    const layoutHeight = Math.max(1, root.clientHeight || window.innerHeight);
    const visualHeight = Math.max(1, viewport?.height || layoutHeight);
    const height = Math.min(layoutHeight, visualHeight);
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
    const welcome = document.querySelector('[data-s-check-bubble="welcome"]');
    const composerField = document.querySelector('.s-check-composer-field');
    const lowerHeight = lower?.getBoundingClientRect().height || 32;
    const upperHeight = upper?.getBoundingClientRect().height || 32;
    const welcomeHeight = welcome?.getBoundingClientRect().height || 32;
    const userBubble = document.querySelector('[data-s-check-user-bubble]');
    const userBubbleHeight = userBubble?.getBoundingClientRect().height || 32;
    const infoCard = document.querySelector('[data-s-check-info-card]');
    const infoCardHeight = infoCard?.getBoundingClientRect().height || 72;
    const send = document.querySelector('.s-check-composer-send');
    const composerRow = document.querySelector('.s-check-composer-row');
    const x = Number.parseFloat(getComputedStyle(root).getPropertyValue('--s-check-x')) || 0;
    const viewportHeight = Number.parseFloat(getComputedStyle(root).getPropertyValue('--s-check-vv-height')) || window.innerHeight;
    const composerTop = composerField?.getBoundingClientRect().top || viewportHeight;
    const cardTop = infoCard?.getBoundingClientRect().top;
    const fadeStartTop = infoCard?.getAttribute('aria-hidden') === 'false' && Number.isFinite(cardTop)
      ? cardTop - (x * 1.25)
      : composerTop;
    const welcomeBottom = Math.max(0, viewportHeight - composerTop + (x * 2));
    const conversationShift = body?.classList.contains('is-check-intro') ? 0 : userBubbleHeight + x;
    const userBubbleBottom = welcomeBottom;
    const sharedGap = composerField && send ? Math.max(0, composerField.getBoundingClientRect().right - send.getBoundingClientRect().right) : 8;
    const baseBottom = welcomeBottom;
    const spacingReduction = Math.max(0, x - sharedGap);
    const composerRect = composerRow?.getBoundingClientRect();
    setCheckVar('--s-check-bubble-rise', `${Math.max(0, lowerHeight - 32)}px`);
    setCheckVar('--s-check-lower-height', `${lowerHeight}px`);
    setCheckVar('--s-check-upper-height', `${upperHeight}px`);
    setCheckVar('--s-check-welcome-height', `${welcomeHeight}px`);
    setCheckVar('--s-check-welcome-bottom', `${welcomeBottom}px`);
    setCheckVar('--s-check-user-bubble-height', `${userBubbleHeight}px`);
    setCheckVar('--s-check-user-bubble-bottom', `${userBubbleBottom}px`);
    setCheckVar('--s-check-conversation-shift', `${conversationShift}px`);
    setCheckVar('--s-check-card-height', `${infoCardHeight}px`);
    setCheckVar('--s-check-base-bottom', `${baseBottom}px`);
    setCheckVar('--s-check-shared-gap', `${sharedGap}px`);
    setCheckVar('--s-check-spacing-reduction', `${spacingReduction}px`);
    if (composerRect) {
      setCheckVar('--s-check-composer-left', `${composerRect.left}px`);
      setCheckVar('--s-check-composer-width', `${composerRect.width}px`);
    }
    setCheckVar('--s-check-bottom-fade-top', `${Math.max(0, fadeStartTop)}px`);
    setCheckVar('--s-check-bottom-fade-height', `${Math.max(0, Math.min(viewportHeight, viewportHeight - fadeStartTop))}px`);
  };

  const scheduleBubbleMeasure = () => window.requestAnimationFrame(() => {
    measureBubbleRise();
    updateBubbleGroups();
  });

  measureVisibleArea();
  measureBubbleRise();
  window.addEventListener('resize', scheduleMeasure, { passive: true });
  window.addEventListener('orientationchange', scheduleMeasure, { passive: true });
  viewport?.addEventListener('resize', scheduleMeasure, { passive: true });
  viewport?.addEventListener('scroll', scheduleMeasure, { passive: true });
  window.addEventListener('resize', scheduleBubbleMeasure, { passive: true });
  window.addEventListener('orientationchange', scheduleBubbleMeasure, { passive: true });
  viewport?.addEventListener('resize', scheduleBubbleMeasure, { passive: true });

  const form = document.querySelector('[data-s-check-composer]');
  const introInput = document.querySelector('[data-s-check-intro-input]');
  const userBubble = document.querySelector('[data-s-check-user-bubble]');
  const ooxoAvatar = document.querySelector('.s-page__add');
  const followupAvatar = document.querySelector('[data-s-check-avatar-group="followup"]');
  const userAvatar = document.querySelector('[data-s-check-user-avatar]');
  let introStarted = false;
  let introNameSubmitted = false;
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (introNameSubmitted || !introInput || introInput.disabled) return;
    const name = introInput.value.trim();
    if (!name) return;
    introNameSubmitted = true;
    beginConversationAfterName(name);
  });

  const testBubble = document.querySelector('[data-s-check-test-bubble]');
  const testOptions = [...document.querySelectorAll('[data-s-check-test-option]')];
  const infoCard = document.querySelector('[data-s-check-info-card]');
  const optionExitStagger = 82;
  const optionTransitionDuration = 220;
  const optionEnterStagger = 82;
  let optionTransitionGeneration = 0;
  let lastAnswerSelectionAt = 0;

  const viewportDiagnosticsEnabled = new URLSearchParams(window.location.search).has('viewport-diagnostics');
  const captureViewportDiagnostics = () => {
    const safeProbe = document.createElement('div');
    safeProbe.style.cssText = [
      'position:fixed',
      'inset:0',
      'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)',
      'visibility:hidden',
      'pointer-events:none',
      'box-sizing:border-box'
    ].join(';');
    document.body.append(safeProbe);
    const safeStyle = getComputedStyle(safeProbe);
    const read = (selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height, top: rect.top, right: rect.right, bottom: rect.bottom, left: rect.left },
        position: style.position,
        overflow: style.overflow,
        zIndex: style.zIndex,
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        border: style.border,
        boxShadow: style.boxShadow,
        pointerEvents: style.pointerEvents
      };
    };
    const layer = document.querySelector('[data-s-check-conversation-layer]');
    const scroll = document.querySelector('[data-s-check-conversation-scroll]');
    const layerAfter = layer ? getComputedStyle(layer, '::after') : null;
    const result = {
      capturedAt: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      standalone: Boolean(window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches,
      viewport: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight,
        visualWidth: window.visualViewport?.width ?? null,
        visualHeight: window.visualViewport?.height ?? null,
        visualOffsetLeft: window.visualViewport?.offsetLeft ?? null,
        visualOffsetTop: window.visualViewport?.offsetTop ?? null,
        visualScale: window.visualViewport?.scale ?? null,
        devicePixelRatio: window.devicePixelRatio
      },
      safeArea: {
        top: safeStyle.paddingTop,
        right: safeStyle.paddingRight,
        bottom: safeStyle.paddingBottom,
        left: safeStyle.paddingLeft
      },
      cssVariables: {
        viewportLeft: getComputedStyle(root).getPropertyValue('--s-check-vv-left').trim(),
        viewportTop: getComputedStyle(root).getPropertyValue('--s-check-vv-top').trim(),
        viewportWidth: getComputedStyle(root).getPropertyValue('--s-check-vv-width').trim(),
        viewportHeight: getComputedStyle(root).getPropertyValue('--s-check-vv-height').trim(),
        spacing: getComputedStyle(root).getPropertyValue('--s-check-x').trim()
      },
      elements: {
        html: read('html'),
        body: read('body'),
        main: read('main'),
        content: read('.s-page__content'),
        controlsViewport: read('.s-check-viewport'),
        conversationLayer: read('[data-s-check-conversation-layer]'),
        conversationScroll: read('[data-s-check-conversation-scroll]'),
        conversationCanvas: read('[data-s-check-conversation-canvas]'),
        bottomArea: read('[data-s-check-bottom-area]'),
        card: read('[data-s-check-info-card]'),
        composer: read('[data-s-check-composer]'),
        composerField: read('.s-check-composer-field')
      },
      scroll: scroll ? {
        scrollTop: scroll.scrollTop,
        scrollHeight: scroll.scrollHeight,
        clientHeight: scroll.clientHeight,
        overflowY: getComputedStyle(scroll).overflowY,
        touchAction: getComputedStyle(scroll).touchAction
      } : null,
      effects: layerAfter ? {
        topLayerDisplay: getComputedStyle(layer, '::before').display,
        bottomLayerDisplay: layerAfter.display,
        bottomLayerHeight: layerAfter.height,
        bottomLayerBackground: layerAfter.backgroundImage,
        bottomLayerBackdropFilter: layerAfter.backdropFilter,
        bottomLayerPointerEvents: layerAfter.pointerEvents,
        bottomLayerMask: layerAfter.maskImage
      } : null
    };
    safeProbe.remove();
    return result;
  };
  if (viewportDiagnosticsEnabled) {
    const renderDiagnostics = () => {
      const result = captureViewportDiagnostics();
      const text = JSON.stringify(result, null, 2);
      console.info('[OOXME viewport diagnostics]\n' + text);
      let panel = document.querySelector('[data-s-check-viewport-diagnostics]');
      if (!panel) {
        panel = document.createElement('aside');
        panel.dataset.sCheckViewportDiagnostics = '';
        panel.style.cssText = 'position:fixed;inset:12px;z-index:2147483647;display:grid;grid-template-rows:auto minmax(0,1fr);gap:8px;padding:10px;border:1px solid #777;border-radius:10px;background:#111;color:#fff;font:12px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;pointer-events:auto;';
        const copyButton = document.createElement('button');
        copyButton.type = 'button';
        copyButton.textContent = 'Copy viewport diagnostics';
        copyButton.style.cssText = 'justify-self:start;padding:7px 10px;border:1px solid #888;border-radius:6px;background:#292929;color:#fff;font:inherit;';
        copyButton.addEventListener('click', async () => {
          const latest = JSON.stringify(captureViewportDiagnostics(), null, 2);
          try {
            await navigator.clipboard.writeText(latest);
            copyButton.textContent = 'Copied';
          } catch {
            copyButton.textContent = 'Copy failed; use the text below';
          }
          panel.querySelector('pre').textContent = latest;
        });
        const output = document.createElement('pre');
        output.style.cssText = 'min-height:0;margin:0;overflow:auto;white-space:pre-wrap;user-select:text;';
        panel.append(copyButton, output);
        document.body.append(panel);
      }
      panel.querySelector('pre').textContent = text;
      return text;
    };
    window.OOXMECheckViewportDiagnostics = renderDiagnostics;
    window.setTimeout(renderDiagnostics, 0);
  }

  const questionBank = [
    { id: 'q01', categoryId: 'c01', category: { ar: 'وضوح المشروع', en: 'Project clarity' }, question: { ar: 'هل تستطيع شرح ما يقدمه مشروعك ولمن، بجملة واضحة ومباشرة؟', en: 'Can you explain what your project offers and to whom in one clear, direct sentence?' }, options: [
      { id: 'q01a', ar: 'نعم، أستطيع شرحه بوضوح وباختصار.', en: 'Yes, I can explain it clearly and concisely.' },
      { id: 'q01b', ar: 'أستطيع، لكن الشرح يحتاج بعض التفاصيل.', en: 'I can, but the explanation needs some detail.' },
      { id: 'q01c', ar: 'لا، يصعب علي شرحه بشكل واضح.', en: 'No, it is difficult for me to explain it clearly.' }
    ] },
    { id: 'q02', categoryId: 'c01', category: { ar: 'وضوح المشروع', en: 'Project clarity' }, question: { ar: 'هل تعرف المشكلة او الحاجة الأساسية التي تجعل العميل يبحث عن منتجك او خدمتك؟', en: 'Do you know the core problem or need that makes a customer look for your product or service?' }, options: [
      { id: 'q02a', ar: 'نعم، وهي واضحة ومثبتة من تعاملنا مع العملاء.', en: 'Yes, and it is clear and validated through our customer interactions.' },
      { id: 'q02b', ar: 'لدي فكرة جيدة عنها، لكن ليست مؤكدة بالكامل.', en: 'I have a good idea of it, but it is not fully confirmed.' },
      { id: 'q02c', ar: 'لا، لا أعرفها بشكل واضح.', en: 'No, I do not know it clearly.' }
    ] },
    { id: 'q03', categoryId: 'c01', category: { ar: 'وضوح المشروع', en: 'Project clarity' }, question: { ar: 'هل تعرف بالضبط من هو العميل الأنسب لمشروعك؟', en: 'Do you know exactly who the best-fit customer for your project is?' }, options: [
      { id: 'q03a', ar: 'نعم، نعرف صفاته واحتياجاته وسلوكه بشكل واضح.', en: 'Yes, we clearly know their traits, needs, and behavior.' },
      { id: 'q03b', ar: 'نعرفه بصورة عامة، لكن بدون تحديد دقيق.', en: 'We know them generally, but without precise definition.' },
      { id: 'q03c', ar: 'لا، نستهدف شريحة واسعة او الجميع تقريباً.', en: 'No, we target a broad segment or almost everyone.' }
    ] },
    { id: 'q04', categoryId: 'c01', category: { ar: 'وضوح المشروع', en: 'Project clarity' }, question: { ar: 'هل لديك سبب واضح يجعل العميل يختارك بدلاً من البدائل المتاحة؟', en: 'Do you have a clear reason for a customer to choose you over the available alternatives?' }, options: [
      { id: 'q04a', ar: 'نعم، ولدينا فرق واضح يشعر به العميل.', en: 'Yes, we have a clear difference that the customer can feel.' },
      { id: 'q04b', ar: 'يوجد فرق، لكنه ليس واضحاً او قوياً بما يكفي.', en: 'There is a difference, but it is not clear or strong enough.' },
      { id: 'q04c', ar: 'لا، عرضنا مشابه جداً لما هو موجود في السوق.', en: 'No, our offer is very similar to what is already in the market.' }
    ] },
    { id: 'q05', categoryId: 'c01', category: { ar: 'وضوح المشروع', en: 'Project clarity' }, question: { ar: 'عندما تتخذ قراراً مهماً في المشروع، على ماذا تعتمد غالباً؟', en: 'When you make an important project decision, what do you usually rely on?' }, options: [
      { id: 'q05a', ar: 'على بيانات، تجارب، ومعلومات فعلية.', en: 'Data, experiments, and real information.' },
      { id: 'q05b', ar: 'على مزيج من المعلومات والخبرة الشخصية.', en: 'A mix of information and personal experience.' },
      { id: 'q05c', ar: 'على الحدس والتوقعات غالباً.', en: 'Mostly intuition and expectations.' }
    ] },
    { id: 'q06', categoryId: 'c02', category: { ar: 'العميل والعرض', en: 'Customer and offer' }, question: { ar: 'هل تعرف أي نوع من العملاء يحقق لك أفضل قيمة؟', en: 'Do you know which type of customer creates the most value for you?' }, options: [
      { id: 'q06a', ar: 'نعم، ونعرف من يشتري أكثر او يحقق ربحية أفضل.', en: 'Yes, we know who buys more or generates better profitability.' },
      { id: 'q06b', ar: 'لدينا تصور، لكن لا نقيس ذلك بوضوح.', en: 'We have a view, but we do not measure it clearly.' },
      { id: 'q06c', ar: 'لا، نتعامل مع جميع العملاء بنفس الطريقة.', en: 'No, we treat all customers the same way.' }
    ] },
    { id: 'q07', categoryId: 'c02', category: { ar: 'العميل والعرض', en: 'Customer and offer' }, question: { ar: 'هل يستطيع العميل فهم ما سيحصل عليه مقابل السعر بسهولة؟', en: 'Can the customer easily understand what they will receive for the price?' }, options: [
      { id: 'q07a', ar: 'نعم، العرض واضح ولا يحتاج شرحاً طويلاً.', en: 'Yes, the offer is clear and does not need a long explanation.' },
      { id: 'q07b', ar: 'غالباً، لكن بعض العملاء يحتاجون توضيحاً إضافياً.', en: 'Usually, but some customers need additional clarification.' },
      { id: 'q07c', ar: 'لا، نحتاج عادة الى شرح طويل قبل أن يفهم العميل العرض.', en: 'No, we usually need a long explanation before the customer understands the offer.' }
    ] },
    { id: 'q08', categoryId: 'c02', category: { ar: 'العميل والعرض', en: 'Customer and offer' }, question: { ar: 'هل تعرف ما الذي يقدره العميل فعلياً في منتجك او خدمتك؟', en: 'Do you know what the customer actually values in your product or service?' }, options: [
      { id: 'q08a', ar: 'نعم، ونعرف ذلك من سلوك وملاحظات العملاء.', en: 'Yes, we know from customer behavior and feedback.' },
      { id: 'q08b', ar: 'لدينا تصور مبني على التجربة.', en: 'We have a view based on experience.' },
      { id: 'q08c', ar: 'لا، نفترض غالباً ما الذي يريده العميل.', en: 'No, we mostly assume what the customer wants.' }
    ] },
    { id: 'q09', categoryId: 'c02', category: { ar: 'العميل والعرض', en: 'Customer and offer' }, question: { ar: 'هل عدد المنتجات او الخدمات او الباقات لديك يساعد العميل على اتخاذ القرار؟', en: 'Does the number of products, services, or packages help the customer make a decision?' }, options: [
      { id: 'q09a', ar: 'نعم، الخيارات واضحة ومنظمة.', en: 'Yes, the options are clear and organized.' },
      { id: 'q09b', ar: 'توجد بعض الخيارات التي قد تربك العميل.', en: 'Some options may confuse the customer.' },
      { id: 'q09c', ar: 'الخيارات كثيرة او غير واضحة ويصعب المقارنة بينها.', en: 'There are too many or unclear options and they are difficult to compare.' }
    ] },
    { id: 'q10', categoryId: 'c02', category: { ar: 'العميل والعرض', en: 'Customer and offer' }, question: { ar: 'هل تجمع بشكل منتظم معلومات من العملاء حول أسباب الشراء او عدم الشراء؟', en: 'Do you regularly collect information from customers about why they buy or do not buy?' }, options: [
      { id: 'q10a', ar: 'نعم، ولدينا طريقة واضحة لجمع هذه المعلومات.', en: 'Yes, we have a clear way to collect this information.' },
      { id: 'q10b', ar: 'أحياناً، لكن بشكل غير منتظم.', en: 'Sometimes, but not regularly.' },
      { id: 'q10c', ar: 'لا، لا نجمع هذه المعلومات.', en: 'No, we do not collect this information.' }
    ] },
    { id: 'q11', categoryId: 'c03', category: { ar: 'التسعير والربحية', en: 'Pricing and profitability' }, question: { ar: 'هل تعرف التكلفة الحقيقية لتقديم منتجاتك او خدماتك الرئيسية؟', en: 'Do you know the true cost of delivering your main products or services?' }, options: [
      { id: 'q11a', ar: 'نعم، ونحسب جميع التكاليف المهمة المرتبطة بها.', en: 'Yes, we calculate all important costs associated with them.' },
      { id: 'q11b', ar: 'أعرف التكلفة الأساسية، لكن قد توجد تكاليف غير محسوبة بدقة.', en: 'I know the basic cost, but some costs may not be calculated precisely.' },
      { id: 'q11c', ar: 'لا، لا أعرف التكلفة الحقيقية بشكل واضح.', en: 'No, I do not clearly know the true cost.' }
    ] },
    { id: 'q12', categoryId: 'c03', category: { ar: 'التسعير والربحية', en: 'Pricing and profitability' }, question: { ar: 'كيف يتم تحديد أسعارك حالياً؟', en: 'How are your prices currently determined?' }, options: [
      { id: 'q12a', ar: 'بناءً على التكلفة والقيمة والسوق والربحية المطلوبة.', en: 'Based on cost, value, the market, and the required profitability.' },
      { id: 'q12b', ar: 'نعتمد بشكل أساسي على أسعار السوق والمنافسين.', en: 'We rely mainly on market and competitor prices.' },
      { id: 'q12c', ar: 'السعر تقديري او تم اختياره بدون حساب واضح.', en: 'The price is an estimate or was chosen without clear calculation.' }
    ] },
    { id: 'q13', categoryId: 'c03', category: { ar: 'التسعير والربحية', en: 'Pricing and profitability' }, question: { ar: 'هل تعرف هامش الربح لكل منتج او خدمة رئيسية؟', en: 'Do you know the profit margin for each main product or service?' }, options: [
      { id: 'q13a', ar: 'نعم، وأعرفه من أرقام فعلية ومحدثة.', en: 'Yes, I know it from actual, up-to-date figures.' },
      { id: 'q13b', ar: 'أعرفه بشكل تقريبي.', en: 'I know it approximately.' },
      { id: 'q13c', ar: 'لا، لا أعرف الهامش بدقة.', en: 'No, I do not know the margin accurately.' }
    ] },
    { id: 'q14', categoryId: 'c03', category: { ar: 'التسعير والربحية', en: 'Pricing and profitability' }, question: { ar: 'هل تعرف تأثير الخصومات والعمولات والتوصيل والإعلان وغيرها على ربحك؟', en: 'Do you know how discounts, commissions, delivery, advertising, and other costs affect your profit?' }, options: [
      { id: 'q14a', ar: 'نعم، نحسب تأثيرها قبل اتخاذ القرار.', en: 'Yes, we calculate their impact before making a decision.' },
      { id: 'q14b', ar: 'نحسب بعضها، لكن ليس جميعها.', en: 'We calculate some of them, but not all.' },
      { id: 'q14c', ar: 'لا، غالباً ننظر الى قيمة البيع فقط.', en: 'No, we usually look only at the sale value.' }
    ] },
    { id: 'q15', categoryId: 'c03', category: { ar: 'التسعير والربحية', en: 'Pricing and profitability' }, question: { ar: 'هل تعرف ما الذي يحقق لك أفضل ربح، وليس فقط أعلى مبيعات؟', en: 'Do you know what creates the best profit for you, not just the highest sales?' }, options: [
      { id: 'q15a', ar: 'نعم، ونفرق بوضوح بين حجم المبيعات والربحية.', en: 'Yes, we clearly distinguish sales volume from profitability.' },
      { id: 'q15b', ar: 'لدينا فكرة تقريبية.', en: 'We have an approximate idea.' },
      { id: 'q15c', ar: 'لا، نركز غالباً على المنتجات او الخدمات الأكثر مبيعاً فقط.', en: 'No, we mostly focus only on the best-selling products or services.' }
    ] },
    { id: 'q16', categoryId: 'c04', category: { ar: 'المبيعات والتحويل', en: 'Sales and conversion' }, question: { ar: 'هل لديك خطوات واضحة من أول استفسار للعميل حتى إتمام البيع؟', en: 'Do you have clear steps from the customer’s first inquiry through to completing the sale?' }, options: [
      { id: 'q16a', ar: 'نعم، ولدينا عملية بيع واضحة ومتكررة.', en: 'Yes, we have a clear, repeatable sales process.' },
      { id: 'q16b', ar: 'توجد طريقة عامة، لكنها تختلف من شخص الى آخر.', en: 'There is a general approach, but it differs from person to person.' },
      { id: 'q16c', ar: 'لا، كل عملية بيع تتم بطريقة مختلفة.', en: 'No, every sale is handled differently.' }
    ] },
    { id: 'q17', categoryId: 'c04', category: { ar: 'المبيعات والتحويل', en: 'Sales and conversion' }, question: { ar: 'عندما يتواصل عميل جديد، هل توجد طريقة واضحة للرد وفهم احتياجه وتقديم العرض؟', en: 'When a new customer reaches out, is there a clear way to respond, understand their need, and present the offer?' }, options: [
      { id: 'q17a', ar: 'نعم، ولدينا أسلوب واضح ومتسق.', en: 'Yes, we have a clear and consistent approach.' },
      { id: 'q17b', ar: 'توجد طريقة عامة، لكن التطبيق غير ثابت.', en: 'There is a general approach, but execution is inconsistent.' },
      { id: 'q17c', ar: 'لا، يعتمد ذلك بالكامل على الشخص الذي يرد.', en: 'No, it depends entirely on the person who responds.' }
    ] },
    { id: 'q18', categoryId: 'c04', category: { ar: 'المبيعات والتحويل', en: 'Sales and conversion' }, question: { ar: 'ماذا يحدث إذا أبدى العميل اهتماماً ثم لم يشترِ؟', en: 'What happens if a customer shows interest and then does not buy?' }, options: [
      { id: 'q18a', ar: 'تتم متابعته بطريقة منظمة وفي الوقت المناسب.', en: 'They are followed up with in an organized and timely way.' },
      { id: 'q18b', ar: 'تتم المتابعة أحياناً.', en: 'Follow-up happens sometimes.' },
      { id: 'q18c', ar: 'غالباً لا تتم متابعته.', en: 'They are usually not followed up with.' }
    ] },
    { id: 'q19', categoryId: 'c04', category: { ar: 'المبيعات والتحويل', en: 'Sales and conversion' }, question: { ar: 'هل تعرف أكثر الأسباب التي تمنع العملاء من إتمام الشراء؟', en: 'Do you know the main reasons that prevent customers from completing a purchase?' }, options: [
      { id: 'q19a', ar: 'نعم، نعرف الاعتراضات الرئيسية ونتعامل معها بوضوح.', en: 'Yes, we know the main objections and address them clearly.' },
      { id: 'q19b', ar: 'نعرف بعضها من التجربة.', en: 'We know some of them from experience.' },
      { id: 'q19c', ar: 'لا، لا نعرف لماذا ينسحب معظم العملاء.', en: 'No, we do not know why most customers drop out.' }
    ] },
    { id: 'q20', categoryId: 'c04', category: { ar: 'المبيعات والتحويل', en: 'Sales and conversion' }, question: { ar: 'هل تعرف تقريباً نسبة العملاء المحتملين الذين يتحولون الى مشترين؟', en: 'Do you roughly know the percentage of prospects who become buyers?' }, options: [
      { id: 'q20a', ar: 'نعم، نقيس التحويل بشكل منتظم.', en: 'Yes, we measure conversion regularly.' },
      { id: 'q20b', ar: 'لدينا تقدير تقريبي فقط.', en: 'We only have an approximate estimate.' },
      { id: 'q20c', ar: 'لا، لا نقيس ذلك.', en: 'No, we do not measure it.' }
    ] },
    { id: 'q21', categoryId: 'c05', category: { ar: 'التسويق', en: 'Marketing' }, question: { ar: 'هل لكل نشاط تسويقي لديك هدف تجاري واضح؟', en: 'Does each marketing activity you run have a clear business objective?' }, options: [
      { id: 'q21a', ar: 'نعم، نعرف ماذا نريد من كل نشاط وكيف نقيسه.', en: 'Yes, we know what we want from each activity and how to measure it.' },
      { id: 'q21b', ar: 'بعض الأنشطة لها أهداف واضحة وبعضها لا.', en: 'Some activities have clear objectives and some do not.' },
      { id: 'q21c', ar: 'لا، ننشر او نعلن بدون هدف محدد غالباً.', en: 'No, we usually publish or advertise without a specific objective.' }
    ] },
    { id: 'q22', categoryId: 'c05', category: { ar: 'التسويق', en: 'Marketing' }, question: { ar: 'هل تعرف أي القنوات تجلب لك عملاء فعليين؟', en: 'Do you know which channels bring you actual customers?' }, options: [
      { id: 'q22a', ar: 'نعم، نعرف مصادر العملاء ونقارن أداءها.', en: 'Yes, we know customer sources and compare their performance.' },
      { id: 'q22b', ar: 'نعرف بعضها بشكل تقريبي.', en: 'We know some of them approximately.' },
      { id: 'q22c', ar: 'لا، لا نستطيع تحديد مصدر معظم العملاء.', en: 'No, we cannot identify the source of most customers.' }
    ] },
    { id: 'q23', categoryId: 'c05', category: { ar: 'التسويق', en: 'Marketing' }, question: { ar: 'هل المحتوى الذي تنشره يساعد العميل على الفهم او الثقة او اتخاذ القرار؟', en: 'Does the content you publish help the customer understand, trust, or make a decision?' }, options: [
      { id: 'q23a', ar: 'نعم، لكل محتوى وظيفة واضحة.', en: 'Yes, every piece of content has a clear purpose.' },
      { id: 'q23b', ar: 'بعض المحتوى مفيد وبعضه للنشاط والاستمرارية فقط.', en: 'Some content is useful and some is only for activity and consistency.' },
      { id: 'q23c', ar: 'لا، نركز غالباً على النشر بدون هدف محدد.', en: 'No, we mostly focus on publishing without a specific objective.' }
    ] },
    { id: 'q24', categoryId: 'c05', category: { ar: 'التسويق', en: 'Marketing' }, question: { ar: 'إذا انخفضت المبيعات، هل تستطيع معرفة إن كانت المشكلة في التسويق او العرض او السعر او المبيعات؟', en: 'If sales decline, can you tell whether the problem is marketing, the offer, pricing, or sales?' }, options: [
      { id: 'q24a', ar: 'نعم، نراجع المؤشرات ونحدد مصدر المشكلة.', en: 'Yes, we review the indicators and identify the source of the problem.' },
      { id: 'q24b', ar: 'نستطيع التخمين، لكن ليس لدينا قياس واضح.', en: 'We can guess, but we do not have clear measurement.' },
      { id: 'q24c', ar: 'لا، غالباً نفترض أن المشكلة في التسويق.', en: 'No, we usually assume the problem is marketing.' }
    ] },
    { id: 'q25', categoryId: 'c05', category: { ar: 'التسويق', en: 'Marketing' }, question: { ar: 'قبل زيادة ميزانية الإعلان، هل تتأكد أن العرض ومسار البيع يعملان بشكل جيد؟', en: 'Before increasing the advertising budget, do you make sure the offer and sales path work well?' }, options: [
      { id: 'q25a', ar: 'نعم، نختبر ونقيس قبل زيادة الإنفاق.', en: 'Yes, we test and measure before increasing spend.' },
      { id: 'q25b', ar: 'أحياناً، لكن ليس دائماً.', en: 'Sometimes, but not always.' },
      { id: 'q25c', ar: 'لا، نزيد الإعلان غالباً عندما نحتاج مبيعات أكثر.', en: 'No, we usually increase advertising when we need more sales.' }
    ] },
    { id: 'q26', categoryId: 'c06', category: { ar: 'التشغيل', en: 'Operations' }, question: { ar: 'هل الأعمال المتكررة المهمة في المشروع لها طريقة واضحة للتنفيذ؟', en: 'Do important recurring tasks in the project have a clear way of being carried out?' }, options: [
      { id: 'q26a', ar: 'نعم، وهي منظمة ويمكن تكرارها بنفس المستوى.', en: 'Yes, they are organized and repeatable at the same standard.' },
      { id: 'q26b', ar: 'بعضها منظم وبعضها يعتمد على الخبرة الشخصية.', en: 'Some are organized and some depend on personal experience.' },
      { id: 'q26c', ar: 'لا، معظم العمل يعتمد على الاجتهاد والذاكرة.', en: 'No, most work depends on individual effort and memory.' }
    ] },
    { id: 'q27', categoryId: 'c06', category: { ar: 'التشغيل', en: 'Operations' }, question: { ar: 'هل يعرف كل شخص في المشروع ما المسؤوليات والقرارات التي تقع ضمن دوره؟', en: 'Does everyone in the project know which responsibilities and decisions belong to their role?' }, options: [
      { id: 'q27a', ar: 'نعم، المسؤوليات والصلاحيات واضحة.', en: 'Yes, responsibilities and authority are clear.' },
      { id: 'q27b', ar: 'المسؤوليات واضحة جزئياً.', en: 'Responsibilities are partially clear.' },
      { id: 'q27c', ar: 'لا، يحدث تداخل او ارتباك بشكل متكرر.', en: 'No, overlap or confusion happens frequently.' }
    ] },
    { id: 'q28', categoryId: 'c06', category: { ar: 'التشغيل', en: 'Operations' }, question: { ar: 'إذا غبت أنت او شخص رئيسي عدة أيام، ماذا يحدث للمشروع؟', en: 'If you or a key person are away for several days, what happens to the project?' }, options: [
      { id: 'q28a', ar: 'تستمر الأعمال الأساسية بصورة طبيعية.', en: 'Core work continues normally.' },
      { id: 'q28b', ar: 'يستمر العمل لكن مع بعض المشاكل او التأخير.', en: 'Work continues, but with some problems or delays.' },
      { id: 'q28c', ar: 'تتعطل أجزاء مهمة من المشروع.', en: 'Important parts of the project stop.' }
    ] },
    { id: 'q29', categoryId: 'c06', category: { ar: 'التشغيل', en: 'Operations' }, question: { ar: 'عندما يتكرر خطأ تشغيلي، كيف تتعاملون معه؟', en: 'When an operational error repeats, how do you deal with it?' }, options: [
      { id: 'q29a', ar: 'نبحث عن السبب ونعدل العملية لمنع تكراره.', en: 'We find the cause and adjust the process to prevent recurrence.' },
      { id: 'q29b', ar: 'نحل المشكلة الحالية، وأحياناً نراجع السبب.', en: 'We solve the current problem and sometimes review the cause.' },
      { id: 'q29c', ar: 'نعالج الخطأ كل مرة عندما يحدث.', en: 'We deal with the error each time it happens.' }
    ] },
    { id: 'q30', categoryId: 'c06', category: { ar: 'التشغيل', en: 'Operations' }, question: { ar: 'هل توجد أعمال يدوية متكررة يمكن تنظيمها او أتمتتها او تفويضها؟', en: 'Are there repetitive manual tasks that could be organized, automated, or delegated?' }, options: [
      { id: 'q30a', ar: 'راجعنا هذه الأعمال ونظمنا ما يمكن تنظيمه.', en: 'We reviewed these tasks and organized what could be organized.' },
      { id: 'q30b', ar: 'توجد فرص للتحسين لكن لم نعمل عليها بالكامل.', en: 'There are opportunities to improve, but we have not fully acted on them.' },
      { id: 'q30c', ar: 'نعم، لدينا الكثير من الأعمال اليدوية المتكررة بدون تنظيم.', en: 'Yes, we have many repetitive manual tasks without organization.' }
    ] },
    { id: 'q31', categoryId: 'c07', category: { ar: 'تجربة العميل والاحتفاظ', en: 'Customer experience and retention' }, question: { ar: 'بعد أن يشتري العميل، هل يعرف بوضوح ماذا سيحدث بعد ذلك؟', en: 'After the customer buys, do they clearly know what will happen next?' }, options: [
      { id: 'q31a', ar: 'نعم، الخطوات والتوقيت والتوقعات واضحة.', en: 'Yes, the steps, timing, and expectations are clear.' },
      { id: 'q31b', ar: 'غالباً، لكن توجد بعض النقاط غير الواضحة.', en: 'Usually, but some points are unclear.' },
      { id: 'q31c', ar: 'لا، العميل يحتاج للسؤال والمتابعة لمعرفة ما سيحدث.', en: 'No, the customer needs to ask and follow up to know what will happen.' }
    ] },
    { id: 'q32', categoryId: 'c07', category: { ar: 'تجربة العميل والاحتفاظ', en: 'Customer experience and retention' }, question: { ar: 'هل التجربة الفعلية التي يحصل عليها العميل تطابق الوعد الذي قدمته قبل البيع؟', en: 'Does the customer’s actual experience match the promise you made before the sale?' }, options: [
      { id: 'q32a', ar: 'نعم، ونراقب جودة التجربة باستمرار.', en: 'Yes, and we continuously monitor the quality of the experience.' },
      { id: 'q32b', ar: 'في أغلب الحالات، مع بعض الاختلافات.', en: 'In most cases, with some differences.' },
      { id: 'q32c', ar: 'لا، توجد فجوة واضحة بين الوعد والتنفيذ.', en: 'No, there is a clear gap between the promise and delivery.' }
    ] },
    { id: 'q33', categoryId: 'c07', category: { ar: 'تجربة العميل والاحتفاظ', en: 'Customer experience and retention' }, question: { ar: 'إذا واجه العميل مشكلة او قدم شكوى، هل توجد طريقة واضحة لمعالجتها؟', en: 'If a customer faces a problem or makes a complaint, is there a clear way to handle it?' }, options: [
      { id: 'q33a', ar: 'نعم، وهناك خطوات ومسؤوليات واضحة.', en: 'Yes, there are clear steps and responsibilities.' },
      { id: 'q33b', ar: 'توجد معالجة، لكنها تعتمد على الحالة والشخص.', en: 'There is a response, but it depends on the case and the person.' },
      { id: 'q33c', ar: 'لا، لا توجد طريقة محددة.', en: 'No, there is no defined method.' }
    ] },
    { id: 'q34', categoryId: 'c07', category: { ar: 'تجربة العميل والاحتفاظ', en: 'Customer experience and retention' }, question: { ar: 'هل تتواصل مع العملاء بعد البيع عندما يكون ذلك مناسباً؟', en: 'Do you contact customers after the sale when appropriate?' }, options: [
      { id: 'q34a', ar: 'نعم، لدينا متابعة واضحة ومفيدة للعميل.', en: 'Yes, we have clear and useful customer follow-up.' },
      { id: 'q34b', ar: 'أحياناً، لكن ليست منتظمة.', en: 'Sometimes, but it is not regular.' },
      { id: 'q34c', ar: 'لا، ينتهي التواصل غالباً بعد إتمام البيع.', en: 'No, communication usually ends after the sale is completed.' }
    ] },
    { id: 'q35', categoryId: 'c07', category: { ar: 'تجربة العميل والاحتفاظ', en: 'Customer experience and retention' }, question: { ar: 'هل تعرف لماذا يعود بعض العملاء ولماذا لا يعود آخرون؟', en: 'Do you know why some customers return and others do not?' }, options: [
      { id: 'q35a', ar: 'نعم، نتابع إعادة الشراء والاحتفاظ وملاحظات العملاء.', en: 'Yes, we track repeat purchase, retention, and customer feedback.' },
      { id: 'q35b', ar: 'لدينا فكرة عامة فقط.', en: 'We only have a general idea.' },
      { id: 'q35c', ar: 'لا، لا نتابع ذلك.', en: 'No, we do not track it.' }
    ] },
    { id: 'q36', categoryId: 'c08', category: { ar: 'المال والسيطرة على المشروع', en: 'Money and project control' }, question: { ar: 'هل تعرف بشكل منتظم كم يحقق المشروع من إيرادات ومصروفات ونتيجة مالية؟', en: 'Do you regularly know the project’s revenue, expenses, and financial result?' }, options: [
      { id: 'q36a', ar: 'نعم، لدي أرقام واضحة ومحدثة.', en: 'Yes, I have clear, up-to-date figures.' },
      { id: 'q36b', ar: 'أعرف الأرقام بشكل تقريبي او غير منتظم.', en: 'I know the figures approximately or irregularly.' },
      { id: 'q36c', ar: 'لا، لا أملك صورة مالية واضحة.', en: 'No, I do not have a clear financial picture.' }
    ] },
    { id: 'q37', categoryId: 'c08', category: { ar: 'المال والسيطرة على المشروع', en: 'Money and project control' }, question: { ar: 'هل أموال المشروع منفصلة عن أموالك ومصروفاتك الشخصية؟', en: 'Is the project’s money separate from your personal money and expenses?' }, options: [
      { id: 'q37a', ar: 'نعم، الفصل واضح ومنظم.', en: 'Yes, the separation is clear and organized.' },
      { id: 'q37b', ar: 'يوجد فصل جزئي لكن تحدث بعض الاختلاطات.', en: 'There is partial separation, but some mixing occurs.' },
      { id: 'q37c', ar: 'لا، الأموال مختلطة بشكل كبير.', en: 'No, the money is largely mixed.' }
    ] },
    { id: 'q38', categoryId: 'c08', category: { ar: 'المال والسيطرة على المشروع', en: 'Money and project control' }, question: { ar: 'هل تعرف المبالغ المستحقة لك والمبالغ التي يجب عليك دفعها ومواعيدها؟', en: 'Do you know the amounts owed to you, the amounts you must pay, and their due dates?' }, options: [
      { id: 'q38a', ar: 'نعم، وأتابعها بشكل منتظم.', en: 'Yes, and I track them regularly.' },
      { id: 'q38b', ar: 'أعرف معظمها، لكن المتابعة ليست منظمة.', en: 'I know most of them, but tracking is not organized.' },
      { id: 'q38c', ar: 'لا، أكتشف الالتزامات غالباً عند موعدها.', en: 'No, I usually discover obligations when they are due.' }
    ] },
    { id: 'q39', categoryId: 'c08', category: { ar: 'المال والسيطرة على المشروع', en: 'Money and project control' }, question: { ar: 'هل تستطيع توقع احتياجات المشروع النقدية خلال الفترة القادمة؟', en: 'Can you forecast the project’s cash needs for the coming period?' }, options: [
      { id: 'q39a', ar: 'نعم، لدي رؤية واضحة للتدفقات والالتزامات القادمة.', en: 'Yes, I have a clear view of upcoming cash flows and obligations.' },
      { id: 'q39b', ar: 'أستطيع التقدير بشكل عام.', en: 'I can estimate them generally.' },
      { id: 'q39c', ar: 'لا، نتعامل مع الوضع المالي عند حدوثه.', en: 'No, we deal with the financial situation as it occurs.' }
    ] },
    { id: 'q40', categoryId: 'c08', category: { ar: 'المال والسيطرة على المشروع', en: 'Money and project control' }, question: { ar: 'عندما تفكر في التوسع او التوظيف او شراء شيء جديد، كيف تتخذ القرار؟', en: 'When you consider expansion, hiring, or buying something new, how do you make the decision?' }, options: [
      { id: 'q40a', ar: 'أراجع القدرة المالية والعائد والمخاطر قبل القرار.', en: 'I review financial capacity, return, and risks before deciding.' },
      { id: 'q40b', ar: 'أراجع بعض الأرقام ثم أعتمد على التقدير.', en: 'I review some figures and then rely on judgment.' },
      { id: 'q40c', ar: 'أتخذ القرار غالباً لأن المبيعات جيدة او لأن المشروع يحتاجه.', en: 'I usually decide because sales are good or because the project needs it.' }
    ] }
  ];
  const getQuestion = (id) => questionBank.find((question) => question.id === id);
  const checkSessionStorageKey = 'ooxme-check-session-v1';
  const persistSavedSession = () => {
    try { window.localStorage.setItem(checkSessionStorageKey, JSON.stringify({ name: state.name, answers: state.answers })); } catch { /* storage may be unavailable */ }
  };
  const state = {
    currentIndex: 0,
    answers: [],
    answerLocked: false,
    completed: false,
    name: ''
  };
  const language = () => root.lang === 'en' ? 'en' : 'ar';
  const localized = (value) => value?.[language()] || value?.ar || '';
  const getOption = (id) => questionBank.flatMap((question) => question.options).find((option) => option.id === id);
  const floatingMenu = document.querySelector('[data-s-check-floating-menu]');
  const menuItems = [...document.querySelectorAll('[data-s-check-menu-action]')];
  const progressPanel = document.querySelector('[data-s-check-progress-panel]');
  const progressGauges = [...document.querySelectorAll('[data-s-check-progress-gauge]')];
  const progressGaugeTickCount = 80;
  let progressAnimationGeneration = 0;
  progressGauges.forEach((gauge) => {
    const ticks = gauge.querySelector('[data-s-check-progress-gauge-ticks]');
    for (let index = 0; index < progressGaugeTickCount; index += 1) {
      const tick = document.createElement('span');
      tick.className = 's-check-progress-gauge-tick';
      tick.style.setProperty('--s-check-progress-tick-angle', `${index * (360 / progressGaugeTickCount)}deg`);
      tick.style.setProperty('--s-check-progress-tick-delay', `${index * 8}ms`);
      ticks?.append(tick);
    }
  });
  const menuCopy = {
    ar: {
      menu: 'قائمة التشخيص',
      open: 'فتح قائمة التشخيص',
      close: 'إغلاق قائمة التشخيص',
      home: 'الرئيسية',
      language: 'تغيير اللغة',
      appearance: 'تغيير المظهر',
    },
    en: {
      menu: 'Diagnosis menu',
      open: 'Open diagnosis menu',
      close: 'Close diagnosis menu',
      home: 'Home',
      language: 'Change Language',
      appearance: 'Change Appearance'
    }
  };
  const savedLanguage = (() => {
    try { return window.localStorage.getItem('ooxme-language'); } catch { return null; }
  })();
  if (savedLanguage === 'ar' || savedLanguage === 'en') {
    root.lang = savedLanguage;
    root.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
  }
  const categoryOrder = [...new Map(questionBank.map((question) => [question.categoryId, question.category])).entries()];
  const updateProgressPresentation = () => {
    const currentLanguage = language();
    const copy = menuCopy[currentLanguage];
    if (!copy || !progressGauges.length) return;
    const answeredIds = new Set(state.answers.map((answer) => answer.questionId));
    const answeredCount = state.answers.length;
    const completedSections = categoryOrder.filter(([categoryId]) => questionBank
      .filter((question) => question.categoryId === categoryId)
      .every((question) => answeredIds.has(question.id))).length;
    const values = {
      score: { value: '—', fraction: 0, label: currentLanguage === 'ar' ? 'النتيجة غير متاحة' : 'Score unavailable', title: currentLanguage === 'ar' ? 'النتيجة' : 'Score' },
      sections: { value: String(completedSections), fraction: completedSections / categoryOrder.length, label: currentLanguage === 'ar' ? `${completedSections} من ${categoryOrder.length} أقسام مكتملة` : `${completedSections} of ${categoryOrder.length} sections complete`, title: currentLanguage === 'ar' ? 'الأقسام' : 'Sections' },
      questions: { value: String(answeredCount), fraction: answeredCount / questionBank.length, label: currentLanguage === 'ar' ? `${answeredCount} من ${questionBank.length} سؤالاً مجاباً` : `${answeredCount} of ${questionBank.length} questions answered`, title: currentLanguage === 'ar' ? 'الأسئلة' : 'Questions' }
    };
    progressGauges.forEach((gauge) => {
      const data = values[gauge.dataset.sCheckProgressGauge];
      if (!data) return;
      gauge.setAttribute('aria-label', data.label);
      const value = gauge.querySelector('[data-s-check-progress-gauge-value]');
      if (value) value.textContent = data.value;
      const title = gauge.querySelector('[data-s-check-progress-gauge-label]');
      if (title) title.textContent = data.title;
      gauge.querySelectorAll('.s-check-progress-gauge-tick').forEach((tick, index) => {
        tick.classList.toggle('is-complete', index < Math.round(data.fraction * progressGaugeTickCount));
      });
    });
  };
  const animateProgressGauges = () => {
    const generation = ++progressAnimationGeneration;
    progressGauges.forEach((gauge) => {
      gauge.querySelectorAll('.s-check-progress-gauge-tick').forEach((tick) => {
        tick.classList.add('is-sweep-complete');
        tick.classList.remove('is-complete');
      });
    });
    window.setTimeout(() => {
      if (generation !== progressAnimationGeneration) return;
      progressGauges.forEach((gauge) => gauge.querySelectorAll('.s-check-progress-gauge-tick').forEach((tick, index) => {
        tick.style.setProperty('--s-check-progress-reverse-delay', `${(progressGaugeTickCount - index) * 8}ms`);
        tick.classList.remove('is-sweep-complete', 'is-complete');
        tick.classList.add('is-sweep-reversing');
      }));
      updateProgressPresentation();
      window.setTimeout(() => {
        if (generation !== progressAnimationGeneration) return;
        progressGauges.forEach((gauge) => gauge.querySelectorAll('.s-check-progress-gauge-tick').forEach((tick) => tick.classList.remove('is-sweep-reversing')));
      }, (progressGaugeTickCount * 8) + 260);
    }, (progressGaugeTickCount * 8) + 260);
  };
  const updateMenuCopy = () => {
    const currentLanguage = language();
    const copy = menuCopy[currentLanguage];
    if (!floatingMenu || !copy) return;
    floatingMenu.setAttribute('aria-label', copy.menu);
    menuItems.forEach((item) => {
      const label = item.querySelector(`[data-s-check-menu-label="${item.dataset.sCheckMenuAction}"]`);
      if (label) label.textContent = copy[item.dataset.sCheckMenuAction];
    });
    updateProgressPresentation();
    if (ooxoAvatar) {
      ooxoAvatar.setAttribute('aria-label', floatingMenu.classList.contains('is-open') ? copy.close : copy.open);
      ooxoAvatar.setAttribute('aria-expanded', String(floatingMenu.classList.contains('is-open')));
    }
  };
  const setMenuOpen = (open, restoreFocus = false) => {
    if (!floatingMenu || !ooxoAvatar) return;
    body.classList.toggle('is-check-menu-open', open);
    floatingMenu.classList.toggle('is-open', open);
    floatingMenu.setAttribute('aria-hidden', String(!open));
    if ('inert' in floatingMenu) floatingMenu.inert = !open;
    ooxoAvatar.classList.toggle('is-active', open);
    ooxoAvatar.classList.toggle('is-rotated', open);
    ooxoAvatar.setAttribute('aria-pressed', String(open));
    ooxoAvatar.setAttribute('aria-expanded', String(open));
    updateMenuCopy();
    if (open) {
      animateProgressGauges();
      window.requestAnimationFrame(() => menuItems[0]?.focus());
    } else if (restoreFocus) {
      ooxoAvatar.focus();
    }
  };
  const applyCheckLanguage = (nextLanguage) => {
    const next = nextLanguage === 'en' ? 'en' : 'ar';
    root.lang = next;
    root.dir = next === 'ar' ? 'rtl' : 'ltr';
    try { window.localStorage.setItem('ooxme-language', next); } catch { /* storage may be unavailable */ }
    window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language: next } }));
  };
  const applyCheckAppearance = (nextAppearance) => {
    const day = nextAppearance === 'day';
    root.classList.toggle('is-day-mode', day);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', day ? '#FFFFFF' : '#000000');
  };
  ooxoAvatar?.addEventListener('click', () => {
    setMenuOpen(!floatingMenu?.classList.contains('is-open'));
  });
  floatingMenu?.addEventListener('click', (event) => {
    const item = event.target.closest('[data-s-check-menu-action]');
    if (!item) return;
    const action = item.dataset.sCheckMenuAction;
    if (action === 'home') {
      setMenuOpen(false);
      window.location.assign('/');
    } else if (action === 'language') {
      setMenuOpen(false);
      applyCheckLanguage(language() === 'ar' ? 'en' : 'ar');
    } else if (action === 'appearance') {
      setMenuOpen(false);
      applyCheckAppearance(root.classList.contains('is-day-mode') ? 'dark' : 'day');
    }
  });
  floatingMenu?.addEventListener('keydown', (event) => {
    if (!menuItems.length) return;
    const index = menuItems.indexOf(document.activeElement);
    let nextIndex = -1;
    if (event.key === 'ArrowDown') nextIndex = (index + 1 + menuItems.length) % menuItems.length;
    if (event.key === 'ArrowUp') nextIndex = (index - 1 + menuItems.length) % menuItems.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = menuItems.length - 1;
    if (event.key === 'Escape') {
      event.preventDefault();
      setMenuOpen(false, true);
      return;
    }
    if (nextIndex >= 0) {
      event.preventDefault();
      menuItems[nextIndex].focus();
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (!floatingMenu?.classList.contains('is-open')) return;
    if (floatingMenu.contains(event.target) || ooxoAvatar?.contains(event.target)) return;
    setMenuOpen(false);
  }, { passive: true });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && floatingMenu?.classList.contains('is-open')) setMenuOpen(false, true);
  });
  const conversation = document.querySelector('[data-s-check-message-list]')
    || document.querySelector('[data-s-check-conversation-canvas]');
  let messageOrder = 0;
  conversation?.querySelectorAll(':scope > *').forEach((item) => {
    item.dataset.sCheckMessageOrder = String(messageOrder++);
  });
  let conversationScrollFrame = 0;
  let conversationNearLatest = true;
  conversationScroll?.addEventListener('scroll', () => {
    conversationNearLatest = conversationScroll.scrollHeight - conversationScroll.clientHeight - conversationScroll.scrollTop <= 32;
  }, { passive: true });
  const scrollConversationToLatest = () => {
    if (!conversationScroll || !conversationNearLatest || conversationScrollFrame) return;
    conversationScrollFrame = window.requestAnimationFrame(() => {
      conversationScrollFrame = 0;
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      conversationScroll.scrollTo({
        top: conversationScroll.scrollHeight,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  };
  const answerBubbles = () => [...document.querySelectorAll('[data-s-check-answer-bubble]')];
  testOptions.forEach((option) => {
    option.addEventListener('click', () => selectAnswer(option));
  });

  const applyCopy = () => {
    const currentLanguage = language();
    if (introInput) {
      const optionsVisible = infoCard?.getAttribute('aria-hidden') === 'false';
      introInput.placeholder = optionsVisible
        ? (currentLanguage === 'ar' ? 'اختر من الاختيارات أعلاه' : 'Choose from the options above')
        : (currentLanguage === 'ar' ? 'اكتب اسمك..' : 'Type your name');
      introInput.lang = currentLanguage;
      introInput.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    }
    const fixedCopy = {
      welcome: { ar: 'مرحباً بك في اوكسوم', en: 'Welcome to OOXME' },
      upper: { ar: 'هل أنت جاهز للبدء في التشخيص التجاري؟', en: 'Are you ready to begin the business diagnosis?' },
      lower: { ar: 'أولاً ما هو اسمك؟', en: 'First, what is your name?' },
      start: { ar: 'لنبدأ', en: 'Let\'s begin' }
    };
    document.querySelectorAll('[data-s-check-bubble]').forEach((bubble) => {
      const question = bubble.dataset.questionId ? getQuestion(bubble.dataset.questionId) : null;
      const fixed = fixedCopy[bubble.dataset.sCheckBubble];
      if (question) bubble.textContent = localized(question.question);
      else if (fixed && bubble !== userBubble) bubble.textContent = fixed[currentLanguage];
      bubble.lang = currentLanguage;
      bubble.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    });
    answerBubbles().forEach((bubble) => {
      const option = getOption(bubble.dataset.optionId);
      if (option) {
        bubble.textContent = localized(option);
        bubble.lang = currentLanguage;
        bubble.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
      }
    });
    const currentQuestion = questionBank[state.currentIndex];
    if (testBubble && currentQuestion) {
      testBubble.lang = currentLanguage;
      testBubble.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
      testBubble.dataset.questionId = currentQuestion.id;
      testBubble.querySelectorAll('[data-s-check-test-option-label]').forEach((label, index) => {
        label.textContent = localized(currentQuestion.options[index]);
      });
      testBubble.setAttribute('aria-label', currentLanguage === 'ar' ? 'خيارات الإجابة' : 'Answer options');
    }
    updateMenuCopy();
    scheduleBubbleMeasure();
  };
  applyCopy();
  const bubbles = [...document.querySelectorAll('[data-s-check-bubble]')];
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(scheduleBubbleMeasure);
    bubbles.forEach((bubble) => observer.observe(bubble));
    if (testBubble) observer.observe(testBubble);
  }
  window.addEventListener('ooxme-language-change', applyCopy);
  const showIntroElement = (element) => {
    if (!element) return;
    element.classList.add('is-intro-visible');
    element.setAttribute('aria-hidden', 'false');
    updateBubbleGroups();
    scrollConversationToLatest();
  };
  const avatarForGroup = (owner, groupKey) => {
    if (!conversation || !groupKey) return null;
    const existing = conversation.querySelector(`.s-page__icon-button[data-s-check-avatar-group="${groupKey}"]`);
    if (existing) return existing;
    const template = owner === 'ooxme' ? followupAvatar : userAvatar;
    if (!template) return null;
    const avatar = template.cloneNode(true);
    avatar.dataset.sCheckAvatarGroup = groupKey;
    avatar.dataset.sCheckGeneratedAvatar = 'true';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.classList.remove('is-intro-visible');
    conversation.append(avatar);
    return avatar;
  };
  const completionDividerForCategory = (categoryId) => conversation?.querySelector(`[data-s-check-completion-category="${categoryId}"]`);
  const updateCompletionDividers = () => {
    conversation?.querySelectorAll('[data-s-check-completion-category]').forEach((divider) => {
      const category = categoryOrder.find(([id]) => id === divider.dataset.sCheckCompletionCategory)?.[1];
      if (!category) return;
      const label = language() === 'ar'
        ? `اكتملت أسئلة قسم ${category.ar}`
        : `${category.en} questions completed`;
      divider.querySelector('[data-s-check-completion-label]').textContent = label;
      divider.setAttribute('aria-label', label);
      divider.lang = language();
      divider.dir = language() === 'ar' ? 'rtl' : 'ltr';
    });
  };
  const ensureCompletionDivider = (question) => {
    if (!question || (questionBank.indexOf(question) + 1) % 5 !== 0 || completionDividerForCategory(question.categoryId)) return;
    const category = categoryOrder.find(([id]) => id === question.categoryId)?.[1];
    if (!category || !conversation) return;
    const divider = document.createElement('div');
    divider.className = 's-check-completion-divider';
    divider.dataset.sCheckCompletionCategory = question.categoryId;
    divider.setAttribute('role', 'separator');
    divider.setAttribute('aria-hidden', 'true');
    divider.innerHTML = '<span class="s-check-completion-divider-line" aria-hidden="true"></span><span data-s-check-completion-label></span><span class="s-check-completion-divider-line" aria-hidden="true"></span>';
    divider.dataset.sCheckMessageOrder = String(messageOrder++);
    conversation.append(divider);
    updateCompletionDividers();
    divider.classList.add('is-intro-visible');
    divider.setAttribute('aria-hidden', 'false');
  };
  window.addEventListener('ooxme-language-change', updateCompletionDividers);
  const updateBubbleGroups = () => {
    if (!conversation) return;

    // Render from normal document flow. Existing wrappers are dismantled first
    // so every update has one canonical message order and no stale coordinates.
    [...conversation.querySelectorAll(':scope > .s-check-message-group')].forEach((group) => {
      [...group.querySelectorAll('.s-check-ooxo-bubble, .s-check-user-avatar, .s-check-followup-avatar')]
        .forEach((item) => conversation.append(item));
      group.remove();
    });
    const items = [...conversation.querySelectorAll(':scope > .s-check-ooxo-bubble[data-message-owner], :scope > [data-s-check-completion-category]')]
      .sort((a, b) => Number(a.dataset.sCheckMessageOrder || 0) - Number(b.dataset.sCheckMessageOrder || 0));
    conversation.querySelectorAll('.is-flow-hidden').forEach((item) => item.classList.remove('is-flow-hidden'));
    conversation.querySelectorAll(':scope > .s-check-user-avatar, :scope > .s-check-followup-avatar').forEach((avatar) => avatar.classList.add('is-flow-hidden'));
    items.filter((item) => !item.classList.contains('is-intro-visible')).forEach((item) => item.classList.add('is-flow-hidden'));
    items.forEach((item) => conversation.append(item));
    conversation.querySelectorAll(':scope > .s-check-ooxo-bubble[data-message-owner]').forEach((bubble) => {
      bubble.classList.remove('is-bubble-single', 'is-bubble-first', 'is-bubble-middle', 'is-bubble-last');
    });

    const visible = items.filter((item) => item.classList.contains('is-intro-visible'));
    // Remove only visible flow items; hidden bubbles remain in the DOM so
    // question lookup and language updates continue to use the same nodes.
    visible.forEach((item) => item.remove());
    let index = 0;
    while (index < visible.length) {
      const item = visible[index];
      if (item.matches('[data-s-check-completion-category]')) {
        conversation.append(item);
        index += 1;
        continue;
      }
      const owner = item.dataset.messageOwner;
      const group = [item];
      while (index + group.length < visible.length) {
        const next = visible[index + group.length];
        if (!next.matches('.s-check-ooxo-bubble[data-message-owner]') || next.dataset.messageOwner !== owner) break;
        group.push(next);
      }
      const groupWrap = document.createElement('div');
      groupWrap.className = `s-check-message-group s-check-message-group--${owner}`;
      const stack = document.createElement('div');
      stack.className = 's-check-message-stack';
      const last = group[group.length - 1];
      const groupKey = group[0].dataset.sCheckAvatarGroup
        || (owner === 'ooxme' ? group[0].dataset.sCheckOoxmeGroup : 'name');
      const avatar = avatarForGroup(owner, groupKey);
      group.forEach((bubble, bubbleIndex) => {
        const position = group.length === 1 ? 'single' : bubbleIndex === 0 ? 'first' : bubbleIndex === group.length - 1 ? 'last' : 'middle';
        bubble.classList.add(`is-bubble-${position}`);
        if (bubble !== last) stack.append(bubble);
      });
      if (group.length > 1) groupWrap.append(stack);
      const row = document.createElement('div');
      row.className = 's-check-message-row';
      if (avatar) {
        avatar.classList.remove('is-flow-hidden');
        avatar.classList.add('is-intro-visible');
        avatar.setAttribute('aria-hidden', 'false');
        row.append(avatar);
      }
      row.append(last);
      groupWrap.append(row);
      conversation.append(groupWrap);
      index += group.length;
    }
    conversation.querySelectorAll(':scope > .s-check-ooxo-bubble[data-message-owner], :scope > [data-s-check-completion-category], :scope > .s-check-user-avatar, :scope > .s-check-followup-avatar')
      .forEach((item) => item.classList.toggle('is-flow-hidden', !item.classList.contains('is-intro-visible')));
    const computedRoot = getComputedStyle(root);
    const x = Number.parseFloat(computedRoot.getPropertyValue('--s-check-x')) || 18;
    const card = document.querySelector('[data-s-check-info-card]');
    const composerField = document.querySelector('.s-check-composer-field');
    const scrollRect = conversationScroll?.getBoundingClientRect();
    const cardVisible = card?.getAttribute('aria-hidden') === 'false';
    const anchorTop = cardVisible
      ? card.getBoundingClientRect().top
      : (composerField?.getBoundingClientRect().top || scrollRect?.bottom || 0);
    const flowBottomPadding = scrollRect
      ? Math.max(0, scrollRect.bottom - anchorTop + (x * 2))
      : x * 2;
    conversation.style.setProperty('--s-check-flow-bottom-padding', `${flowBottomPadding}px`);
    const isOverflowing = Boolean(conversationScroll && conversationScroll.scrollHeight > conversationScroll.clientHeight + 1);
    conversationScroll?.classList.toggle('is-overflowing', isOverflowing);
    conversationLayer?.classList.toggle('is-overflowing', isOverflowing);
  };
  const createBubble = ({ owner, text, questionId, optionId }) => {
    const bubble = document.createElement('div');
    bubble.className = owner === 'ooxme'
      ? 's-check-ooxo-bubble s-check-ooxo-bubble--followup'
      : 's-check-ooxo-bubble s-check-user-bubble';
    bubble.dataset.messageOwner = owner;
    if (owner === 'ooxme') {
      bubble.dataset.sCheckOoxmeGroup = `question-${questionId}`;
      bubble.dataset.sCheckAvatarGroup = `question-${questionId}`;
      bubble.dataset.sCheckQuestionBubble = 'true';
      bubble.dataset.questionId = questionId;
      bubble.dataset.sCheckBubble = 'question';
    } else {
      bubble.dataset.sCheckAvatarGroup = `answer-${optionId}`;
      bubble.dataset.sCheckAnswerBubble = 'true';
      bubble.dataset.optionId = optionId;
    }
    bubble.dataset.sCheckMessageOrder = String(messageOrder++);
    conversation?.append(bubble);
    return bubble;
  };
  const renderQuestion = (question, show = true) => {
    let bubble = document.querySelector(`[data-s-check-question-bubble][data-question-id="${question.id}"]`);
    if (!bubble) bubble = createBubble({ owner: 'ooxme', text: localized(question.question), questionId: question.id });
    bubble.textContent = localized(question.question);
    bubble.lang = language();
    bubble.dir = language() === 'ar' ? 'rtl' : 'ltr';
    bubble.setAttribute('aria-hidden', show ? 'false' : 'true');
    if (show) bubble.classList.add('is-intro-visible');
    return bubble;
  };
  const renderOptions = (question, { entering = false } = {}) => {
    if (!testBubble) return;
    testBubble.dataset.questionId = question.id;
    testBubble.classList.remove('is-empty');
    testBubble.setAttribute('aria-hidden', 'false');
    testOptions.forEach((option, index) => {
      option.dataset.optionId = question.options[index].id;
      option.disabled = entering;
      option.setAttribute('aria-disabled', String(entering));
      option.setAttribute('aria-checked', 'false');
      option.classList.remove('is-selected', 'is-options-exiting', 'is-options-entering');
      if (entering) option.classList.add('is-options-entering');
      const label = option.querySelector('[data-s-check-test-option-label]');
      if (label) label.textContent = localized(question.options[index]);
    });
    applyCopy();
  };
  const animateOptionsToQuestion = (question) => {
    const generation = ++optionTransitionGeneration;
    testOptions.forEach((option, index) => {
      window.setTimeout(() => option.classList.add('is-options-exiting'), index * optionExitStagger);
    });
    const exitDuration = ((testOptions.length - 1) * optionExitStagger) + optionTransitionDuration;
    window.setTimeout(() => {
      if (generation !== optionTransitionGeneration) return;
      renderOptions(question, { entering: true });
      testOptions.forEach((option, index) => {
        window.setTimeout(() => {
          if (generation !== optionTransitionGeneration) return;
          option.classList.remove('is-options-entering');
          if (index === testOptions.length - 1) {
            testOptions.forEach((candidate) => {
              candidate.disabled = false;
              candidate.setAttribute('aria-disabled', 'false');
            });
            state.answerLocked = false;
          }
        }, index * optionEnterStagger);
      });
    }, exitDuration);
  };
  const beginConversationAfterName = (name, restoredAnswers = []) => {
    const resumeAnswers = restoredAnswers.length
      ? restoredAnswers.filter((answer) => getQuestion(answer.questionId)?.options.some((option) => option.id === answer.optionId))
      : [];
    state.name = name;
    userBubble.textContent = name;
    userBubble.lang = language();
    userBubble.dir = language() === 'ar' ? 'rtl' : 'ltr';
    userAvatar.querySelector('.s-check-user-avatar-initial').textContent = [...name][0] || 'A';
    introInput.value = '';
    introInput.disabled = true;
    introInput.readOnly = true;
    introInput.setAttribute('aria-disabled', 'true');
    showIntroElement(userAvatar);
    showIntroElement(userBubble);
    document.body.classList.remove('is-check-intro');
    state.currentIndex = Math.min(questionBank.length, resumeAnswers.length);
    state.answers = resumeAnswers;
    state.completed = resumeAnswers.length >= questionBank.length;
    state.answerLocked = false;
    if (resumeAnswers.length) persistSavedSession();
    infoCard?.classList.remove('is-empty');
    infoCard?.setAttribute('aria-hidden', 'false');
    const question = questionBank[0];
    renderQuestion(question, true);
    renderOptions(question);
    resumeAnswers.forEach((answer, index) => {
      const option = getOption(answer.optionId);
      const answeredQuestion = getQuestion(answer.questionId);
      const answerBubble = createBubble({ owner: 'user', text: localized(option), optionId: answer.optionId });
      answerBubble.textContent = localized(option);
      answerBubble.lang = language();
      answerBubble.dir = language() === 'ar' ? 'rtl' : 'ltr';
      answerBubble.classList.add('is-intro-visible');
      answerBubble.setAttribute('aria-hidden', 'false');
      ensureCompletionDivider(answeredQuestion);
      if (index < resumeAnswers.length - 1) renderQuestion(questionBank[index + 1], true);
    });
    if (!state.completed) {
      renderQuestion(questionBank[state.currentIndex], true);
      renderOptions(questionBank[state.currentIndex]);
    } else {
      infoCard?.setAttribute('aria-hidden', 'true');
    }
    showIntroElement(document.querySelector('[data-s-check-bubble="start"]'));
    showIntroElement(followupAvatar);
    window.setTimeout(() => {
      if (resumeAnswers.length) {
        applyCopy();
        measureBubbleRise();
        updateBubbleGroups();
        scheduleBubbleMeasure();
        scrollConversationToLatest();
        return;
      }
      renderQuestion(question, true);
      renderOptions(question);
      measureBubbleRise();
      updateBubbleGroups();
      scheduleBubbleMeasure();
      scrollConversationToLatest();
    }, 350);
    scheduleBubbleMeasure();
  };
  const selectAnswer = (optionElement) => {
    if (state.answerLocked || state.completed || Date.now() - lastAnswerSelectionAt < 900) return;
    const question = questionBank[state.currentIndex];
    const option = question?.options.find((candidate) => candidate.id === optionElement.dataset.optionId);
    if (!question || !option) return;
    state.answerLocked = true;
    lastAnswerSelectionAt = Date.now();
    optionTransitionGeneration += 1;
    testOptions.forEach((candidate) => {
      candidate.disabled = true;
      candidate.setAttribute('aria-disabled', 'true');
      candidate.setAttribute('aria-checked', String(candidate === optionElement));
    });
    state.answers.push({ questionId: question.id, optionId: option.id });
    persistSavedSession();
    const answerBubble = createBubble({ owner: 'user', text: localized(option), optionId: option.id });
    answerBubble.textContent = localized(option);
    answerBubble.lang = language();
    answerBubble.dir = language() === 'ar' ? 'rtl' : 'ltr';
    answerBubble.classList.add('is-intro-visible');
    answerBubble.setAttribute('aria-hidden', 'false');
    ensureCompletionDivider(question);
    optionElement.classList.add('is-selected');
    measureBubbleRise();
    updateBubbleGroups();
    scrollConversationToLatest();
    window.setTimeout(() => {
      if (state.currentIndex >= questionBank.length - 1) {
        state.completed = true;
        state.answerLocked = false;
        persistSavedSession();
        scheduleBubbleMeasure();
        return;
      }
      state.currentIndex += 1;
      const nextQuestion = questionBank[state.currentIndex];
      const nextBubble = renderQuestion(nextQuestion, true);
      nextBubble.classList.add('is-intro-visible');
      animateOptionsToQuestion(nextQuestion);
      measureBubbleRise();
      updateBubbleGroups();
      scheduleBubbleMeasure();
      scrollConversationToLatest();
    }, 300);
  };
  const startIntro = () => {
    if (introStarted) return;
    introStarted = true;
    document.body.classList.add('is-check-intro');
    if (userBubble) userBubble.textContent = '';
    const infoCard = document.querySelector('[data-s-check-info-card]');
    infoCard?.classList.remove('is-empty');
    infoCard?.setAttribute('aria-hidden', 'true');
    if (introInput) {
      introInput.disabled = true;
      introInput.readOnly = false;
      introInput.removeAttribute('aria-disabled');
      introInput.placeholder = root.lang === 'ar' ? 'اكتب اسمك..' : 'Type your name';
    }
    showIntroElement(ooxoAvatar);
    showIntroElement(document.querySelector('[data-s-check-bubble="welcome"]'));
    window.setTimeout(() => showIntroElement(document.querySelector('[data-s-check-bubble="upper"]')), 350);
    window.setTimeout(() => {
      showIntroElement(document.querySelector('[data-s-check-bubble="lower"]'));
      if (introInput) introInput.disabled = false;
    }, 700);
  };
  root.classList.remove('s-x-initializing');
  startIntro();
})();
