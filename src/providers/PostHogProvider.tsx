import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function ClientPosthogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const token = import.meta.env.VITE_PUBLIC_POSTHOG_TOKEN;
  
  useEffect(() => {
    if (typeof window === 'undefined' || !token || posthog.__loaded) return;
    
    posthog.init(token, {
      api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      person_profiles: "always",
      capture_pageview: true,
      autocapture: false,
      capture_performance: false,
      persistence: 'sessionStorage',
      capture_exceptions: {
        capture_unhandled_errors: true,
        capture_unhandled_rejections: true,
        capture_console_errors: false
      },
      loaded: (posthog) => {
        const authData = localStorage.getItem("auth-storage");
        if (authData) {
          try {
            const auth = JSON.parse(authData);
            const userId = auth?.state?.userId;
            
            if (userId) {
              posthog.identify(String(userId));
            }
          } catch (error) {
            console.error('Error restoring PostHog identify:', error);
          }
        }
        
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