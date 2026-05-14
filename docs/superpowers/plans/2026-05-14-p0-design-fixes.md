# P0 Design Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 CSS issues (contrast, mobile nav, copy button, focus ring) across 6 static HTML files

**Architecture:** Single Node.js bulk-edit script that reads each file, applies regex replacements targeting specific CSS rules, writes back. All 6 files modified in one pass.

**Tech Stack:** Node.js (built-in fs module), CSS custom properties, no dependencies

---

### Task 1: Create and run bulk-edit script

**Files:**
- Create: `fix-p0.js` (temp, deleted after run)
- Modify: `index.html`, `fitness-tiktok-captions.html`, `beauty-tiktok-captions.html`, `crypto-tiktok-captions.html`, `funny-tiktok-captions.html`, `aesthetic-tiktok-captions.html`

- [ ] **Step 1: Write the fix script**

Create `fix-p0.js` in project root:

```javascript
const fs = require('fs');
const files = [
  'index.html',
  'fitness-tiktok-captions.html',
  'beauty-tiktok-captions.html',
  'crypto-tiktok-captions.html',
  'funny-tiktok-captions.html',
  'aesthetic-tiktok-captions.html'
];

files.forEach(f => {
  let html = fs.readFileSync(f, 'utf8');

  // Fix 1: Contrast — update CSS custom properties
  html = html.replace(/--text-muted:\s*#[0-9a-fA-F]+;/g, '--text-muted: #7a7a94;');
  html = html.replace(/--text-secondary:\s*#[0-9a-fA-F]+;/g, '--text-secondary: #b0b0c8;');

  // Fix 2: Mobile nav — remove display:none for .nav-links
  html = html.replace(/\.nav-links\s*\{\s*display:\s*none;\s*\}/g, '');

  // Fix 3: Mobile copy button — add always-visible rule at end of @media block
  html = html.replace(
    /(@media\s*\(max-width:\s*640px\)\s*\{[\s\S]*?)(\})/g,
    '$1 .btn-copy { opacity: 0.6; } $2'
  );

  // Fix 3b: Scope hover-reveal to devices with hover
  html = html.replace(
    /\.result-item:hover\s*\.btn-copy\s*\{\s*opacity:\s*1;\s*\}/g,
    ''
  );
  // Add hover-query version
  html = html.replace(
    /(\/\* ===== Results ===== \*\/)/,
    '$1\n  @media (hover: hover) { .result-item:hover .btn-copy { opacity: 1; } }'
  );

  // Fix 4: Focus ring for keyboard a11y
  html = html.replace(
    /(\/\* ===== Input Form Card ===== \*\/)/,
    '$1\n  .btn-generate:focus-visible { outline: 2px solid var(--accent-3); outline-offset: 2px; }\n  .tone-chip:focus-visible { outline: 2px solid var(--accent-3); outline-offset: 1px; }'
  );

  fs.writeFileSync(f, html, 'utf8');
  console.log(f + ': done');
});

console.log('All 6 files updated.');
```

- [ ] **Step 2: Run the script**

```bash
cd C:\Users\86159\Documents\tiktok-caption-generator && node fix-p0.js
```

Expected: 6 lines of `<filename>: done` followed by `All 6 files updated.`

- [ ] **Step 3: Verify contrast fix**

```bash
grep -c "text-muted: #7a7a94" *.html
```

Expected: `6` (one per file)

- [ ] **Step 4: Verify mobile nav fix**

```bash
grep -c "nav-links.*display.*none" *.html
```

Expected: `0` (rule removed from all files)

- [ ] **Step 5: Verify copy button fix**

```bash
grep -c "hover: hover" *.html
```

Expected: `6` (hover query added to all files)

- [ ] **Step 6: Verify focus ring fix**

```bash
grep -c "focus-visible" *.html
```

Expected: `12` (2 rules × 6 files)

- [ ] **Step 7: Cleanup temp script**

```bash
rm C:\Users\86159\Documents\tiktok-caption-generator\fix-p0.js
```

- [ ] **Step 8: Commit**

```bash
cd C:\Users\86159\Documents\tiktok-caption-generator
git add index.html fitness-tiktok-captions.html beauty-tiktok-captions.html crypto-tiktok-captions.html funny-tiktok-captions.html aesthetic-tiktok-captions.html
git commit -m "fix(p0): contrast WCAG AA, mobile nav visibility, copy button touch support, focus ring a11y"
```

- [ ] **Step 9: Push**

```bash
git push
```
