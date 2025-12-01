import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to .env file
const envPath = path.join(__dirname, '../.env');
const backgroundPath = path.join(__dirname, '../extension/background.js');

try {
    // Read .env file
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found!');
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Extract Gemini API Key
    const match = envContent.match(/GEMINI_API_KEY=(.*)/) || envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    
    if (!match || !match[1]) {
        console.error('❌ Gemini API Key not found in .env');
        process.exit(1);
    }

    const apiKey = match[1].trim();
    console.log('✅ Found API Key:', apiKey.substring(0, 5) + '...');

    // Read background.js
    let backgroundContent = fs.readFileSync(backgroundPath, 'utf8');

    // Inject key into initialization
    const replacement = `'gemini_api_key': '${apiKey}',`;
    
    const insertPoint = "chrome.storage.local.set({";
    if (backgroundContent.includes(insertPoint)) {
        // Check if we already injected it
        if (backgroundContent.includes("'gemini_api_key':")) {
             backgroundContent = backgroundContent.replace(/'gemini_api_key': '.*?'/, replacement);
        } else {
             backgroundContent = backgroundContent.replace(insertPoint, `chrome.storage.local.set({\n            'gemini_api_key': '${apiKey}',`);
        }
    }

    fs.writeFileSync(backgroundPath, backgroundContent);
    console.log('✅ Successfully injected API key into background.js');

} catch (error) {
    console.error('❌ Error:', error);
}
