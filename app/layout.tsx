import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./globals.css";

// ─────────────────────────────────────────────────────────────────────────────
// Font Configuration
// Optimized for Indian languages with proper Devanagari rendering
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Inter Font (English/Latin)
 * - Clean, modern sans-serif
 * - Optimized for UI text
 * - Subset: latin (for smaller bundle size)
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});

/**
 * Noto Sans Devanagari (Hindi)
 * - Google's Noto family for Devanagari script
 * - Proper rendering of Hindi conjuncts and matras
 * - Weights: 300-800 for full typography scale
 * - Optimized subset for Hindi
 */
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-hindi",
  display: "swap",
  preload: true,
  weight: ["300", "400", "500", "600", "700", "800"],
  fallback: ["system-ui", "arial"],
});

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// Optimized for Indian audience with bilingual support
// ─────────────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "Bandhan AI - Find Your Perfect Match",
    template: "%s | Bandhan AI",
  },
  description:
    "Bandhan AI uses artificial intelligence to help you find meaningful connections. Experience premium matchmaking designed for modern Indians.",
  keywords: [
    "matchmaking",
    "dating",
    "AI matchmaking",
    "Indian dating",
    "relationships",
    "bandhan",
    "shaadi",
    "matrimony",
    "love",
    "compatibility",
    "हिंदी मैचमेकिंग",
    "भारतीय डेटिंग",
    "शादी",
    "विवाह",
  ],
  authors: [{ name: "Bandhan AI Team" }],
  creator: "Bandhan AI",
  publisher: "Bandhan AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://bandhan.ai",
  ),
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/en",
      "hi-IN": "/hi",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    alternateLocale: ["hi_IN"],
    url: "/",
    siteName: "Bandhan AI",
    title: "Bandhan AI - Find Your Perfect Match",
    description:
      "AI-powered matchmaking for meaningful connections. Designed for modern Indians seeking love and companionship.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Bandhan AI - Premium Matchmaking",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bandhan AI - Find Your Perfect Match",
    description:
      "AI-powered matchmaking for meaningful connections. Designed for modern Indians.",
    creator: "@bandhanai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  category: "lifestyle",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

// ─────────────────────────────────────────────────────────────────────────────
// Root Layout
// Wraps app with LanguageProvider for bilingual support
// ─────────────────────────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="hi"
      suppressHydrationWarning
      className={`${inter.variable} ${notoSansDevanagari.variable} dark`}
    >
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Font display swap for better CLS */}
        <style>{`
          /* Ensure fonts load without FOIT */
          @font-face {
            font-display: swap;
            font-family: 'Inter';
            font-style: normal;
            font-weight: 100 900;
            src: url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
          }

          @font-face {
            font-display: swap;
            font-family: 'Noto Sans Devanagari';
            font-style: normal;
            font-weight: 300 800;
            src: url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@300;400;500;600;700;800&display=swap');
          }

          /* Font classes for dynamic switching */
          .font-inter {
            font-family: var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .font-hindi {
            font-family: var(--font-hindi), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          /* Hindi text needs more line height for proper matra rendering */
          .font-hindi {
            line-height: 1.8;
            letter-spacing: 0.02em;
          }

          /* Prevent layout shift during font load */
          html {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          /* Proper Devanagari rendering */
          .font-hindi * {
            text-rendering: optimizeLegibility;
            -webkit-font-feature-settings: 'liga' 1, 'calt' 1;
            font-feature-settings: 'liga' 1, 'calt' 1;
          }
        `}</style>
      </head>
      <body className="antialiased">
        <LanguageProvider defaultLanguage="en">{children}</LanguageProvider>
      </body>
    </html>
  );
}
