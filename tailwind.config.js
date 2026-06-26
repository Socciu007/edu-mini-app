/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: 'var(--color-background)' },
        surface: 'var(--color-surface)',
        card: 'var(--color-card-hover)',
        code: 'var(--color-code-bg)',
        tabbar: 'var(--color-tabbar-bg)',
        header: 'var(--color-header-bg)',
        input: 'var(--color-input-bg)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          pressed: 'var(--color-primary-pressed)',
          foreground: 'var(--color-primary-foreground)',
        },
        secondary: 'var(--color-secondary)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          soft: 'var(--color-accent-soft)',
        },
        inactive: {
          DEFAULT: 'var(--color-inactive)',
          foreground: 'var(--color-inactive-foreground)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
          subtle: 'var(--color-text-subtle)',
        },
        border: { DEFAULT: 'var(--color-border)' },
        divider: { DEFAULT: 'var(--color-divider)' },
        success: 'var(--color-success)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'add-to-cart': 'add-to-cart 0.5s ease-in-out',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        'add-to-cart': {
          '0%': { transform: 'scale(1)' }, '20%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.1)' }, '80%': { transform: 'scale(1.05)' },
          '90%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
    aspectRatio: false,
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
}
