const uploadZone = document.getElementById('asc-upload-zone');
const fileInput = document.getElementById('asc-file-input');
const output = document.getElementById('asc-output');
const canvas = document.getElementById('asc-canvas');
const ctx = canvas.getContext('2d');

const widthSlider = document.getElementById('asc-width');
const widthVal = document.getElementById('asc-width-val');
const contrastSlider = document.getElementById('asc-contrast');
const contrastVal = document.getElementById('asc-contrast-val');
const invertToggle = document.getElementById('asc-invert');

const copyBtn = document.getElementById('asc-copy-btn');
const downloadBtn = document.getElementById('asc-download-btn');
const downloadPngBtn = document.getElementById('asc-download-png-btn');

let currentImage = null;

const gradientSelect = document.getElementById('asc-gradient');

// ASCII character sets (from darkest to lightest)
const charSets = {
  normal: ' .:-=+*#%@',
  standard: ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  alphabetic: ' aBcDeFgHiJkLmNoPqRsTuVwXyZ',
  alphanumeric: ' 0123456789aBcDeFgHiJkLmNoPqRsTuVwXyZ',
  math: ' -+÷×=≠≈<≤>≥±∞',
  minimalist: ' .-',
  binary: ' 01',
  blocks: ' ░▒▓█'
};

let currentChars = charSets.normal;

// Event Listeners for UI
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) {
    handleFile(e.target.files[0]);
  }
});

// Settings interactions
[widthSlider, contrastSlider, invertToggle, gradientSelect].forEach(el => {
  el.addEventListener('input', () => {
    if (el === widthSlider) widthVal.textContent = widthSlider.value;
    if (el === contrastSlider) contrastVal.textContent = contrastSlider.value;
    if (el === gradientSelect) currentChars = charSets[gradientSelect.value];
    if (currentImage) generateASCII();
  });
});

function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Please upload an image file.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      // Hide the initial text, keep the border area clean
      uploadZone.innerHTML = `
        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#4CAF50" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <p style="color:#4CAF50;">IMAGE UPLOADED<br><span class="asc-subtext" style="color:#888;">CLICK OR DRAG TO REPLACE</span></p>
      `;
      generateASCII();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function generateASCII() {
  if (!currentImage) return;

  const width = parseInt(widthSlider.value);
  // Calculate height preserving aspect ratio, multiplied by ~0.55 to compensate for monospace font height being greater than width
  const height = Math.floor((currentImage.height / currentImage.width) * width * 0.55);
  
  canvas.width = width;
  canvas.height = height;
  
  ctx.drawImage(currentImage, 0, 0, width, height);
  
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const contrast = parseInt(contrastSlider.value);
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  
  let asciiStr = '';
  const invert = invertToggle.checked;
  const chars = invert ? currentChars.split('').reverse().join('') : currentChars;
  const charLen = chars.length;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i+1];
    let b = data[i+2];
    
    // Apply contrast
    if (contrast !== 0) {
      r = factor * (r - 128) + 128;
      g = factor * (g - 128) + 128;
      b = factor * (b - 128) + 128;
    }
    
    // Calculate relative luminance (human eye perception)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    // Clamp to 0-1
    const bClamped = Math.max(0, Math.min(1, brightness));
    
    // Map to character index evenly
    let charIndex = Math.floor(bClamped * charLen);
    if (charIndex >= charLen) charIndex = charLen - 1; // Cap at max index
    asciiStr += chars[charIndex];
    
    // Add newline at the end of each row
    if ((i / 4 + 1) % width === 0) {
      asciiStr += '\n';
    }
  }
  
  output.textContent = asciiStr;
  
  // Adjust font size smoothly based on available container width
  const container = document.querySelector('.asc-output-container');
  const availableWidth = (container.clientWidth || 800) - 40; 
  // Monospace character width is typically ~60% of its font size
  const calculatedFontSize = availableWidth / (width * 0.6);
  // Clamp font size to prevent extreme values
  const finalFontSize = Math.max(2, Math.min(16, calculatedFontSize));
  
  output.style.fontSize = `${finalFontSize}px`;
  output.style.lineHeight = `${finalFontSize}px`;
}

// Action Buttons
copyBtn.addEventListener('click', () => {
  if (!currentImage) return;
  navigator.clipboard.writeText(output.textContent).then(() => {
    const originalContent = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span style="color:#4CAF50;">COPIED!</span>
    `;
    setTimeout(() => {
      copyBtn.innerHTML = originalContent;
    }, 2000);
  });
});

downloadBtn.addEventListener('click', () => {
  if (!currentImage) return;
  const blob = new Blob([output.textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'xkatsura_ascii_art.txt';
  a.click();
  URL.revokeObjectURL(url);
});

downloadPngBtn.addEventListener('click', () => {
  if (!currentImage || !output.textContent) return;
  
  const text = output.textContent;
  const lines = text.split('\n');
  // Remove the last empty line if it exists
  if (lines[lines.length - 1] === '') lines.pop();
  
  const widthChars = lines[0].length;
  const heightChars = lines.length;
  
  // High-res fixed font size for export
  const fontSize = 12;
  const charWidth = fontSize * 0.6;
  const lineHeight = fontSize;
  
  const canvasWidth = Math.ceil(widthChars * charWidth) + 40; // 20px padding
  const canvasHeight = Math.ceil(heightChars * lineHeight) + 40;
  
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = canvasWidth;
  exportCanvas.height = canvasHeight;
  const eCtx = exportCanvas.getContext('2d');
  
  // Fill background
  eCtx.fillStyle = '#030303';
  eCtx.fillRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw text
  eCtx.fillStyle = '#ffffff';
  eCtx.font = `${fontSize}px "JetBrains Mono", Courier, monospace`;
  eCtx.textBaseline = 'top';
  
  for (let i = 0; i < lines.length; i++) {
    eCtx.fillText(lines[i], 20, 20 + i * lineHeight);
  }
  
  const url = exportCanvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = 'xkatsura_ascii_art.png';
  a.click();
});
