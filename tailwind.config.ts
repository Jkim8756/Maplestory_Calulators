import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        maple: {
          bg:      '#0f0e1a',
          surface: '#1a1829',
          border:  '#2e2a4a',
          accent:  '#7c3aed',
          gold:    '#f59e0b',
          teal:    '#14b8a6',
          red:     '#ef4444',
          text:    '#e2e8f0',
          muted:   '#94a3b8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
