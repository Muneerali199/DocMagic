import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'components', 'presentation', 'presentation-generator.tsx');

console.log('🔧 Applying URL feature to presentation generator...\n');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Add import if not present
if (!content.includes('UrlInputSection')) {
  const importLine = 'import { UrlInputSection } from "@/components/presentation/url-input-section";';
  const slideOutlineImport = 'import { SlideOutlinePreview } from "@/components/presentation/slide-outline-preview";';
  
  content = content.replace(slideOutlineImport, slideOutlineImport + '\n' + importLine);
  console.log('✅ Added UrlInputSection import');
} else {
  console.log('ℹ️  Import already exists');
}

// Step 2: Replace textarea section
const oldSection = `              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-sm font-medium flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  Describe your presentation
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="E.g., Create a startup pitch deck for an AI-powered fitness app targeting millennials, including market analysis, product features, business model, and funding requirements"
                  className="min-h-[140px] text-base glass-effect border-yellow-400/30 focus:border-yellow-400/60 focus:ring-yellow-400/20 resize-none"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                />
              </div>`;

const newSection = `              <UrlInputSection
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
              />`;

if (content.includes(oldSection)) {
  content = content.replace(oldSection, newSection);
  console.log('✅ Replaced textarea with UrlInputSection component');
} else {
  console.log('⚠️  Could not find exact textarea section');
  console.log('   You may need to manually replace it');
}

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✨ Integration complete!');
console.log('📝 Now restart your dev server: npm run dev');
console.log('🌐 Then visit your presentation page to see the URL feature!\n');
