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

## Phase 0: Production Correctness

**Goal:** fix issues that are already wrong in production or clearly unsafe.

### Work items

- [ ] **Replace the Shift4 DEV SDK with environment-aware SDK loading**
  - `index.html` currently loads `https://js.dev.shift4.com/shift4.js`.
  - Production must load `https://js.shift4.com/shift4.js`.
  - Development can keep the DEV endpoint if still required.

- [ ] **Remove raw console output from runtime code**
  - Replace `console.log`, `console.warn`, and `console.error` with a small logger utility.
  - Production logs should be silent by default, except for explicit error reporting.
  - Existing console usage in analytics, axios, payment, auth, and UI helpers should be cleaned up.

- [ ] **Move hardcoded third-party identifiers into environment-driven config**
  - Facebook Pixel ID
  - Google Ads ID
  - TrackDesk account
  - Cookie banner script ID
  - Keep environment-specific values in one typed config layer instead of scattering them in `index.html`.

- [ ] **Fix invalid environment checks**
  - Replace `import.meta.env.VITE_NODE_ENV` usage with `import.meta.env.DEV` or `import.meta.env.PROD`.

### Done when

- Production loads the correct payment SDK.
- Browser console no longer exposes internal payloads in production.
- Third-party script configuration is environment-specific and centralized.
- Runtime environment checks are valid and consistent.

---

## Phase 1: Security and Runtime Safety

**Goal:** remove obvious security gaps and reduce unsafe runtime behavior.

### Work items

- [ ] **Fix i18n escaping policy**
  - Revisit `escapeValue: false` in the i18n config.
  - Either restore escaping or explicitly document and constrain safe interpolation usage.

- [ ] **Add Cloudflare headers for browser-side protection**
  - Add a strict Content Security Policy through `public/_headers`.
  - Add related headers where useful: `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`.
  - Start with a policy that matches the current third-party integrations and then tighten it.

- [ ] **Create a typed frontend config layer**
  - Add a single `src/config/env.ts` module.
  - Validate required env variables with Zod at startup/build time.
  - Fail early if a required production variable is missing or malformed.

- [ ] **Remove unsafe TypeScript escape hatches**
  - Eliminate `as any` usage by adding proper types for:
    - `window.Shift4`
    - `window.fbq`
    - `window.gtag`
    - TrackDesk globals if used directly
  - Replace weakly typed component props and helper return values with explicit interfaces.

- [ ] **Remove linter suppressions by fixing root causes**
  - Replace `payload?: any` with proper payload typing.
  - Fix React hook dependency issues instead of suppressing them.
  - Remove ad hoc exemptions around analytics globals once the globals are typed.

### Done when

- Unsafe interpolation paths are understood and controlled.
- The app ships with explicit browser security headers.
- Missing env vars fail fast instead of failing at runtime.
- `any`-based third-party integrations are replaced with typed declarations.
- Linter suppressions are reduced to near zero and justified when they remain.

---

## Phase 2: Error Handling and Debuggability

**Goal:** make failures visible, actionable, and isolated.

### Work items

- [ ] **Integrate Sentry**
  - Initialize Sentry in the app bootstrap.
  - Include environment and release metadata.
  - Upload hidden source maps during the production build.

- [ ] **Add React error boundaries**
  - Add a boundary around the stepper shell.
  - Add a narrower boundary around payment-related UI.
  - Fallback UI should preserve progress and offer a safe retry path.

- [ ] **Standardize runtime logging**
  - Add `src/lib/logger.ts` with a small API such as `debug`, `info`, `warn`, `error`.
  - Development may log locally; production should forward only meaningful failures.

- [ ] **Normalize API error handling**
  - Centralize axios error parsing.
  - Distinguish between validation errors, auth errors, network failures, and third-party SDK failures.
  - Ensure user-facing messages remain clean while technical details go to telemetry.

### Done when

- Frontend crashes are visible in Sentry with readable stack traces.
- A single broken step does not blank the entire funnel.
- Error reporting is structured and consistent across services and hooks.
- API failures are handled through one predictable pattern.

---

## Phase 3: Delivery Pipeline Hardening

**Goal:** strengthen the existing delivery flow with better technical quality gates.

### Work items

- [ ] **Audit the current CI/CD checks**
  - Document what the current pipeline already runs for `dev` and `main`.
  - Confirm whether lint, typecheck, and build are enforced before deployment.
  - Identify gaps rather than rebuilding the deployment setup from scratch.

- [ ] **Add missing quality gates to the existing pipeline**
  - Require `eslint`, `tsc -b`, and `vite build`.
  - Add automated test steps once the testing foundation exists.
  - Fail the pipeline on missing required env vars for the target environment.

- [ ] **Standardize local developer workflow**
  - Add Husky and lint-staged for changed files.
  - Add Prettier and `eslint-config-prettier`.
  - Make formatting and lint behavior deterministic across machines.

- [ ] **Tighten static analysis**
  - Add `eslint-plugin-jsx-a11y`.
  - Upgrade `@typescript-eslint/no-explicit-any` to `error`.
  - Turn on `noUnusedLocals` and `noUnusedParameters` after cleaning current violations.

### Done when

