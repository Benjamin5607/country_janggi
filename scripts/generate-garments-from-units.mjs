/**
 * Auto-build garment textures from unit reference PNGs (no manual work).
 * Run: npm run generate:garments
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UNITS = path.join(__dirname, '..', 'public', 'textures', 'units');
const OUT = path.join(__dirname, '..', 'public', 'textures', 'garments');
const REGIONS = ['europe', 'china', 'india', 'korea', 'japan', 'arab'];
const TEAMS = ['w', 'b'];

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  for (const region of REGIONS) {
    for (const team of TEAMS) {
      const src = path.join(UNITS, `unit_${region}_${team}.png`);
      const dest = path.join(OUT, `garment_${region}_${team}.png`);
      await sharp(src)
        .resize(512, 512, { fit: 'cover', position: 'centre' })
        .png({ compressionLevel: 8 })
        .toFile(dest);
      console.log(`  garment_${region}_${team}.png`);
    }
  }
  console.log('Done — garments auto-generated from unit PNGs.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
