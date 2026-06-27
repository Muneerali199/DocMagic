/**
 * Centralized placeholder image utility.
 * Base URL is configurable via PLACEHOLDER_IMAGE_BASE_URL env var.
 * Defaults to https://placehold.co
 */

const PLACEHOLDER_BASE_URL =
  process.env.PLACEHOLDER_IMAGE_BASE_URL?.replace(/\/$/, "") ??
  "https://placehold.co";

export function getPlaceholderImage(
  width: number,
  height: number,
  bg = "EEE",
  fg = "31343C",
  text?: string,
): string {
  const base = `${PLACEHOLDER_BASE_URL}/${width}x${height}/${bg}/${fg}`;
  if (text) {
    return `${base}?text=${encodeURIComponent(text)}`;
  }
  return base;
}

export function getSlidePlaceholder(text?: string): string {
  return getPlaceholderImage(1024, 576, "EEE", "31343C", text);
}

export function getSquarePlaceholder(text?: string): string {
  return getPlaceholderImage(512, 512, "EEE", "31343C", text);
}