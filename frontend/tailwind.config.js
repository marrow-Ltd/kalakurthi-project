/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FDFBF7",
        beige: "#F7F2EA",
        plum: {
          DEFAULT: "#6A1B38",
          light: "#8C2C4D",
          dark: "#4E1327",
        },
        terracotta: "#C86D51",
        blush: "#E8B4B8",
        olive: "#5F6F52",
        gold: "#D4AF37",
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1EBE5A",
        },
      },
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        script: ["'Cormorant'", "serif"],
        body: ["'Poppins'", "sans-serif"],
      },
      keyframes: {
        stitch: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        threadPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(26px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideRight: {
          "0%": { opacity: "0", transform: "translateX(28px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideLeft: {
          "0%": { opacity: "0", transform: "translateX(-32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        kenBurns: {
          "0%": { transform: "scale(1.12) translate(0, 0)" },
          "100%": { transform: "scale(1) translate(0, 0)" },
        },
        heartPop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.4)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)" },
        },
        tabPop: {
          "0%": { transform: "translateY(4px) scale(0.85)" },
          "60%": { transform: "translateY(-3px) scale(1.12)" },
          "100%": { transform: "translateY(0) scale(1)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "70%": { opacity: "1", transform: "scale(1.06)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        sheetUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        progress: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shine: {
          "0%": { transform: "translateX(-120%) skewX(-20deg)" },
          "100%": { transform: "translateX(220%) skewX(-20deg)" },
        },
      },
      animation: {
        stitch: "stitch 2.5s ease-in-out forwards",
        floaty: "floaty 4s ease-in-out infinite",
        fadeInUp: "fadeInUp 0.7s ease-out forwards",
        fadeIn: "fadeIn 0.6s ease-out forwards",
        shimmer: "shimmer 2.5s linear infinite",
        threadPulse: "threadPulse 2s ease-in-out infinite",
        slideUp: "slideUp 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        slideRight: "slideRight 0.5s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        slideLeft: "slideLeft 0.7s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        kenBurns: "kenBurns 7s ease-out forwards",
        heartPop: "heartPop 0.45s ease-out",
        tabPop: "tabPop 0.45s ease-out",
        popIn: "popIn 0.45s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        sheetUp: "sheetUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) both",
        bounceSoft: "bounceSoft 2.4s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(106, 27, 56, 0.15)",
        card: "0 4px 24px -4px rgba(106, 27, 56, 0.12)",
      },
    },
  },
  plugins: [],
};
