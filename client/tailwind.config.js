module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        appleGray: '#f5f6fa',
        appleGlass: 'rgba(255,255,255,0.6)',
        appleBorder: 'rgba(255,255,255,0.2)',
        appleAccent: '#0071e3',
      },
      fontFamily: {
        sans: ['Inter', 'San Francisco', 'SF Pro Display', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '2rem',
      },
    },
  },
  plugins: [],
}; 