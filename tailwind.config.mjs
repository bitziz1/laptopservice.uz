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
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', '"Liberation Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '0.875rem' }], // 11px label
        'xs': ['0.75rem', { lineHeight: '1rem' }], // 12px
        'sm': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px body small
        'base': ['0.875rem', { lineHeight: '1.5rem' }], // 14px body
        'lg': ['1rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      }
    },
  },
  plugins: [],
}