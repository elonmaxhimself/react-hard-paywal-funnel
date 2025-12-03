import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function ClientPosthogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const token = import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN;
  console.log(!!token)
  useEffect(() => {
    if (typeof window === 'undefined' || !token || posthog.__loaded) return;

    posthog.init(token, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: "identified_only",
      capture_pageview: false,
      loaded: (posthog) => {
        if (import.meta.env.DEV && import.meta.env.VITE_PUBLIC_ENABLE_DEV_ANALYTICS !== 'true') {
          posthog.opt_out_capturing()
        }
      }
    })
  }, [token])

  if (!token) {
    return <>{children}</>
  }

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}