- Deployments continue to use the existing platform flow, but the code entering that flow is cleaner and safer.
- Broken builds, type errors, and lint regressions fail automatically.
- Local workflows match CI expectations closely enough to reduce surprise failures.

---

## Phase 4: API Contracts and State Safety

**Goal:** protect the app from malformed backend data and fragile local persistence.

### Work items

- [ ] **Validate critical API responses at runtime**
  - Add Zod schemas for auth, payment, and payment-status responses.
  - Parse server responses in the service layer before passing them to UI code.

- [ ] **Introduce a small DTO-to-domain mapping layer**
  - Keep backend response shapes isolated from form state and UI state.
  - Make service contracts explicit and easier to evolve safely.

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

## Phase 5: Performance and Bundle Control

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
  - Revisit everything injected in `index.html`.
  - Defer non-critical scripts where possible.
  - Keep payment-critical code available, but avoid blocking first paint with non-essential integrations.

- [ ] **Self-host static assets that should not depend on third parties**
  - Self-host fonts.
  - Define an image policy for future raster assets: dimensions, format, and compression.

- [ ] **Define simple frontend performance budgets**
  - Initial JS budget
  - Largest step chunk budget
  - Third-party script budget
  - Track regressions with a repeatable build report

### Done when

- Users entering the first steps no longer download the full payment tail immediately.
- Third-party script cost is intentional instead of accidental.
- Performance discussions can rely on measurements, not guesswork.

---

## Phase 6: Testing Foundation

**Goal:** protect the main funnel flows with automated confidence.

### Work items

- [ ] **Add a unit and integration testing stack**
  - Set up Vitest, React Testing Library, and coverage reporting.
  - Add stable helpers for store reset, mocked env, and mocked browser APIs.

- [ ] **Test critical logic first**
  - Funnel step validation rules
  - Form restore behavior
  - Store persistence and reset
  - Analytics service guardrails
  - Payment helper logic
  - Auth callback restoration logic

- [ ] **Add Playwright for end-to-end coverage**
  - Happy path from early steps to payment completion using mocked payment tokenization
  - Payment failure and retry path
  - Refresh and persistence path
  - OAuth callback restoration path

- [ ] **Wire tests into the existing pipeline**
  - Start with unit tests in the main quality gate.
  - Add a small but valuable browser smoke suite once Playwright is stable.

### Done when

- Core funnel logic is covered by fast local tests.
- The highest-value user journeys have browser-level protection.
- Refactors stop depending entirely on manual confidence.

---

## Phase 7: Frontend Architecture and Maintainability

**Goal:** make the codebase easier to extend without hidden coupling.

### Work items

- [ ] **Reduce third-party SDK sprawl**
  - Wrap analytics and payment globals behind typed adapters.
  - Keep direct `window.*` access out of components where possible.

- [ ] **Clarify code ownership boundaries**
  - Keep UI components presentational where possible.
  - Push orchestration into hooks, services, and adapters.
  - Keep backend contracts out of step components.

- [ ] **Normalize naming and file hygiene**
  - Remove remaining `I*` interface naming where touched.
  - Clean unused code and dead paths as part of nearby changes.
  - Keep exported functions and components explicitly typed.

- [ ] **Document critical technical flows**
  - Auth flow
  - Payment flow
  - Funnel persistence
  - Analytics/tracking integration points
  - The goal is lightweight technical documentation, not product documentation.

- [ ] **Consider Storybook after the testing foundation is stable**
  - Useful for isolated UI work, field components, and regression-friendly review.
  - Lower priority than runtime safety and test coverage.

### Done when

- Critical flows are easier to reason about.
- Components are less coupled to SDK globals and transport details.
- New contributors can navigate the codebase without reverse-engineering everything first.

---

## Phase 8: Accessibility Hardening

**Goal:** eliminate obvious accessibility issues and make step navigation safer.

### Work items

- [ ] **Fix missing labels and keyboard affordances**
  - Add missing `aria-label` values for icon-only actions.
  - Audit `BadgeField`, `ButtonField`, and `VoiceField` for keyboard behavior.

- [ ] **Improve focus management between steps**
  - Move focus intentionally on step transitions.
  - Ensure error states and validation messages are discoverable by keyboard and screen-reader users.

- [ ] **Enforce accessibility in static analysis**
  - Add `eslint-plugin-jsx-a11y`.
  - Resolve the first wave of violations and keep the rule active in CI.

### Done when

- The funnel is navigable without relying on a mouse.
- Step transitions and validation states are easier to use with assistive technology.
- Accessibility regressions are caught by tooling, not just by manual review.

---

## Recommended Execution Order

| Order | Phase | Why it comes here |
|-------|-------|-------------------|
| 1 | Phase 0 | Fixes issues that are already wrong in production |
| 2 | Phase 1 | Removes obvious security and runtime safety risks |
| 3 | Phase 2 | Makes new failures visible before wider refactors |
| 4 | Phase 3 | Strengthens the existing delivery flow and local engineering workflow |
| 5 | Phase 4 | Hardens API boundaries, persistence, and payment state |
| 6 | Phase 5 | Improves load cost and creates measurable performance visibility |
| 7 | Phase 6 | Adds automated confidence for future refactors |
| 8 | Phase 7 | Improves maintainability after guardrails are in place |
| 9 | Phase 8 | Final quality pass for accessibility and polish |
