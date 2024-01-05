/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    colors: {
      'primary-light': '#2491ff',
      primary: '#005ea2',
      'primary-dark': '#1a4480',
      'primary-darker': '#162e51',
      secondary: '#e31c3d',
      white: '#ffffff',
      black: '#000000',
      'gray-lightest': '#f0f0f0',
      'gray-lighter': '#e6e6e6',
      'gray-light': '#adadad',
      gray: '#757575',
      'gray-dark': '#454545',
      'gray-darker': '#171717',
      'gray-darkest': '#5c5c5c',
      success: '#00a91c',
      'success-light': '#ecf3ec',
      warning: '#ffbe2e',
      'warning-light': '#fde68a',
      error: '#d54309',
      'error-light': '#f4e3db',
      info: '#00bde3',
      'info-light': '#e7f6f8',
      'text-dark': '#1b1b1b',
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
