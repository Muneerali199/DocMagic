import fs from 'fs';

const filePath = './components/presentation/presentation-generator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Updating theme selection buttons...\n');

// Replace the back button onClick
content = content.replace(
  `onClick={() => setCurrentStep('outline')}`,
  `onClick={() => setCurrentStep(slides.length > 0 ? 'generated' : 'outline')}`
);

console.log('✅ Updated back button logic');

// Replace the generate button onClick and text
content = content.replace(
  `onClick={generateFullPresentation}`,
  `onClick={slides.length > 0 ? applyNewThemeToSlides : generateFullPresentation}`
);

console.log('✅ Updated generate button onClick');

// Update the button text to be conditional
const oldButtonText = `              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating your presentation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Professional Presentation
                </>
              )}`;

const newButtonText = `              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {slides.length > 0 ? 'Applying theme...' : 'Creating your presentation...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {slides.length > 0 ? 'Apply This Theme' : 'Generate Professional Presentation'}
                </>
              )}`;

content = content.replace(oldButtonText, newButtonText);

console.log('✅ Updated button text to be conditional');

fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✨ Theme buttons updated successfully!');
console.log('📝 Now the button will say "Apply This Theme" when changing styles\n');
