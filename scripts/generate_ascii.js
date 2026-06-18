const { Jimp } = require('jimp');
const fs = require('fs');

async function generateAscii() {
  const image = await Jimp.read('c:/Users/0xjin/xkatsura/assets/images/crayon.png');
  const origW = image.bitmap.width;
  const origH = image.bitmap.height;
  
  const textContent = fs.readFileSync('c:/Users/0xjin/xkatsura/scripts/ascii-crayon.txt', 'utf8');
  const lines = textContent.split(/\r?\n/).filter(line => line.length > 0);
  const height = lines.length;
  
  const fontSize = origH / height;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${origW}" height="${origH}" viewBox="0 0 ${origW} ${origH}" preserveAspectRatio="none">
    <rect width="100%" height="100%" fill="#ffffff" />
    <text x="0" y="0" font-family="'JetBrains Mono', Courier, monospace" font-size="${fontSize}px" font-weight="bold" fill="#000000" style="white-space: pre;">`;

  lines.forEach((line, i) => {
    let safeLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    svg += `\n      <tspan x="0" y="${(i + 0.8) * fontSize}" textLength="${origW}" lengthAdjust="spacingAndGlyphs">${safeLine}</tspan>`;
  });

  svg += `\n    </text>\n</svg>`;

  fs.writeFileSync('c:/Users/0xjin/xkatsura/assets/images/crayon-ascii.svg', svg);
  console.log('SVG generated successfully at crayon-ascii.svg using ascii-crayon.txt');
}

generateAscii().catch(console.error);
