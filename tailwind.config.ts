import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        prime: {
          deep: '#0B0E14',
          card: 'rgba(255,255,255,0.06)',
          'card-hover': 'rgba(255,255,255,0.10)',
          border: 'rgba(255,255,255,0.12)',
          'border-hover': 'rgba(255,255,255,0.20)',
          green: '#00E676',
          yellow: '#FFD600',
          blue: '#448AFF',
          'green-bright': '#69F0AE',
          'yellow-bright': '#FFEA00',
          'blue-bright': '#82B1FF',
        },
        zone: {
          libertadores: '#34D399',
          prelibertadores: '#2DD4BF',
          sulamericana: '#60A5FA',
          rebaixamento: '#FB7185',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'live-pulse': 'live-pulse 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'live-pulse': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255, 68, 68, 0.4)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 8px rgba(255, 68, 68, 0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};

export default config;
