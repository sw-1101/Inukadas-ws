/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // LINE風紫系UIカスタムカラーパレット
        'base-primary': 'var(--base-primary)',
        'base-secondary': 'var(--base-secondary)',
        'base-tertiary': 'var(--base-tertiary)',
        'base-border': 'var(--base-border)',
        'base-text-primary': 'var(--base-text-primary)',
        'base-text-secondary': 'var(--base-text-secondary)',
        
        'main-primary': 'var(--main-primary)',
        'main-secondary': 'var(--main-secondary)',
        'main-light': 'var(--main-light)',
        'main-dark': 'var(--main-dark)',
        
        'accent-primary': 'var(--accent-primary)',
        'accent-warning': 'var(--accent-warning)',
        'accent-success': 'var(--accent-success)',
        'accent-error': 'var(--accent-error)',
      },
      spacing: {
        '18': '4.5rem', // 72px (メッセージバブル用)
        '88': '22rem',   // 352px
        '128': '32rem',  // 512px
      },
      borderRadius: {
        'bubble': '18px', // LINE風メッセージバブル角丸
      },
      fontFamily: {
        'sans': [
          '-apple-system', 
          'BlinkMacSystemFont', 
          'Segoe UI', 
          'Roboto', 
          'Noto Sans JP', 
          'sans-serif'
        ],
      },
      boxShadow: {
        'bubble': '0 2px 8px rgba(124, 58, 237, 0.25)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'modal': '0 4px 20px rgba(124, 58, 237, 0.4)',
      },
      animation: {
        'message-slide-in': 'messageSlideIn 0.3s ease-out',
        'pulse-recording': 'pulse-recording 1.5s ease-in-out infinite',
        'trophy-slide': 'trophy-slide 3s ease-in-out',
        'gradient-loading': 'gradient-loading 1.5s ease-in-out infinite',
      },
      keyframes: {
        'messageSlideIn': {
          'from': { 
            opacity: '0', 
            transform: 'translateY(40px)' 
          },
          'to': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        'pulse-recording': {
          '0%, 100%': { 
            transform: 'scale(1)', 
            boxShadow: '0 0 0 0 rgba(236, 72, 153, 0.7)' 
          },
          '50%': { 
            transform: 'scale(1.05)', 
            boxShadow: '0 0 0 10px rgba(236, 72, 153, 0)' 
          },
        },
        'trophy-slide': {
          '0%': { transform: 'translateX(100%)' },
          '10%': { transform: 'translateX(0)' },
          '90%': { transform: 'translateX(0)', opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        'gradient-loading': {
          '0%': { backgroundPosition: '-200px 0' },
          '100%': { backgroundPosition: 'calc(200px + 100%) 0' },
        },
      },
    },
  },
  plugins: [],
  darkMode: ['class', '[data-theme="dark"]'],
}