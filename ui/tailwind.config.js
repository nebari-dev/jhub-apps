import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Match the MUI default breakpoints currently in use.
    screens: {
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['var(--app-font-family, Inter, sans-serif)'],
      },
      colors: {
        // shadcn semantic tokens, HSL triples sourced from CSS variables.
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Raw brand palette mirrors src/theme/colors.tsx so Tailwind classes
        // can render exact MUI palette values during coexistence.
        brand: {
          purple: {
            DEFAULT: '#BA18DA',
            light: '#BA18DA10',
            dark: '#9B00CE',
          },
          green: {
            DEFAULT: '#18817A',
            light: '#18817A10',
            dark: '#12635E',
          },
          red: '#D72D47',
          orange: '#F66A0A',
          black: '#0F1015',
          disabled: '#0F101561',
        },
        gray: {
          50: 'rgba(0, 0, 0, .08)',
          100: '#E1E3E4',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#90969C',
          500: '#5B5F63',
          600: '#44474A',
          700: '#3C3C3B',
          800: '#242628',
          900: '#1A1C1D',
        },
        blue: {
          50: '#FAFBFC',
          100: '#2491FF',
          200: '#2491FF',
          300: '#2491FF',
          400: '#2491FF',
          500: '#005EA2',
          600: '#1A4480',
          700: '#1A4480',
          800: '#1A4480',
          900: '#162E51',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
