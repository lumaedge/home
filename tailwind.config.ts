import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          50: '#fdf8f0',
          100: '#faf0e0',
          200: '#f3dfc0',
          300: '#e8c89a',
          400: '#d4a574',
          500: '#c28d58',
          600: '#a87346',
          700: '#8c5c3a',
          800: '#734b33',
          900: '#5f3f2d',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
