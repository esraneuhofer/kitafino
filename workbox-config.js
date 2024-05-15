module.exports = {
  globDirectory: 'dist/your-project-name/',
  globPatterns: [
    '**/*.{html,js,css,png,svg,jpg}'
  ],
  swSrc: 'src/sw-custom.js',
  swDest: 'dist/your-project-name/sw.js',
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};
