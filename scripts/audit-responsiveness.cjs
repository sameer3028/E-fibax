const puppeteer = require('puppeteer-core');

const VIEWPORTS = [
  { width: 320, height: 640, name: '320px (iPhone SE narrow)' },
  { width: 360, height: 800, name: '360px (Standard Android)' },
  { width: 375, height: 812, name: '375px (iPhone X/11/12 mini)' },
  { width: 390, height: 844, name: '390px (iPhone 12/13/14)' },
  { width: 414, height: 896, name: '414px (iPhone Plus/XR)' },
  { width: 768, height: 1024, name: '768px (iPad Mini / Tablet)' },
  { width: 1024, height: 768, name: '1024px (iPad Pro / Small Laptop)' },
  { width: 1280, height: 800, name: '1280px (Standard Laptop)' },
  { width: 1440, height: 900, name: '1440px (Desktop)' },
  { width: 1920, height: 1080, name: '1920px (FHD Large Desktop)' }
];

const PAGES = [
  { path: '/', name: 'Home Page' },
  { path: '/products', name: 'Products Catalog' },
  { path: '/product/joint-conbo-pack', name: 'Product Detail Page' },
  { path: '/about', name: 'About Page' },
  { path: '/contact', name: 'Contact Page' },
  { path: '/blogs', name: 'Blogs Page' },
  { path: '/checkout', name: 'Checkout Page' },
  { path: '/admin', name: 'Admin Portal' }
];

async function runAudit() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();

  console.log('=== RESPONSIVENESS AUDIT START ===\n');

  for (const pageInfo of PAGES) {
    console.log(`\n--- Auditing: ${pageInfo.name} (${pageInfo.path}) ---`);
    await page.goto(`http://localhost:3030${pageInfo.path}`, { waitUntil: 'networkidle0', timeout: 15000 }).catch(() => {});

    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 200));

      const overflowData = await page.evaluate(() => {
        const doc = document.documentElement;
        const scrollWidth = doc.scrollWidth;
        const clientWidth = doc.clientWidth;
        const diff = scrollWidth - clientWidth;

        // Find elements that exceed clientWidth
        const overflowingElements = [];
        const all = document.querySelectorAll('*');
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > clientWidth + 1) {
            overflowingElements.push({
              tag: el.tagName.toLowerCase(),
              className: (el.className || '').toString().slice(0, 100),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
            if (overflowingElements.length >= 5) break;
          }
        }

        return { scrollWidth, clientWidth, diff, overflowingElements };
      });

      if (overflowData.diff > 1) {
        console.log(`❌ OVERFLOW on ${vp.name}: scrollWidth=${overflowData.scrollWidth} > clientWidth=${overflowData.clientWidth} (diff: +${overflowData.diff}px)`);
        if (overflowData.overflowingElements.length > 0) {
          console.log('   Offending elements sample:');
          overflowData.overflowingElements.forEach(o => {
            console.log(`     <${o.tag} class="${o.className}"> right=${o.right}px, width=${o.width}px`);
          });
        }
      } else {
        console.log(`✅ OK on ${vp.name} (${vp.width}px): ${overflowData.scrollWidth}px`);
      }
    }
  }

  await browser.close();
  console.log('\n=== RESPONSIVENESS AUDIT COMPLETE ===');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
