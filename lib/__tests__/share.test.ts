import {
  getEmailLink,
  getWhatsAppLink,
  getTwitterLink,
  getLinkedInLink,
  getFacebookLink,
  getTelegramLink,
} from "../share";

describe("Share Link Generators", () => {
  const testUrl = "https://draftdeckai.com/resume/123";

  it("generates email link correctly", () => {
    const link = getEmailLink(testUrl, "My Title", "My Description");
    expect(link).toContain("mailto:");
    expect(link).toContain(encodeURIComponent("My Title"));
    expect(link).toContain(encodeURIComponent(testUrl));
  });

  it("generates WhatsApp link correctly", () => {
    const link = getWhatsAppLink(testUrl, "My Text");
    expect(link).toBe(`https://wa.me/?text=${encodeURIComponent("My Text " + testUrl)}`);
  });

  it("generates Twitter link correctly", () => {
    const link = getTwitterLink(testUrl, "Tweet Text");
    expect(link).toContain("https://twitter.com/intent/tweet");
    expect(link).toContain(encodeURIComponent("Tweet Text"));
    expect(link).toContain(encodeURIComponent(testUrl));
  });

  it("generates LinkedIn link correctly", () => {
    const link = getLinkedInLink(testUrl);
    expect(link).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(testUrl)}`);
  });

  it("generates Facebook link correctly", () => {
    const link = getFacebookLink(testUrl);
    expect(link).toBe(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(testUrl)}`);
  });

  it("generates Telegram link correctly", () => {
    const link = getTelegramLink(testUrl, "Telegram Text");
    expect(link).toContain("https://t.me/share/url");
    expect(link).toContain(encodeURIComponent(testUrl));
    expect(link).toContain(encodeURIComponent("Telegram Text"));
  });
});
