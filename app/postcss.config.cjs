module.exports = {
  plugins: [
    require('tailwindcss'), // Add Tailwind CSS plugin
    require('postcss-preset-env'), // Use postcss-preset-env for future CSS features
    require('cssnano'), // Minify CSS
  ],
};
