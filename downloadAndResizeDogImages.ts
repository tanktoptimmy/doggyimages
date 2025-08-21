import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import sharp from 'sharp';

// Path to your JSON file
const jsonFilePath = path.resolve('./dogs.json');

// Read and parse the JSON file
const dogs: {
  title: string;
  breed: string;
  type: string;
  author: string;
  authorUrl: string | null;
  license: string;
  uploadDate: string;
  source: string;
  originalUrl: string;
}[] = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

// CLI args
const [cliWidth, cliHeight, cliFormat, cliMode] = process.argv.slice(2);

// Width & height
const DEFAULT_WIDTH = parseInt(cliWidth || process.env.IMG_WIDTH || '800', 10);
const DEFAULT_HEIGHT = parseInt(cliHeight || process.env.IMG_HEIGHT || '600', 10);

// Format: webp or jpeg
const outputFormat = (cliFormat || process.env.IMG_FORMAT || 'webp').toLowerCase() === 'jpg' ? 'jpeg' : 'webp';

// Resize mode: 'cover' or 'contain'
const validModes = ['cover', 'contain'] as const;
type ResizeMode = (typeof validModes)[number];
const resizeMode: ResizeMode =
  (cliMode || process.env.IMG_MODE || 'cover').toLowerCase() === 'contain' ? 'contain' : 'cover';

async function downloadDogImages(dogsArray: typeof dogs) {
  for (const dog of dogsArray) {
    try {
      const { data: html } = await axios.get(dog.originalUrl);
      const dom = new JSDOM(html);
      const document = dom.window.document;

      const imgElement = document.querySelector<HTMLImageElement>('div.fullImageLink a img');
      if (!imgElement) {
        console.log(`No image found for ${dog.breed}`);
        continue;
      }

      const imgUrl = imgElement.src;
      const ext = outputFormat === 'jpeg' ? '.jpg' : '.webp';
      const fileName = dog.breed.toLowerCase().replace(/\s+/g, '_') + ext;
      const filePath = path.resolve('./images', fileName);

      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      const response = await axios.get(imgUrl, { responseType: 'arraybuffer' });
      const originalBuffer = Buffer.from(response.data);

      const originalMeta = await sharp(originalBuffer).metadata();
      const originalWidth = originalMeta.width || 0;
      const originalHeight = originalMeta.height || 0;

      const processedBuffer = await sharp(originalBuffer)
        .resize({
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          fit: resizeMode,
          position: 'center',
          background: resizeMode === 'contain' ? { r: 255, g: 255, b: 255, alpha: 1 } : undefined,
        })
        .toFormat(outputFormat, { quality: 80 })
        .toBuffer();

      const processedMeta = await sharp(processedBuffer).metadata();
      const processedWidth = processedMeta.width || 0;
      const processedHeight = processedMeta.height || 0;

      fs.writeFileSync(filePath, processedBuffer);

      console.log(
        `Downloaded ${dog.breed} to ${filePath} | Original: ${originalWidth}x${originalHeight} | Processed: ${processedWidth}x${processedHeight} | Format: ${outputFormat} | Mode: ${resizeMode}`
      );
    } catch (err) {
      console.error(`Error downloading ${dog.breed}:`, err);
    }
  }
}

downloadDogImages(dogs);
