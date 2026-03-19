# Technical Excellence Roadmap

Focused roadmap for hardening an already live Cloudflare-hosted product.
This document intentionally stays technical: code quality, runtime safety,
debuggability, performance, testing, and frontend maintainability.

## Scope

- The product is already live in production.
- `dev` and `main` environments already exist.
- Cloudflare Pages already provides deployment infrastructure and branch environments.
- Manual QA already performs post-release smoke testing.
- Rollback and business-side conversion monitoring are out of scope here.
- The goal of this roadmap is to make the codebase safer, easier to operate,
  easier to change, and harder to break.

---

## Resolved Items

Items investigated and closed — no action needed.

- [x] **~~Replace the Shift4 DEV SDK with environment-aware SDK loading~~** — NOT AN ISSUE
    - `index.html` loads `https://js.dev.shift4.com/shift4.js` — this is correct.
    - Shift4 uses a single SDK/API URL for all environments. `dev` in the domain means "developer portal", not "sandbox".
    - The environment (test vs live) is determined by the API key prefix (`pk_test_*` vs `pk_live_*`), not the URL.
    - Confirmed via [Shift4 docs](https://dev.shift4.com/docs/js/): no separate production SDK URL exists.

- [x] **~~Remove raw console output from runtime code~~** — DEFERRED
    - Console logs are the only diagnostic tool in the funnel until Sentry is integrated.
    - QA tests on production and needs console output for debugging payment/auth issues.
    - Revisit after Sentry is in place. For now, only audit for sensitive data leaks (tokens, passwords, card details).

---

## Phase 1: Linting, Typecheck, and Local Workflow ✅

**Goal:** catch bugs before they reach production. Make the codebase consistent across developers.

**Status:** Completed — PR [#53](https://github.com/elonmaxhimself/react-hard-paywal-funnel/pull/53)

### Work items

- [x] **Add missing quality gates to the pipeline**
    - Build script now runs `eslint . && tsc -b && vite build` — lint and type errors fail the build.

- [x] **Standardize local developer workflow**
    - Added Husky + lint-staged (pre-commit: eslint --fix + prettier on staged files).
    - Added Prettier + `eslint-config-prettier`. Config: single quotes, 4-space indent, 120 char width.

- [x] **Tighten static analysis**
    - `@typescript-eslint/no-unused-vars` upgraded to `error`.
    - `noUnusedLocals` and `noUnusedParameters` enabled in tsconfig.
    - Resolved 75 lint/TS problems → 0 errors, 0 warnings.
    - Audited all 27 `eslint-disable` comments — each justified and documented with explanatory comments.

- [x] **Remove unsafe TypeScript escape hatches**
    - Created `src/types/globals.d.ts` with proper types for `window.Shift4`, `window.fbq`, `window.gtag`, `window.dataLayer`.
    - Eliminated all `as any` casts across 35 files.
    - Added typed interfaces for JWT decoder, OAuth callbacks, payment hooks, analytics service.

- [ ] **Audit current CI/CD checks** _(deferred — requires Cloudflare Pages investigation)_
    - Document what Cloudflare Pages already runs for `dev` and `main`.
    - Confirm whether lint, typecheck, and build are enforced before deployment.

---

## Phase 2: Quick Production Fixes

**Goal:** fix small issues that are clearly wrong and quick to address.

### Work items

- [x] **~~Fix invalid environment checks~~** — done in Phase 1
    - Replaced `import.meta.env.VITE_NODE_ENV` with `import.meta.env.DEV` in SpriteIcon.tsx.

- [x] **~~Move hardcoded third-party identifiers into environment-driven config~~** — DEFERRED to Phase 8
    - Facebook Pixel ID, Google Ads ID, TrackDesk account are hardcoded in `index.html`.
    - However: IDs are the same for all environments (staging disables analytics entirely via missing `VITE_PUBLIC_ENABLE_DEV_ANALYTICS`).
    - Moving them to env vars requires a Vite HTML plugin or moving init scripts to JS — architectural change with risk of breaking tracking order.
    - Not a quick fix; moved to Phase 8 (Architecture).

- [x] **~~Remove Mixpanel integration~~** — done
    - Removed `mixpanel-browser` dependency and all tracking calls.
    - Deleted `analytics-service.ts` and `analytics-event-types.ts`.
    - Cleaned `handleAuthSuccess.ts` and `usePaymentForm.tsx`.
    - Removed 3 `eslint-disable` comments. Bundle reduced by ~330 KB.

- [x] **~~Create a typed frontend config layer~~** — done
    - Added `src/config/env.ts` — single source of truth for all env vars.
    - Required vars (`apiBaseUrl`, `shift4.publishableKey`) throw at startup if missing.
    - Optional vars have typed defaults. Typos are now compile errors.
    - All `import.meta.env.VITE_*` removed from application code (only in `config/env.ts` and `vite.config.ts`).

### Done when

- Environment checks use Vite built-ins and work reliably.
- Third-party scripts use correct IDs per environment.
- Missing env vars fail fast instead of silently breaking at runtime.

---

## Phase 3: Observability (Sentry + Error Handling)

**Goal:** make failures visible and actionable instead of relying on console logs and QA reports.

### Work items

- [ ] **Integrate Sentry**
    - Initialize Sentry in the app bootstrap.
    - Include environment and release metadata.
    - Upload hidden source maps during the production build.

- [ ] **Add React error boundaries**
    - Add a boundary around the stepper shell.
    - Add a narrower boundary around payment-related UI.
    - Fallback UI should preserve progress and offer a safe retry path.

- [ ] **Normalize API error handling**
    - Centralize axios error parsing.
    - Distinguish between validation errors, auth errors, network failures, and third-party SDK failures.
    - Ensure user-facing messages remain clean while technical details go to Sentry.

- [ ] **Replace console logs with structured logger** _(unblocked after Sentry)_
    - Add `src/lib/logger.ts` with `debug`, `info`, `warn`, `error`.
    - Development logs locally; production forwards errors to Sentry.

### Done when

- Frontend crashes are visible in Sentry with readable stack traces.
- A single broken step does not blank the entire funnel.
- API failures are handled through one predictable pattern.

---

## Phase 4: Security Hardening

**Goal:** remove obvious security gaps.

### Work items

- [ ] **Add Cloudflare headers for browser-side protection**
    - Add a strict Content Security Policy through `public/_headers`.
    - Add `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
    - Start with a policy that matches current third-party integrations, then tighten.

- [ ] **Fix i18n escaping policy**
    - Revisit `escapeValue: false` in the i18n config.
    - Either restore escaping or explicitly document and constrain safe interpolation usage.

### Done when

- The app ships with explicit browser security headers.
- Unsafe interpolation paths are understood and controlled.

---

## Phase 5: API Contracts and State Safety

**Goal:** protect the app from malformed backend data and fragile local persistence.

### Work items

- [ ] **Validate critical API responses at runtime**
    - Add Zod schemas for auth, payment, and payment-status responses.
    - Parse server responses in the service layer before passing them to UI code.

- [ ] **Version persisted Zustand state**
    - Add store versioning and migration functions for auth and funnel storage.
    - Handle corrupted or outdated local storage safely.
    - Define when persisted state should expire or be cleared.

- [ ] **Harden payment interaction state**
    - Prevent duplicate submits from the UI.
    - Make retry behavior explicit.
    - Preserve a predictable state machine around pending, failed, and successful charges.

### Done when

- Unexpected backend payloads fail in one controlled place instead of leaking into UI logic.
- Persisted state survives schema changes safely.
- Payment UI behavior is deterministic under retries, refreshes, and partial failures.

---

## Phase 6: Performance and Bundle Control

**Goal:** reduce unnecessary work on first load and make performance visible.

### Work items

- [ ] **Analyze the current bundle**
    - Add a bundle visualizer script.
    - Identify the heaviest steps, libraries, and third-party integrations.

- [ ] **Lazy-load the heavy tail of the funnel**
    - Split `PaymentFormStep`, `SubscriptionStep`, `AuthStep`, loader-heavy screens,
      and large modals into separate chunks.
    - Keep the first steps as lightweight as possible.

- [ ] **Review third-party script loading**
    - Defer non-critical scripts where possible.
    - Keep payment-critical code available, but avoid blocking first paint with non-essential integrations.

- [ ] **Self-host fonts**
    - Remove external font dependencies.

### Done when

- Users entering the first steps no longer download the full payment tail immediately.
- Third-party script cost is intentional instead of accidental.

---

## Phase 7: Testing Foundation

**Goal:** protect the main funnel flows with automated confidence.

### Work items

- [ ] **Add a unit and integration testing stack**
    - Set up Vitest, React Testing Library, and coverage reporting.

- [ ] **Test critical logic first**
    - Funnel step validation rules, form restore behavior, store persistence and reset.
    - Payment helper logic, auth callback restoration logic.

- [ ] **Add Playwright for end-to-end coverage**
    - Happy path from early steps to payment completion using mocked payment tokenization.
    - Payment failure/retry, refresh/persistence, OAuth callback restoration.

- [ ] **Wire tests into CI**
    - Unit tests in the main quality gate.
    - Browser smoke suite once Playwright is stable.

### Done when

- Core funnel logic is covered by fast local tests.
- The highest-value user journeys have browser-level protection.

---

## Phase 8: Architecture and Maintainability

**Goal:** make the codebase easier to extend without hidden coupling.

### Work items

- [ ] **Reduce third-party SDK sprawl**
    - Wrap analytics and payment globals behind typed adapters.
    - Keep direct `window.*` access out of components where possible.

- [ ] **Clarify code ownership boundaries**
    - Keep UI components presentational where possible.
    - Push orchestration into hooks, services, and adapters.

- [ ] **Normalize naming and file hygiene**
    - Remove remaining `I*` interface naming where touched.
    - Clean unused code and dead paths as part of nearby changes.

- [ ] **Document critical technical flows**
    - Auth flow, payment flow, funnel persistence, analytics integration points.

### Done when

- Critical flows are easier to reason about.
- Components are less coupled to SDK globals and transport details.

---

## Phase 9: Accessibility

**Goal:** eliminate obvious accessibility issues.

### Work items

- [ ] **Fix missing labels and keyboard affordances**
    - Add missing `aria-label` values for icon-only actions.
    - Audit `BadgeField`, `ButtonField`, and `VoiceField` for keyboard behavior.

- [ ] **Improve focus management between steps**
    - Move focus intentionally on step transitions.
    - Ensure error states and validation messages are discoverable by keyboard and screen-reader users.

- [ ] **Add `eslint-plugin-jsx-a11y`**
    - Resolve initial violations and keep the rule active in CI.

### Done when

- The funnel is navigable without relying on a mouse.
- Accessibility regressions are caught by tooling.

---

## Execution Order

| Order | Phase                            | Why                                                                  |
| ----- | -------------------------------- | -------------------------------------------------------------------- |
| 1     | Phase 1 — Linting & Typecheck    | Foundation — catches bugs before deploy, makes all future work safer |
| 2     | Phase 2 — Quick Production Fixes | Small, high-value fixes that are easy to ship                        |
| 3     | Phase 3 — Observability          | Makes failures visible before deeper refactors                       |
| 4     | Phase 4 — Security               | Adds browser-level protection                                        |
| 5     | Phase 5 — API & State Safety     | Hardens data boundaries and payment state                            |
| 6     | Phase 6 — Performance            | Optimizes load cost with measurable data                             |
| 7     | Phase 7 — Testing                | Adds automated confidence for future refactors                       |
| 8     | Phase 8 — Architecture           | Improves maintainability after guardrails are in place               |
| 9     | Phase 9 — Accessibility          | Final quality pass                                                   |
