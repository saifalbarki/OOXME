(() => {
  const composer = document.querySelector('[data-s-composer]');
  const addButton = composer?.querySelector('.s-page__add');
  const submitButton = composer?.querySelector('button[type="submit"]');
  if (!composer || !addButton || !submitButton) return;

  const pulse = () => {
    composer.classList.remove('is-pulsing');
    requestAnimationFrame(() => composer.classList.add('is-pulsing'));
  };

  composer.addEventListener('animationend', (event) => {
    if (event.animationName === 's-page-composer-pulse') composer.classList.remove('is-pulsing');
  });
  [addButton, submitButton].forEach((control) => {
    control.addEventListener('pointerdown', pulse, { passive: true });
  });
  composer.addEventListener('pointerdown', (event) => {
    if (event.target === composer) pulse();
  }, { passive: true });
  addButton.addEventListener('click', (event) => {
    event.stopPropagation();
    window.location.assign('/');
  });
})();
