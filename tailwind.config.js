/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        LRtheme:{
          "primary": "#E9760C", // strong orange color
          "secondary": "#F1F1F1", // light grey color
          "accent": "#A47950", // brown color
          "neutral": "#e9bd95", // light orange color
          "base-100": "#ffffff", // white background
          "base-200": "#1E1E1E", // dark grey color
        },
        DRtheme:{ // dark version of the theme above
          "primary": "#E9760C", // strong orange color
          "secondary": "#1E1E1E", // dark grey color
          "accent": "#A47950", // brown color1
          "neutral": "#E9760C", // dark orange
          "base-100": "#2D2D2D", // dark background
          "base-200": "#F1F1F1", // light grey color
        },
      },
      "light", 
      "dark", 
      "bumblebee", 
      "cyberpunk"
    ],
  },
}

