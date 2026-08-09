# OOXME Website Guide

## Architecture

- This is a static website. The entry point is `index.html` and each route has its own root HTML file.
- `css/styles.css` is the base visual system; `css/refinements.css` holds approved panel and interaction refinements.
- `js/` contains page behaviour. `js/static-site.js` controls the homepage panel navigation, language switch, and search overlay.
- `assets/` contains all required logos, fonts, icons, and project imagery. Do not remove or rename assets without checking every page reference.
- `server.js` is only the local preview server. Run it with `npm.cmd run dev` in PowerShell.

## Design and spacing

- Preserve the approved rounded light-gray panels, white safe margins, OOXME logo placement, and header icon sizing.
- Use the existing CSS spacing variables and multiples of them; do not introduce arbitrary one-off margins.
- Preserve current typography, panel colors, CTA treatment, card radius, animations, and responsive behaviour.
- Make visual changes only when explicitly requested. Never redesign a working component while fixing an unrelated problem.

## Navigation

- Root HTML pages are the canonical destinations. Use relative static links such as `consultation.html`.
- The local preview server also supports clean URLs such as `/consultation` for compatibility.
- Keep homepage section navigation, search overlay, and language switching smooth and consistent.
- Test every changed link and button after editing.

## Booking flow

- Keep booking state, promo-code logic, price calculation, and confirmation details connected across consultation, summary, payment, and confirmation pages.
- `R100` remains a 100% promotion and locks the consultation to 45 minutes.
- Do not alter booking prices, payment rules, or customer-facing copy unless explicitly instructed.

## Languages

- English uses LTR and the approved English typography.
- Arabic uses RTL and the existing Tosh Arabic fonts in `assets/fonts/arabic/tosh/`.
- Language changes must update text direction, alignment, arrows, controls, and dynamic content consistently.

## Working rules

- Make small, isolated changes. Test the affected page before moving on.
- Do not delete files, assets, CSS, scripts, or pages unless they are proven unused.
- Do not add secrets, private keys, tokens, or local environment files to Git.
- Keep `.gitignore` current for local build folders, logs, and environment files.
