(() => {
  const html = document.documentElement;
  const isArabic = () => html.lang === 'ar';
  const applyLanguage = (language) => {
    html.lang = language;
    html.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-en][data-ar]').forEach((element) => {
      element.textContent = element.dataset[language] || element.dataset.en;
    });
    try { localStorage.setItem('ooxme-language', language); } catch (_) {}
  };
  try { applyLanguage(localStorage.getItem('ooxme-language') === 'ar' ? 'ar' : 'en'); } catch (_) { applyLanguage('en'); }

  const track = document.querySelector('[data-static-track]');
  const experience = document.querySelector('[data-static-panels]');
  let index = 0;
  let wheelLock = false;
  const goTo = (next) => {
    if (!track) return;
    const total = track.children.length;
    index = Math.max(0, Math.min(total - 1, next));
    track.style.transform = `translateY(${-index * 100}dvh)`;
  };
  document.querySelectorAll('[data-next-panel]').forEach((button) => button.addEventListener('click', () => goTo(index + 1)));
  document.querySelectorAll('[data-static-language]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); applyLanguage(isArabic() ? 'en' : 'ar'); }));
  document.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', (event) => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section || !track) return;
    event.preventDefault();
    goTo(Array.prototype.indexOf.call(track.children, section));
  }));
  let startY = null;
  experience?.addEventListener('pointerdown', (event) => { if (!event.target.closest('a,button,input')) startY = event.clientY; });
  experience?.addEventListener('pointerup', (event) => { if (startY === null) return; const delta = startY - event.clientY; if (Math.abs(delta) > 60) goTo(index + (delta > 0 ? 1 : -1)); startY = null; });
  window.addEventListener('wheel', (event) => { if (!track || wheelLock || Math.abs(event.deltaY) < 20) return; wheelLock = true; goTo(index + (event.deltaY > 0 ? 1 : -1)); window.setTimeout(() => { wheelLock = false; }, 620); }, { passive: true });

  const overlay = document.querySelector('[data-static-search-overlay]');
  const searchContent = document.querySelector('[data-static-search-content]');
  const toggleSearch = (open) => { if (!overlay) return; overlay.hidden = !open; overlay.classList.toggle('is-open', open); };
  document.querySelectorAll('[data-static-search]').forEach((button) => button.addEventListener('click', (event) => { event.stopPropagation(); toggleSearch(!overlay?.classList.contains('is-open')); }));
  overlay?.addEventListener('click', () => toggleSearch(false));
  searchContent?.addEventListener('click', (event) => event.stopPropagation());
  overlay?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => toggleSearch(false)));
})();
