const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const svgPath = 'D:\\projects\\wg-skills\\workflow-diagram-skill\\test-vibe-flat.svg';
  const pngPath = svgPath.replace('.svg', '.png');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: 'new',
    args: []
  });

  const page = await browser.newPage();
  const width = 960;
  const height = 1200;
  const scale = 2;
  await page.setViewport({ width, height, deviceScaleFactor: scale });

  const html = `<!DOCTYPE html>
<html><head><style>
  body { margin: 0; padding: 0; background: #fff; }
  img { display: block; }
</style></head><body>
  <img src="data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}" width="${width}" height="${height}" />
</body></html>`;

  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: pngPath, type: 'png', omitBackground: false });
  await browser.close();
  console.log('PNG generated: ' + pngPath);
})();
