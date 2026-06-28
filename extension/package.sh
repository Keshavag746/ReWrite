#!/bin/bash
# AI Rewrite Anywhere - Packaging Script

echo "🚀 Starting extension build process..."

# Navigate to the script's directory
cd "$(dirname "$0")"

# 1. Install dependencies and run production build
npm install
npm run build

if [ ! -d "dist" ]; then
  echo "❌ Error: build directory 'dist' was not created."
  exit 1
fi

# 2. Check manifest.json contains default_locale
if ! grep -q '"default_locale"' dist/manifest.json; then
  echo "❌ Error: dist/manifest.json does not contain 'default_locale'."
  exit 1
fi

# 3. Check _locales folder exists in dist
if [ ! -d "dist/_locales" ]; then
  echo "❌ Error: dist/_locales directory does not exist."
  exit 1
fi

# 4. Remove any existing zip
if [ -f "extension.zip" ]; then
  rm extension.zip
fi

# 5. Package the extension using recursive zipping inside dist/
echo "📦 Packaging extension..."
cd dist
zip -r ../extension.zip .

echo "✅ Packaging complete! Created extension.zip"
