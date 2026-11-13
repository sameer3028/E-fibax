const fs = require('fs');
const path = require('path');

function extractHtml(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const mainStart = content.indexOf('<main');
  const openTagEnd = content.indexOf('>', mainStart);
  const mainEnd = content.indexOf('</main>');
  let inner = content.slice(openTagEnd + 1, mainEnd).trim();

  // Convert JSX attributes to standard HTML
  inner = inner.replace(/className=/g, 'class=');
  // Remove JSX comments
  inner = inner.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  // Clean Lucide-React icon tags
  inner = inner.replace(/<[A-Z][a-zA-Z0-9]*\s*class="[^"]*"\s*\/>/g, '');
  inner = inner.replace(/<[A-Z][a-zA-Z0-9]*\s*\/>/g, '');
  return inner.trim();
}

const termsHtml = extractHtml(path.join(__dirname, '..', 'client/src/pages/Terms.jsx'));
const privacyHtml = extractHtml(path.join(__dirname, '..', 'client/src/pages/Privacy.jsx'));

const now = new Date().toISOString();

const initialLegalPages = {
  terms: {
    id: 'terms',
    slug: 'terms',
    pageTitle: 'Terms & Conditions',
    shortDescription: 'Official terms, conditions, purchase guidelines, and user agreement governing all orders and website interactions on fibaxpharma.com.',
    documentVersion: '1.0',
    lastUpdated: '2026-11-13',
    effectiveDate: '2026-11-13',
    status: 'published',
    publishedContent: termsHtml,
    draftContent: termsHtml,
    updatedAt: now,
    updatedBy: 'admin',
    history: [
      {
        id: 'rev_terms_1_0',
        version: '1.0',
        savedAt: now,
        adminUser: 'admin',
        status: 'published',
        note: 'Baseline published Terms & Conditions document (30 sections)',
        content: termsHtml
      }
    ]
  },
  privacy: {
    id: 'privacy',
    slug: 'privacy',
    pageTitle: 'Privacy Policy',
    shortDescription: 'Official privacy notice, data fiduciary commitments, and data protection practices for Fibax Ayurveda under Indian IT Rules and DPDP Act.',
    documentVersion: '1.0',
    lastUpdated: '2026-11-14',
    effectiveDate: '2026-11-14',
    status: 'published',
    publishedContent: privacyHtml,
    draftContent: privacyHtml,
    updatedAt: now,
    updatedBy: 'admin',
    history: [
      {
        id: 'rev_privacy_1_0',
        version: '1.0',
        savedAt: now,
        adminUser: 'admin',
        status: 'published',
        note: 'Baseline published Privacy Policy document (29 sections)',
        content: privacyHtml
      }
    ]
  }
};

const destPath = path.join(__dirname, '..', 'server/data/legal_pages.json');
fs.writeFileSync(destPath, JSON.stringify(initialLegalPages, null, 2), 'utf8');
console.log('✅ Successfully seeded server/data/legal_pages.json!');
console.log('Terms size:', termsHtml.length, 'bytes');
console.log('Privacy size:', privacyHtml.length, 'bytes');
