# OOXME Services Handoff

## Scope

This handoff covers the `/services` page only. Homepage and shared Master Panel behavior were not modified.

## Current implementation

- Page markup: `services.html`
- Page styles: `css/services.css`
- Page runtime: `js/services.js`
- Shared read-only dependencies: `css/tokens.css`, `css/main.css`, `css/header.css`, `js/top-bar.js`, and `js/page-controls.js`

## Completed Services changes

- Preserved the current Services hero geometry and bottom formula:
  `bottom: calc(var(--s-first-group-bottom-baseline) + var(--s-section-2-bottom-baseline-correction, 0px))`.
- Added a Services-scoped visual-viewport synchronizer in `js/services.js`.
- The synchronizer updates only `--s-keyboard-offset`, coalesces changes through one animation frame, responds to resize/orientation/visualViewport/focus changes, and resynchronizes after fonts are ready.
- Added duplicate-initialization cleanup protection for the Services synchronizer.
- No homepage baseline correction loop was copied into Services.

## Confirmed verification

- `node --check js/services.js`
- `node --check js/top-bar.js`
- `node --check js/page-controls.js`
- `npm run build`
- `git diff --check`
- Fresh local desktop render at 1280x720:
  - Homepage `/update` bottom gap: 8px.
  - Services `Explore Scope` bottom gap: 8px.
  - Difference: 0px.
- Three repeated fresh Services loads produced an 8px Services gap each time.
- Phone LAN Services render produced an 8px gap at the tested viewport.

## Unresolved alignment issue

The reported intermittent Safari/PWA mismatch is not considered resolved. It was not reproducible in the available Chromium-based browser contexts after fresh navigation. Real Safari, iOS dynamic toolbar behavior, standalone PWA mode, safe-area devices, and physical orientation changes remain unverified.

The known architectural risk is that the homepage loads `js/main.js` and runs the shared baseline correction lifecycle, while `/services` intentionally does not load `js/main.js`. Services now synchronizes keyboard/visual-viewport state locally, but no cross-page baseline correction was introduced.

## Remaining risks

- Safari visual viewport behavior may differ from Chromium.
- Standalone PWA viewport and safe-area behavior require device verification.
- Cache headers and production asset-cache behavior were not changed or cleared.
- Arabic/English live switching was not available through the current browser automation context.

## Recommended next diagnostic

On the affected Safari/PWA device, capture the following simultaneously for `/` and `/services` during toolbar expansion, rotation, and keyboard display:

```js
{
  innerHeight,
  clientHeight: document.documentElement.clientHeight,
  visualHeight: visualViewport?.height,
  visualOffsetTop: visualViewport?.offsetTop,
  scrollY,
  section: document.querySelector('.service-atlas__hero')?.getBoundingClientRect(),
  button: document.querySelector('[data-scroll-to="brand-scope"]')?.getBoundingClientRect(),
  keyboardOffset: getComputedStyle(document.body).getPropertyValue('--s-keyboard-offset'),
  baseline: getComputedStyle(document.body).getPropertyValue('--s-first-group-bottom-baseline')
}
```

