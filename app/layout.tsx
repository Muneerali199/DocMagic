import "./globals.css";
import { Suspense, type ReactNode } from "react";
import { logEnvStatus } from "@/lib/env-validator";

logEnvStatus();

import Footer from "@/components/ui/Footer";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "./providers";
import { CursorProvider } from "@phazr/custom-cursor";
import { PWABanner } from "@/components/pwa-banner";
import { FeedbackPopup } from "@/components/feedback-popup";
import { DeploymentStatusBanner } from "@/components/deployment-status-banner";
import type { Metadata } from "next";
import PlausibleProvider from 'next-plausible';
import { headers } from 'next/headers';

// 2. Import your existing Client Component (adjust the path if it's in a different folder)
import { UTMTracker } from "@/components/utm-tracker"; 

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "DraftDeckAI - AI Document Creation Platform",
  description: "Create beautiful resumes, presentations, CVs and letters with AI",
  openGraph: {
    title: "DraftDeckAI - AI Document Creation Platform",
    description: "Create beautiful resumes, presentations, CVs and letters with AI",
    siteName: "DraftDeckAI",
    url: "https://draftdeckai.com",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DraftDeckAI - AI Document Creation Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DraftDeckAI - AI Document Creation Platform",
    description: "Create beautiful resumes, presentations, CVs and letters with AI",
    images: ["/og-image.png"],
  },
};

const themeScript = `(function(){try{var s=localStorage.getItem('theme');var d=document.documentElement;if(s==='dark'){d.classList.add('dark');}else if(s==='light'){d.classList.remove('dark');}else{if(window.matchMedia('(prefers-color-scheme: dark)').matches){d.classList.add('dark');}else{d.classList.remove('dark');}}}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') ?? '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Plausible Analytics setup. */}
        <PlausibleProvider
          // @ts-expect-error - domain prop type missing in current next-plausible version
          domain="draftdeckai.com"
          src="https://plausible.io/js/script.tagged-events.outbound-links.js"
          trackOutboundLinks={true}
          taggedEvents={true}
          scriptProps={{ nonce }}
        />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
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
        <DeploymentStatusBanner />
        
        {/* 3. FIX: Your existing component properly wrapped in a Suspense boundary */}
        <Suspense fallback={null}>
          <UTMTracker />
        </Suspense>

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