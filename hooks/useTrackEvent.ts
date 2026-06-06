"use client";

import { usePlausible } from "next-plausible";

export function useTrackEvent() {
  const plausible = usePlausible();

  const trackEvent = (eventName: string, additionalProps: Record<string, any> = {}) => {
    let utmData = {};

    // 1. Check if we have any trapped UTMs in storage
    if (typeof window !== "undefined") {
      const savedUTMs = sessionStorage.getItem("draftdeck_utms");
      if (savedUTMs) {
        try {
          utmData = JSON.parse(savedUTMs);
        } catch (e) {
          console.error("Failed to parse UTM data", e);
        }
      }
    }

    // 2. Fire the event to Plausible, combining our UTMs with any extra data
    plausible(eventName, {
      props: {
        ...additionalProps,
        ...utmData,
      },
    });
    
    // Console log just so we can see it working locally!
    console.log(`📡 Event Tracked: ${eventName}`, { ...additionalProps, ...utmData });
  };

  return { trackEvent };
}