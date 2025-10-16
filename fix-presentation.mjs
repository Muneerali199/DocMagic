import fs from 'fs';

const filePath = './components/presentation/presentation-generator.tsx';

console.log('🔧 Fixing presentation generator...\n');

let content = fs.readFileSync(filePath, 'utf8');

// Check if import exists
if (!content.includes('UrlInputSection')) {
  console.log('❌ Import missing - adding it now...');
  
  // Add import after SlideOutlinePreview
  content = content.replace(
    'import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";',
    'import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";\nimport { UrlInputSection } from "@/components/presentation/url-input-section";'
  );
  
  console.log('✅ Import added');
} else {
  console.log('✅ Import already exists');
}

// Replace the textarea div with UrlInputSection
const textareaPattern = /              <div className="space-y-2">\s*<Label htmlFor="prompt"[^>]*>[\s\S]*?<\/Textarea>\s*<\/div>/;

if (textareaPattern.test(content)) {
  content = content.replace(
    textareaPattern,
    `              <UrlInputSection
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
              />`
  );
  console.log('✅ Replaced textarea with UrlInputSection');
} else {
  console.log('⚠️  Pattern not found, trying alternative...');
  
  // Try line by line replacement
  const lines = content.split('\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Describe your presentation')) {
      startIdx = i - 2; // Start from the div
    }
    if (startIdx !== -1 && lines[i].includes('</div>') && i > startIdx + 10) {
      endIdx = i;
      break;
    }
  }
  
  if (startIdx !== -1 && endIdx !== -1) {
    const newLines = [
      ...lines.slice(0, startIdx),
      '              <UrlInputSection',
      '                prompt={prompt}',
      '                setPrompt={setPrompt}',
      '                isGenerating={isGenerating}',
      '              />',
      ...lines.slice(endIdx + 1)
    ];
    content = newLines.join('\n');
    console.log('✅ Replaced using line-by-line method');
  } else {
    console.log('❌ Could not find section to replace');
  }
}

// Write the file
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✨ Done! Restart your dev server and check the presentation page.');
console.log('   You should now see "Text Input" and "From URL" tabs.\n');
