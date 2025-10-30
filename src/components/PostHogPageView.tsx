// src/components/PostHogPageView.tsx
import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export default function PostHogPageView() {
  const posthog = usePostHog();
  
  useEffect(() => {
    if (typeof window !== 'undefined' && posthog) {
      const url = window.location.href;
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [posthog]);

  return null;
}