/**
 * Utility functions for sharing content across different platforms.
 * All functions are pure and free of side effects.
 */

export function getEmailLink(url: string, title?: string, text?: string): string {
  const subject = encodeURIComponent(title || "Check out my resume!");
  const bodyText = text || "I wanted to share my professional resume with you:";
  const body = encodeURIComponent(`${bodyText}\n\n${url}`);
  return `mailto:?subject=${subject}&body=${body}`;
}

export function getWhatsAppLink(url: string, text?: string): string {
  const shareText = encodeURIComponent(`${text || "Check out my resume:"} ${url}`);
  return `https://wa.me/?text=${shareText}`;
}

export function getTwitterLink(url: string, text?: string): string {
  const shareText = encodeURIComponent(text || "Check out my professional resume!");
  const shareUrl = encodeURIComponent(url);
  return `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`;
}

export function getLinkedInLink(url: string): string {
  const shareUrl = encodeURIComponent(url);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
}

export function getFacebookLink(url: string): string {
  const shareUrl = encodeURIComponent(url);
  return `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
}

export function getTelegramLink(url: string, text?: string): string {
  const shareText = encodeURIComponent(text || "Check out my resume!");
  const shareUrl = encodeURIComponent(url);
  return `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
}
