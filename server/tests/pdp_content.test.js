import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { initStore, getArray } from '../store.js';
import productRoutes, {
  sanitizeProductIntroduction,
  sanitizeBotanicalIngredients,
  sanitizeUsageInstructions,
  sanitizeComparisonTable,
  sanitizeFaqsConfig
} from '../routes/productRoutes.js';
import { generateAdminToken } from '../middleware/auth.js';

test('Product Detail Page (PDP) Universal Content System Tests', async (t) => {
  await initStore();

  // Clean any previous test products before running
  const currentProds = getArray('products');
  const sanitizedCatalog = currentProds.filter(p => !p.title.includes('Automated Test'));
  if (sanitizedCatalog.length !== currentProds.length) {
    const { setArray } = await import('../store.js');
    setArray('products', sanitizedCatalog);
  }

  const app = express();
  app.use(express.json());
  app.use('/api/products', productRoutes);

  let server;
  let testPort;
  const adminToken = generateAdminToken('admin');
  const authHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  };

  await t.test('Server starts and mounts productRoutes', async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        testPort = server.address().port;
        resolve();
      });
    });
    assert.ok(testPort > 0);
  });

  t.after(() => {
    if (server) {
      server.close();
    }
  });

  // -------------------------------------------------------------
  // Unit Tests: PDP Sanitizers
  // -------------------------------------------------------------
  await t.test('Sanitizer: sanitizeProductIntroduction cleans fields & filters empty features', () => {
    const raw = {
      enabled: true,
      badge: '  Heritage Quality  ',
      heading: '  Pure Herbs ',
      description: ' Classical process ',
      features: [
        { title: 'Feature 1', description: 'Desc 1', icon: 'shield' },
        { title: '', description: '' }, // Should be filtered
        { title: 'Feature 2', description: 'Desc 2', icon: 'invalid_icon' } // Icon defaulted to leaf
      ]
    };
    const clean = sanitizeProductIntroduction(raw);
    assert.equal(clean.enabled, true);
    assert.equal(clean.badge, 'Heritage Quality');
    assert.equal(clean.heading, 'Pure Herbs');
    assert.equal(clean.description, 'Classical process');
    assert.equal(clean.features.length, 2);
    assert.equal(clean.features[0].icon, 'shield');
    assert.equal(clean.features[1].icon, 'leaf');

    // Null/undefined handling
    assert.equal(sanitizeProductIntroduction(null), null);
    assert.equal(sanitizeProductIntroduction(undefined), null);
  });

  await t.test('Sanitizer: sanitizeBotanicalIngredients handles string/boolean enabled & trims herbs', () => {
    const raw = {
      enabled: 'false',
      badge: 'Herbs',
      heading: 'Botanical Actives',
      herbs: [
        { name: ' Ashwagandha ', sanskrit: ' Withania somnifera ', role: ' Adaptogen ', desc: ' Vitality ' },
        { name: '', sanskrit: '', role: '', desc: '' } // Should be filtered
      ]
    };
    const clean = sanitizeBotanicalIngredients(raw);
    assert.equal(clean.enabled, false);
    assert.equal(clean.herbs.length, 1);
    assert.equal(clean.herbs[0].name, 'Ashwagandha');
    assert.equal(clean.herbs[0].sanskrit, 'Withania somnifera');
  });

  await t.test('Sanitizer: sanitizeUsageInstructions handles progression stages and step numbers', () => {
    const raw = {
      enabled: true,
      badge: 'Protocol',
      heading: 'Daily Dosage',
      description: 'Take with warm water',
      steps: [
        { stepNumber: 1, title: 'Step 1', description: 'Measure 10ml' },
        { title: 'Step 2', description: 'Drink after meal' }
      ],
      showProgression: true,
      progressionHeading: '30-Day Course',
      progressionStages: [
        { stage: 'Month 1', title: 'Detox', description: 'Cellular cleanse' }
      ]
    };
    const clean = sanitizeUsageInstructions(raw);
    assert.equal(clean.enabled, true);
    assert.equal(clean.steps.length, 2);
    assert.equal(clean.steps[1].stepNumber, 2);
    assert.equal(clean.progressionStages.length, 1);
  });

  await t.test('Sanitizer: sanitizeComparisonTable filters empty rows & sets default competitorHeader', () => {
    const raw = {
      enabled: true,
      badge: 'Comparison',
      heading: 'Fibax vs Market',
      rows: [
        { feature: 'Purity', fibax: '100% Ayurvedic', competitor: 'Synthetic' },
        { feature: '', fibax: '', competitor: '' }
      ]
    };
    const clean = sanitizeComparisonTable(raw);
    assert.equal(clean.enabled, true);
    assert.equal(clean.competitorHeader, 'Conventional Market Products');
    assert.equal(clean.rows.length, 1);
    assert.equal(clean.rows[0].feature, 'Purity');
  });

  await t.test('Sanitizer: sanitizeFaqsConfig preserves Q&A pairs', () => {
    const raw = {
      enabled: true,
      badge: 'FAQ',
      heading: 'Common Questions',
      items: [
        { q: 'Is it safe?', a: 'Yes, 100% AYUSH approved.' },
        { q: '', a: '' }
      ]
    };
    const clean = sanitizeFaqsConfig(raw);
    assert.equal(clean.enabled, true);
    assert.equal(clean.items.length, 1);
    assert.equal(clean.items[0].q, 'Is it safe?');
  });

  // -------------------------------------------------------------
  // Integration Tests: REST API with Complete PDP Lifecycles
  // -------------------------------------------------------------
  let createdProductId;

  await t.test('API: POST /api/products creates product with complete 5 PDP sections', async () => {
    const newProductPayload = {
      title: 'Automated Test Ayurvedic Elixir',
      slug: `auto-test-elixir-${Date.now()}`,
      sku: 'FBX-TEST-200ML',
      categoryId: 'syrups',
      concernId: 'immunity-vitality',
      dosageForm: 'Syrup',
      volumeWeight: '200 ml',
      mrp: 399,
      salePrice: 329,
      stockQuantity: 100,
      productIntroduction: {
        enabled: true,
        badge: 'Authentic Formulation',
        heading: 'Restorative Elixir for Deep Cellular Vitality',
        description: 'Traditional decoction prepared with 18 classical botanical actives.',
        features: [
          { title: 'Cold Decoction', description: 'Slow brewed for 72 hours.', icon: 'leaf' },
          { title: 'Immunity Boost', description: 'Nourishes Ojas directly.', icon: 'heart' }
        ]
      },
      botanicalIngredients: {
        enabled: true,
        badge: 'Active Botanicals',
        heading: 'Pure Extracts',
        description: 'Standardized botanical actives.',
        herbs: [
          { name: 'Amalaki', sanskrit: 'Emblica officinalis', role: 'Vitamin C Booster', desc: 'Cellular protector' },
          { name: 'Giloy', sanskrit: 'Tinospora cordifolia', role: 'Immunomodulator', desc: 'Balances all three doshas' }
        ]
      },
      usageInstructions: {
        enabled: true,
        badge: 'Dosage Protocol',
        heading: 'Daily Dosage Guideline',
        description: 'Consume with warm water after breakfast.',
        steps: [
          { stepNumber: 1, title: 'Shake Well', description: 'Mix natural sediment.' },
          { stepNumber: 2, title: 'Measure 15ml', description: 'Dilute in 50ml lukewarm water.' }
        ],
        showProgression: true,
        progressionHeading: '90-Day Cellular Reset',
        progressionStages: [
          { stage: 'Month 1', title: 'Bio-cleansing', description: 'Eliminates Ama.' }
        ]
      },
      comparisonTable: {
        enabled: true,
        badge: 'Quality Standard',
        heading: 'Fibax Elixir vs Chemical Tonics',
        description: 'Clinical comparative analysis.',
        competitorHeader: 'Generic Market Tonics',
        rows: [
          { feature: 'Sugar Content', fibax: 'Zero Added Sugar (Pure Stevia & Herbs)', competitor: 'High Fructose Corn Syrup' },
          { feature: 'Standardization', fibax: 'AYUSH-GMP Certified NABL Tested', competitor: 'Unstandardized bulk powder' }
        ]
      },
      faqsConfig: {
        enabled: true,
        badge: 'FAQ',
        heading: 'Elixir Frequently Asked Questions',
        description: 'Everything you need to know before starting the course.',
        items: [
          { q: 'Can diabetics take this elixir?', a: 'Yes, this syrup is 100% sugar-free and safe for diabetic individuals.' },
          { q: 'What is the recommended course duration?', a: 'For best therapeutic results, complete a 90-day course.' }
        ]
      }
    };

    const res = await fetch(`http://127.0.0.1:${testPort}/api/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newProductPayload)
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    const body = json.data;
    assert.ok(body.id);
    createdProductId = body.id;

    // Verify all 5 PDP sections were saved with high fidelity
    assert.equal(body.productIntroduction.enabled, true);
    assert.equal(body.productIntroduction.features.length, 2);
    assert.equal(body.botanicalIngredients.herbs.length, 2);
    assert.equal(body.usageInstructions.steps.length, 2);
    assert.equal(body.comparisonTable.rows.length, 2);
    assert.equal(body.faqsConfig.items.length, 2);
  });

  await t.test('API: GET /api/products/:id retrieves exact PDP content', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/products/${createdProductId}`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const body = json.data;

    assert.equal(body.id, createdProductId);
    assert.equal(body.productIntroduction.heading, 'Restorative Elixir for Deep Cellular Vitality');
    assert.equal(body.botanicalIngredients.herbs[0].name, 'Amalaki');
    assert.equal(body.comparisonTable.competitorHeader, 'Generic Market Tonics');
    assert.equal(body.faqsConfig.items[0].q, 'Can diabetics take this elixir?');
  });

  await t.test('API: PUT /api/products/:id updating basic details PRESERVES all 5 PDP sections', async () => {
    // Admin edits only price and stock — NO PDP fields in payload
    const basicUpdatePayload = {
      salePrice: 299,
      mrp: 449,
      stockQuantity: 85,
      sku: 'FBX-TEST-200ML-UPDATED'
    };

    const res = await fetch(`http://127.0.0.1:${testPort}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(basicUpdatePayload)
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const body = json.data;

    // Basic fields updated
    assert.equal(body.salePrice, 299);
    assert.equal(body.mrp, 449);
    assert.equal(body.stockQuantity, 85);
    assert.equal(body.sku, 'FBX-TEST-200ML-UPDATED');

    // PDP fields MUST be preserved!
    assert.ok(body.productIntroduction, 'productIntroduction must exist');
    assert.equal(body.productIntroduction.features.length, 2, 'features must be preserved');
    assert.ok(body.botanicalIngredients, 'botanicalIngredients must exist');
    assert.equal(body.botanicalIngredients.herbs.length, 2, 'herbs must be preserved');
    assert.ok(body.usageInstructions, 'usageInstructions must exist');
    assert.equal(body.usageInstructions.steps.length, 2, 'steps must be preserved');
    assert.ok(body.comparisonTable, 'comparisonTable must exist');
    assert.equal(body.comparisonTable.rows.length, 2, 'comparison rows must be preserved');
    assert.ok(body.faqsConfig, 'faqsConfig must exist');
    assert.equal(body.faqsConfig.items.length, 2, 'faqs must be preserved');
  });

  await t.test('API: PUT /api/products/:id updates individual section and preserves active states', async () => {
    // Admin selectively disables comparisonTable and updates FAQs
    const partialPdpUpdate = {
      comparisonTable: {
        enabled: false,
        badge: 'Disabled Comparison',
        heading: 'Not Visible',
        rows: []
      },
      faqsConfig: {
        enabled: true,
        badge: 'Updated FAQ',
        heading: 'Frequently Asked Questions v2',
        description: 'New questions added.',
        items: [
          { q: 'Is international shipping available?', a: 'Currently we ship all across India with Delhivery Express.' }
        ]
      }
    };

    const res = await fetch(`http://127.0.0.1:${testPort}/api/products/${createdProductId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(partialPdpUpdate)
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const body = json.data;

    // Section 4 disabled state verified
    assert.equal(body.comparisonTable.enabled, false);

    // Section 5 update verified
    assert.equal(body.faqsConfig.enabled, true);
    assert.equal(body.faqsConfig.items.length, 1);
    assert.equal(body.faqsConfig.items[0].q, 'Is international shipping available?');

    // Untouched sections 1, 2, 3 must still be preserved
    assert.equal(body.productIntroduction.enabled, true);
    assert.equal(body.productIntroduction.features.length, 2);
    assert.equal(body.botanicalIngredients.herbs.length, 2);
    assert.equal(body.usageInstructions.steps.length, 2);
  });

  await t.test('Catalog Isolation: Verify zero cross-product data leakage between products', async () => {
    // Fetch all products
    const res = await fetch(`http://127.0.0.1:${testPort}/api/products`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    const allProducts = json.data;

    // Ensure our created product has its specific heading
    const testProd = allProducts.find(p => String(p.id) === String(createdProductId));
    assert.ok(testProd);
    assert.equal(testProd.productIntroduction.heading, 'Restorative Elixir for Deep Cellular Vitality');

    // Ensure NO OTHER PRODUCT in the catalog received this heading or these items
    const contaminated = allProducts.filter(p =>
      String(p.id) !== String(createdProductId) &&
      p.productIntroduction?.heading === 'Restorative Elixir for Deep Cellular Vitality'
    );
    assert.equal(contaminated.length, 0, 'Zero other products should share the test product Introduction heading');
  });

  // Cleanup the created test product
  await t.test('Cleanup: DELETE test product', async () => {
    const res = await fetch(`http://127.0.0.1:${testPort}/api/products/${createdProductId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert.equal(res.status, 200);

    // Verify it is deleted
    const verifyRes = await fetch(`http://127.0.0.1:${testPort}/api/products/${createdProductId}`);
    assert.equal(verifyRes.status, 404);
  });
});
