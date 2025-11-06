# Companion Dream AI — Funnel & Tracking README

## Prerequisites

- Node.js 18+ and npm (for local development)
- Docker and Docker Compose (for containerized deployment)

## Quick Start

### Environment Setup

Create a `.env` file based on `.env.example` and configure the required values for your environment.


## Environment Variables

Configure the following variables in your `.env` file:

### API Configuration

- **`VITE_PUBLIC_API_BASE_URL`** (string)  
  Base URL for the backend API. Points to the server handling authentication, payments, and data operations.

### Payment Integration (Shift4)

- **`VITE_PUBLIC_SHIFT4_PUBLISHABLE_KEY`** (string)  
  Publishable API key for Shift4 payment processing. Use test key for development and live key for production.

- **`VITE_PUBLIC_SHIFT4_PAYMENT_REDIRECT`** (string)  
  Redirect URL after successful payment completion. Should point to the application page where users land after checkout.

### Analytics (PostHog)

- **`VITE_PUBLIC_POSTHOG_TOKEN`** (string)  
  PostHog project API token for user analytics and event tracking.

- **`VITE_PUBLIC_POSTHOG_HOST`** (string)  
  PostHog instance URL.

- **`VITE_PUBLIC_ENABLE_DEV_ANALYTICS`** (boolean)  
  Enable or disable analytics in development mode. Set to false in local development to avoid polluting analytics data.

---

## Development vs Production

### Development Mode

Development mode uses `docker-compose.dev.yml` configuration with hot-reload enabled for faster iteration. The application connects to the development backend API and uses Shift4 test keys for payment processing. Analytics can be disabled by setting `VITE_PUBLIC_ENABLE_DEV_ANALYTICS` to false to avoid polluting production analytics data. Payment redirects point to preview or staging URLs.

**Run development mode:**

```bash
docker-compose -f docker-compose.dev.yml up
```

For local development without Docker:

```bash
npm install
npm run dev
```

### Production Mode

Production mode uses the optimized `docker-compose.yml` configuration with a production build. The application connects to the production backend API and uses live Shift4 keys for real payment processing. Analytics are always enabled in production to track user behavior and events. Payment redirects point to the final production application URLs.

**Run production mode:**

```bash
docker-compose up -d
```

For local production build:

```bash
npm install
npm run build
npm start
```

## Stopping the Application

```bash
docker-compose down
```
