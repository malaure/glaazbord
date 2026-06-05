/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Couleurs GLAAZ
        surface: '#F8F8FB',
        border: '#EBEBF0',
        'text-main': '#1A1A2E',
        'text-muted': '#8888A0',
        // Pastels
        lavender: {
          50: '#F3F0FF',
          100: '#E9E3FF',
          200: '#D4C9FF',
          500: '#8B6FE8',
          600: '#7558D9',
        },
        mint: {
          50: '#EDFAF4',
          100: '#D5F5E7',
          500: '#3DB87A',
          600: '#2EA366',
        },
        peach: {
          50: '#FFF4F0',
          100: '#FFE4D9',
          500: '#F07048',
          600: '#E05A30',
        },
        powder: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#5B9BF0',
          600: '#4488E0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': '11px',
        xs: '12px',
        sm: '13px',
        base: '14px',
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        modal: '0 8px 32px rgba(0,0,0,0.10)',
      },
    },
  },
  plugins: [],
}
