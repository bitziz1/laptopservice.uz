/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        chassis: {
          950: '#111317',
          900: '#171A20',
          850: '#1D2128',
          800: '#252A33',
          700: '#323844',
          600: '#464E5E',
          400: '#8C96A5',
          300: '#B8C0CC',
          200: '#D5DBE4',
          100: '#ECEFF4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Consolas', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}