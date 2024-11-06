module.exports = {
  plugins: [
    require("tailwindcss"),
    require("postcss-prefix-selector")({
      prefix: "#yodel-image-admin",
    }),
    require("autoprefixer"),
  ],
};
