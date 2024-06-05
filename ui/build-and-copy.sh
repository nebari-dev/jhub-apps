# Rename assets for static name
mv dist/assets/index-*.js dist/assets/index.js
mv dist/assets/index-*.css dist/assets/index.css

# Copy assets to jhub_apps static folder
cp -r dist/assets/index.js ../jhub_apps/static/js
cp -r dist/assets/index.css ../jhub_apps/static/css
