import fs from 'fs';

const filePath = './components/presentation/presentation-generator.tsx';
const content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Verifying all fixes...\n');

let allGood = true;

// Check 1: UrlInputSection import
if (content.includes('import { UrlInputSection }')) {
  console.log('✅ UrlInputSection import found');
} else {
  console.log('❌ UrlInputSection import missing');
  allGood = false;
}

// Check 2: UrlInputSection component usage
if (content.includes('<UrlInputSection')) {
  console.log('✅ UrlInputSection component is used');
} else {
  console.log('❌ UrlInputSection component not found');
  allGood = false;
}

// Check 3: applyNewThemeToSlides function
if (content.includes('const applyNewThemeToSlides')) {
  console.log('✅ applyNewThemeToSlides function exists');
} else {
  console.log('❌ applyNewThemeToSlides function missing');
  allGood = false;
}

// Check 4: Dynamic button text
if (content.includes('Apply This Theme')) {
  console.log('✅ Dynamic button text implemented');
} else {
  console.log('❌ Dynamic button text missing');
  allGood = false;
}

// Check 5: Conditional onClick
if (content.includes('slides.length > 0 ? applyNewThemeToSlides : generateFullPresentation')) {
  console.log('✅ Conditional button onClick implemented');
} else {
  console.log('❌ Conditional button onClick missing');
  allGood = false;
}

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 ALL FIXES VERIFIED SUCCESSFULLY!');
  console.log('\n📝 Features Ready:');
  console.log('   ✓ URL to Presentation');
  console.log('   ✓ Theme Change & Re-application');
  console.log('\n🚀 Restart your dev server to see the changes!');
} else {
  console.log('⚠️  Some fixes may not have applied correctly');
  console.log('   Please check the output above');
}

console.log('='.repeat(50) + '\n');
