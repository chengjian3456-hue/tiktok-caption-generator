# P0 Design Fixes — Design Audit Remediation

Date: 2026-05-14 | Status: approved | Scope: 6 HTML files

## Problem

Design audit identified 3 critical P0 issues blocking usability and accessibility:
1. Muted text (#63637a) fails WCAG AA contrast minimum (4.1:1, need 4.5:1)
2. Mobile users lose all niche navigation links (display:none at 640px)
3. Copy button invisible on touch devices (opacity:0, revealed only on :hover)

## Solution

### 1. Contrast Fix
- `--text-muted`: #63637a → #7a7a94 (4.1:1 → 5.4:1, passes WCAG AA)
- `--text-secondary`: #a0a0b8 → #b0b0c8 (6.5:1 → 7.6:1, passes WCAG AAA)
- Change in `:root` CSS custom properties block, all 6 HTML files

### 2. Mobile Navigation
- Remove `.nav-links { display: none }` from `@media (max-width: 640px)` block
- Replace with: shrink the dropdown button text, keep "Try Free" visible
- All 6 HTML files

### 3. Mobile Copy Button
- Add `@media (hover: hover) { .result-item:hover .btn-copy { opacity: 1 } }` — scoped to devices with hover (desktop)
- Add `@media (max-width: 640px) { .btn-copy { opacity: 0.6 } }` — always visible on mobile
- All 6 HTML files

### Bonus P1: Focus Ring
- Add `.btn-generate:focus-visible { outline: 2px solid var(--accent-3); outline-offset: 2px }`
- Add `.tone-chip:focus-visible { outline: 2px solid var(--accent-3); outline-offset: 1px }`
- All 6 HTML files

## Non-goals
- No layout restructure
- No color palette redesign
- No new components
- No JS logic changes

## Implementation
- Bulk-edit via Node.js script across all 6 files
- CSS-only changes, zero JS modifications
- Test: open any page in browser, verify mobile nav visible at 375px width
