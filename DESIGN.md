---
name: EduNomad
description: Project-collaboration platform connecting Beginners, Mentors, and UMKM through real projects.
colors:
  bg: "#faf8f3"
  ink: "#0b0b0b"
  surface: "#ffffff"
  surface-inset: "#fafaf8"
  muted-surface: "#f1eee7"
  muted-ink: "#6b6b6b"
  border: "#e7e3d8"
  primary: "#d8f277"
  primary-hover: "#cdec5a"
  primary-active: "#c2e84a"
  on-primary: "#0b0b0b"
  accent-tint: "#eef7d6"
  on-accent-tint: "#3f4d00"
  link-green: "#5f8c00"
  ring: "#a3ce00"
  navy: "#201f31"
  on-navy: "#e8e8ec"
  on-navy-muted: "#9595a1"
  success: "#67c957"
  warning: "#ffa500"
  destructive: "#e5484d"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.12em"
rounded:
  sm: "8px"
  input: "10px"
  md: "12px"
  card: "20px"
  hero: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  "2xl": "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    padding: "10px 12px"
  sidebar:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
    width: "256px"
  sidebar-nav-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  chip-active:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.on-navy}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  badge-mentor:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.on-accent-tint}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# EduNomad — DESIGN.md

> Canonical visual contract for the **authenticated app** (dashboard, workspace, admin, forms).
> The marketing landing (`/`) runs a separate, intentionally distinct palette scoped to `ln-*`
> tokens in `globals.css` — do **not** mix the two systems. Tokens here are normative; prose is
> how to apply them. Source of truth: `frontend/src/app/globals.css` `:root` + `[data-app]` layer.

## Overview

**Creative North Star — "The Warm Workshop."** EduNomad is where students, mentors, and small
businesses do real work together, so the app should feel like a calm, well-lit studio, not a
loud SaaS dashboard. Three materials carry the whole system:

- **Warm paper** (`bg #faf8f3`) — the calm canvas everything sits on. Never pure white at the page level.
- **Deep navy** (`navy #201f31`) — the focused workspace: the sidebar, the greeting hero, dark surfaces. Where the app "holds" you.
- **Chartreuse** (`primary #d8f277`) — energy and action, used sparingly for the single most important affordance on a surface.

Mood: focused, warm, crafted, trustworthy. Anti-references: not cream/SaaS-beige, not neon
dark-mode "tool", not corporate blue-and-gray. Warmth comes from the paper bg + Manrope + generous
radii — never from tinting everything beige.

**Layout.** 256px navy sidebar (fixed, full viewport height via `h-dvh`) + warm content area with
a slim translucent header. Content max-width ~`max-w-5xl`, padding `p-6 lg:p-8`. Flex for 1D, grid
for 2D; responsive grids use `repeat(auto-fit, minmax(280px, 1fr))` where breakpoints aren't needed.

## Colors

Strategy: **restrained** — tinted-warm neutrals + one chartreuse accent (≤10% of any surface),
with navy as the committed dark surface. One accent, one dark, one canvas.

| Role | Token | Hex | Use |
|------|-------|-----|-----|
| Canvas | `bg` | `#faf8f3` | Page background (warm off-white). |
| Ink | `ink` | `#0b0b0b` | Primary text / headings. |
| Surface | `surface` | `#ffffff` | Cards, popovers. |
| Inset | `surface-inset` | `#fafaf8` | Input fills. |
| Muted surface | `muted-surface` | `#f1eee7` | Hover, subtle fills. |
| Muted ink | `muted-ink` | `#6b6b6b` | Secondary text (≥4.5:1 on canvas). |
| Border | `border` | `#e7e3d8` | Warm hairlines. |
| **Primary** | `primary` | `#d8f277` | Primary CTA, active nav/tab — **always with `on-primary #0b0b0b` (dark) text, never white.** |
| Primary hover/active | `primary-hover` / `primary-active` | `#cdec5a` / `#c2e84a` | Button states. |
| Accent tint | `accent-tint` | `#eef7d6` | Selected chips, icon chips, "Mentor" badge. |
| Link green | `link-green` | `#5f8c00` | Green text/links **on light** (chartreuse is illegible as text on light). |
| Ring | `ring` | `#a3ce00` | Focus ring on warm/white surfaces. |
| **Navy** | `navy` | `#201f31` | Sidebar, hero, dark surfaces, active chips. |
| On-navy | `on-navy` / `on-navy-muted` | `#e8e8ec` / `#9595a1` | Text on navy (primary / secondary). |
| Success / Warning / Destructive | `success` / `warning` / `destructive` | `#67c957` / `#ffa500` / `#e5484d` | Semantic states only. |

