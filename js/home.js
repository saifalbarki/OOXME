const dotCanvas = document.querySelector('.dot-field');
const homeReveal = document.querySelector('.home-reveal');

if (homeReveal) {
  requestAnimationFrame(() => homeReveal.classList.add('is-visible'));
}

if (dotCanvas) {
  const context = dotCanvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pointer = { x: 0, y: 0, active: false };
  const sphere = { x: 0, y: 0, targetX: 0, targetY: 0, velocityX: 0, velocityY: 0 };
  let width = 0;
  let height = 0;
  let scale = 1;
  let spacing = 22;
  let radius = 115;
  let time = 0;
  let previousFrame = 0;

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

  function chooseTarget() {
    const inset = radius * 0.48;
    sphere.targetX = inset + Math.random() * Math.max(1, width - inset * 2);
    sphere.targetY = inset + Math.random() * Math.max(1, height - inset * 2);
  }

  function resize() {
    const previousWidth = width;
    const previousHeight = height;
    const bounds = dotCanvas.getBoundingClientRect();
    scale = window.devicePixelRatio || 1;
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    dotCanvas.width = Math.round(width * scale);
    dotCanvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.imageSmoothingEnabled = true;
    spacing = width < 680 ? 14 : 20;
    radius = width < 680 ? 138 : 210;

    if (previousWidth && previousHeight) {
      sphere.x = sphere.x / previousWidth * width;
      sphere.y = sphere.y / previousHeight * height;
      sphere.targetX = sphere.targetX / previousWidth * width;
      sphere.targetY = sphere.targetY / previousHeight * height;
    } else {
      sphere.x = width * 0.5;
      sphere.y = height * 0.42;
      chooseTarget();
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#000000';

    for (let y = spacing * 0.5; y < height; y += spacing) {
      for (let x = spacing * 0.5; x < width; x += spacing) {
        const distance = Math.hypot(x - sphere.x, y - sphere.y);
        if (distance >= radius) continue;

        const fade = 1 - distance / radius;
        const opacity = Math.pow(fade, 1.85);
        if (opacity < 0.01) continue;

        context.globalAlpha = opacity;
        context.beginPath();
        context.arc(x, y, width < 680 ? 3.75 : 4.5, 0, Math.PI * 2);
        context.fill();
      }
    }

    context.globalAlpha = 1;
  }

  function updateSphere(delta) {
    if (pointer.active) {
      sphere.x += (pointer.x - sphere.x) * 0.16;
      sphere.y += (pointer.y - sphere.y) * 0.16;
      sphere.velocityX = 0;
      sphere.velocityY = 0;
      return;
    }

    const dx = sphere.targetX - sphere.x;
    const dy = sphere.targetY - sphere.y;
    const distance = Math.hypot(dx, dy);
    if (distance < radius * 0.24) chooseTarget();

    const attraction = reducedMotion ? 0.00034 : 0.00072;
    const drag = reducedMotion ? 0.91 : 0.94;
    const driftX = Math.sin(time * 0.73) * 0.12 + Math.sin(time * 0.19 + 1.4) * 0.08;
    const driftY = Math.cos(time * 0.61) * 0.11 + Math.cos(time * 0.27 + 0.7) * 0.08;
    sphere.velocityX = (sphere.velocityX + dx * attraction * delta + driftX * delta) * Math.pow(drag, delta);
    sphere.velocityY = (sphere.velocityY + dy * attraction * delta + driftY * delta) * Math.pow(drag, delta);
    sphere.x += sphere.velocityX * delta;
    sphere.y += sphere.velocityY * delta;

    if (sphere.x < 0 || sphere.x > width) sphere.velocityX *= -0.45;
    if (sphere.y < 0 || sphere.y > height) sphere.velocityY *= -0.45;
    sphere.x = clamp(sphere.x, 0, width);
    sphere.y = clamp(sphere.y, 0, height);
  }

  function animate(frame) {
    const delta = clamp((frame - previousFrame) / 16.667 || 1, 0.4, 2);
    previousFrame = frame;
    time += (reducedMotion ? 0.012 : 0.036) * delta;
    updateSphere(delta);
    draw();
    requestAnimationFrame(animate);
  }

  function updatePointer(event) {
    const bounds = dotCanvas.getBoundingClientRect();
    pointer.x = clamp(event.clientX - bounds.left, 0, bounds.width);
    pointer.y = clamp(event.clientY - bounds.top, 0, bounds.height);
  }

  const interactionSurface = document.querySelector('.home-layout') || dotCanvas;

  interactionSurface.addEventListener('pointerdown', (event) => {
    pointer.active = true;
    updatePointer(event);
    interactionSurface.setPointerCapture?.(event.pointerId);
  }, { passive: true });
  interactionSurface.addEventListener('pointermove', (event) => {
    if (pointer.active) updatePointer(event);
  }, { passive: true });
  window.addEventListener('pointerup', () => {
    if (pointer.active) {
      pointer.active = false;
      chooseTarget();
    }
  }, { passive: true });
  window.addEventListener('pointercancel', () => {
    if (pointer.active) {
      pointer.active = false;
      chooseTarget();
    }
  }, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('orientationchange', resize, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(dotCanvas);

  resize();
  draw();
  requestAnimationFrame(animate);
}
