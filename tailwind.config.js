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
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 50px -24px rgba(28, 61, 52, 0.35)',
      },
    },
  },
  plugins: [],
}
