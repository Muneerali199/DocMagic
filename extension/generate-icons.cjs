const fs = require('fs');
const path = require('path');

// Create simple PNG icons using Canvas (if available) or copy from public folder
const publicIconPath = path.join(__dirname, '..', 'public');
const iconsDir = path.join(__dirname, 'icons');

// Check if public icons exist
const favicon16 = path.join(publicIconPath, 'favicon-16x16.png');
const favicon32 = path.join(publicIconPath, 'favicon-32x32.png');
const android192 = path.join(publicIconPath, 'android-chrome-192x192.png');

// Copy or create icons
if (fs.existsSync(favicon16)) {
  fs.copyFileSync(favicon16, path.join(iconsDir, 'icon16.png'));
  console.log('✓ Created icon16.png from favicon-16x16.png');
}

if (fs.existsSync(favicon32)) {
  fs.copyFileSync(favicon32, path.join(iconsDir, 'icon48.png'));
  console.log('✓ Created icon48.png from favicon-32x32.png');
}

if (fs.existsSync(android192)) {
  fs.copyFileSync(android192, path.join(iconsDir, 'icon128.png'));
  console.log('✓ Created icon128.png from android-chrome-192x192.png');
}

console.log('\n✓ All icons created successfully!');
