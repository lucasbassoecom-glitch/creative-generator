const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function htmlToImage(html, options = {}) {
  const {
    width = 1080,
    height = 1080,
    format = 'png',
    quality = 90,
    scale = 2,
  } = options;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: scale });
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    const screenshot = await page.screenshot({
      type: format === 'jpg' ? 'jpeg' : 'png',
      quality: format === 'jpg' ? quality : undefined,
      clip: { x: 0, y: 0, width, height },
      omitBackground: format === 'png',
    });

    return screenshot;
  } finally {
    await browser.close();
  }
}

async function saveImage(buffer, filename, dir = '/tmp') {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, filename);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = { htmlToImage, saveImage };
