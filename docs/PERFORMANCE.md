# Performance Baseline

## Scope and date

This baseline combines the successful GitHub Actions Vite build for squashed main commit `df8249c6a0bb588c32c4eb1b25666435be0d6e1c` (14 October 2026) with a direct fetch of the live production JS/CSS assets from Vercel. Raw sizes for the live entry assets are based on fetched response-body lengths. Gzip figures are Vite's estimates from CI, not measured transfer sizes; the live JS filename/hash differs between the CI build and Vercel output. These measurements are not a Lighthouse run or real-user Core Web Vitals.

## Entry assets

| Asset | Raw size | Vite-reported gzip |
| --- | ---: | ---: |
| dist/index.html | 1.40 kB | 0.64 kB |
| dist/assets/index-D-_qDQMD.js (live production JS; CI hash differs) | 473.10 kB | ~137.80 kB |
| dist/assets/index-CW4x3m8v.css (main CSS) | 56.91 kB | 10.06 kB |
| dist/asset-manifest.json | 4.51 kB | 0.77 kB |

Live production entry JS + CSS total approximately **530.01 kB raw**. The **~147.86 kB gzip estimate** comes from the CI build output, not a measurement of the live response encoding (Vercel serves Brotli in the inspected response). The CI build transformed 1,874 modules. This is an asset-size baseline, not a packet capture or exact runtime transfer measurement for every browser/cache/protocol.

## Lazy-loaded route chunks

| Chunk | Raw size | Vite-reported gzip |
| --- | ---: | ---: |
| AppLayout | 14.38 kB | 4.42 kB |
| DashboardPage | 7.56 kB | 2.46 kB |
| FavoritesPage | 2.64 kB | 1.10 kB |
| LoginPage | 11.14 kB | 3.56 kB |
| PromptsPage | 13.82 kB | 4.23 kB |
| SettingsPage | 6.88 kB | 2.17 kB |
| CreatePromptModal | 24.72 kB | 8.21 kB |
| PromptDetailPanel | 23.67 kB | 6.35 kB |

Routes are code-split using React lazy loading and Vite emits separate route/component chunks. The largest asset is the shared entry bundle; it should be the first target for bundle composition inspection if further optimization is required, rather than adding manual chunks without evidence.

## Lighthouse and field metrics

A repeatable Lighthouse browser runner and PageSpeed Insights report were not available in the connected execution environment for this handoff. Therefore this project does **not** claim a Lighthouse Performance/Accessibility/SEO score, LCP, INP/TBT, CLS, or other field metric based on this document.

To establish that baseline from a browser-capable environment:
1. Run Lighthouse against the public production domain on mobile and desktop, using a clean profile.
2. Record Performance, Accessibility, Best Practices, and SEO scores, plus LCP, INP/TBT, CLS, and the run date/device/network settings.
3. Repeat at least once and distinguish lab data from field Core Web Vitals.
4. Save the report or export under a dated artifact outside the production application; update this document with the exact methodology and source report.
5. Re-run after significant changes to route loading, CSS, images, fonts, or caching.

## Sensible optimization order

1. Compare the entry bundle's dependency composition before splitting shared dependencies further.
2. Preserve lazy route loading and remove unused imports/dependencies only when the build graph proves they are unused.
3. Inspect the external font requests. The app currently preconnects to Google Fonts; text remains usable offline but the custom font is not guaranteed offline.
4. Keep the service worker's cache complete. Any chunk/hash change must remain reflected by the emitted manifest and worker precache tests.
5. Compare repeatable Lighthouse runs before claiming that a change improved user-perceived performance.

Avoid optimizing on raw bytes alone: Vite's gzip estimates, browser Brotli transfer, cache state, device CPU, and network conditions are different measurements.
