import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const optimize = async (assets, sourceName, outputName, options = {}) => {
  const source = path.join(assets, sourceName);
  const output = path.join(assets, outputName);
  await sharp(source)
    .rotate()
    .resize({ width: options.width, withoutEnlargement: true })
    .webp({ quality: options.quality ?? 82, effort: 6 })
    .toFile(output);
};

export async function optimizeImages(assets) {
  await fs.mkdir(assets, { recursive: true });
  await Promise.all([
    optimize(assets, 'kobe-harbour.png', 'kobe-harbour.webp', { width: 1800, quality: 84 }),
    optimize(assets, 'swing-dance.png', 'swing-dance.webp', { width: 1600, quality: 82 }),
    optimize(assets, 'sunflower-community.jpg', 'sunflower-community-960.webp', { width: 960, quality: 82 }),
    optimize(assets, 'sunflower-community.jpg', 'sunflower-community-1920.webp', { width: 1920, quality: 82 }),
    optimize(assets, 'savoy-ballroom.png', 'savoy-ballroom.webp', { width: 1200, quality: 82 }),
    optimize(assets, 'frankie-manning.png', 'frankie-manning.webp', { width: 564, quality: 82 }),
  ]);
}
