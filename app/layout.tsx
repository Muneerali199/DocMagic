import "./globals.css";
import type { ReactNode } from "react";

import Footer from "@/components/ui/Footer";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "./providers";
import { CursorProvider } from "@phazr/custom-cursor";
import { PWABanner } from "@/components/pwa-banner";
import { FeedbackPopup } from "@/components/feedback-popup";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "DraftDeckAI - AI Document Creation Platform",
  description:
    "Create beautiful resumes, presentations, CVs and letters with AI",
};

/**
 * Inline script injected into <head> to apply the correct theme class
 * before the first paint, preventing a flash of the wrong color scheme.
 *
 * It reads the same localStorage key ("theme") that next-themes uses,
 * so the two are always in sync. The script must be a plain string
 * (not a module) so the browser executes it synchronously.
 */
const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=document.documentElement;if(s==='dark'){d.classList.add('dark');}else if(s==='light'){d.classList.remove('dark');}else{if(window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('dark');}else{d.classList.remove('dark');}}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking theme script -- must be first in <head> to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DraftDeckAI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <Providers>
          <CursorProvider>
            {children}
            <PWABanner />
            <FeedbackPopup />
            <Footer />
          </CursorProvider>
        </Providers>
      </body>
    </html>
  );
}
