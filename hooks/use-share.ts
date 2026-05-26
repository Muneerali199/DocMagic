"use client";

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Configuration options for the useShare hook.
 * All fields are optional; sensible defaults are applied when omitted.
 */
export interface ShareConfig {
  /** Default URL to share. Falls back to window.location.href when not provided. */
  url?: string;
  /** Title used for the Web Share API and as a subject hint for social platforms. */
  title?: string;
  /** Short descriptive text sent to social sharing targets. */
  text?: string;
  /** Subject line for the mailto share. */
  emailSubject?: string;
  /**
   * Body text for the mailto share (plain text, no HTML).
   * If omitted the resolved URL is appended automatically.
   */
  emailBody?: string;
}

/** Public API returned by the useShare hook. */
export interface UseShareReturn {
  /** True for two seconds after a successful clipboard copy. */
  copied: boolean;
  /** Copies the given URL (or the hook default) to the clipboard. */
  copyToClipboard: (url?: string) => Promise<void>;
  /** Opens a mailto: link with an optional subject and body. */
  shareViaEmail: (config?: Pick<ShareConfig, "url" | "emailSubject" | "emailBody">) => void;
  /** Opens WhatsApp Web with the resolved URL always appended to the message text. */
  shareViaWhatsApp: (config?: Pick<ShareConfig, "url" | "text">) => void;
  /** Opens the Twitter/X intent page with text and URL. */
  shareViaTwitter: (config?: Pick<ShareConfig, "url" | "text">) => void;
  /** Opens the LinkedIn share dialog for the given URL. */
  shareViaLinkedIn: (url?: string) => void;
  /** Opens the Facebook sharer for the given URL. */
  shareViaFacebook: (url?: string) => void;
  /** Opens Telegram share with the resolved URL and optional text. */
  shareViaTelegram: (config?: Pick<ShareConfig, "url" | "text">) => void;
  /** Uses the native Web Share API when available, falling back to clipboard copy. */
  shareViaWebShare: (config?: Pick<ShareConfig, "url" | "title" | "text">) => Promise<void>;
}

/**
 * Opens a URL in a new tab with rel="noopener noreferrer" semantics to
 * prevent the opened page from accessing window.opener.
 *
 * @param url - The URL to open.
 */
function openInNewTab(url: string): void {
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * useShare provides a single, reusable set of social-sharing utilities that
 * can be dropped into any component. It encapsulates clipboard access, all
 * seven supported share targets, the Web Share API wrapper, and success or
 * failure toast notifications so callers do not need to duplicate that logic.
 *
 * @param defaultUrl  URL shared by default. Falls back to window.location.href.
 * @param defaults    Default text/title/subject used when a caller omits them.
 */
export function useShare(
  defaultUrl?: string,
  defaults?: Omit<ShareConfig, "url">
): UseShareReturn {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  /**
   * Resolves the URL to share. Only accepts a plain string override;
   * non-string values (e.g. event objects) are ignored and fall through
   * to defaultUrl or window.location.href.
   */
  const resolveUrl = useCallback(
    (override?: string): string =>
      (typeof override === "string" ? override : undefined) ??
      defaultUrl ??
      (typeof window !== "undefined" ? window.location.href : ""),
    [defaultUrl]
  );

  const copyToClipboard = useCallback(
    async (url?: string) => {
      const target = resolveUrl(url);
      if (!target) return;
      try {
        await navigator.clipboard.writeText(target);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Link copied!",
          description: "Share link has been copied to your clipboard",
        });
      } catch {
        toast({
          title: "Failed to copy",
          description: "Please copy the URL manually",
          variant: "destructive",
        });
      }
    },
    [resolveUrl, toast]
  );

  const shareViaEmail = useCallback(
    (config?: Pick<ShareConfig, "url" | "emailSubject" | "emailBody">) => {
      const url = resolveUrl(config?.url);
      const subject = encodeURIComponent(
        config?.emailSubject ?? defaults?.emailSubject ?? "Check this out!"
      );
      const body = encodeURIComponent(
        config?.emailBody ??
          defaults?.emailBody ??
          `I wanted to share this link with you:\n\n${url}`
      );
      openInNewTab(`mailto:?subject=${subject}&body=${body}`);
    },
    [resolveUrl, defaults?.emailSubject, defaults?.emailBody]
  );

  const shareViaWhatsApp = useCallback(
    (config?: Pick<ShareConfig, "url" | "text">) => {
      const url = resolveUrl(config?.url);
      const baseText = config?.text ?? defaults?.text ?? "Check this out:";
      // Always append the URL so it is included even when defaults.text is set.
      const combined = baseText.includes(url) ? baseText : `${baseText} ${url}`;
      const text = encodeURIComponent(combined);
      openInNewTab(`https://wa.me/?text=${text}`);
    },
    [resolveUrl, defaults?.text]
  );

  const shareViaTwitter = useCallback(
    (config?: Pick<ShareConfig, "url" | "text">) => {
      const url = resolveUrl(config?.url);
      const text = encodeURIComponent(
        config?.text ?? defaults?.text ?? "Check this out!"
      );
      const encodedUrl = encodeURIComponent(url);
      openInNewTab(
        `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`
      );
    },
    [resolveUrl, defaults?.text]
  );

  const shareViaLinkedIn = useCallback(
    (url?: string) => {
      const encodedUrl = encodeURIComponent(resolveUrl(url));
      openInNewTab(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
      );
    },
    [resolveUrl]
  );

  const shareViaFacebook = useCallback(
    (url?: string) => {
      const encodedUrl = encodeURIComponent(resolveUrl(url));
      openInNewTab(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      );
    },
    [resolveUrl]
  );

  const shareViaTelegram = useCallback(
    (config?: Pick<ShareConfig, "url" | "text">) => {
      const url = resolveUrl(config?.url);
      const text = encodeURIComponent(
        config?.text ?? defaults?.text ?? "Check this out!"
      );
      const encodedUrl = encodeURIComponent(url);
      openInNewTab(
        `https://t.me/share/url?url=${encodedUrl}&text=${text}`
      );
    },
    [resolveUrl, defaults?.text]
  );

  const shareViaWebShare = useCallback(
    async (config?: Pick<ShareConfig, "url" | "title" | "text">) => {
      const url = resolveUrl(config?.url);
      if (navigator.share) {
        try {
          await navigator.share({
            title: config?.title ?? defaults?.title ?? "Shared via DraftDeckAI",
            text: config?.text ?? defaults?.text ?? "Check this out!",
            url,
          });
          toast({
            title: "Shared successfully!",
            description: "Content shared via Web Share API",
          });
        } catch (error) {
          if ((error as Error).name !== "AbortError") {
            toast({
              title: "Share failed",
              description: "An error occurred while sharing. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else {
        await copyToClipboard(url);
      }
    },
    [resolveUrl, defaults?.title, defaults?.text, copyToClipboard, toast]
  );

  return {
    copied,
    copyToClipboard,
    shareViaEmail,
    shareViaWhatsApp,
    shareViaTwitter,
    shareViaLinkedIn,
    shareViaFacebook,
    shareViaTelegram,
    shareViaWebShare,
  };
}
