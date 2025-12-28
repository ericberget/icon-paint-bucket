/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom animations for paint splash effect
      animation: {
        'paint-splash': 'paintSplash 0.6s ease-out forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        paintSplash: {
          '0%': {
            transform: 'scale(0)',
            opacity: '1',
            borderRadius: '50%'
          },
          '50%': {
            transform: 'scale(1.5)',
            opacity: '0.8',
            borderRadius: '30%'
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
            borderRadius: '20%'
          }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      // Custom colors for brand themes
      colors: {
        'rinvoq-yellow': '#FFD200',
        'novartis-orange': '#ED6A00',
        'gsk-orange': '#FF6200',
        'custom-blue': '#1E40AF',
      }
    },
  },
  plugins: [],
}
