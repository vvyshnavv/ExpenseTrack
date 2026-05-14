module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0F766E',
        secondary: '#14B8A6',
        bg: '#f5f5f5',
        danger: '#EF4444',
        success: '#22C55E',
        accent: '#FFD400',
        bright: '#06B6D4'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
