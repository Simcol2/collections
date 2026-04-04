/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Light mode base (pillow canvas cream)
        canvas:    '#F5EFE0',
        surface:   '#EDE5D0',
        // ── Dark mode base (espresso from hair shadows)
        espresso:  '#1C1109',
        walnut:    '#2A1A0E',
        // ── Neutrals
        mahogany:  '#7A5C3E',
        // ── Accent palette (derived from pillow)
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#E8C97A',
          pale:    '#F0DFA0',
          muted:   '#A88930',
        },
        coral: {
          DEFAULT: '#D94F3D',
          light:   '#E8786A',
          dark:    '#B03A2B',
        },
        cream:     '#F5EFE0',
        petal:     '#E8C4A0',  // peach floral borders/dividers
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],   // Playfair Display
        serif:   ['var(--font-serif)', 'Georgia', 'serif'],     // Cormorant Garamond
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'], // Montserrat / Inter
        reading: ['var(--font-reading)', 'Georgia', 'serif'],   // Lora (reader body)
        script:  ['var(--font-script)', 'cursive'],
      },
      spacing: {
        'shelf': '180px',   // standard book spine height
        'spine': '52px',    // standard spine width
      },
      boxShadow: {
        'spine': '4px 0 12px rgba(0,0,0,0.25), -1px 0 0 rgba(255,255,255,0.05)',
        'spine-hover': '8px 4px 24px rgba(0,0,0,0.4), -1px 0 0 rgba(255,255,255,0.1)',
        'gold-glow': '0 0 20px rgba(201,168,76,0.3)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'spine-lift': {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '100%': { transform: 'translateY(-8px) rotate(-1deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16,1,0.3,1)',
        'spine-lift': 'spine-lift 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
