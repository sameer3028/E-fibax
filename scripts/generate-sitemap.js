import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const BASE_URL = 'https://www.fibaxpharma.com';

function xmlEscape(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(d) {
  if (!d) return new Date().toISOString().split('T')[0];
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return new Date().toISOString().split('T')[0];
  return dateObj.toISOString().split('T')[0];
}

function resolveImageUrl(img) {
  if (!img) return null;
  const trimmed = String(img).trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith('/') ? trimmed : '/' + trimmed;
  return `${BASE_URL}${cleanPath}`;
}

export async function generateSitemap() {
  const urls = [];
  const today = new Date().toISOString().split('T')[0];

  // 1. Core Pages
  const corePages = [
    { loc: `${BASE_URL}/`, priority: '1.0', changefreq: 'daily', lastmod: today },
    { loc: `${BASE_URL}/products`, priority: '0.9', changefreq: 'daily', lastmod: today },
    { loc: `${BASE_URL}/blogs`, priority: '0.8', changefreq: 'daily', lastmod: today },
    { loc: `${BASE_URL}/about`, priority: '0.7', changefreq: 'weekly', lastmod: today },
    { loc: `${BASE_URL}/contact`, priority: '0.7', changefreq: 'monthly', lastmod: today },
    { loc: `${BASE_URL}/terms`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${BASE_URL}/privacy`, priority: '0.5', changefreq: 'monthly', lastmod: today },
    { loc: `${BASE_URL}/track`, priority: '0.6', changefreq: 'monthly', lastmod: today }
  ];

  urls.push(...corePages);

  // 2. Products
  const productsJsonPath = path.join(rootDir, 'server', 'data', 'products.json');
  let products = [];
  if (fs.existsSync(productsJsonPath)) {
    try {
      products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
    } catch (err) {
      console.warn('⚠️ Could not parse server/data/products.json, loading fallback:', err.message);
    }
  }

  if (products.length === 0) {
    try {
      const prodModule = await import('../client/src/data/products.js');
      products = prodModule.PRODUCTS || [];
    } catch (err) {
      console.warn('⚠️ Could not load client/src/data/products.js:', err.message);
    }
  }

  for (const prod of products) {
    if (!prod) continue;
    const slug = prod.slug || String(prod.id);
    const loc = `${BASE_URL}/product/${encodeURIComponent(slug)}`;
    const lastmod = formatDate(prod.updatedAt || prod.createdAt);
    
    // Collect images
    const images = [];
    const mainImg = resolveImageUrl(prod.featuredImage || prod.image);
    if (mainImg) {
      images.push({ loc: mainImg, title: prod.title });
    }
    if (Array.isArray(prod.images)) {
      for (const extraImg of prod.images) {
        const resolved = resolveImageUrl(extraImg);
        if (resolved && !images.some(img => img.loc === resolved)) {
          images.push({ loc: resolved, title: prod.title });
        }
      }
    }

    urls.push({
      loc,
      lastmod,
      changefreq: 'weekly',
      priority: '0.8',
      images
    });
  }

  // 3. Blog Articles
  let blogPosts = [];
  try {
    const blogsModule = await import('../client/src/data/blogs.js');
    blogPosts = blogsModule.BLOG_POSTS || [];
  } catch (err) {
    console.warn('⚠️ Could not load client/src/data/blogs.js:', err.message);
  }

  for (const blog of blogPosts) {
    if (!blog) continue;
    const slug = blog.slug || String(blog.id);
    const loc = `${BASE_URL}/blog/${encodeURIComponent(slug)}`;
    const lastmod = formatDate(blog.date);

    const images = [];
    const blogImg = resolveImageUrl(blog.image);
    if (blogImg) {
      images.push({ loc: blogImg, title: blog.title });
    }

    urls.push({
      loc,
      lastmod,
      changefreq: 'weekly',
      priority: '0.7',
      images
    });
  }

  // 4. Construct XML Document
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  for (const item of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${xmlEscape(item.loc)}</loc>\n`;
    if (item.lastmod) {
      xml += `    <lastmod>${item.lastmod}</lastmod>\n`;
    }
    if (item.changefreq) {
      xml += `    <changefreq>${item.changefreq}</changefreq>\n`;
    }
    if (item.priority) {
      xml += `    <priority>${item.priority}</priority>\n`;
    }
    if (item.images && item.images.length > 0) {
      for (const img of item.images) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${xmlEscape(img.loc)}</image:loc>\n`;
        if (img.title) {
          xml += `      <image:title>${xmlEscape(img.title)}</image:title>\n`;
        }
        xml += `    </image:image>\n`;
      }
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  // 5. Write to targets
  const clientPublicDir = path.join(rootDir, 'client', 'public');
  if (!fs.existsSync(clientPublicDir)) {
    fs.mkdirSync(clientPublicDir, { recursive: true });
  }

  const sitemapPublicPath = path.join(clientPublicDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPublicPath, xml, 'utf8');
  console.log(`✅ Generated ${sitemapPublicPath} (${urls.length} URLs)`);

  const clientDistDir = path.join(rootDir, 'client', 'dist');
  if (fs.existsSync(clientDistDir)) {
    const sitemapDistPath = path.join(clientDistDir, 'sitemap.xml');
    fs.writeFileSync(sitemapDistPath, xml, 'utf8');
    console.log(`✅ Generated ${sitemapDistPath}`);
  }

  // 6. Generate robots.txt if not exists
  const robotsPublicPath = path.join(clientPublicDir, 'robots.txt');
  const robotsTxtContent = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`;
  fs.writeFileSync(robotsPublicPath, robotsTxtContent, 'utf8');
  console.log(`✅ Generated ${robotsPublicPath}`);

  if (fs.existsSync(clientDistDir)) {
    const robotsDistPath = path.join(clientDistDir, 'robots.txt');
    fs.writeFileSync(robotsDistPath, robotsTxtContent, 'utf8');
    console.log(`✅ Generated ${robotsDistPath}`);
  }

  return { totalUrls: urls.length, xml };
}

// Run directly if called as a script
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  generateSitemap().catch(err => {
    console.error('❌ Sitemap generation error:', err);
    process.exit(1);
  });
}
