/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7f4',
          100: '#dcefe7',
          200: '#b9dfd1',
          300: '#8cc8b3',
          400: '#5aaa90',
          500: '#3b8d74',
          600: '#2c715d',
          700: '#245b4c',
          800: '#1f493e',
          900: '#1b3d34',
        },
      },
      fontFamily: {
        sans: ['Noto Sans', 'Segoe UI', 'Arial', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
