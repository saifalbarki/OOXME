const track = document.querySelector('[data-master-track]');
const HOMEPAGE_NAVIGATION_LOCKED = false;
const experience = document.querySelector('.master-panel-experience');
const root = document.documentElement;
const setStableViewportHeight = () => root.style.setProperty('--ooxme-stable-viewport-height', `${window.innerHeight}px`);
setStableViewportHeight();
window.addEventListener('orientationchange', () => window.setTimeout(setStableViewportHeight, 160));
document.querySelectorAll('[data-progress]').forEach((progress) => {
  const value = Math.min(100, Math.max(0, Number(progress.dataset.progress) || 0));
  const segmentCount = 30;
  const completedSegments = Math.round((value / 100) * segmentCount);
  progress.setAttribute('aria-valuenow', String(value));
  progress.replaceChildren(...Array.from({ length: segmentCount }, (_, index) => {
    const segment = document.createElement('i');
    segment.classList.toggle('is-complete', index < completedSegments);
    return segment;
  }));
});
const searchInput = document.querySelector('[data-search-input]');
const applyLanguage = (next) => {
  language = next;
  root.lang = next;
  root.dir = next === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[next]; });
  searchInput.placeholder = searchInput.dataset[`${next}Placeholder`];
  document.querySelectorAll('[data-home-search-input]').forEach((input) => { input.placeholder = input.dataset[`${next}Placeholder`]; });
  document.querySelectorAll('[data-home-account-input], [data-employee-dashboard-edit-input]').forEach((input) => { input.placeholder = input.dataset[`${next}Placeholder`]; });
  document.querySelectorAll('[data-language-toggle]').forEach((button) => button.setAttribute('aria-label', next === 'ar' ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'));
  try { localStorage.setItem('ooxme-language', next); } catch (_) {}
  window.dispatchEvent(new CustomEvent('ooxme-language-change', { detail: { language: next } }));
};
let language = 'en';
try { language = localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'; } catch (_) {}
applyLanguage(language);
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => applyLanguage(root.lang === 'ar' ? 'en' : 'ar')));
window.addEventListener('storage', (event) => { if (event.key === 'ooxme-language') applyLanguage(event.newValue === 'ar' ? 'ar' : 'en'); });
const searchOverlay = document.querySelector('[data-search-overlay]');
const searchSuggestion = document.querySelector('[data-search-suggestion]');
let searchCloseTimer;
const searchOverlayCloseDuration = 1450;
const resizeSearchInput = () => {
  searchInput.style.height = '24px';
  searchInput.style.height = `${searchInput.scrollHeight}px`;
  searchOverlay.querySelector('.search-overlay-field').style.height = `${Math.max(48, searchInput.scrollHeight + 24)}px`;
};
const updateSearchState = () => {
  const query = searchInput.value.trim();
  searchOverlay.classList.toggle('is-typing', Boolean(query));
  searchSuggestion.hidden = !query;
  if (query) searchSuggestion.textContent = root.lang === 'ar' ? `اقتراح: «${query}»` : `Search for “${query}”`;
  resizeSearchInput();
};
const setSearchOpen = (open) => {
  window.clearTimeout(searchCloseTimer);
  if (open) {
    searchOverlay.hidden = false;
    updateSearchState();
    window.requestAnimationFrame(() => searchOverlay.classList.add('is-open'));
    return;
  }
  searchOverlay.classList.remove('is-open');
  searchCloseTimer = window.setTimeout(() => { searchOverlay.hidden = true; }, searchOverlayCloseDuration);
};
document.querySelectorAll('[data-search-toggle]').forEach((button) => button.addEventListener('click', (event) => {
  if (HOMEPAGE_NAVIGATION_LOCKED) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return;
  }
  event.stopPropagation();
  setSearchOpen(searchOverlay.hidden);
}));
searchOverlay.addEventListener('click', () => setSearchOpen(false));
searchOverlay.querySelectorAll('a, label, [data-search-suggestion]').forEach((element) => element.addEventListener('click', (event) => event.stopPropagation()));
searchInput.addEventListener('input', updateSearchState);
const requestedPanel = new URLSearchParams(window.location.search).get('panel');
const dashboardPanelId = requestedPanel === 'client-dashboard' ? 'client-dashboard' : 'employee-dashboard';
const isClientDashboard = dashboardPanelId === 'client-dashboard';
document.body.dataset.dashboardAudience = dashboardPanelId === 'client-dashboard' ? 'client' : 'employee';
const applyClientDashboardCopy = (next = language) => {
  if (!isClientDashboard) return;
  document.querySelectorAll('[data-client-en][data-client-ar]').forEach((element) => { element.textContent = element.dataset[`client${next === 'ar' ? 'Ar' : 'En'}`]; });
};
applyClientDashboardCopy();
window.addEventListener('ooxme-language-change', (event) => applyClientDashboardCopy(event.detail?.language));
const panelIds = ['intro', dashboardPanelId];
const originalPanels = [...track.querySelectorAll('.master-panel-screen')];
originalPanels.forEach((panel, index) => { panel.dataset.panelId = panelIds[index]; });
const panels = [...document.querySelectorAll('.master-panel-screen')];
track.style.height = `calc(var(--ooxme-stable-viewport-height) * ${panels.length})`;
const requestedPanelId = /^\d+$/.test(requestedPanel || '') ? panelIds[Number(requestedPanel)] : requestedPanel;
const requestedPanelIndex = HOMEPAGE_NAVIGATION_LOCKED && requestedPanelId !== dashboardPanelId
  ? 0
  : panels.findIndex((panel) => panel.dataset.panelId === requestedPanelId);
