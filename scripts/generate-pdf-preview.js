import { pdf } from 'pdf-to-img';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePreview(pdfFileName, outputFileName, maxPages = 1) {
  try {
    const pdfPath = path.join(__dirname, '..', 'public', pdfFileName);
    const outputDir = path.join(__dirname, '..', 'public', 'templates', 'previews');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Converting ${pdfFileName} to image(s)...`);
    
    // Convert PDF to images
    const document = await pdf(pdfPath, { scale: 2 });
    
    // Generate previews for multiple pages
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      const page = await document.getPage(pageNum);
      
      if (!page) {
        console.log(`⚠️ Page ${pageNum} not found, stopping...`);
        break;
      }

      console.log(`Optimizing page ${pageNum}...`);
      
      // Optimize image with sharp
      const optimizedImage = await sharp(page)
        .resize(1200, null, { // Larger size for presentations
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 90 })
        .toBuffer();

      // Save preview
      const fileName = maxPages > 1 
        ? outputFileName.replace('.png', `-slide-${pageNum}.png`)
        : outputFileName;
      const outputPath = path.join(outputDir, fileName);
      fs.writeFileSync(outputPath, optimizedImage);

      console.log(`✅ Page ${pageNum} saved to: ${outputPath}`);
    }

    console.log('✅ All previews generated successfully!');
  } catch (error) {
    console.error('❌ Error generating preview:', error);
  }
}

// Generate all previews
async function generateAll() {
  console.log('🎨 Generating template previews...\n');
  
  // Resume templates (1 page each)
  await generatePreview(
    'Black and White Clean Professional A4 Resume.pdf',
    'black-white-professional.png',
    1
  );
  
  console.log('\n');
  
  await generatePreview(
    'Blue and White Modern Professional Resume.pdf',
    'blue-white-modern-professional.png',
    1
  );
  
  console.log('\n');
  
  await generatePreview(
    'Blue and Black Geometric Creative Resume.pdf',
    'blue-black-geometric-creative.png',
    1
  );
  
  console.log('\n');
  
  await generatePreview(
    'IT Manager CV Resume.pdf',
    'it-manager-cv.png',
    1
  );
  
  console.log('\n');
  
  // Presentation template 1 (all 10 slides)
  await generatePreview(
    'Blue and Green Modern Artificial Intelligence Presentation.pdf',
    'blue-green-ai-presentation.png',
    10
  );
  
  console.log('\n');
  
  // Presentation template 2 (all 15 slides)
  await generatePreview(
    'Black Elegant and Modern Startup Pitch Deck Presentation.pdf',
    'black-elegant-startup-pitch.png',
    15
  );
  
  console.log('\n');
  
  // Presentation template 3
  await generatePreview(
    'Black and Grey 3D Shapes Tech Company Presentation.pdf',
    'black-grey-3d-tech.png',
    10
  );
  
  console.log('\n');
  
  // Presentation template 4
  await generatePreview(
    'Blue and White Modern Artificial Intelligence Presentation.pdf',
    'blue-white-modern-ai.png',
    10
  );
  
  console.log('\n');
  
  // Presentation template 5
  await generatePreview(
    'Beige and Black Minimalist Project Deck Presentation.pdf',
    'beige-black-minimalist-project.png',
    10
  );
  
  console.log('\n');
  
  // Presentation template 6
  await generatePreview(
    'White Blue Simple Modern Enhancing Sales Strategy Presentation.pdf',
    'white-blue-sales-strategy.png',
    10
  );
  
  console.log('\n🎉 All previews generated!');
}

generateAll();
