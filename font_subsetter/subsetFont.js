import fs from 'fs';
import path from 'path';
import subsetFont from 'subset-font';
import { fileURLToPath } from 'url';

// Define __dirname and __filename using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fontsDir = path.join(__dirname, 'fonts');
const outputDir = path.join(__dirname, 'subsetted_fonts');

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to subset a font
async function subsetFontFile(filePath) {
  try {
    const fontBuffer = fs.readFileSync(filePath);
    // Extract characters from filename for subsetting
    const filename = path.basename(filePath, '.ttf');
    const subsetCharacters = filename.replace(/[^A-Za-z]/g, ''); // Remove non-alphabet characters
    const subsetBuffer = await subsetFont(fontBuffer, subsetCharacters, { targetFormat: 'truetype' });
    const relativePath = path.relative(fontsDir, filePath);
    const outputFilePath = path.join(outputDir, path.dirname(relativePath), filename + '-Preview.ttf');
    const outputDirectory = path.dirname(outputFilePath);
    // Ensure the output directory exists
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true });
    }
    fs.writeFileSync(outputFilePath, subsetBuffer);
    console.log(`Subsetted font saved as ${outputFilePath}`);
  } catch (error) {
    console.error(`Failed to subset font ${path.basename(filePath)}:`, error);
  }
}

// Function to recursively read directories and process .ttf files
function processDirectory(directory) {
  fs.readdir(directory, { withFileTypes: true }, (err, entries) => {
    if (err) {
      return console.error('Failed to list directory:', err);
    }
    entries.forEach(entry => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        processDirectory(entryPath);
      } else if (entry.isFile() && path.extname(entry.name) === '.ttf') {
        subsetFontFile(entryPath);
      }
    });
  });
}

// Start processing from the root fonts directory
processDirectory(fontsDir);