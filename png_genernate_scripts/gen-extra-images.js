const sharp = require('sharp');
const fs = require('fs');

const OUT_DIR = 'src/static/images';
fs.mkdirSync(OUT_DIR, { recursive: true });

// 1. 默认头像 (160x160)
const avatarSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8F0EE"/>
      <stop offset="100%" stop-color="#D4E5E0"/>
    </linearGradient>
  </defs>
  <circle cx="80" cy="80" r="80" fill="url(#bg)"/>
  <circle cx="80" cy="62" r="26" fill="#7BA59D" opacity="0.5"/>
  <ellipse cx="80" cy="138" rx="40" ry="34" fill="#7BA59D" opacity="0.35"/>
</svg>`;

// 2. 空状态插图 (300x240)
const emptySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240">
  <rect width="300" height="240" fill="none"/>
  <rect x="110" y="50" width="80" height="100" rx="8" fill="#E8F0EE" stroke="#C5D0CB" stroke-width="2"/>
  <line x1="125" y1="80" x2="175" y2="80" stroke="#C5D0CB" stroke-width="3" stroke-linecap="round"/>
  <line x1="125" y1="100" x2="175" y2="100" stroke="#C5D0CB" stroke-width="3" stroke-linecap="round"/>
  <line x1="125" y1="120" x2="155" y2="120" stroke="#C5D0CB" stroke-width="3" stroke-linecap="round"/>
  <circle cx="200" cy="140" r="28" fill="none" stroke="#7BA59D" stroke-width="3" opacity="0.5"/>
  <line x1="220" y1="160" x2="240" y2="180" stroke="#7BA59D" stroke-width="3" stroke-linecap="round" opacity="0.5"/>
  <circle cx="80" cy="100" r="4" fill="#D4A5A5" opacity="0.4"/>
  <circle cx="230" cy="80" r="3" fill="#A5C4D4" opacity="0.4"/>
  <circle cx="70" cy="160" r="5" fill="#D4B896" opacity="0.3"/>
</svg>`;

Promise.all([
  sharp(Buffer.from(avatarSvg)).resize(160, 160).png().toFile(OUT_DIR + '/avatar-default.png'),
  sharp(Buffer.from(emptySvg)).resize(300, 240).png().toFile(OUT_DIR + '/empty-state.png'),
]).then(() => {
  console.log('[OK] avatar-default.png (160x160)');
  console.log('[OK] empty-state.png (300x240)');
}).catch(e => console.error(e));
