/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C00000',
          navy: '#1A1A2E',
          ink: '#2A2A33',
          muted: '#6B6B76',
          green: '#1B7A43',
          grey: '#F4F4F6',
        }
      },
      fontFamily: {
        sans: ['Arial', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: []
}
