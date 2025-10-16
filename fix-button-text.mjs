import fs from 'fs';

const filePath = './components/presentation/presentation-generator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Fixing button text...\n');

// Replace the loading text
content = content.replace(
  '                  Creating your presentation...',
  "                  {slides.length > 0 ? 'Applying theme...' : 'Creating your presentation...'}"
);

console.log('✅ Updated loading text');

// Replace the button label
content = content.replace(
  '                  Generate Professional Presentation',
  "                  {slides.length > 0 ? 'Apply This Theme' : 'Generate Professional Presentation'}"
);

console.log('✅ Updated button label');

fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✨ Button text fixed!\n');
