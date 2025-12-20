import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export default function PostHogPageView() {
  const posthog = usePostHog();
  
  useEffect(() => {
    if (!posthog) return;
    
    const sendPageview = () => {
      posthog.capture("$pageview", {
        $current_url: window.location.href,
      });
    };
    
    if (posthog.__loaded) {
      sendPageview();
    } else {
      const handleLoaded = () => sendPageview();
      window.addEventListener('posthog-loaded', handleLoaded, { once: true });
      
      return () => {
        window.removeEventListener('posthog-loaded', handleLoaded);
      };
    }
  }, [posthog]);
  
  return null;
}