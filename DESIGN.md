# Design

## Visual Theme

**Strategy:** Restrained (tinted neutrals + blue accent ≤10%)

**Scene:** "DevOps-инженер в 2am на мониторе 27" проверяет статус серверов в тёмной комнате" — тёмная тема по умолчанию, светлая для дневного использования.

## Color Palette

### Primary
- **Blue 500:** `#3b82f6` — Primary actions, links, brand
- **Blue 600:** `#2563eb` — Hover states, emphasis
- **Blue 50:** `#eff6ff` — Light backgrounds, badges

### Neutrals (Tinted toward blue)
- **Slate 900:** `#0f172a` — Dark backgrounds
- **Slate 800:** `#1e293b` — Elevated surfaces (dark)
- **Slate 700:** `#334155` — Borders (dark)
- **Slate 200:** `#e2e8f0` — Borders (light)
- **Slate 100:** `#f1f5f9` — Backgrounds (light)
- **Slate 50:** `#f8fafc` — Subtle backgrounds (light)

### Semantic
- **Green:** Элементы, связанные с "всё хорошо"
- **Amber/Orange:** Предупреждения, внимание
- **Rose/Red:** Ошибки, критичные задачи

### Dark Mode
- Background: `var(--neu-bg)` или Slate 900
- Surface: Slate 800
- Text: Slate 100 (primary), Slate 400 (muted)

## Typography

**Font Family:** Geist (Sans) — современный, технический, читаемый

**Scale:**
- Hero: 4xl-5xl (36-48px)
- H1: 3xl (30px)
- H2: 2xl (24px)
- H3: xl (20px)
- Body: base (16px)
- Small: sm (14px)
- XS: xs (12px)

**Line lengths:** Max 65-75ch для body текста

## Components

### Buttons
- **Primary:** `bg-blue-600 hover:bg-blue-700 text-white`
- **Secondary/Outline:** `border-2 border-slate-200 dark:border-slate-600`
- **Ghost:** `hover:bg-slate-100 dark:hover:bg-slate-800`

**Sizes:** Default (py-2 px-4), LG (py-3 px-6), Icon (w-10 h-10)

### Cards
- Background: White (light) / Slate 800 (dark)
- Border: `border border-slate-200 dark:border-slate-700`
- Radius: `rounded-2xl` (16px)
- Shadow: Subtle или none
- **No nested cards**

### Inputs
- Height: 40-44px minimum
- Border: `border-slate-300 dark:border-slate-600`
- Focus: `ring-2 ring-blue-500`

### Navigation
- **Sidebar:** Collapsible, icon + text
- **Active:** `neu-panel text-[var(--neu-accent)]` with ring
- **Hover:** Opacity transition

## Layout

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Grid
- **Landing:** Max-w-6xl centered
- **App:** Flexible, sidebar + main content
- **Cards:** Responsive grid, 1-3 columns

### Rhythm
- Vary spacing for visual interest
- Section padding: py-24 on landing
- Component gaps: 16-24px

## Motion

**Easing:** `ease-out-quart` / `ease-out-expo` for UI animations

**Durations:**
- Micro (hover): 150-200ms
- UI transitions: 300ms
- Page transitions: 400-500ms

**Principles:**
- Never animate layout properties (width/height)
- Use transform and opacity only
- Respect `prefers-reduced-motion`

## Elevation

**Shadows:**
- Subtle: `shadow-sm`
- Default: `shadow`
- Elevated: `shadow-lg`
- **No glassmorphism blurs** (intentional)

## Icons

**Library:** Lucide React
**Size:** 16-24px depending on context
**Stroke:** 1.5-2

## Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640-1024px
- **Desktop:** > 1024px

**Touch targets:** Minimum 44x44px

## Accessibility

- Focus rings on all interactive elements
- `aria-label` на иконки без текста
- Skip links для keyboard nav
- Color contrast ≥ 4.5:1
