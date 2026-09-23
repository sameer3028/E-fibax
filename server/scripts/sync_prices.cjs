const fs = require('fs');
const https = require('https');
const path = require('path');

const options = {
  hostname: 'fibaxpharma.com',
  port: 443,
  path: '/wp-json/wc/store/v1/products?per_page=100',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const jsonStart = data.indexOf('[');
    const jsonEnd = data.lastIndexOf(']');
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('Could not find JSON in live API response');
      return;
    }

    const liveProducts = JSON.parse(data.slice(jsonStart, jsonEnd + 1));
    console.log('Fetched ' + liveProducts.length + ' live products from fibaxpharma.com');

    const liveMap = new Map();
    liveProducts.forEach(p => {
      const pr = p.prices || {};
      const minor = pr.currency_minor_unit || 2;
      const div = Math.pow(10, minor);
      const regular = pr.regular_price ? parseInt(pr.regular_price, 10) / div : null;
      const sale = pr.sale_price ? parseInt(pr.sale_price, 10) / div : null;
      const current = pr.price ? parseInt(pr.price, 10) / div : null;

      const effectiveSale = sale || current || regular;
      const effectiveMrp = regular || (effectiveSale ? Math.round(effectiveSale * 1.1) : null);

      const record = {
        mrp: effectiveMrp,
        salePrice: effectiveSale,
        name: p.name,
        slug: p.slug
      };

      liveMap.set(String(p.id), record);
      if (p.slug) {
        liveMap.set(p.slug, record);
      }
    });

    const serverFile = path.join(__dirname, 'data', 'products.json');
    const serverProducts = JSON.parse(fs.readFileSync(serverFile, 'utf8'));

    let updatedCount = 0;
    serverProducts.forEach(prod => {
      const live = liveMap.get(String(prod.id)) || liveMap.get(prod.slug);
      if (live && live.salePrice) {
        const oldSale = prod.salePrice;
        const oldMrp = prod.mrp;
        prod.salePrice = live.salePrice;
        prod.mrp = live.mrp;
        prod.discountPercent = Math.max(0, Math.round(((prod.mrp - prod.salePrice) / prod.mrp) * 100));
        prod.multiPacks = [
          {
            name: '1 Unit (Standard)',
            quantity: 1,
            price: prod.salePrice,
            savings: 0
          },
          {
            name: '2 Units (Value Pack)',
            quantity: 2,
            price: Math.round(prod.salePrice * 2 * 0.9),
            savings: '10% OFF'
          },
          {
            name: '3-Month Course (Max Results)',
            quantity: 3,
            price: Math.round(prod.salePrice * 3 * 0.85),
            savings: '15% OFF'
          }
        ];
        prod.updatedAt = new Date().toISOString();
        updatedCount++;
        console.log('Updated: ' + prod.title + ' | MRP: ₹' + oldMrp + ' -> ₹' + prod.mrp + ' | Sale: ₹' + oldSale + ' -> ₹' + prod.salePrice + ' (' + prod.discountPercent + '% OFF)');
      }
    });

    fs.writeFileSync(serverFile, JSON.stringify(serverProducts, null, 2), 'utf8');

    const clientFile = path.join(__dirname, '..', 'client', 'src', 'data', 'products.js');
    fs.writeFileSync(clientFile, 'export const PRODUCTS = ' + JSON.stringify(serverProducts, null, 2) + ';\n', 'utf8');

    console.log('\n✅ Successfully synced and corrected prices for ' + updatedCount + ' products from live fibaxpharma.com!');
  });
});

req.on('error', (err) => {
  console.error('Error contacting fibaxpharma.com:', err.message);
});

req.end();
