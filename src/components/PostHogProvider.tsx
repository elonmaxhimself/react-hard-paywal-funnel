// src/providers/PosthogProvider.tsx
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function ClientPosthogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !posthog.__loaded) {
      posthog.init(import.meta.env.VITE_POSTHOG_TOKEN!, {
        api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
        person_profiles: "identified_only",
        capture_pageview: false,
        loaded: (posthog) => {
          if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ANALYTICS !== 'true') {
            posthog.opt_out_capturing()
          }
        }
      })
    }
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}