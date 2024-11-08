# Make copy of assets
cp dist/assets/index-*.js dist/assets/index.js
cp dist/assets/index-*.css dist/assets/index.css

# Copy assets to jhub_apps static folder
cp -r dist/assets/index.js ../jhub_apps/static/js
cp -r dist/assets/index.css ../jhub_apps/static/css
