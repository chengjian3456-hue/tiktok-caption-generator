# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

CaptionAI — a fully static AI TikTok Caption Generator website deployed on Vercel via GitHub. Six standalone HTML files with no backend, no build step, no dependencies. Each page is self-contained with inline CSS and JavaScript.

- **Production URL:** `https://tiktok-caption-generator-omega.vercel.app`
- **Repo:** `git@github.com:chengjian3456-hue/tiktok-caption-generator.git`
- **Branch:** `main` (auto-deploys to Vercel on push)

## File architecture

```
index.html                          ← Main generator page
fitness-tiktok-captions.html        ← SEO landing page: fitness niche
beauty-tiktok-captions.html         ← SEO landing page: beauty niche
crypto-tiktok-captions.html         ← SEO landing page: crypto niche
funny-tiktok-captions.html          ← SEO landing page: comedy niche
aesthetic-tiktok-captions.html      ← SEO landing page: aesthetic niche
robots.txt                          ← Crawler rules + sitemap reference
sitemap.xml                         ← 6 URLs with priority/changefreq
```

Every HTML file is a complete standalone page (~40KB each) with:
1. `<head>`: SEO meta tags, Open Graph, Twitter Cards, canonical URL, JSON-LD structured data
2. `<style>`: Full CSS (CSS custom properties on `:root`, dark theme, responsive breakpoint at 640px)
3. `<body>`: Navbar (sticky, backdrop-blur, niche dropdown), hero, generator form, results section, example cards, FAQ accordion, SEO content sections, related pages grid, footer
4. `<script>`: Tone selector, FAQ toggle, niche dropdown, `generate()` → `buildResponse()` → `renderResults()`, copy-to-clipboard, toast notifications, scroll-reveal animations

## Key design patterns

**Generator flow:** User enters topic + selects tone → `generate()` validates input → brief simulated delay (600-900ms) → `buildResponse(topic, tone)` returns local template data with niche-specific emoji/captions/hooks/hashtags/CTAs → `renderResults(data)` injects HTML into `#resultsContainer` → results scroll into view.

**Niche pages vs. main page differences:**
- Each has niche-specific `buildResponse()` with tailored emoji arrays and caption templates
- Different accent colors (fitness=green, beauty=pink, crypto=gold, funny=orange, aesthetic=lavender)
- Different default tone pre-selected (fitness=viral, beauty=aesthetic, crypto=professional, funny=funny, aesthetic=aesthetic)
- Different pre-filled topic placeholder and example cards
- Different FAQ questions and SEO content sections

**CSS system:** All styles are inline in `<style>`. CSS custom properties on `:root` define the entire design token system (colors, radii, shadows, gradients). The dark theme uses `#0a0a0f` background with `#f0f0f5` text. Every page shares identical structural CSS but the niche pages override accent colors (`.btn-generate`, `.tone-chip.active`, `.hero-badge`, gradient variables) to match their niche theme.

**No backend / no API:** Previously had OpenAI API integration (`api/generate.js` Vercel serverless function) — fully removed. `robots.txt` disallows `/api/` to prevent 404 crawl errors. Generation is purely client-side template logic.

## Common operations

**Deploy:** Push to `main` → Vercel auto-deploys. No build command, no install step.

**Add a new niche SEO page:**
1. Copy any `*-tiktok-captions.html` as template
2. Update: `<title>`, meta description/keywords, OG/Twitter tags, canonical URL, JSON-LD schemas, breadcrumb
3. Customize accent color variables, hero content, example cards array, FAQ_DATA array, `buildResponse()` niche templates, SEO H2 content sections, related-pages links
4. Add link to new page in the navbar dropdown and footer of ALL 6 pages
5. Add `<url>` entry to `sitemap.xml`
6. Add a "Related Pages" card linking to the new page from all other 5 pages

**Edit a site-wide feature (e.g., new tone option, generator UI change):** Must update all 6 HTML files. Use a Node.js script for bulk edits since CSS/JS is duplicated across files.

**Test locally:** Open any HTML file directly in browser — no server needed. Static HTML/CSS/JS works from `file://`.

**Git workflow:** Commit directly to `main`. No PRs, no branches. Vercel deploys on push.

## Structured data (JSON-LD)

All 6 pages have:
- `FAQPage` schema (index has 5 Q&As, niche pages have 2 Q&As each)
- `BreadcrumbList` schema (index = 1 level, niche = 2 levels)
- `index.html` additionally has `SoftwareApplication` schema

When changing FAQ content in JavaScript (`FAQ_DATA` array), update the corresponding JSON-LD in `<head>` to keep them in sync.

## Domain / SEO notes

- Canonical domain is `tiktok-caption-generator-omega.vercel.app` (not `tiktokcaptiongen.ai`)
- All OG URLs, canonical links, Twitter image URLs, sitemap URLs, and JSON-LD `item` fields must use the vercel.app domain
- `google-site-verification` meta tag is present on all 6 pages
- Sitemap is registered in `robots.txt` — no need to resubmit to GSC unless URLs change
