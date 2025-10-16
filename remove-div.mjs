import fs from 'fs';

const filePath = './components/presentation/presentation-generator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Removing orphaned div tag...\n');

// Read line by line
const lines = content.split('\n');
const newLines = [];

for (let i = 0; i < lines.length; i++) {
  // Skip line 1009 which has the orphaned div
  if (lines[i].trim() === '<div className="space-y-2">') {
    // Check if next line is UrlInputSection
    if (i + 1 < lines.length && lines[i + 1].includes('UrlInputSection')) {
      console.log(`✅ Skipping orphaned div at line ${i + 1}`);
      continue; // Skip this line
    }
  }
  newLines.push(lines[i]);
}

content = newLines.join('\n');
fs.writeFileSync(filePath, content, 'utf8');

console.log('✨ Fixed!\n');
console.log('Now RESTART your dev server and the URL feature will appear! 🎉\n');
