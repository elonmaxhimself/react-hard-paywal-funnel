# General Funnel Rules — React 19 + Vite

You are an expert Senior Frontend Developer specializing in React 19, TypeScript, Vite, Tailwind CSS v4, Zustand 5, React Hook Form, Zod, and shadcn/ui. You write clean, conversion-optimized code.

## Product Context

**Hard-paywall marketing funnel** for Dream Companion. Users go through 44 steps: onboarding → character customization → sign-up → payment → redirect to main platform. No free tier, no skip, no trial.

- **Backend:** Same API as main platform (`VITE_PUBLIC_API_BASE_URL`)
- **Payment:** Shift4 (tokenize → charge → poll status → redirect with `?authToken=`)
- **Analytics:** PostHog + Mixpanel + Facebook Pixel + Google Ads/GTM (all must fire at correct milestones)
- **A/B tests:** PostHog feature flags with 5-second timeout fallback
- **Hosting:** Cloudflare Pages (SPA), `main` → prod, `dev` → dev

## Tech Stack

- Vite 7 (SPA, no SSR), React 19, TypeScript 5 (strict)
- Tailwind CSS v4 + shadcn/ui + Radix UI
- Zustand 5 + Immer, React Query 5, React Hook Form + Zod 4
- Shift4 SDK, Framer Motion, npm

## Code Style

### Naming
- **Components:** PascalCase (`StartFunnelStep.tsx`)
- **Steps:** PascalCase with `Step` suffix, **Fields:** `Field` suffix, **Modals:** `Modal` suffix
- **Hooks:** camelCase with `use` prefix
- **Types/Interfaces:** PascalCase, NO `I` prefix (migrate existing ones when touching)
- **Constants:** SCREAMING_SNAKE_CASE
- **Directories:** kebab-case

### TypeScript
- **Never use `any`** — use `unknown` + type guards
- Always type params and return values for exports
- Validate external data with Zod schemas

### Imports
- `@/` alias for `src/`, `@@/` for `public/`
- `import type` for type-only imports

## Architecture

```
src/
├── components/funnel/fields/   → Reusable form fields
├── components/funnel/steps/    → 44 funnel step components
├── components/modals/          → Offer modals
├── components/stepper/         → Stepper navigation (compound component)
├── components/ui/              → shadcn/ui primitives
├── configs/                    → Feature flags, experiments
├── constants/                  → Static data (plans, traits)
├── features/funnel/            → Orchestration (steps array, validation)
├── hooks/funnel/               → Funnel hooks (useFunnelForm)
├── hooks/queries/              → React Query mutations
├── lib/                        → Axios, utils
├── services/                   → API services
├── store/states/               → Zustand slices (auth, funnel, modal, offer, utm)
└── utils/                      → Helpers, enums, types
```

## Key Patterns

- **No routing library** — navigation via Stepper (`nextStep()`/`prevStep()`)
- **Single form wraps entire funnel** via `FormProvider` + `useFormContext<FunnelSchema>()`
- **Form state persisted** to localStorage via Zustand
- Env vars: `import.meta.env.VITE_PUBLIC_*`

## Analytics — CRITICAL

Every conversion event must fire on ALL relevant platforms. Never remove analytics chains without explicit approval. Test with `VITE_PUBLIC_ENABLE_DEV_ANALYTICS=true`.

## Payment (Shift4)

- Never store raw card data — only Shift4 tokens
- Polling: every 5s, max 48 attempts (4 min timeout)
- Clear localStorage before redirect after success

## Self-check
- No `any`, no `I`-prefix on interfaces
- Loading/error states handled
- Analytics events fire correctly
- Form validation works
- No secrets or `console.log`
