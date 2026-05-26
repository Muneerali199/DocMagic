import fs from 'fs';

const filePath = './components/presentation/presentation-generator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Cleaning up the code...\n');

// Remove the orphaned div tag
content = content.replace(
  '              <div className="space-y-2">\n              <UrlInputSection',
  '              <UrlInputSection'
);

console.log('✅ Removed extra div tag');

fs.writeFileSync(filePath, content, 'utf8');

console.log('✨ All done!\n');
console.log('📝 Now restart your dev server:');
console.log('   1. Stop server (Ctrl+C)');
console.log('   2. Run: npm run dev');
console.log('   3. Go to presentation page');
console.log('   4. You should see TWO TABS now! 🎉\n');
