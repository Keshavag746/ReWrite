import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0F0F10',
          secondary: '#1A1A1E',
        },
        accent: {
          DEFAULT: '#7C6EF8',
          hover: '#6A5CE6',
        },
        text: {
          primary: '#F0F0F2',
          secondary: '#8B8B9A',
        },
        border: {
          DEFAULT: '#2A2A32',
        },
        success: '#4ADE80',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        popup: '12px',
      },
      boxShadow: {
        popup: '0 8px 40px rgba(0,0,0,0.6)',
        button: '0 4px 16px rgba(124, 110, 248, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
