/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F7FA',
        card: '#FFFFFF',
        textPrimary: '#17212B',
        textSecondary: '#667085',
        textMuted: '#98A2B3',
        borderSubtle: '#E4E7EC',
        brand: {
          blue: '#1769AA',
          lightBlue: '#EBF4FA',
          secondary: '#2F80C0',
        },
        cooling: {
          blue: '#1597B8',
          light: '#EAF7FA',
        },
        healthy: {
          green: '#2E9B67',
          light: '#EAF7EE',
        },
        warning: {
          amber: '#D99A22',
          light: '#FDF7EB',
        },
        critical: {
          red: '#D64545',
          light: '#FDECEC',
        },
        solar: {
          yellow: '#E3A72F',
          light: '#FDF9EE',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
