import fs from 'fs';
import path from 'path';
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';

// List of PDF files that need preview generation
const pdfFiles = [
  'Software_Engineering_Resume.pdf',
  'NIT_Patna_Resume_Template_v2_1.pdf',
  'Deedy_Resume_Reversed.pdf',
  'autoCV.pdf',
  'AltaCV_Template.pdf'
];

// Corresponding preview image names
const previewNames = [
  'software-engineering.png',
  'nit-patna.png',
  'deedy.png',
  'autocv.png',
  'altacv.png'
];

async function generatePreviews() {
  const publicDir = path.join(process.cwd(), 'public');
  const previewDir = path.join(publicDir, 'templates', 'previews');

  // Ensure preview directory exists
  if (!fs.existsSync(previewDir)) {
    fs.mkdirSync(previewDir, { recursive: true });
  }

  console.log('🎨 Starting preview generation...\n');

  for (let i = 0; i < pdfFiles.length; i++) {
    const pdfFile = pdfFiles[i];
    const previewName = previewNames[i];
    const pdfPath = path.join(publicDir, pdfFile);
    const previewPath = path.join(previewDir, previewName);

    // Skip if preview already exists
    if (fs.existsSync(previewPath)) {
      console.log(`✅ Preview already exists: ${previewName}`);
      continue;
    }

    // Check if PDF exists
    if (!fs.existsSync(pdfPath)) {
      console.log(`❌ PDF not found: ${pdfFile}`);
      continue;
    }

    try {
      console.log(`📄 Processing: ${pdfFile}...`);
      
      // Convert PDF to image
      const document = await pdf(pdfPath, { scale: 2 });
      const firstPage = await document.getPage(1);
      
      if (!firstPage) {
        console.log(`❌ Failed to extract first page from: ${pdfFile}`);
        continue;
      }

      // Optimize image with sharp
      const optimizedImage = await sharp(firstPage)
        .resize(800, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .png({ quality: 90 })
        .toBuffer();

      // Save preview
      fs.writeFileSync(previewPath, optimizedImage);
      console.log(`✅ Generated: ${previewName}\n`);
    } catch (error) {
      console.error(`❌ Error processing ${pdfFile}:`, error);
    }
  }

  console.log('🎉 Preview generation complete!');
}

generatePreviews().catch(console.error);
