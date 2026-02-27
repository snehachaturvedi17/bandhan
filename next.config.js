/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/],
});

const nextConfig = {
  // ─── TypeScript & ESLint ──────────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ─── Image Optimization ───────────────────────────────────────────
  images: {
    // Primary CDN + fallback origins for Indian deployments
    remotePatterns: [
      // Cloudflare R2 / Indian CDN edge
      {
        protocol: "https",
        hostname: "cdn.bandhan.ai",
        pathname: "/**",
      },
      // AWS S3 (Mumbai region – ap-south-1)
      {
        protocol: "https",
        hostname: "bandhan-media.s3.ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "bandhan-media.s3-ap-south-1.amazonaws.com",
        pathname: "/**",
      },
      // Firebase Storage
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/v0/b/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
      // DigiLocker / Aadhaar assets
      {
        protocol: "https",
        hostname: "*.digilocker.gov.in",
        pathname: "/**",
      },
      // User-generated content via Cloudinary (IN region)
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Fallback avatars
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/**",
      },
    ],
    // Serve modern formats; AVIF first for bandwidth savings on mobile
    formats: ["image/avif", "image/webp"],
    // Aggressive caching – 30 days for profile photos
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Standard responsive breakpoints + Indian mid-range handsets
    deviceSizes: [360, 414, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [16, 32, 48, 64, 96, 128, 192, 256, 384],
    // Disable dangerouslyAllowSVG for security
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ─── Compiler ─────────────────────────────────────────────────────
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ─── Experimental Features ────────────────────────────────────────
  experimental: {
    // Server Actions (stable in Next 14)
    serverActions: {
      allowedOrigins: [
        "bandhan.ai",
        "www.bandhan.ai",
        "app.bandhan.ai",
        "localhost:3000",
      ],
      bodySizeLimit: "10mb", // allow video-selfie uploads
    },
    // Optimise bundle for faster TTI on 4G/LTE in India
    optimizePackageImports: [
      "framer-motion",
      "react-icons",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "date-fns",
    ],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
  },

  // ─── Redirects ────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source:      "/home",
        destination: "/discover",
        permanent:   true,
      },
      {
        source:      "/signup",
        destination: "/register",
        permanent:   true,
      },
    ];
  },

  // ─── Security & Performance Headers ──────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key:   "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key:   "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key:   "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key:   "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key:   "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key:   "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          {
            key:   "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/static/(.*)",
        headers: [
          {
            key:   "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // No-cache for API routes
      {
        source: "/api/(.*)",
        headers: [
          {
            key:   "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },

  // ─── Environment Variables ────────────────────────────────────────
  // Only variables prefixed NEXT_PUBLIC_ are exposed to the browser.
  // All others remain server-only.
  env: {
    // App
    NEXT_PUBLIC_APP_NAME:    process.env.NEXT_PUBLIC_APP_NAME    ?? "Bandhan AI",
    NEXT_PUBLIC_APP_URL:     process.env.NEXT_PUBLIC_APP_URL     ?? "https://bandhan.ai",
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",

    // Firebase (client-safe)
    NEXT_PUBLIC_FIREBASE_API_KEY:             process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:         process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID:              process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,

    // Razorpay (public key only)
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

    // CDN
    NEXT_PUBLIC_CDN_URL:     process.env.NEXT_PUBLIC_CDN_URL     ?? "https://cdn.bandhan.ai",
    NEXT_PUBLIC_MEDIA_URL:   process.env.NEXT_PUBLIC_MEDIA_URL   ?? "https://bandhan-media.s3.ap-south-1.amazonaws.com",

    // Feature flags
    NEXT_PUBLIC_ENABLE_KUNDALI: process.env.NEXT_PUBLIC_ENABLE_KUNDALI ?? "true",
    NEXT_PUBLIC_ENABLE_VIDEO:   process.env.NEXT_PUBLIC_ENABLE_VIDEO   ?? "true",
    NEXT_PUBLIC_MAINTENANCE:    process.env.NEXT_PUBLIC_MAINTENANCE     ?? "false",
  },

  // ─── Webpack Customisation ────────────────────────────────────────
  webpack(config, { isServer }) {
    // Handle SVG as React components
    config.module.rules.push({
      test:    /\.svg$/,
      use:     ["@svgr/webpack"],
    });

    // Prevent firebase-admin from being bundled on the client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs:            false,
        net:           false,
        tls:           false,
        child_process: false,
        crypto:        require.resolve("crypto-browserify"),
        stream:        require.resolve("stream-browserify"),
      };
    }

    return config;
  },

  // ─── Output ───────────────────────────────────────────────────────
  output:           "standalone", // optimal for Docker / serverless on AWS India
  poweredByHeader:  false,        // hide "X-Powered-By: Next.js"
  compress:         true,
  reactStrictMode:  true,
  swcMinify:        true,

  // ─── Internationalisation (Indian languages) ─────────────────────
  i18n: {
    locales:       ["en-IN", "hi", "bn", "ta", "te", "mr", "gu", "kn", "ml", "pa"],
    defaultLocale: "en-IN",
    localeDetection: true,
  },
};

module.exports = withPWA(nextConfig);
