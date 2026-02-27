/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ─── Brand Palette ──────────────────────────────────────────────
      colors: {
        midnight: {
          DEFAULT: "#0a0e17",
          50: "#e8eaf0",
          100: "#c5c9d8",
          200: "#9ea5be",
          300: "#7780a4",
          400: "#575f8f",
          500: "#373f7a",
          600: "#2b3166",
          700: "#1e2252",
          800: "#13163d",
          900: "#0a0e17",
          950: "#050710",
        },
        saffron: {
          DEFAULT: "#FF9933",
          50: "#fff5e6",
          100: "#ffe5bf",
          200: "#ffd699",
          300: "#ffc266",
          400: "#ffad33",
          500: "#FF9933",
          600: "#e67a00",
          700: "#b35e00",
          800: "#804400",
          900: "#4d2900",
        },
        violet: {
          DEFAULT: "#a29bfe",
          50: "#f3f2ff",
          100: "#e5e3ff",
          200: "#cdc9ff",
          300: "#b5b0ff",
          400: "#a29bfe",
          500: "#8f87fd",
          600: "#7b72fc",
          700: "#5e55e0",
          800: "#4239b3",
          900: "#281e86",
        },
        rose: {
          DEFAULT: "#fd79a8",
          400: "#fe9dc4",
          500: "#fd79a8",
          600: "#e05585",
        },
        gold: {
          DEFAULT: "#f9ca24",
          400: "#fbd44f",
          500: "#f9ca24",
          600: "#d4a800",
        },
      },

      // ─── Typography ─────────────────────────────────────────────────
      fontFamily: {
        // English (Inter) - Clean, modern sans-serif
        inter: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        // Hindi (Noto Sans Devanagari) - Proper Devanagari script rendering
        hindi: [
          "var(--font-hindi)",
          "Noto Sans Devanagari",
          "system-ui",
          "sans-serif",
        ],
        // Default (uses CSS class switching via LanguageContext)
        sans: [
          "var(--font-inter)",
          "var(--font-hindi)",
          "Inter",
          "Noto Sans Devanagari",
          "system-ui",
          "sans-serif",
        ],
        // Display fonts for headings
        display: [
          "var(--font-playfair)",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
        // Monospace for code
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      // ─── Spacing & Sizing ────────────────────────────────────────────
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        88: "22rem",
        112: "28rem",
        128: "32rem",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ─── Shadows ─────────────────────────────────────────────────────
      boxShadow: {
        glass: "0 8px 32px 0 rgba(10, 14, 23, 0.37)",
        "glass-sm": "0 4px 16px 0 rgba(10, 14, 23, 0.25)",
        "glass-lg": "0 16px 48px 0 rgba(10, 14, 23, 0.50)",
        "saffron-glow": "0 0 24px 4px rgba(255, 153, 51, 0.35)",
        "violet-glow": "0 0 24px 4px rgba(162, 155, 254, 0.35)",
        "rose-glow": "0 0 24px 4px rgba(253, 121, 168, 0.35)",
        card: "0 2px 16px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)",
      },

      // ─── Backgrounds ─────────────────────────────────────────────────
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #0a0e17 0%, #1a1040 50%, #0a0e17 100%)",
        "gradient-saffron": "linear-gradient(135deg, #FF9933 0%, #e67a00 100%)",
        "gradient-violet": "linear-gradient(135deg, #a29bfe 0%, #7b72fc 100%)",
        "gradient-premium":
          "linear-gradient(135deg, #f9ca24 0%, #FF9933 50%, #fd79a8 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        "gradient-hero":
          "radial-gradient(ellipse at 60% 20%, rgba(162,155,254,0.18) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(255,153,51,0.12) 0%, transparent 50%), linear-gradient(180deg, #0a0e17 0%, #130d2e 100%)",
        noise: "url('/images/noise.svg')",
      },

      // ─── Backdrop ────────────────────────────────────────────────────
      backdropBlur: {
        xs: "2px",
      },

      // ─── Animations ──────────────────────────────────────────────────
      keyframes: {
        "swipe-right": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateX(120%) rotate(20deg)", opacity: "0" },
        },
        "swipe-left": {
          "0%": { transform: "translateX(0) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translateX(-120%) rotate(-20deg)",
            opacity: "0",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 12px 2px rgba(255,153,51,0.3)" },
          "50%": { boxShadow: "0 0 28px 6px rgba(255,153,51,0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "slide-up": {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "14%": { transform: "scale(1.2)" },
          "28%": { transform: "scale(1)" },
          "42%": { transform: "scale(1.15)" },
          "70%": { transform: "scale(1)" },
        },
        typing: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "swipe-right": "swipe-right 0.4s ease-out forwards",
        "swipe-left": "swipe-left 0.4s ease-out forwards",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "slide-down": "slide-down 0.4s ease-out forwards",
        "fade-in": "fade-in 0.3s ease-out forwards",
        "scale-in": "scale-in 0.3s ease-out forwards",
        heartbeat: "heartbeat 1.2s ease-in-out infinite",
        "typing-dot": "typing 1.2s ease-in-out infinite",
      },

      // ─── Transitions ─────────────────────────────────────────────────
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth-out": "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },

      // ─── Z-index ─────────────────────────────────────────────────────
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
    require("@tailwindcss/aspect-ratio"),

    // ─── Glassmorphism Utilities ─────────────────────────────────────
    function ({ addUtilities, theme }) {
      addUtilities({
        ".glass": {
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(16px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 32px 0 rgba(10, 14, 23, 0.37)",
        },
        ".glass-sm": {
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(8px) saturate(160%)",
          "-webkit-backdrop-filter": "blur(8px) saturate(160%)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 4px 16px 0 rgba(10, 14, 23, 0.25)",
        },
        ".glass-md": {
          background: "rgba(255, 255, 255, 0.08)",
          backdropFilter: "blur(24px) saturate(200%)",
          "-webkit-backdrop-filter": "blur(24px) saturate(200%)",
          border: "1px solid rgba(255, 255, 255, 0.10)",
          boxShadow: "0 8px 32px 0 rgba(10, 14, 23, 0.37)",
        },
        ".glass-dark": {
          background: "rgba(10, 14, 23, 0.60)",
          backdropFilter: "blur(20px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(20px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.50)",
        },
        ".glass-saffron": {
          background: "rgba(255, 153, 51, 0.10)",
          backdropFilter: "blur(16px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 153, 51, 0.20)",
          boxShadow: "0 8px 32px 0 rgba(255, 153, 51, 0.15)",
        },
        ".glass-violet": {
          background: "rgba(162, 155, 254, 0.10)",
          backdropFilter: "blur(16px) saturate(180%)",
          "-webkit-backdrop-filter": "blur(16px) saturate(180%)",
          border: "1px solid rgba(162, 155, 254, 0.20)",
          boxShadow: "0 8px 32px 0 rgba(162, 155, 254, 0.15)",
        },
        ".shimmer-bg": {
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 2.5s linear infinite",
        },
        ".text-gradient-brand": {
          background: "linear-gradient(135deg, #FF9933 0%, #a29bfe 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".text-gradient-premium": {
          background:
            "linear-gradient(135deg, #f9ca24 0%, #FF9933 50%, #fd79a8 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          "-webkit-text-fill-color": "transparent",
        },
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        ".safe-bottom": {
          paddingBottom: "env(safe-area-inset-bottom)",
        },
        ".safe-top": {
          paddingTop: "env(safe-area-inset-top)",
        },
      });
    },
  ],
};
