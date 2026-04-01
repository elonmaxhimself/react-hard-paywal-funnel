# Dream Companion — Marketing Funnel

Hard-paywall marketing funnel (React 19 + Vite 7 SPA). Users go through onboarding → character customization → sign-up → payment → redirect to the main platform. No free tier.

## Tech Stack

- **React 19**, **TypeScript 5.9**, **Vite 7**
- **Tailwind CSS v4** + shadcn/ui + Radix UI
- **Zustand 5** (state) + **React Query 5** (server state) + **React Hook Form** + **Zod 4**
- **Shift4** (payments), **PostHog** + Facebook Pixel + Google Ads (analytics)
- **Hosting:** Cloudflare Pages (`main` → production, `dev` → staging)

## Prerequisites

- Node.js 18+
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This will also set up Husky git hooks via the `prepare` script.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in the required values:

| Variable                              | Description                                                        |
| ------------------------------------- | ------------------------------------------------------------------ |
| `VITE_PUBLIC_API_BASE_URL`            | Backend API base URL                                               |
| `VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY`  | Shift4 publishable key (test key for dev, live for prod)           |
| `VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT` | Redirect URL after successful payment                              |
| `VITE_PUBLIC_POSTHOG_TOKEN`           | PostHog project API token                                          |
| `VITE_PUBLIC_POSTHOG_HOST`            | PostHog instance URL                                               |
| `VITE_PUBLIC_ENABLE_DEV_ANALYTICS`    | `true`/`false` — disable in local dev to avoid polluting analytics |

### 3. Start the dev server

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start Vite dev server                |
| `npm run build`         | Lint + type-check + production build |
| `npm run lint`          | Run ESLint                           |
| `npm run lint:fix`      | Run ESLint with auto-fix             |
| `npm run format`        | Format code with Prettier            |
| `npm test`              | Run unit/integration tests (Vitest)  |
| `npm run test:watch`    | Run tests in watch mode              |
| `npm run test:coverage` | Run tests with coverage report       |
| `npm run test:e2e`      | Run E2E tests (Playwright)           |
| `npm run test:e2e:ui`   | Run E2E tests with Playwright UI     |

## Testing

The project uses a two-layer testing stack that runs automatically on every commit.

### Unit & Integration Tests (Vitest)

- **Framework:** Vitest + React Testing Library + jsdom
- **Location:** `src/**/*.test.{ts,tsx}`
- **Run:** `npm test`

Covers stores, hooks, services, utils, and component integration tests. Coverage thresholds are enforced (see `vitest.config.ts`).

### E2E Tests (Playwright)

- **Framework:** Playwright (Chromium only)
- **Location:** `e2e/*.spec.ts`
- **Run:** `npm run test:e2e`

Tests the full funnel: navigation between steps, sign-up form validation, payment flow, and offer modals. Uses API mocking via `page.route()` — no real backend needed.

Playwright auto-starts the Vite dev server on `localhost:5173` (or reuses an existing one).

#### First-time setup

Playwright browser is downloaded automatically on `npm install`. If you see a `browserType.launch: Executable doesn't exist` error, run:

```bash
npx playwright install --with-deps chromium
```

This only needs to be done once.

### Pre-commit Hook

Every commit runs the following checks automatically (via Husky):

1. **lint-staged** — ESLint + Prettier on staged files
2. **Vitest** — all unit/integration tests (~3s)
3. **Playwright** — all E2E tests (~30s)

All three must pass for the commit to succeed. **Do not skip hooks with `--no-verify`.**

## Project Structure

```
src/
├── components/
│   ├── funnel/fields/      # Reusable form fields
│   ├── funnel/steps/       # Funnel step components
│   ├── modals/             # Offer modals
│   ├── stepper/            # Stepper navigation
│   └── ui/                 # shadcn/ui primitives
├── configs/                # Feature flags, experiments
├── constants/              # Static data (plans, traits)
├── features/funnel/        # Step orchestration, validation
├── hooks/
│   ├── funnel/             # Funnel hooks (useFunnelForm)
│   └── queries/            # React Query mutations
├── lib/                    # Axios client, utils
├── services/               # API services
├── store/states/           # Zustand slices
└── utils/                  # Helpers, enums, types
e2e/                        # Playwright E2E specs
test/                       # Test setup (vitest)
```

## Docker

For containerized deployment:

```bash
# Development (with hot-reload)
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```
