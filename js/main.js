const track = document.querySelector('[data-master-track]');
const HOMEPAGE_NAVIGATION_LOCKED = true;
const SERVICES_NAVIGATION_ENABLED = true;
const CONSULTATION_NAVIGATION_ENABLED = true;
const blockNavigation = (selector, enabled) => document.querySelectorAll(selector).forEach((action) => action.addEventListener('click', (event) => {
  if (enabled) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}, true));
blockNavigation('[data-service-option]:not([data-service-option="brand-management"])', SERVICES_NAVIGATION_ENABLED);
blockNavigation('[data-consultation-option]', CONSULTATION_NAVIGATION_ENABLED);
const brandsWeDesignedLink = document.querySelector('[data-portfolio-option="brands-we-designed"]');
if (brandsWeDesignedLink) brandsWeDesignedLink.href = 'brands-designed-gallery.html';
const uniqueWorksLink = document.querySelector('[data-portfolio-option="unique-works"]');
if (uniqueWorksLink) uniqueWorksLink.href = 'unique-works-gallery.html';
const moreServicesLink = document.querySelector('[data-service-option="more-services"]');
if (moreServicesLink) moreServicesLink.href = 'services.html';
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
  document.querySelectorAll('[data-home-account-input]').forEach((input) => { input.placeholder = input.dataset[`${next}Placeholder`]; });
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
const panelIds = ['intro', 'portfolio', 'plans', 'services', 'consultation', 'contact', 'employee-dashboard'];
const originalPanels = [...track.querySelectorAll('.master-panel-screen')];
originalPanels.forEach((panel, index) => { panel.dataset.panelId = panelIds[index]; });
const plansPanel = track.querySelector('[data-panel-id="plans"]');
const servicesPanel = track.querySelector('[data-panel-id="services"]');
if (plansPanel && servicesPanel) track.insertBefore(servicesPanel, plansPanel);
const panels = [...document.querySelectorAll('.master-panel-screen')];
track.style.height = `calc(var(--ooxme-stable-viewport-height) * ${panels.length})`;
const requestedPanel = new URLSearchParams(window.location.search).get('panel');
const requestedPanelId = /^\d+$/.test(requestedPanel || '') ? panelIds[Number(requestedPanel)] : requestedPanel;
const requestedPanelIndex = HOMEPAGE_NAVIGATION_LOCKED && requestedPanelId !== 'employee-dashboard'
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
if (!HOMEPAGE_NAVIGATION_LOCKED) window.OOXMEMasterPanelDrag?.register({ experience, track, panels, getIndex: () => panelIndex, moveTo });
revealPanel(panelIndex);
const setupEmployeeDashboardPanels = () => {
  if (requestedPanelId !== 'employee-dashboard' || !experience || !window.OOXMEMasterPanelDrag) return;
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
    ['Campaign Launch', 'Prepare and launch the approved monthly campaign.'],
    ['Content Planning', 'Prepare and approve the monthly content direction.'],
    ['Photography Session', 'Complete the scheduled brand photography session.'],
    ['Performance Review', 'Review campaign, content, and engagement performance.'],
    ['Client Feedback', 'Review and apply the latest client feedback.']
  ];
  const taskTrack = timeline.querySelector('.employee-dashboard-task-track');
  taskTrack.innerHTML = demoTasks.map(([title, description]) => `<article class="employee-dashboard-task"><span class="employee-dashboard-task-dot" aria-hidden="true"></span><div class="employee-dashboard-task-copy"><strong>${title}</strong><p>${description}</p><div class="employee-dashboard-task-blocks" aria-hidden="true"><i class="is-in-progress">Status</i><i class="is-days-left">Time</i><i class="is-upload-started">Files</i></div></div></article>`).join('');
  const taskViewport = timeline.querySelector('.employee-dashboard-task-viewport');
  const taskItems = [...taskTrack.querySelectorAll('.employee-dashboard-task')];
  const landscapeTaskQuery = window.matchMedia('(min-aspect-ratio: 4 / 3)');
  let activeTaskIndex = 0;
  let taskGesture = null;
  const taskDetailMeta = [
    { start: '10 Sep 2026', delivery: '15 Sep 2026', remaining: '2–3 Days Left' },
    { start: '01 Sep 2026', delivery: '05 Sep 2026', remaining: '2–3 Days Left' },
    { start: '06 Sep 2026', delivery: '08 Sep 2026', remaining: 'On Track' },
    { start: '20 Sep 2026', delivery: '25 Sep 2026', remaining: 'On Track' },
    { start: '26 Sep 2026', delivery: '30 Sep 2026', remaining: '1 Day Left' }
  ];
  const detailsView = document.createElement('section');
  detailsView.className = 'employee-dashboard-task-details';
  detailsView.setAttribute('aria-label', 'Task details');
  detailsView.hidden = true;
  detailsView.innerHTML = '<section class="employee-dashboard-task-details-section employee-dashboard-task-details-overview"><h2>Task Overview</h2><strong data-task-detail-title></strong><p data-task-detail-description></p></section><section class="employee-dashboard-task-details-section"><h2>Timeline</h2><div class="employee-dashboard-task-detail-boxes"><span><small>Start Date</small><b data-task-detail-start></b></span><span><small>Delivery Date</small><b data-task-detail-delivery></b></span><span><small>Time Remaining</small><b data-task-detail-remaining></b></span></div></section><section class="employee-dashboard-task-details-section"><h2>Files</h2><div class="employee-dashboard-task-detail-boxes"><span><small>Required Files</small><b>3</b></span><span><small>Uploaded Files</small><b>1</b></span><span><small>Remaining Files</small><b>2</b></span></div></section><section class="employee-dashboard-task-details-section employee-dashboard-task-details-updates"><h2>Progress Updates</h2><div class="employee-dashboard-task-update-list"><p><span>Monthly direction reviewed and approved.</span><time>Today, 09:30</time></p><p><span>Production brief prepared for the next step.</span><time>Yesterday, 16:10</time></p><p><span>Task owner confirmed the delivery plan.</span><time>28 Aug 2026, 11:45</time></p></div></section><section class="employee-dashboard-task-details-section employee-dashboard-task-details-actions"><h2>Actions</h2><div><button type="button">Start Task</button><button type="button">Update Progress</button><button type="button">Upload Files</button></div></section>';
  const renderTaskDetails = () => {
    const task = taskItems[activeTaskIndex];
    const meta = taskDetailMeta[activeTaskIndex] || taskDetailMeta[0];
    if (!task) return;
    detailsView.querySelector('[data-task-detail-title]').textContent = task.querySelector('strong')?.textContent || '';
    detailsView.querySelector('[data-task-detail-description]').textContent = task.querySelector('p')?.textContent || '';
    detailsView.querySelector('[data-task-detail-start]').textContent = meta.start;
    detailsView.querySelector('[data-task-detail-delivery]').textContent = meta.delivery;
    detailsView.querySelector('[data-task-detail-remaining]').textContent = meta.remaining;
  };
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
  let panelTwoState = 'progress';
  const setPanelTwoState = (next) => {
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
    if (panelTwoState === 'details') renderTaskDetails();
    navigationProxy.querySelectorAll('[data-employee-dashboard-context]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.employeeDashboardContext === arrowState)));
  };
  selectorProxy.querySelectorAll('[data-employee-dashboard-state-option]').forEach((option) => option.addEventListener('click', () => setPanelTwoState(option.dataset.employeeDashboardStateOption)));
  navigationProxy.querySelectorAll('[data-employee-dashboard-context]').forEach((button) => button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setPanelTwoState(panelTwoState === 'details' ? 'progress' : 'details');
  }));
  taskItems.forEach((task, index) => task.addEventListener('click', () => {
    if (index === activeTaskIndex && panelTwoState === 'progress') setPanelTwoState('details');
  }));
  setPanelTwoState(panelTwoState);
  emptyMasterPanel.append(emptyCard, navigationProxy);
  emptyPanel.append(emptyMasterPanel);

  track.hidden = true;
  employeeTrack.append(employeePanel, emptyPanel);
  experience.append(employeeTrack);

  const employeePanels = [employeePanel, emptyPanel];
  let employeePanelIndex = 0;
  const revealEmployeePanel = (index) => employeePanels.forEach((panel, panelNumber) => panel.classList.toggle('is-active', panelNumber === index));
  const moveToEmployeePanel = (next) => {
    const target = Math.max(0, Math.min(employeePanels.length - 1, next));
    if (target === employeePanelIndex) return;
    employeePanelIndex = target;
    employeePanels.forEach((panel) => panel.classList.remove('is-active'));
    employeeTrack.style.transform = `translateY(calc(var(--ooxme-stable-viewport-height) * ${-employeePanelIndex}))`;
    window.setTimeout(() => revealEmployeePanel(employeePanelIndex), 620);
  };
  revealEmployeePanel(employeePanelIndex);
  window.OOXMEMasterPanelDrag.register({
    experience,
    track: employeeTrack,
    panels: employeePanels,
    getIndex: () => employeePanelIndex,
    moveTo: moveToEmployeePanel
  });

};
setupEmployeeDashboardPanels();
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
const setHomepageMenuOpen = (open) => {
  if (!open) window.clearTimeout(homepageMenuSelectionTimer);
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
document.querySelector('[data-home-menu-gallery]')?.addEventListener('click', () => queueHomepageMenuSelection('gallery', () => location.assign('/studio')));
document.querySelector('[data-employee-dashboard-menu-gallery]')?.addEventListener('click', () => location.assign('/studio'));
document.querySelector('[data-home-menu-services]')?.addEventListener('click', () => queueHomepageMenuSelection('services', () => setHomepageServicesOpen(true)));
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
document.querySelectorAll('[data-brand-management-link]').forEach((button) => button.addEventListener('click', () => { window.location.assign('/brand-management-new'); }));
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
  if (event.target.closest('.homepage-bottom-menu-button, [data-home-menu-trigger]')) return;
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