**Contrast law.** Chartreuse `#d8f277` is a *light* fill: legible only as a background (with dark
text) or as text on navy. On light surfaces, green text/icons use `link-green #5f8c00` or
`ring #a3ce00` — never `primary`. Body text holds ≥4.5:1; large/bold ≥3:1.

## Typography

One family, weight-driven contrast: **Manrope** (`--font-sans`, 400–800), loaded in `layout.tsx`.
No second family. Headings use `tracking` slightly negative; never below `-0.04em`. Cap prose at
65–75ch. Roles: `display` (page/hero titles, 700, ~30px) · `heading` (section, 700, ~20px) ·
`body` (15px/1.6) · `label` (12px, 600, uppercase `tracking-[0.12em]` for eyebrow strip labels like
PROYEK / STATUS). Numbers in stats use `tabular-nums`.

## Elevation

**Mostly flat — depth comes from the navy/paper/white tonal stack, not shadows.** Borders
(`1px border`) separate surfaces; rounded corners do the lifting. Shadows are reserved and soft:
hover lift on interactive cards only — `0 14px 30px rgba(32,31,49,0.08)` (navy-tinted, low alpha).
No ambient drop-shadows on static cards, no glassmorphism, no nested cards. Radii scale: inputs
`10px`, cards `20px`, hero `24px`, pills/buttons/badges `full`.

**Motion.** Scoped to `[data-app]`. One reveal: `app-reveal` (fade-up 10px, 0.5s,
`cubic-bezier(0.22,1,0.36,1)`), staggered across list items via `animation-delay`. Transitions are
explicit (`transition-colors`/`transition-[transform,box-shadow]`, 200–300ms, ease-out-quint), never
`transition-all`. Press feedback = `active:translate-y-px` / `active:scale`. **Reduced motion:** the
reveal only runs under `prefers-reduced-motion: no-preference`, so reduced users see content
instantly (content is visible by default — reveals enhance, never gate visibility).

## Components

- **Button — primary:** chartreuse fill, dark text, `rounded-full`, `12px 24px`, hover `#cdec5a`,
  `active:translate-y-px`, visible focus ring. The one loud element per surface.
- **Button — outline/secondary:** white fill, `border`, dark text, `rounded-full`; hover `muted-surface`.
- **Link / tertiary:** `link-green` text, underline on hover (not chartreuse).
- **Card:** white, `1px border`, `rounded-[20px]`, `p-5`–`p-6`. Hover lift only if it's a link/action.
- **Input:** `surface-inset` fill, `1.5px border`, `rounded-[10px]`, `h-11`; focus ring `ring`.
- **Sidebar (navy, `.app-dark`):** 256px, brand block (chartreuse "E" + role label), MENU label,
  nav items; **active = chartreuse pill** (`sidebar-nav-active`) with `aria-current="page"`; profile
  mini-card pinned bottom. Focus rings render chartreuse on navy.
- **Tabs:** bottom-border, active = `border-primary` + `aria-current`; inactive muted with hover border.
- **Chips (discussion):** pill; active = navy fill + white text (`chip-active`), `aria-pressed`.
- **Badges (role):** Mentor → `accent-tint`; Mahasiswa → sky-100/sky-700; UMKM → amber-100/amber-700;
  Admin → zinc. Status badges tint via className (Badge has no success/warning variant).
- **Message card (feed):** white card, tone avatar (initial), name + role badge + timestamp, body;
  own messages get a `ring/40` border. Lives in `DiscussionFeed`.

## Do's and Don'ts

**Do**
- Put dark `#0b0b0b` text on chartreuse; reserve chartreuse for the one key action per surface.
- Use navy for focus/dark surfaces and `app-dark`/`app-on-dark` so focus rings flip to chartreuse on it.
- Keep the page bg warm paper `#faf8f3`; cards white; inputs `surface-inset`.
- Add `aria-current`/`aria-pressed` to active nav/tab/chip; keep every interactive element keyboard-focusable with a visible ring.
- Reuse `AppShell` + `Sidebar`; new authed pages inherit the shell + `[data-app]` a11y/motion layer for free.
- Mirror existing patterns (`projectApi`/`discussionApi` service objects, `ConfirmDialog`, `RailCard`).

**Don't**
- ❌ White text on chartreuse, or chartreuse as text on a light surface (illegible) — use `link-green`.
- ❌ Pure-white page backgrounds, cream/beige tinting "for warmth", or the deprecated `#67C957` green palette.
- ❌ Nested cards, side-stripe accent borders, gradient text, glassmorphism, ambient shadows on static cards.
- ❌ `transition-all`; pair fonts; tracking below `-0.04em`; numbers without `tabular-nums` in stats.
- ❌ Mix `ln-*` (landing) tokens into the app, or app tokens into the landing.
- ❌ Gate content visibility behind a reveal animation (ships blank for reduced-motion / SSR).
