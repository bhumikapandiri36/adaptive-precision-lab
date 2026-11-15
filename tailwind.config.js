/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050816',
          900: '#080D1F',
          800: '#0C1330',
          700: '#121B40',
          600: '#1B2757',
          500: '#2A3A75',
        },
        brand: { blue: '#4F8CFF', violet: '#8B6CFF' },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
