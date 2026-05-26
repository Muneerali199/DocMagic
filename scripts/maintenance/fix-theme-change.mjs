import fs from 'fs';

const filePath = './components/presentation/presentation-generator.tsx';
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔧 Adding theme re-application functionality...\n');

// Find the goToThemeSelection function and modify it
const oldGoToTheme = `  const goToThemeSelection = () => {
    setCurrentStep('theme');
  };`;

const newGoToTheme = `  const goToThemeSelection = () => {
    setCurrentStep('theme');
  };

  const applyNewThemeToSlides = async () => {
    if (!slides.length || !slideOutlines.length) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStage('🎨 Applying new theme...');

    try {
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 300);

      const response = await fetch('/api/generate/presentation-full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          outlines: slideOutlines, 
          template: selectedTemplate,
          prompt 
        }),
      });

      if (!response.ok) {
        clearInterval(progressInterval);
        throw new Error('Failed to apply new theme');
      }

      const data = await response.json();
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      setGenerationStage('✅ Theme Applied!');
      
      setSlides(data.slides);
      setCurrentStep('generated');

      toast({
        title: "🎨 Theme Applied Successfully!",
        description: \`Your presentation now uses the \${selectedTemplate} theme!\`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply new theme. Please try again.",
        variant: "destructive",
      });
      setCurrentStep('generated');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStage('');
    }
  };`;

if (content.includes('const goToThemeSelection')) {
  content = content.replace(oldGoToTheme, newGoToTheme);
  console.log('✅ Added applyNewThemeToSlides function');
} else {
  console.log('⚠️  Could not find goToThemeSelection function');
}

// Now update the theme selection section to add an "Apply Theme" button
const oldThemeButtons = `          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => setCurrentStep('outline')}
              variant="outline"
              className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
            >
              ← Back to Structure
            </Button>
            <Button
              onClick={generateFullPresentation}
              disabled={isGenerating}
              className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300 px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating your presentation...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Professional Presentation
                </>
              )}
            </Button>
          </div>`;

const newThemeButtons = `          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => setCurrentStep(slides.length > 0 ? 'generated' : 'outline')}
              variant="outline"
              className="glass-effect border-yellow-400/30 hover:border-yellow-400/60"
            >
              ← Back
            </Button>
            <Button
              onClick={slides.length > 0 ? applyNewThemeToSlides : generateFullPresentation}
              disabled={isGenerating}
              className="bolt-gradient text-white font-semibold hover:scale-105 transition-all duration-300 px-8 py-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {slides.length > 0 ? 'Applying theme...' : 'Creating your presentation...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {slides.length > 0 ? 'Apply This Theme' : 'Generate Professional Presentation'}
                </>
              )}
            </Button>
          </div>`;

if (content.includes('Generate Professional Presentation')) {
  content = content.replace(oldThemeButtons, newThemeButtons);
  console.log('✅ Updated theme selection buttons');
} else {
  console.log('⚠️  Could not find theme buttons section');
}

fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✨ Theme change functionality improved!');
console.log('📝 Now when you click "Change Style" and select a new theme,');
console.log('   it will regenerate the slides with the new style applied!\n');