let panelIndex = requestedPanelIndex >= 0 ? requestedPanelIndex : 0;
if (panelIndex) track.style.transform = `translateY(calc(var(--ooxme-stable-viewport-height) * ${-panelIndex}))`;
let panelTransitionTimer;
const revealPanel = (index) => {
  panels.forEach((panel, panelNumber) => panel.classList.toggle('is-active', panelNumber === index));
};
const moveTo = (next) => {
  if (HOMEPAGE_NAVIGATION_LOCKED) return;
  const target = Math.max(0, Math.min(panels.length - 1, next));
  if (target === panelIndex) return;
  panelIndex = target;
  panels.forEach((panel) => panel.classList.remove('is-active'));
  track.style.transform = `translateY(calc(var(--ooxme-stable-viewport-height) * ${-panelIndex}))`;
  window.clearTimeout(panelTransitionTimer);
  panelTransitionTimer = window.setTimeout(() => revealPanel(panelIndex), 620);
};
if (!HOMEPAGE_NAVIGATION_LOCKED && requestedPanelId !== dashboardPanelId) window.OOXMEMasterPanelDrag?.register({ experience, track, panels, getIndex: () => panelIndex, moveTo });
revealPanel(panelIndex);
const setupEmployeeDashboardPanels = () => {
  if (requestedPanelId !== dashboardPanelId || !experience || !window.OOXMEMasterPanelDrag) return;
  const employeePanel = document.querySelector('.employee-dashboard-panel');
  const employeeNavigation = employeePanel?.querySelector('[data-employee-dashboard-contextual]');
  if (!employeePanel || !employeeNavigation) return;

  const employeeTrack = document.createElement('div');
  employeeTrack.className = 'master-panel-track employee-dashboard-track';
  employeeTrack.style.height = 'calc(var(--ooxme-stable-viewport-height) * 2)';

  const emptyPanel = document.createElement('section');
  emptyPanel.className = 'master-panel-screen employee-dashboard-panel employee-dashboard-empty-panel';
  const emptyMasterPanel = document.createElement('div');
  emptyMasterPanel.className = 'master-panel';
  const emptyCard = document.createElement('div');
  emptyCard.className = 'employee-dashboard-empty-card';
  const selectorProxy = document.createElement('div');
  selectorProxy.className = 'homepage-account-selector studio-selector employee-dashboard-top-selector employee-dashboard-panel-two-selector';
  selectorProxy.dataset.employeeDashboardSelector = '';
  selectorProxy.dataset.active = 'progress';
  selectorProxy.setAttribute('role', 'tablist');
  selectorProxy.setAttribute('aria-label', 'Employee dashboard view');
  selectorProxy.innerHTML = '<span class="homepage-account-selector-indicator" aria-hidden="true"></span><button type="button" data-employee-dashboard-state-option="progress" role="tab" aria-selected="true"><span data-en="Progress" data-ar="التقدم">Progress</span></button><button type="button" data-employee-dashboard-state-option="details" role="tab" aria-selected="false"><span data-en="Details" data-ar="التفاصيل">Details</span></button>';
  const timeline = document.createElement('div');
  timeline.className = 'employee-dashboard-timeline employee-dashboard-panel-two-timeline';
  timeline.setAttribute('aria-label', 'Employee task timeline');
  timeline.innerHTML = '<span class="employee-dashboard-timeline-line" aria-hidden="true"></span><div class="employee-dashboard-task-viewport"><div class="employee-dashboard-task-track"></div></div>';
  const demoTasks = [
    { en: { title: 'Campaign Launch', description: 'Prepare and launch the approved monthly campaign.' }, ar: { title: 'إطلاق الحملة', description: 'إعداد وإطلاق الحملة الشهرية المعتمدة.' } },
    { en: { title: 'Content Planning', description: 'Prepare and approve the monthly content direction.' }, ar: { title: 'تخطيط المحتوى', description: 'إعداد واعتماد توجه المحتوى الشهري.' } },
    { en: { title: 'Photography Session', description: 'Complete the scheduled brand photography session.' }, ar: { title: 'جلسة التصوير', description: 'تنفيذ جلسة تصوير العلامة التجارية المجدولة.' } },
    { en: { title: 'Performance Review', description: 'Review campaign, content, and engagement performance.' }, ar: { title: 'مراجعة الأداء', description: 'مراجعة أداء الحملة والمحتوى والتفاعل.' } },
    { en: { title: 'Client Feedback', description: 'Review and apply the latest client feedback.' }, ar: { title: 'ملاحظات العميل', description: 'مراجعة أحدث ملاحظات العميل وتطبيقها.' } }
  ];
  const panelTwoLabels = {
    en: { view: 'Employee dashboard view', timeline: 'Employee task timeline', details: 'Task details', home: 'Home', progress: 'Progress', detailsOption: 'Details' },
    ar: { view: 'عرض لوحة الموظف', timeline: 'الخط الزمني لمهام الموظف', details: 'تفاصيل المهمة', home: 'الرئيسية', progress: 'التقدم', detailsOption: 'التفاصيل' }
  };
  const taskTrack = timeline.querySelector('.employee-dashboard-task-track');
  taskTrack.innerHTML = demoTasks.map((task) => `<article class="employee-dashboard-task"><span class="employee-dashboard-task-dot" aria-hidden="true"></span><div class="employee-dashboard-task-copy"><strong data-task-title data-en="${task.en.title}" data-ar="${task.ar.title}">${task.en.title}</strong><p data-task-description data-en="${task.en.description}" data-ar="${task.ar.description}">${task.en.description}</p><div class="employee-dashboard-task-blocks" aria-hidden="true"><i class="is-in-progress" data-en="Status" data-ar="الحالة">Status</i><i class="is-days-left" data-en="Time" data-ar="الوقت">Time</i><i class="is-upload-started" data-en="Files" data-ar="الملفات">Files</i></div></div></article>`).join('');
  const taskViewport = timeline.querySelector('.employee-dashboard-task-viewport');
  const taskItems = [...taskTrack.querySelectorAll('.employee-dashboard-task')];
  const landscapeTaskQuery = window.matchMedia('(min-aspect-ratio: 4 / 3)');
  let activeTaskIndex = 0;
  let taskGesture = null;
  const taskDetailMeta = [
    { en: { start: '10 Sep 2026', delivery: '15 Sep 2026', remaining: '2–3 Days Left' }, ar: { start: '10 سبتمبر 2026', delivery: '15 سبتمبر 2026', remaining: 'متبقي 2–3 أيام' } },
    { en: { start: '01 Sep 2026', delivery: '05 Sep 2026', remaining: '2–3 Days Left' }, ar: { start: '01 سبتمبر 2026', delivery: '05 سبتمبر 2026', remaining: 'متبقي 2–3 أيام' } },
    { en: { start: '06 Sep 2026', delivery: '08 Sep 2026', remaining: 'On Track' }, ar: { start: '06 سبتمبر 2026', delivery: '08 سبتمبر 2026', remaining: 'في الموعد' } },
    { en: { start: '20 Sep 2026', delivery: '25 Sep 2026', remaining: 'On Track' }, ar: { start: '20 سبتمبر 2026', delivery: '25 سبتمبر 2026', remaining: 'في الموعد' } },
    { en: { start: '26 Sep 2026', delivery: '30 Sep 2026', remaining: '1 Day Left' }, ar: { start: '26 سبتمبر 2026', delivery: '30 سبتمبر 2026', remaining: 'متبقي يوم واحد' } }
  ];
  const detailsView = document.createElement('section');
  detailsView.className = 'employee-dashboard-task-details';
  detailsView.setAttribute('aria-label', panelTwoLabels.en.details);
  detailsView.hidden = true;
  detailsView.innerHTML = '<section class="employee-dashboard-task-details-section employee-dashboard-task-details-overview employee-dashboard-task-details-disclosure homepage-notification" data-task-details-disclosure><button type="button" class="homepage-notification-summary" data-task-details-toggle aria-expanded="false"><span><strong data-task-detail-title></strong></span></button><div class="homepage-notification-details" data-task-details-content aria-hidden="true"><p data-task-detail-description></p></div></section><section class="employee-dashboard-task-details-section employee-dashboard-task-details-updates employee-dashboard-task-details-disclosure homepage-notification" data-task-details-disclosure><button type="button" class="homepage-notification-summary" data-task-details-toggle aria-expanded="false"><span><strong data-en="Progress Updates" data-ar="تحديثات التقدم">Progress Updates</strong></span></button><div class="homepage-notification-details" data-task-details-content aria-hidden="true"><div class="employee-dashboard-task-update-list"><p><span data-en="Monthly direction reviewed and approved." data-ar="تمت مراجعة التوجه الشهري واعتماده.">Monthly direction reviewed and approved.</span><time data-en="Today, 09:30" data-ar="اليوم، 09:30">Today, 09:30</time></p><p><span data-en="Production brief prepared for the next step." data-ar="تم إعداد موجز الإنتاج للخطوة التالية.">Production brief prepared for the next step.</span><time data-en="Yesterday, 16:10" data-ar="أمس، 16:10">Yesterday, 16:10</time></p><p><span data-en="Task owner confirmed the delivery plan." data-ar="أكد مسؤول المهمة خطة التسليم.">Task owner confirmed the delivery plan.</span><time data-en="28 Aug 2026, 11:45" data-ar="28 أغسطس 2026، 11:45">28 Aug 2026, 11:45</time></p></div></div></section><section class="employee-dashboard-task-details-section employee-dashboard-task-details-timeline employee-dashboard-task-details-disclosure homepage-notification" data-task-details-disclosure><button type="button" class="homepage-notification-summary" data-task-details-toggle aria-expanded="false"><span><strong data-en="Timeline" data-ar="الجدول الزمني">Timeline</strong></span></button><div class="homepage-notification-details" data-task-details-content aria-hidden="true"><div class="employee-dashboard-task-detail-boxes"><span><small data-en="Start Date" data-ar="تاريخ البدء">Start Date</small><b data-task-detail-start></b></span><span><small data-en="Delivery Date" data-ar="تاريخ التسليم">Delivery Date</small><b data-task-detail-delivery></b></span><span><small data-en="Time Remaining" data-ar="الوقت المتبقي">Time Remaining</small><b data-task-detail-remaining></b></span></div></div></section><section class="employee-dashboard-task-details-section employee-dashboard-task-details-files employee-dashboard-task-details-disclosure homepage-notification" data-task-details-disclosure><button type="button" class="homepage-notification-summary" data-task-details-toggle aria-expanded="false"><span><strong data-en="Files" data-ar="الملفات">Files</strong></span></button><div class="homepage-notification-details" data-task-details-content aria-hidden="true"><div class="employee-dashboard-task-detail-boxes"><span><small data-en="Required Files" data-ar="الملفات المطلوبة">Required Files</small><b>3</b></span><span><small data-en="Uploaded Files" data-ar="الملفات المرفوعة">Uploaded Files</small><b>1</b></span><span><small data-en="Remaining Files" data-ar="الملفات المتبقية">Remaining Files</small><b>2</b></span></div></div></section><section class="employee-dashboard-task-details-section employee-dashboard-task-details-actions"><h2 data-en="Actions" data-ar="الإجراءات">Actions</h2><div><button type="button" data-en="Start Task" data-ar="بدء المهمة">Start Task</button><button type="button" data-en="Add Update" data-ar="إضافة تحديث">Add Update</button><button type="button" data-employee-dashboard-upload-files-action data-en="Upload Files" data-ar="رفع الملفات">Upload Files</button></div></section>';
  if (isClientDashboard) {
    const [startTask, , uploadFiles] = detailsView.querySelectorAll('.employee-dashboard-task-details-actions button');
    Object.assign(startTask.dataset, { en: 'Add Request', ar: 'إضافة طلب' });
    Object.assign(uploadFiles.dataset, { en: 'Download Files', ar: 'تحميل الملفات' });
  }
  if (!isClientDashboard) {
    detailsView.querySelectorAll('.employee-dashboard-task-update-list p').forEach((update) => {
      const copy = update.querySelector('span');
      const time = update.querySelector('time');
      if (!copy || !time) return;
      const by = document.createElement('small');
      by.className = 'employee-dashboard-task-update-by';
      by.dataset.en = 'By Employee';
      by.dataset.ar = 'بواسطة الموظف';
      by.textContent = by.dataset[language === 'ar' ? 'ar' : 'en'];
      copy.classList.add('employee-dashboard-task-update-copy');
      update.replaceChildren(copy, by, time);
    });
  }
  const renderTaskDetails = () => {
    const task = taskItems[activeTaskIndex];
    const meta = taskDetailMeta[activeTaskIndex] || taskDetailMeta[0];
    const copy = language === 'ar' ? 'ar' : 'en';
    if (!task) return;
    detailsView.querySelector('[data-task-detail-title]').textContent = demoTasks[activeTaskIndex]?.[copy]?.title || '';
    detailsView.querySelector('[data-task-detail-description]').textContent = demoTasks[activeTaskIndex]?.[copy]?.description || '';
    detailsView.querySelector('[data-task-detail-start]').textContent = meta[copy].start;
    detailsView.querySelector('[data-task-detail-delivery]').textContent = meta[copy].delivery;
    detailsView.querySelector('[data-task-detail-remaining]').textContent = meta[copy].remaining;
  };
  const localizePanelTwo = (next = language) => {
    const copy = next === 'ar' ? 'ar' : 'en';
    const labels = panelTwoLabels[copy];
    emptyPanel.setAttribute('dir', copy === 'ar' ? 'rtl' : 'ltr');
    selectorProxy.setAttribute('aria-label', labels.view);
    timeline.setAttribute('aria-label', labels.timeline);
    detailsView.setAttribute('aria-label', labels.details);
    emptyPanel.querySelectorAll('[data-employee-dashboard-panel-two-input]').forEach((input) => { input.placeholder = input.dataset[`${copy}Placeholder`]; });
    const startTaskSelect = emptyPanel.querySelector('[data-employee-dashboard-start-task-select]');
    if (startTaskSelect) {
      const selectedTask = startTaskSelect.value || String(activeTaskIndex);
      startTaskSelect.replaceChildren(...demoTasks.map((task, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        option.textContent = task[language === 'ar' ? 'ar' : 'en'].title;
        return option;
      }));
      startTaskSelect.value = selectedTask;
    }
    navigationProxy?.querySelector('[data-employee-dashboard-home]')?.setAttribute('aria-label', labels.home);
    navigationProxy?.querySelectorAll('[data-employee-dashboard-context]').forEach((button) => button.setAttribute('aria-label', button.dataset.employeeDashboardContext === 'details' ? labels.detailsOption : labels.progress));
    emptyPanel.querySelectorAll('[data-en][data-ar]').forEach((element) => { element.textContent = element.dataset[copy]; });
    renderTaskDetails();
  };
  window.addEventListener('ooxme-language-change', (event) => localizePanelTwo(event.detail?.language));
  const detailsDisclosureItems = [...detailsView.querySelectorAll('[data-task-details-disclosure]')];
  const setDetailsDisclosure = (section, expanded) => {
    if (expanded) {
      detailsDisclosureItems.forEach((item) => {
        if (item === section) return;
        item.classList.remove('is-expanded');
        item.querySelector('[data-task-details-toggle]')?.setAttribute('aria-expanded', 'false');
        item.querySelector('[data-task-details-content]')?.setAttribute('aria-hidden', 'true');
      });
    }
    section.classList.toggle('is-expanded', expanded);
    const toggle = section.querySelector('[data-task-details-toggle]');
    const content = section.querySelector('[data-task-details-content]');
    toggle?.setAttribute('aria-expanded', String(expanded));
    content?.setAttribute('aria-hidden', String(!expanded));
  };
  detailsDisclosureItems.forEach((section) => {
    const toggle = section.querySelector('[data-task-details-toggle]');
    toggle?.addEventListener('click', () => setDetailsDisclosure(section, !section.classList.contains('is-expanded')));
    setDetailsDisclosure(section, false);
  });
  const timelineLine = timeline.querySelector('.employee-dashboard-timeline-line');
  const updateTimelineLineFade = () => {
    if (!timelineLine) return;
    const timelineRect = timeline.getBoundingClientRect();
    const cardRect = timeline.closest('.employee-dashboard-empty-card')?.getBoundingClientRect();
    const xValue = cardRect ? (timelineRect.left - cardRect.left) / 2 : 0;
    const lineHeight = timelineLine.getBoundingClientRect().height;
    const fadeSize = xValue * 2;
    timelineLine.style.setProperty('--timeline-line-top-fade-start', '0px');
    timelineLine.style.setProperty('--timeline-line-top-fade-end', `${fadeSize}px`);
    timelineLine.style.setProperty('--timeline-line-bottom-fade-start', `${Math.max(0, lineHeight - fadeSize)}px`);
    timelineLine.style.setProperty('--timeline-line-bottom-fade-end', `${lineHeight}px`);
  };
  const setTaskFocus = (nextIndex, animate = true) => {
    activeTaskIndex = Math.max(0, Math.min(taskItems.length - 1, nextIndex));
    const visibleRadius = landscapeTaskQuery.matches ? 1 : 2;
    taskItems.forEach((task, index) => {
      task.classList.toggle('is-active', index === activeTaskIndex);
      task.classList.toggle('is-focus-hidden', Math.abs(index - activeTaskIndex) > visibleRadius);
    });
    const activeTask = taskItems[activeTaskIndex];
    if (!activeTask) return;
    const offset = ((taskViewport.clientHeight - activeTask.offsetHeight) / 2) - activeTask.offsetTop;
    taskTrack.style.transition = animate ? '' : 'none';
    taskTrack.style.transform = `translate3d(0, ${offset}px, 0)`;
    requestAnimationFrame(updateTimelineLineFade);
    if (!animate) requestAnimationFrame(() => { taskTrack.style.transition = ''; });
  };
  taskTrack.addEventListener('transitionend', updateTimelineLineFade);
  const finishTaskGesture = (event, cancelled = false) => {
    if (!taskGesture || event.pointerId !== taskGesture.pointerId) return;
    const travel = event.clientY - taskGesture.startY;
    taskGesture = null;
    timeline.releasePointerCapture?.(event.pointerId);
    if (!cancelled && Math.abs(travel) >= 30) setTaskFocus(activeTaskIndex + (travel < 0 ? 1 : -1));
    else setTaskFocus(activeTaskIndex);
  };
  timeline.addEventListener('pointerdown', (event) => {
    if (panelTwoState !== 'progress' || event.button !== 0 || taskGesture) return;
    const currentTransform = getComputedStyle(taskTrack).transform;
    const transformMatch = currentTransform.match(/matrix3?\(([^)]+)\)/);
    const transformValues = transformMatch ? transformMatch[1].split(',').map(Number) : [];
    const currentOffset = transformValues.length === 16 ? transformValues[13] : (transformValues.length === 6 ? transformValues[5] : 0);
    taskGesture = { pointerId: event.pointerId, startY: event.clientY, startOffset: currentOffset };
    taskTrack.style.transition = 'none';
    timeline.setPointerCapture?.(event.pointerId);
    event.stopPropagation();
  }, true);
  timeline.addEventListener('pointermove', (event) => {
    if (panelTwoState !== 'progress' || !taskGesture || event.pointerId !== taskGesture.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    taskTrack.style.transform = `translate3d(0, ${taskGesture.startOffset + event.clientY - taskGesture.startY}px, 0)`;
  }, { capture: true, passive: false });
  timeline.addEventListener('pointerup', (event) => finishTaskGesture(event), true);
  timeline.addEventListener('pointercancel', (event) => finishTaskGesture(event, true), true);
  timeline.addEventListener('wheel', (event) => {
    if (panelTwoState !== 'progress' || Math.abs(event.deltaY) < 1) return;
    event.preventDefault();
    event.stopPropagation();
    setTaskFocus(activeTaskIndex + (event.deltaY > 0 ? 1 : -1));
  }, { passive: false });
  window.addEventListener('resize', () => setTaskFocus(activeTaskIndex, false));
  landscapeTaskQuery.addEventListener?.('change', () => setTaskFocus(activeTaskIndex, false));
  requestAnimationFrame(() => setTaskFocus(activeTaskIndex, false));
  emptyCard.append(selectorProxy, timeline, detailsView);
  const navigationProxy = employeeNavigation.cloneNode(true);
  navigationProxy.classList.add('employee-dashboard-contextual-navigation-proxy');
  navigationProxy.removeAttribute('data-employee-dashboard-contextual');
  const contextPillProxy = navigationProxy.querySelector('[data-employee-dashboard-context-pill]');
  const addUpdateCard = !isClientDashboard ? document.createElement('form') : null;
  if (addUpdateCard) {
    addUpdateCard.className = 'employee-dashboard-add-update-card';
    addUpdateCard.hidden = true;
    addUpdateCard.setAttribute('aria-label', 'Add update');
    addUpdateCard.innerHTML = '<label><input type="text" data-employee-dashboard-panel-two-input data-employee-dashboard-add-update-input data-ooxme-ios-zoom-safe data-en-placeholder="Write an update" data-ar-placeholder="اكتب تحديثاً" placeholder="Write an update" aria-label="Write an update"></label><button type="button" data-en="Submit" data-ar="إرسال">Submit</button>';
  }
  const uploadFilesCard = !isClientDashboard ? document.createElement('form') : null;
  if (uploadFilesCard) {
    uploadFilesCard.className = 'employee-dashboard-upload-files-card';
    uploadFilesCard.hidden = true;
    uploadFilesCard.setAttribute('aria-label', 'Upload files');
    uploadFilesCard.innerHTML = '<label><input type="text" data-employee-dashboard-panel-two-input data-employee-dashboard-upload-files-input data-ooxme-ios-zoom-safe data-en-placeholder="File Name" data-ar-placeholder="اسم الملف" placeholder="File Name" aria-label="File Name"></label><button type="button" data-employee-dashboard-upload-files-add data-en="Add File" data-ar="إضافة ملف">Add File</button><button type="button" data-en="Submit" data-ar="إرسال">Submit</button>';
  }
  const startTaskCard = !isClientDashboard ? document.createElement('form') : null;
  if (startTaskCard) {
    startTaskCard.className = 'employee-dashboard-start-task-card';
    startTaskCard.hidden = true;
    startTaskCard.setAttribute('aria-label', 'Start task');
    startTaskCard.innerHTML = '<label><select data-employee-dashboard-start-task-select data-ooxme-ios-zoom-safe aria-label="Choose Task"></select></label><button type="button" data-en="Start" data-ar="بدء">Start</button>';
  }
  const panelTwoActionCards = [addUpdateCard, uploadFilesCard, startTaskCard].filter(Boolean);
  const isPanelTwoActionOpen = () => panelTwoActionCards.some((card) => card.hidden === false);
  const setPanelTwoActionCard = (activeCard, action = '') => {
    const active = Boolean(activeCard);
    emptyPanel.dataset.employeeDashboardPanelTwoAction = action;
    emptyCard.hidden = active;
    panelTwoActionCards.forEach((card) => { card.hidden = card !== activeCard; });
  };
  const setAddUpdateOpen = (open) => {
    if (!addUpdateCard) return;
    setPanelTwoActionCard(open ? addUpdateCard : null, open ? 'add-update' : '');
  };
  const setUploadFilesOpen = (open) => {
    if (!uploadFilesCard) return;
    setPanelTwoActionCard(open ? uploadFilesCard : null, open ? 'upload-files' : '');
  };
  const setStartTaskOpen = (open) => {
    if (!startTaskCard) return;
    if (open) startTaskCard.querySelector('[data-employee-dashboard-start-task-select]').value = String(activeTaskIndex);
    setPanelTwoActionCard(open ? startTaskCard : null, open ? 'start-task' : '');
  };
  let panelTwoState = 'progress';
  const setPanelTwoState = (next) => {
    if (isPanelTwoActionOpen()) setPanelTwoActionCard(null);
    panelTwoState = next === 'details' ? 'details' : 'progress';
    const arrowState = panelTwoState === 'details' ? 'details' : 'work';
    selectorProxy.dataset.active = panelTwoState;
    selectorProxy.querySelectorAll('[data-employee-dashboard-state-option]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.employeeDashboardStateOption === panelTwoState)));
    emptyPanel.dataset.employeeDashboardState = panelTwoState;
    contextPillProxy?.setAttribute('data-active', arrowState);
    timeline.hidden = panelTwoState === 'details';
    timeline.setAttribute('aria-hidden', String(panelTwoState === 'details'));
    detailsView.hidden = panelTwoState !== 'details';
    detailsView.setAttribute('aria-hidden', String(panelTwoState !== 'details'));
    if (panelTwoState === 'details') {
      detailsDisclosureItems.forEach((section) => setDetailsDisclosure(section, false));
      renderTaskDetails();
    }
    navigationProxy.querySelectorAll('[data-employee-dashboard-context]').forEach((button) => {
      const isBack = button.dataset.employeeDashboardContext === 'work';
      button.setAttribute('aria-pressed', String(button.dataset.employeeDashboardContext === arrowState));
      button.disabled = panelTwoState === 'progress' ? isBack : !isBack;
      button.setAttribute('aria-disabled', String(button.disabled));
    });
  };
  selectorProxy.querySelectorAll('[data-employee-dashboard-state-option]').forEach((option) => option.addEventListener('click', () => setPanelTwoState(option.dataset.employeeDashboardStateOption)));
  navigationProxy.querySelectorAll('[data-employee-dashboard-context]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isPanelTwoActionOpen()) {
      setPanelTwoActionCard(null);
      return;
    }
    setPanelTwoState(button.dataset.employeeDashboardContext === 'details' ? 'details' : 'progress');
  }));
  if (addUpdateCard) {
    const [startTaskButton, addUpdateButton, uploadFilesButton] = detailsView.querySelectorAll('.employee-dashboard-task-details-actions button');
    startTaskButton?.addEventListener('click', () => setStartTaskOpen(true));
    addUpdateButton?.addEventListener('click', () => setAddUpdateOpen(true));
    uploadFilesButton?.addEventListener('click', () => setUploadFilesOpen(true));
  }
  taskItems.forEach((task, index) => task.addEventListener('click', () => {
    if (index === activeTaskIndex && panelTwoState === 'progress') setPanelTwoState('details');
  }));
  setPanelTwoState(panelTwoState);
  emptyMasterPanel.append(emptyCard, ...panelTwoActionCards, navigationProxy);
  emptyPanel.append(emptyMasterPanel);
  emptyPanel.addEventListener('click', (event) => {
    if (!isPanelTwoActionOpen()) return;
    if (event.target.closest(':is(.employee-dashboard-add-update-card, .employee-dashboard-upload-files-card, .employee-dashboard-start-task-card, .employee-dashboard-task-details-actions, .employee-dashboard-contextual-navigation-proxy)')) return;
    setPanelTwoActionCard(null);
  });
  localizePanelTwo(language);

  track.hidden = true;
  employeeTrack.append(employeePanel, emptyPanel);
  experience.append(employeeTrack);

  const employeePanels = [employeePanel, emptyPanel];
  let employeePanelIndex = 0;
  let employeePanelTransitionTimer;
  const revealEmployeePanel = (index) => employeePanels.forEach((panel, panelNumber) => panel.classList.toggle('is-active', panelNumber === index));
  const moveToEmployeePanel = (next) => {
    const target = Math.max(0, Math.min(employeePanels.length - 1, next));
    if (target === employeePanelIndex) return;
    employeePanelIndex = target;
    employeePanels.forEach((panel) => panel.classList.remove('is-active'));
    employeeTrack.style.transform = `translateY(calc(var(--ooxme-stable-viewport-height) * ${-employeePanelIndex}))`;
    window.clearTimeout(employeePanelTransitionTimer);
    employeePanelTransitionTimer = window.setTimeout(() => revealEmployeePanel(employeePanelIndex), 620);
  };
  revealEmployeePanel(employeePanelIndex);
  window.OOXMEMasterPanelDrag.register({
    experience,
    track: employeeTrack,
    panels: employeePanels,
    getIndex: () => employeePanelIndex,
    moveTo: moveToEmployeePanel,
    wrapBottomTap: false
  });

};
setupEmployeeDashboardPanels();
const employeeDashboardPanelOne = document.querySelector('.employee-dashboard-panel:not(.employee-dashboard-empty-panel)');
const employeeDashboardPanelOneSelector = employeeDashboardPanelOne?.querySelector('.employee-dashboard-panel-one-selector');
const employeeDashboardPanelOneNavigation = employeeDashboardPanelOne?.querySelector('[data-employee-dashboard-contextual]');
if (employeeDashboardPanelOne && employeeDashboardPanelOneSelector && employeeDashboardPanelOneNavigation) {
  let employeeDashboardPanelOneState = 'current';
  let employeeDashboardPanelOneSizingFrame;
  const resetEmployeeDashboardPanelOneSizing = () => {
    const infoCard = employeeDashboardPanelOne.querySelector('.employee-dashboard-info-card');
    const avatar = employeeDashboardPanelOne.querySelector('.employee-dashboard-avatar');
    window.cancelAnimationFrame(employeeDashboardPanelOneSizingFrame);
    infoCard?.style.removeProperty('--employee-dashboard-edit-extension');
    infoCard?.style.removeProperty('height');
    avatar?.style.removeProperty('--employee-dashboard-avatar-restore-offset');
    avatar?.style.removeProperty('--employee-dashboard-avatar-portrait-offset');
    avatar?.style.removeProperty('transform');
    employeeDashboardPanelOne.removeAttribute('data-employee-dashboard-panel-one-landscape-columns');
  };
  const sizeEmployeeDashboardPanelOneEditCard = (preservedAvatarTop = null) => {
    const infoCard = employeeDashboardPanelOne.querySelector('.employee-dashboard-info-card');
    const avatar = employeeDashboardPanelOne.querySelector('.employee-dashboard-avatar');
    if (!infoCard || !avatar || employeeDashboardPanelOneState !== 'edit') {
      infoCard?.style.removeProperty('--employee-dashboard-edit-extension');
      infoCard?.style.removeProperty('height');
      avatar?.style.removeProperty('--employee-dashboard-avatar-restore-offset');
      avatar?.style.removeProperty('--employee-dashboard-avatar-portrait-offset');
      avatar?.style.removeProperty('transform');
      employeeDashboardPanelOne.removeAttribute('data-employee-dashboard-panel-one-landscape-columns');
      return;
    }
    if (window.matchMedia('(min-aspect-ratio: 4 / 3)').matches) {
      avatar.style.removeProperty('--employee-dashboard-avatar-portrait-offset');
      avatar.style.removeProperty('--employee-dashboard-avatar-restore-offset');
      infoCard.style.height = 'auto';
      const previousAvatarTop = preservedAvatarTop ?? avatar.getBoundingClientRect().top;
      infoCard.style.removeProperty('height');
      employeeDashboardPanelOne.dataset.employeeDashboardPanelOneLandscapeColumns = 'true';
      avatar.style.setProperty('--employee-dashboard-avatar-restore-offset', `${previousAvatarTop - avatar.getBoundingClientRect().top}px`);
      return;
    }
    avatar.style.removeProperty('--employee-dashboard-avatar-restore-offset');
    employeeDashboardPanelOne.removeAttribute('data-employee-dashboard-panel-one-landscape-columns');
    infoCard.style.removeProperty('--employee-dashboard-edit-extension');
    const cardBounds = infoCard.getBoundingClientRect();
    const navigationBounds = employeeDashboardPanelOneNavigation.getBoundingClientRect();
    const x = Number.parseFloat(getComputedStyle(infoCard).paddingTop) || 0;
    infoCard.style.setProperty('--employee-dashboard-edit-extension', `${Math.max(0, navigationBounds.top - x - cardBounds.bottom)}px`);
    const currentAvatarTop = avatar.getBoundingClientRect().top;
    const targetAvatarTop = preservedAvatarTop ?? currentAvatarTop;
    avatar.style.setProperty('--employee-dashboard-avatar-portrait-offset', `${targetAvatarTop - currentAvatarTop}px`);
  };
  const setEmployeeDashboardPanelOneState = (next) => {
    const targetState = next === 'edit' ? 'edit' : 'current';
    const preservedAvatarTop = next === 'edit' && employeeDashboardPanelOneState !== 'edit'
      ? employeeDashboardPanelOne.querySelector('.employee-dashboard-avatar')?.getBoundingClientRect().top ?? null
      : null;
    window.cancelAnimationFrame(employeeDashboardPanelOneSizingFrame);
    if (targetState === 'current') resetEmployeeDashboardPanelOneSizing();
    employeeDashboardPanelOneState = targetState;
    const bottomState = employeeDashboardPanelOneState === 'edit' ? 'details' : 'work';
    employeeDashboardPanelOne.dataset.employeeDashboardPanelOneState = employeeDashboardPanelOneState;
    employeeDashboardPanelOneSelector.dataset.active = employeeDashboardPanelOneState;
    employeeDashboardPanelOneSelector.querySelectorAll('[data-employee-dashboard-panel-one-option]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.employeeDashboardPanelOneOption === employeeDashboardPanelOneState)));
    const pill = employeeDashboardPanelOneNavigation.querySelector('[data-employee-dashboard-context-pill]');
    pill?.setAttribute('data-active', bottomState);
    employeeDashboardPanelOneNavigation.querySelectorAll('[data-employee-dashboard-context]').forEach((button) => {
      const isBack = button.dataset.employeeDashboardContext === 'work';
      button.setAttribute('aria-pressed', String(button.dataset.employeeDashboardContext === bottomState));
      button.disabled = employeeDashboardPanelOneState === 'current' ? isBack : !isBack;
      button.setAttribute('aria-disabled', String(button.disabled));
    });
    employeeDashboardPanelOneSizingFrame = window.requestAnimationFrame(() => {
      if (employeeDashboardPanelOneState === targetState) sizeEmployeeDashboardPanelOneEditCard(preservedAvatarTop);
    });
  };
  employeeDashboardPanelOneSelector.querySelectorAll('[data-employee-dashboard-panel-one-option]').forEach((option) => option.addEventListener('click', () => setEmployeeDashboardPanelOneState(option.dataset.employeeDashboardPanelOneOption)));
  employeeDashboardPanelOneNavigation.querySelectorAll('[data-employee-dashboard-context]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setEmployeeDashboardPanelOneState(button.dataset.employeeDashboardContext === 'details' ? 'edit' : 'current');
  }));
  setEmployeeDashboardPanelOneState('current');
  window.addEventListener('resize', () => {
    if (document.activeElement?.matches('[data-employee-dashboard-edit-input], [data-employee-dashboard-add-update-input], [data-employee-dashboard-upload-files-input]')) return;
    requestAnimationFrame(sizeEmployeeDashboardPanelOneEditCard);
  });
}
document.querySelectorAll('[data-employee-dashboard-selector]:not(.employee-dashboard-panel-two-selector)').forEach((selector) => {
  const panel = selector.closest('.employee-dashboard-panel');
  const setState = (next) => {
    const state = next === 'details' ? 'details' : 'progress';
    selector.dataset.active = state;
    panel?.setAttribute('data-employee-dashboard-state', state);
    selector.querySelectorAll('[data-employee-dashboard-state-option]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.employeeDashboardStateOption === state)));
    panel?.querySelectorAll('[data-employee-dashboard-state]').forEach((statePanel) => { statePanel.hidden = statePanel.dataset.employeeDashboardState !== state; });
  };
  selector.querySelectorAll('[data-employee-dashboard-state-option]').forEach((option) => option.addEventListener('click', () => setState(option.dataset.employeeDashboardStateOption)));
  setState('progress');
});
const homepageBottomNavigation = document.querySelector('.homepage-bottom-navigation');
const homepageMenuTrigger = document.querySelector('[data-home-menu-trigger]');
const homepageMenu = document.querySelector('[data-home-menu]');
const homepageNotifications = document.querySelector('[data-notifications]');
const homepageSearch = document.querySelector('[data-home-search]');
const homepageAccount = document.querySelector('[data-home-account]');
const homepageServices = document.querySelector('[data-home-services]');
const homepageLanguage = document.querySelector('[data-home-language]');
const homepageLanguageSelector = document.querySelector('[data-home-language-selector]');
const homepageNotificationDot = document.querySelector('[data-homepage-notification-dot]');
const homepageSearchInput = document.querySelector('[data-home-search-input]');
const homepageSearchSuggestions = document.querySelector('[data-home-search-suggestions]');
const normalizeSharedNotificationLayout = (container) => container?.querySelectorAll('[data-notification]').forEach((item) => {
  const date = item.querySelector('.homepage-notification-summary time');
  const details = item.querySelector('.homepage-notification-details');
  if (date && details) details.append(date);
});
normalizeSharedNotificationLayout(homepageNotifications);
homepageNotifications?.querySelectorAll('[data-notifications-option]').forEach((button) => button.addEventListener('click', () => {
  const selector = homepageNotifications.querySelector('[data-notifications-selector]');
  const panel = homepageNotifications.querySelector('[data-notifications-panel]');
  selector.dataset.active = button.dataset.notificationsOption;
  panel.dataset.active = button.dataset.notificationsOption;
  selector.querySelectorAll('[data-notifications-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
}));
const employeeDashboardNavigation = document.querySelector('[data-employee-dashboard-navigation]');
const employeeDashboardMenuTrigger = document.querySelector('[data-employee-dashboard-menu-trigger]');
const employeeDashboardMenu = document.querySelector('[data-employee-dashboard-menu]');
let homepageMenuInactivityTimer;
let homepageMenuSelectionTimer;
let homepageMenuCloseTimer;
let homepageNotificationsCloseTimer;
let homepageNotificationSelectionTimer;
let homepageSearchCloseTimer;
let homepageAccountCloseTimer;
let homepageServicesCloseTimer;
let homepageLanguageCloseTimer;
let homepageStudioOptionTimer;
let homepageServicesOptionTimer;
let employeeDashboardMenuTimer;
const setEmployeeDashboardMenuOpen = (open) => {
  if (!employeeDashboardNavigation || !employeeDashboardMenuTrigger) return;
  window.clearTimeout(employeeDashboardMenuTimer);
  const wasOpen = employeeDashboardNavigation.classList.contains('is-menu-open');
  employeeDashboardNavigation.classList.toggle('is-menu-open', open);
  employeeDashboardNavigation.classList.toggle('is-menu-closing', !open && wasOpen);
  employeeDashboardMenuTrigger.setAttribute('aria-expanded', String(open));
  employeeDashboardMenuTimer = window.setTimeout(() => {
    if (open) setEmployeeDashboardMenuOpen(false);
    else employeeDashboardNavigation.classList.remove('is-menu-closing');
  }, open ? 5000 : 340);
};
employeeDashboardMenuTrigger?.addEventListener('click', () => setEmployeeDashboardMenuOpen(!employeeDashboardNavigation.classList.contains('is-menu-open')));
employeeDashboardMenu?.querySelectorAll('button').forEach((button) => button.addEventListener('click', () => {
  if (button.hasAttribute('data-employee-dashboard-menu-services')) return;
  const buttons = [...employeeDashboardMenu.querySelectorAll('button')];
  employeeDashboardMenu.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
  employeeDashboardMenu.dataset.active = ['account', 'gallery', 'home', 'menu', 'services'][buttons.indexOf(button)];
}));
document.querySelector('[data-employee-dashboard-menu-notifications]')?.addEventListener('click', () => setHomepageNotificationsOpen(true));
document.addEventListener('pointerdown', (event) => {
  if (employeeDashboardNavigation?.classList.contains('is-menu-open') && !event.target.closest('[data-employee-dashboard-navigation]')) setEmployeeDashboardMenuOpen(false);
});
const resetHomepageMenuInactivityTimer = () => {
  window.clearTimeout(homepageMenuInactivityTimer);
  if (!homepageBottomNavigation?.classList.contains('is-menu-open')) return;
  homepageMenuInactivityTimer = window.setTimeout(() => setHomepageMenuOpen(false), 5000);
};
let homepageStudioNavigationLocked = false;
let homepageServicesNavigationLocked = false;
const resetHomepageStudioOptions = () => {
  window.clearTimeout(homepageStudioOptionTimer);
  homepageStudioNavigationLocked = false;
  homepageMenu?.classList.remove('is-studio-options');
  homepageMenu?.removeAttribute('data-studio-active');
  homepageMenu?.setAttribute('aria-label', 'Homepage navigation');
  homepageMenu?.querySelectorAll('[data-home-studio-option]').forEach((button) => {
    button.setAttribute('aria-hidden', 'true');
    button.setAttribute('tabindex', '-1');
  });
};
const resetHomepageServicesOptions = () => {
  window.clearTimeout(homepageServicesOptionTimer);
  homepageServicesNavigationLocked = false;
  homepageMenu?.classList.remove('is-services-options');
  homepageMenu?.removeAttribute('data-services-active');
  homepageMenu?.setAttribute('aria-label', 'Homepage navigation');
  homepageMenu?.querySelectorAll('[data-home-services-option]').forEach((button) => {
    button.setAttribute('aria-hidden', 'true');
    button.setAttribute('tabindex', '-1');
  });
};
const setHomepageMenuOpen = (open) => {
  const wasOpen = homepageBottomNavigation?.classList.contains('is-menu-open');
  if (!open) {
    window.clearTimeout(homepageMenuSelectionTimer);
    resetHomepageStudioOptions();
    resetHomepageServicesOptions();
    setHomepageMenuActive('home');
  } else if (!wasOpen && !homepageMenu?.classList.contains('is-studio-options') && !homepageMenu?.classList.contains('is-services-options')) {
    setHomepageMenuActive('home');
  }
  window.clearTimeout(homepageMenuCloseTimer);
  if (open) {
    homepageBottomNavigation?.classList.remove('is-menu-closing');
    homepageBottomNavigation?.classList.add('is-menu-open');
  } else if (homepageBottomNavigation?.classList.contains('is-menu-open')) {
    homepageBottomNavigation.classList.remove('is-menu-open');
    homepageBottomNavigation.classList.add('is-menu-closing');
    homepageMenuCloseTimer = window.setTimeout(() => {
      homepageBottomNavigation.classList.remove('is-menu-closing');
      homepageMenuCloseTimer = undefined;
    }, 340);
  }
  homepageMenuTrigger?.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('homepage-navigation-open', open);
  resetHomepageMenuInactivityTimer();
};
const setHomepageStudioOpen = (open) => {
  if (!homepageMenu) return;
  if (!open) {
    resetHomepageStudioOptions();
    return;
  }
  setHomepageMenuOpen(true);
  homepageMenu.dataset.studioActive = 'clients';
  homepageMenu.setAttribute('aria-label', 'Studio options');
  homepageMenu.querySelectorAll('[data-home-studio-option]').forEach((button) => {
    button.setAttribute('aria-hidden', 'false');
    button.setAttribute('tabindex', '0');
  });
  homepageMenu.classList.add('is-studio-options');
  resetHomepageMenuInactivityTimer();
};
homepageMenu?.querySelectorAll('[data-home-studio-option]').forEach((button) => button.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!homepageMenu.classList.contains('is-studio-options') || homepageStudioNavigationLocked) return;
  homepageStudioNavigationLocked = true;
  window.clearTimeout(homepageMenuInactivityTimer);
  homepageMenu.dataset.studioActive = button.dataset.homeStudioOption;
  homepageStudioOptionTimer = window.setTimeout(() => {
    if (button.dataset.homeStudioOption === 'clients') {
      window.location.assign('/brands');
      return;
    }
    if (button.dataset.homeStudioOption === 'selected-works') {
      window.location.assign('/gallery');
      return;
    }
    homepageMenu.removeAttribute('data-studio-active');
    homepageStudioNavigationLocked = false;
    resetHomepageMenuInactivityTimer();
  }, 500);
}));
const setHomepageServicesContextOpen = (open) => {
  if (!homepageMenu) return;
  if (!open) {
    resetHomepageServicesOptions();
    return;
  }
  setHomepageMenuOpen(true);
  homepageMenu.dataset.servicesActive = 'consultation';
  homepageMenu.setAttribute('aria-label', 'Services');
  homepageMenu.querySelectorAll('[data-home-services-option]').forEach((button) => {
    button.setAttribute('aria-hidden', 'false');
    button.setAttribute('tabindex', '0');
  });
  homepageMenu.classList.add('is-services-options');
  resetHomepageMenuInactivityTimer();
};
homepageMenu?.querySelectorAll('[data-home-services-option]').forEach((button) => button.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (!homepageMenu.classList.contains('is-services-options') || homepageServicesNavigationLocked) return;
  homepageServicesNavigationLocked = true;
  window.clearTimeout(homepageMenuInactivityTimer);
  homepageMenu.dataset.servicesActive = button.dataset.homeServicesOption;
  homepageServicesOptionTimer = window.setTimeout(() => {
    window.location.assign(button.dataset.homeServicesOption === 'consultation' ? '/consultation' : '/brand');
  }, 500);
}));
const closeHomepageStudioOutside = (event) => {
  const target = event.target instanceof Element ? event.target : null;
  if (!homepageMenu?.classList.contains('is-studio-options') || target?.closest('.homepage-bottom-navigation')) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  setHomepageMenuOpen(false);
};
document.addEventListener('pointerdown', closeHomepageStudioOutside, true);
const setHomepageMenuActive = (active) => {
  if (!homepageMenu) return;
  homepageMenu.dataset.active = active;
  document.querySelectorAll('.homepage-bottom-menu-button').forEach((button) => {
    const selected = (active === 'account' && button.matches('[data-home-menu-account]')) || (active === 'gallery' && button.matches('[data-home-menu-gallery]')) || (active === 'home' && button.matches('[data-home-menu-home]')) || (active === 'menu' && button.matches('[data-home-menu-menu]')) || (active === 'services' && button.matches('[data-home-menu-services]'));
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
};
const homepageOverlayMotionTimers = new WeakMap();
const prepareHomepageOverlayMotion = (overlay) => {
  window.clearTimeout(homepageOverlayMotionTimers.get(overlay));
  overlay.classList.add('is-animating');
  homepageOverlayMotionTimers.set(overlay, window.setTimeout(() => overlay.classList.remove('is-animating'), 420));
};
const setHomepageNotificationsOpen = (open) => {
  if (!homepageNotifications) return;
  window.clearTimeout(homepageNotificationsCloseTimer);
  if (open) {
    setHomepageStudioOpen(false);
    setHomepageMenuOpen(false);
    loadSharedNotifications();
    homepageNotifications.hidden = false;
    homepageNotifications.setAttribute('aria-hidden', 'false');
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-notifications-open');
      homepageNotifications.classList.add('is-open');
    });
    return;
  }
  homepageNotifications.classList.remove('is-open');
  document.body.classList.remove('homepage-notifications-open');
  homepageNotifications.setAttribute('aria-hidden', 'true');
  homepageNotificationsCloseTimer = window.setTimeout(() => { homepageNotifications.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const homepageSearchEntries = [
  { en: 'Reengineered', ar: 'إعادة هندسة' },
  { en: 'Ooxme v4.0', ar: 'التحديث الرابع لأوكسوم' },
  { en: 'Redesign Website', ar: 'إعادة تصميم الموقع' },
  { en: 'The Client Profile', ar: 'ملف العميل' },
  { en: 'The Gallery', ar: 'المعرض' },
  { en: 'Notifications', ar: 'الإشعارات' },
];
const renderHomepageSearchSuggestions = () => {
  if (!homepageSearchInput || !homepageSearchSuggestions) return;
  const query = homepageSearchInput.value.trim().toLocaleLowerCase();
  homepageSearchSuggestions.hidden = false;
  const matches = homepageSearchEntries
    .map((entry, index) => {
      const label = entry[root.lang === 'ar' ? 'ar' : 'en'];
      const normalized = label.toLocaleLowerCase();
      const position = normalized.indexOf(query);
      const overlap = [...query].filter((character) => normalized.includes(character)).length;
      return { entry, index, score: position < 0 ? 100 - overlap : position };
    })
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, 3);
  homepageSearchSuggestions.innerHTML = matches.map(({ entry }) => `<button class="homepage-search-suggestion" type="button">${entry[root.lang === 'ar' ? 'ar' : 'en']}</button>`).join('');
};
const setHomepageSearchOpen = (open) => {
  if (!homepageSearch) return;
  window.clearTimeout(homepageSearchCloseTimer);
  if (open) {
    setHomepageStudioOpen(false);
    setHomepageMenuOpen(false);
    homepageSearch.hidden = false;
    homepageSearch.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageSearch);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-search-open');
      homepageSearch.classList.add('is-open');
      renderHomepageSearchSuggestions();
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageSearch);
  homepageSearch.classList.remove('is-open');
  document.body.classList.remove('homepage-search-open');
  homepageSearch.setAttribute('aria-hidden', 'true');
  homepageSearchCloseTimer = window.setTimeout(() => { homepageSearch.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const setHomepageAccountOpen = (open) => {
  if (!homepageAccount) return;
  window.clearTimeout(homepageAccountCloseTimer);
  if (open) {
    setHomepageStudioOpen(false);
    setHomepageMenuOpen(false);
    homepageAccount.hidden = false;
    homepageAccount.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageAccount);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-account-open');
      homepageAccount.classList.add('is-open');
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageAccount);
  homepageAccount.classList.remove('is-open');
  document.body.classList.remove('homepage-account-open');
  homepageAccount.setAttribute('aria-hidden', 'true');
  homepageAccountCloseTimer = window.setTimeout(() => { homepageAccount.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const setHomepageServicesOpen = (open) => {
  if (!homepageServices) return;
  window.clearTimeout(homepageServicesCloseTimer);
  if (open) {
    setHomepageStudioOpen(false);
    setHomepageMenuOpen(false);
    setEmployeeDashboardMenuOpen(false);
    homepageServices.hidden = false;
    homepageServices.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageServices);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-services-open');
      homepageServices.classList.add('is-open');
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageServices);
  homepageServices.classList.remove('is-open');
  document.body.classList.remove('homepage-services-open');
  homepageServices.setAttribute('aria-hidden', 'true');
  homepageServicesCloseTimer = window.setTimeout(() => { homepageServices.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
const setHomepageLanguageOpen = (open) => {
  if (!homepageLanguage || !homepageLanguageSelector) return;
  window.clearTimeout(homepageLanguageCloseTimer);
  if (open) {
    setHomepageStudioOpen(false);
    const activeLanguage = root.lang === 'ar' ? 'ar' : 'en';
    homepageLanguageSelector.dataset.active = activeLanguage;
    homepageLanguageSelector.querySelectorAll('[data-home-language-option]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.homeLanguageOption === activeLanguage)));
    setHomepageMenuOpen(false);
    homepageLanguage.hidden = false;
    homepageLanguage.setAttribute('aria-hidden', 'false');
    prepareHomepageOverlayMotion(homepageLanguage);
    window.requestAnimationFrame(() => {
      document.body.classList.add('homepage-language-open');
      homepageLanguage.classList.add('is-open');
    });
    return;
  }
  prepareHomepageOverlayMotion(homepageLanguage);
  homepageLanguage.classList.remove('is-open');
  document.body.classList.remove('homepage-language-open');
  homepageLanguage.setAttribute('aria-hidden', 'true');
  homepageLanguageCloseTimer = window.setTimeout(() => { homepageLanguage.hidden = true; }, 360);
  setHomepageMenuOpen(true);
};
document.querySelector('[data-employee-dashboard-menu-services]')?.addEventListener('click', () => setHomepageServicesOpen(true));
const queueHomepageMenuSelection = (active, action) => {
  setHomepageMenuActive(active);
  resetHomepageMenuInactivityTimer();
  window.clearTimeout(homepageMenuSelectionTimer);
  homepageMenuSelectionTimer = undefined;
  if (action) action();
  else setHomepageMenuOpen(false);
};
window.setTimeout(() => {
  if (homepageBottomNavigation?.classList.contains('is-menu-open') || homepageNotifications?.classList.contains('is-open') || homepageSearch?.classList.contains('is-open') || homepageAccount?.classList.contains('is-open') || homepageServices?.classList.contains('is-open')) return;
  setHomepageMenuOpen(true);
  window.setTimeout(() => setHomepageMenuOpen(false), 2000);
}, 3000);
homepageMenuTrigger?.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  setHomepageMenuOpen(!homepageBottomNavigation.classList.contains('is-menu-open'));
});
document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => setHomepageMenuOpen(false)));
document.querySelector('[data-home-menu-home]')?.addEventListener('click', () => queueHomepageMenuSelection('home', () => setHomepageLanguageOpen(true)));
document.querySelector('[data-home-menu-account]')?.addEventListener('click', () => queueHomepageMenuSelection('account', () => setHomepageAccountOpen(true)));
document.querySelector('[data-home-menu-gallery]')?.addEventListener('click', () => queueHomepageMenuSelection('gallery', () => setHomepageStudioOpen(true)));
document.querySelector('[data-employee-dashboard-menu-gallery]')?.addEventListener('click', () => location.assign('/brands'));
document.querySelector('[data-home-menu-services]')?.addEventListener('click', () => queueHomepageMenuSelection('services', () => setHomepageServicesContextOpen(true)));
document.querySelector('[data-home-menu-menu]')?.addEventListener('click', () => queueHomepageMenuSelection('menu', () => {
  setHomepageNotificationsOpen(true);
}));
homepageNotifications?.addEventListener('click', (event) => {
  if (!event.target.closest('.homepage-notifications-panel')) setHomepageNotificationsOpen(false);
});
const renderSharedNotifications = (notifications) => {
  const list = homepageNotifications?.querySelector('.homepage-notifications-list');
  if (!list || !Array.isArray(notifications)) return;
  list.replaceChildren(...notifications.map(notification => {
    const item = document.createElement('button'); item.type = 'button'; item.className = 'homepage-notification'; item.dataset.notification = ''; item.setAttribute('aria-expanded', 'false');
    const summary = document.createElement('span'); summary.className = 'homepage-notification-summary'; const summaryCopy = document.createElement('span'); const title = document.createElement('strong'); title.textContent = notification.title; const date = document.createElement('time'); date.dateTime = notification.publish_date; date.textContent = new Intl.DateTimeFormat(root.lang === 'ar' ? 'ar-IQ' : 'en', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(notification.publish_date)); summaryCopy.append(title); const unread = document.createElement('span'); unread.className = 'homepage-notification-unread'; unread.setAttribute('aria-hidden', 'true'); summary.append(summaryCopy, unread);
    const details = document.createElement('span'); details.className = 'homepage-notification-details'; const copy = document.createElement('span'); copy.className = 'homepage-notification-copy'; copy.textContent = notification.body; details.append(copy, date); item.append(summary, details); return item;
  }));
  if (homepageNotificationDot) homepageNotificationDot.hidden = notifications.length === 0;
};
const loadSharedNotifications = async () => {
  try {
    const response = await fetch('/api/accounts/index?route=public-notifications', { credentials: 'same-origin' });
    if (!response.ok) throw new Error('notification_load_failed');
    renderSharedNotifications(await response.json());
  } catch (_) {
    renderSharedNotifications([]);
  }
};
loadSharedNotifications();
homepageNotifications?.addEventListener('click', (event) => {
  const notification = event.target.closest('[data-notification]');
  if (!notification) return;
  const expanded = !notification.classList.contains('is-expanded');
  homepageNotifications.querySelectorAll('[data-notification].is-expanded').forEach((openNotification) => {
    openNotification.classList.remove('is-expanded');
    openNotification.setAttribute('aria-expanded', 'false');
  });
  notification.classList.toggle('is-expanded', expanded);
  notification.classList.add('is-read', 'is-selected');
  notification.setAttribute('aria-expanded', String(expanded));
  window.clearTimeout(homepageNotificationSelectionTimer);
  homepageNotificationSelectionTimer = window.setTimeout(() => notification.classList.remove('is-selected'), 340);
});
homepageSearch?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-search-panel')) setHomepageSearchOpen(false);
});
homepageAccount?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-account-panel')) setHomepageAccountOpen(false);
});
homepageServices?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-services-panel')) setHomepageServicesOpen(false);
});
homepageLanguage?.addEventListener('pointerdown', (event) => {
  if (!event.target.closest('.homepage-account-panel')) setHomepageLanguageOpen(false);
});
homepageLanguageSelector?.querySelectorAll('[data-home-language-option]').forEach((button) => button.addEventListener('click', () => {
  const next = button.dataset.homeLanguageOption;
  applyLanguage(next);
  homepageLanguageSelector.dataset.active = next;
  homepageLanguageSelector.querySelectorAll('[data-home-language-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
  setHomepageLanguageOpen(false);
}));
homepageServices?.querySelectorAll('[data-home-services-option]').forEach((button) => button.addEventListener('click', () => {
  const selector = homepageServices.querySelector('[data-home-services-selector]');
  const panel = homepageServices.querySelector('[data-home-services-panel]');
  selector.dataset.active = button.dataset.homeServicesOption;
  panel.dataset.active = button.dataset.homeServicesOption;
  selector.querySelectorAll('[data-home-services-option]').forEach((option) => option.setAttribute('aria-selected', String(option === button)));
}));
document.querySelectorAll('[data-brand-management-link]').forEach((button) => button.addEventListener('click', () => { window.location.assign('/brand'); }));
document.querySelectorAll('[data-consultation-link]').forEach((button) => button.addEventListener('click', () => { window.location.assign('/consultation'); }));
homepageAccount?.querySelectorAll('[data-home-account-type]').forEach((button) => button.addEventListener('click', () => {
  const selector = homepageAccount.querySelector('[data-home-account-selector]');
  if (!selector) return;
  const accountType = button.dataset.homeAccountType;
  selector.dataset.active = accountType;
  selector.querySelectorAll('[data-home-account-type]').forEach((item) => item.setAttribute('aria-selected', String(item === button)));
}));
homepageAccount?.querySelectorAll('.homepage-account-login').forEach((button) => button.addEventListener('click', async () => {
  const [usernameInput, passwordInput] = homepageAccount.querySelectorAll('[data-home-account-input]');
  if (!usernameInput || !passwordInput) return;
  const expectedAccountType = homepageAccount.querySelector('[data-home-account-selector]')?.dataset.active;
  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  usernameInput.removeAttribute('aria-invalid');
  passwordInput.removeAttribute('aria-invalid');
  try {
    const response = await fetch('/api/accounts/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
    });
    const account = await response.json().catch(() => ({}));
    if (!response.ok || account.accountType !== expectedAccountType) throw new Error('invalid_credentials');
    await loadSharedNotifications();
    if (account.accountType === 'employee') location.assign('/?panel=employee-dashboard');
    if (account.accountType === 'client') location.assign('/?panel=client-dashboard');
  } catch (_) {
    usernameInput.setAttribute('aria-invalid', 'true');
    passwordInput.setAttribute('aria-invalid', 'true');
    passwordInput.focus();
  } finally {
    button.disabled = false;
    button.removeAttribute('aria-busy');
  }
}));
homepageAccount?.querySelectorAll('.homepage-account-selector, .homepage-account-form, .homepage-account-login').forEach((element) => element.addEventListener('pointerdown', (event) => event.stopPropagation()));
homepageSearchInput?.addEventListener('input', renderHomepageSearchSuggestions);
homepageSearchSuggestions?.addEventListener('click', (event) => event.stopPropagation());
document.addEventListener('pointerdown', (event) => {
  if (!homepageBottomNavigation?.classList.contains('is-menu-open')) return;
  resetHomepageMenuInactivityTimer();
  if (event.target.closest('[data-language-toggle]')) return;
  if (event.target.closest('.homepage-bottom-navigation')) return;
  setHomepageMenuOpen(false);
  event.preventDefault();
  event.stopPropagation();
}, true);
document.addEventListener('pointermove', resetHomepageMenuInactivityTimer, { passive: true });
document.addEventListener('keydown', resetHomepageMenuInactivityTimer);
document.addEventListener('wheel', resetHomepageMenuInactivityTimer, { passive: true });
document.querySelectorAll('[data-next-panel]').forEach((button) => button.addEventListener('click', () => moveTo(panelIndex + 1)));
document.querySelectorAll('[data-home-panel]').forEach((button) => button.addEventListener('click', () => moveTo(0)));
searchOverlay.querySelectorAll('[data-panel-index]').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  setSearchOpen(false);
  const targetIndex = panels.findIndex((panel) => panel.dataset.panelId === panelIds[Number(link.dataset.panelIndex)]);
  if (targetIndex >= 0) moveTo(targetIndex);
}));
