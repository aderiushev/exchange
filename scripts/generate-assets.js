const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

const COLORS = {
  bg1: '#111827',
  bg2: '#1f2937',
  accent: '#60a5fa',
  text: '#e5e7eb',
  subtext: '#9ca3af',
};

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

function iconSvg({ w, h, padding = 0, includeSymbols = true }) {
  const innerW = w - padding * 2;
  const innerH = h - padding * 2;
  const cx = w / 2;
  const cy = h / 2;

  const leftX = padding + innerW * 0.28;
  const rightX = padding + innerW * 0.72;
  const symY = cy + innerH * 0.07;

  const strokeW = Math.max(6, Math.round(w * 0.02));

  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${COLORS.bg1}"/>
        <stop offset="100%" stop-color="${COLORS.bg2}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>

    <g stroke="${COLORS.accent}" stroke-width="${strokeW}" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <!-- top arrow -->
      <path d="M ${padding + innerW * 0.22} ${cy - innerH * 0.12} H ${padding + innerW * 0.78}" />
      <path d="M ${padding + innerW * 0.72} ${cy - innerH * 0.18} l ${innerW * 0.08} ${innerH * 0.06} -${innerW * 0.08} ${innerH * 0.06}" />
      <!-- bottom arrow -->
      <path d="M ${padding + innerW * 0.78} ${cy + innerH * 0.12} H ${padding + innerW * 0.22}" />
      <path d="M ${padding + innerW * 0.28} ${cy + innerH * 0.18} l -${innerW * 0.08} -${innerH * 0.06} ${innerW * 0.08} -${innerH * 0.06}" />
    </g>

    ${includeSymbols ? `
    <text x="${leftX}" y="${symY}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
      font-size="${Math.round(innerW * 0.22)}" font-weight="800" text-anchor="middle" fill="${COLORS.text}">₽</text>
    <text x="${rightX}" y="${symY}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
      font-size="${Math.round(innerW * 0.22)}" font-weight="800" text-anchor="middle" fill="${COLORS.text}">€</text>
    ` : ''}
  </svg>`;
}

function splashSvg({ w, h }) {
  const cx = w / 2;
  const cy = h * 0.40; // place a bit above center
  const logoSize = Math.min(w, h) * 0.36;
  const inner = logoSize * 0.8;
  const strokeW = Math.max(6, Math.round(logoSize * 0.02));

  const leftX = cx - inner * 0.44;
  const rightX = cx + inner * 0.44;
  const symY = cy + inner * 0.14;

  const titleY = cy + logoSize * 0.70;
  const tagY = titleY + Math.max(48, h * 0.025);

  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${COLORS.bg1}"/>
        <stop offset="100%" stop-color="${COLORS.bg2}"/>
      </linearGradient>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="40" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#bg)"/>

    <!-- Logo group -->
    <g filter="url(#glow)">
      <g stroke="${COLORS.accent}" stroke-width="${strokeW}" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <!-- top arrow -->
        <path d="M ${cx - inner * 0.50} ${cy - inner * 0.22} H ${cx + inner * 0.50}" />
        <path d="M ${cx + inner * 0.42} ${cy - inner * 0.30} l ${inner * 0.12} ${inner * 0.08} -${inner * 0.12} ${inner * 0.08}" />
        <!-- bottom arrow -->
        <path d="M ${cx + inner * 0.50} ${cy + inner * 0.22} H ${cx - inner * 0.50}" />
        <path d="M ${cx - inner * 0.42} ${cy + inner * 0.30} l -${inner * 0.12} -${inner * 0.08} ${inner * 0.12} -${inner * 0.08}" />
      </g>
      <text x="${leftX}" y="${symY}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
        font-size="${Math.round(inner * 0.40)}" font-weight="800" text-anchor="middle" fill="${COLORS.text}">₽</text>
      <text x="${rightX}" y="${symY}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
        font-size="${Math.round(inner * 0.40)}" font-weight="800" text-anchor="middle" fill="${COLORS.text}">€</text>
    </g>

    <text x="${cx}" y="${titleY}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
      font-size="${Math.round(h * 0.045)}" font-weight="800" text-anchor="middle" fill="${COLORS.text}">Exchange Tracker</text>
    <text x="${cx}" y="${tagY}" font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif"
      font-size="${Math.round(h * 0.022)}" font-weight="600" text-anchor="middle" fill="${COLORS.subtext}">RUB ↔ EUR Rates</text>
  </svg>`;
}

async function svgToPng(svgString, outPath) {
  const svgBuffer = Buffer.from(svgString);
  await sharp(svgBuffer)
    .png()
    .toFile(outPath);
}

async function main() {
  await ensureDir(ASSETS_DIR);

  // icon.png
  const icon = iconSvg({ w: 1024, h: 1024, padding: 0, includeSymbols: true });
  await svgToPng(icon, path.join(ASSETS_DIR, 'icon.png'));

  // adaptive-icon.png with 20% padding (safe zone)
  const adaptive = iconSvg({ w: 1024, h: 1024, padding: 1024 * 0.2, includeSymbols: true });
  await svgToPng(adaptive, path.join(ASSETS_DIR, 'adaptive-icon.png'));

  // favicon.png (simplified, arrows only)
  const favicon = iconSvg({ w: 48, h: 48, padding: 6, includeSymbols: false });
  await svgToPng(favicon, path.join(ASSETS_DIR, 'favicon.png'));

  // splash-icon.png
  const splash = splashSvg({ w: 1284, h: 2778 });
  await svgToPng(splash, path.join(ASSETS_DIR, 'splash-icon.png'));

  console.log('✓ Assets generated in /assets');
}

main().catch((err) => {
  console.error('✗ Asset generation failed:', err);
  process.exit(1);
});

