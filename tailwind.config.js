/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: 'var(--bg-base)',
        elevated: 'var(--bg-elevated)',
        raised: 'var(--bg-raised)',
        overlay: 'var(--bg-overlay)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        line: 'var(--border)',
        content: 'var(--text)',
        muted: 'var(--text-muted)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        display: ['Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
