"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function useUTMCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run this on the client side
    if (typeof window === "undefined") return;

    // Safety check: if searchParams is somehow null, bail out early
    if (!searchParams) return;

    // The standard UTM tags marketers use
    const utmTags = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
    let foundUTMs = false;
    const currentUTMs: Record<string, string> = {};

    // Check the current URL for any of these tags
    utmTags.forEach((tag) => {
      const value = searchParams?.get(tag);
      if (value) {
        currentUTMs[tag] = value;
        foundUTMs = true;
      }
    });

    // If we found UTMs in the URL, save them to sessionStorage!
    // They will stay here until the user closes the tab or signs up.
    if (foundUTMs) {
      sessionStorage.setItem("draftdeck_utms", JSON.stringify(currentUTMs));
      console.log("UTMs captured and stored!", currentUTMs); // Keep this for our local testing
    }
  }, [searchParams]);
}