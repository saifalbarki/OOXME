# OOXME Rebuild — Locked Master Panel Standard

## Scope

These rules apply permanently to every file and future feature inside `/rebuild` only. They do not authorize changes to the production website outside `/rebuild`.

## Single shared system

- The current Master Panel is the sole approved visual and interaction system for the entire rebuilt website.
- Every homepage section, internal page, subpage, service page, project page, plan page, and booking, payment, or confirmation step must use this same system.
- New work may change only panel-internal content and page-specific functional elements. It must never create a page-specific version of the panel, header, navigation, motion, or overlay.
- Reuse the shared tokens, styles, markup patterns, and JavaScript motion/language logic. Do not duplicate or override them per page.

## Locked panel framework

Never alter the approved Master Panel's:

- Size, viewport position, radius, safe margins, background, or responsive geometry.
- Centered OOXME logo size and position.
- Physical header positions: Language icon on the left and Search icon on the right, in both LTR and RTL.
- Header icon size, alignment, spacing, or global color system.
- Typography hierarchy, approved fonts, colors, and spacing tokens.
- Bottom-control width, line thickness, spacing, resting position, or shared line-only bounce animation.
- Shared panel swipe/click travel, final panel alignment, or post-arrival content Fade + Blur reveal.
- Search Overlay layout, glass treatment, opening/closing sequence, active-input behavior, keyboard-safe positioning, or suggestion treatment.

## Content boundaries

- Cards, forms, images, lists, controls, and all other new page content must live inside the Master Panel safe area and use its tokens, typography, spacing, direction, and motion conventions.
- Content must not resize, reposition, cover, or override the panel, header, logo, bottom control, Search Overlay, or global spacing.
- Every new panel must enter and lock into the same exact position and dimensions as the first Master Panel.

## Language and responsiveness

- English is LTR with the approved Plus Jakarta Sans font. Arabic is RTL with the approved Tosh font.
- Language selection uses the single shared `ooxme-language` state. Do not create page- or overlay-specific language state.
- RTL mirrors content direction only. It does not swap the physical global header icon positions.
- Preserve the approved responsive behavior and Visual Viewport keyboard-safe handling across screen sizes.

## Working requirement

Before adding a new rebuilt page or component, verify that it uses the shared Master Panel system without changing any locked rule above. Do not build real website pages unless explicitly requested.
