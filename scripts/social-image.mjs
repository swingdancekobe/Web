import sharp from 'sharp';
import fs from 'node:fs';

const width = 1200;
const height = 630;
const bannerHeight = 400;
const bannerTop = (height - bannerHeight) / 2;
const xml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);

export async function generateSocialImage({ source, output, brand, harbour, harbourNote }) {
  const background = await sharp(source)
    .resize(width, height, { fit: 'cover' })
    .blur(24)
    .modulate({ brightness: 0.52 })
    .png()
    .toBuffer();

  const banner = await sharp(source)
    .resize(width, bannerHeight, { fit: 'contain', background: { r: 25, g: 61, b: 71, alpha: 1 } })
    .png()
    .toBuffer();

  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="shade" x1="0" x2="1"><stop stop-color="#0a151b" stop-opacity=".52"/><stop offset=".5" stop-color="#0a151b" stop-opacity=".70"/><stop offset="1" stop-color="#0a151b" stop-opacity=".52"/></linearGradient>
      <filter id="shadow" x="-10%" y="-20%" width="120%" height="150%"><feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dy="3"/><feComponentTransfer><feFuncA type="linear" slope=".8"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect x="0" y="${bannerTop}" width="${width}" height="${bannerHeight}" fill="url(#shade)"/>
    <rect x="22" y="22" width="1156" height="586" rx="8" fill="none" stroke="#efbd7e" stroke-width="2"/>
    <rect x="29" y="29" width="1142" height="572" rx="5" fill="none" stroke="#f4eddc" stroke-opacity=".7"/>
    <g fill="#fff3d7" text-anchor="middle" font-family="Arial, 'Noto Sans JP', sans-serif">
      <text x="600" y="158" font-size="21" font-weight="700" letter-spacing="2">${xml(harbour.en.toUpperCase())}</text>
      <text x="600" y="183" font-size="17" font-weight="700">${xml(harbour.ja)}</text>
      <text x="600" y="298" textLength="700" lengthAdjust="spacingAndGlyphs" font-family="Impact, 'Arial Narrow', sans-serif" font-size="83" font-weight="900" letter-spacing="1" filter="url(#shadow)">${xml(brand.toUpperCase())}</text>
      <text x="600" y="354" font-size="17" font-weight="700" letter-spacing=".45">${xml(harbourNote.en.toUpperCase())}</text>
      <text x="600" y="382" font-size="18" font-weight="700">${xml(harbourNote.ja)}</text>
    </g>
  </svg>`);

  await sharp(background)
    .composite([
      { input: banner, top: bannerTop, left: 0 },
      { input: svg, top: 0, left: 0 },
    ])
    .jpeg({ quality: 94, progressive: true, mozjpeg: true })
    .toFile(output);
}
