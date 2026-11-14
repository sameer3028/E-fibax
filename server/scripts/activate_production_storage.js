import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, readdirSync, unlinkSync, statSync } from 'fs';
import { dirname, join, resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_ROOT = resolve(__dirname, '..');
const REPO_ROOT = resolve(SERVER_ROOT, '..');
const DEFAULT_DATA_DIR = join(SERVER_ROOT, 'default_data');
const REPO_DATA_DIR = join(SERVER_ROOT, 'data');
const REPO_UPLOADS_DIR = join(SERVER_ROOT, 'uploads');
const CLIENT_UPLOADS_DIR = join(REPO_ROOT, 'client', 'public', 'uploads');

async function runActivation() {
  console.log('================================================================');
  console.log('🛡️  FIBAX AYURVEDA — SAFE PRODUCTION STORAGE ACTIVATION');
  console.log('================================================================\n');

  // 1. Resolve Target Directories Outside Git
  const homeDir = os.homedir();
  const targetDataDir = process.env.DATA_DIR && process.env.DATA_DIR.trim()
    ? resolve(process.env.DATA_DIR.trim())
    : join(homeDir, 'fibax-data');

  const targetUploadsDir = process.env.UPLOADS_DIR && process.env.UPLOADS_DIR.trim()
    ? resolve(process.env.UPLOADS_DIR.trim())
    : join(homeDir, 'fibax-uploads');

  console.log(`👤 System User:         ${os.userInfo().username}`);
  console.log(`🏠 User Home Directory:  ${homeDir}`);
  console.log(`📁 Target DATA_DIR:     ${targetDataDir}`);
  console.log(`🖼️  Target UPLOADS_DIR:  ${targetUploadsDir}`);
  console.log(`📦 Application Root:    ${REPO_ROOT}\n`);

  // Verify external isolation
  const repoNorm = REPO_ROOT.toLowerCase();
  const dataNorm = targetDataDir.toLowerCase();
  const uploadsNorm = targetUploadsDir.toLowerCase();

  const isDataExternal = !dataNorm.startsWith(repoNorm);
  const isUploadsExternal = !uploadsNorm.startsWith(repoNorm);

  if (!isDataExternal || !isUploadsExternal) {
    console.warn('⚠️ WARNING: Target directories are inside the Git repository!');
    console.warn('   To protect business data from Git, use paths outside the repository.');
  } else {
    console.log('✅ Directories confirmed 100% OUTSIDE the Git repository.');
  }

  // 2. Ensure Directories Exist & Test Write Permissions
  if (!existsSync(targetDataDir)) mkdirSync(targetDataDir, { recursive: true });
  if (!existsSync(targetUploadsDir)) mkdirSync(targetUploadsDir, { recursive: true });

  const testFile = join(targetDataDir, `.perm_test_${Date.now()}`);
  try {
    writeFileSync(testFile, 'ok', 'utf8');
    unlinkSync(testFile);
    console.log('✅ Write permissions verified on DATA_DIR.');
  } catch (err) {
    console.error('❌ Permission error on DATA_DIR:', err.message);
    process.exit(1);
  }

  // 3. Create Live Pre-Activation Backup
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = join(targetDataDir, 'backups', `pre_activation_${timestamp}`);
  mkdirSync(backupDir, { recursive: true });

  const existingSource = existsSync(REPO_DATA_DIR) ? REPO_DATA_DIR : DEFAULT_DATA_DIR;
  const backupFiles = readdirSync(existingSource).filter(f => f.endsWith('.json'));

  for (const f of backupFiles) {
    copyFileSync(join(existingSource, f), join(backupDir, f));
  }
  console.log(`✅ Live data backed up to: ${backupDir} (${backupFiles.length} files)\n`);

  // 4. Safe Order Recovery and Merging
  console.log('--- Order Reconciliation ---');
  let currentOrders = [];
  const targetOrdersPath = join(targetDataDir, 'orders.json');
  const sourceOrdersPath = join(existingSource, 'orders.json');

  if (existsSync(targetOrdersPath)) {
    currentOrders = JSON.parse(readFileSync(targetOrdersPath, 'utf8'));
  } else if (existsSync(sourceOrdersPath)) {
    currentOrders = JSON.parse(readFileSync(sourceOrdersPath, 'utf8'));
  }

  const baselineOrdersPath = join(DEFAULT_DATA_DIR, 'orders.json');
  const baselineOrders = existsSync(baselineOrdersPath)
    ? JSON.parse(readFileSync(baselineOrdersPath, 'utf8'))
    : [];

  const liveOrderIds = new Set(currentOrders.map(o => o.orderId));
  const missingOrders = baselineOrders.filter(o => !liveOrderIds.has(o.orderId));

  console.log(`Current live orders:     ${currentOrders.length}`);
  console.log(`Baseline orders count:   ${baselineOrders.length}`);
  console.log(`Missing orders to merge: ${missingOrders.length}`);

  if (missingOrders.length > 0) {
    console.log('Orders to be merged:');
    missingOrders.forEach(o => {
      console.log(` + ${o.orderId} | ${o.customer?.name} | ₹${o.totals?.grandTotal} | ${o.createdAt}`);
    });
    currentOrders.push(...missingOrders);
    currentOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  writeFileSync(targetOrdersPath, JSON.stringify(currentOrders, null, 2), 'utf8');
  console.log(`✅ orders.json saved to DATA_DIR (Total: ${currentOrders.length} orders)\n`);

  // 5. Safe Blog Cleaning (Remove unit test blogs)
  console.log('--- Blog Reconciliation ---');
  let blogs = [];
  const targetBlogsPath = join(targetDataDir, 'blogs.json');
  const sourceBlogsPath = join(existingSource, 'blogs.json');

  if (existsSync(targetBlogsPath)) {
    blogs = JSON.parse(readFileSync(targetBlogsPath, 'utf8'));
  } else if (existsSync(sourceBlogsPath)) {
    blogs = JSON.parse(readFileSync(sourceBlogsPath, 'utf8'));
  }

  const origBlogCount = blogs.length;
  blogs = blogs.filter(b => !b.title.includes('Unit Test'));
  const removedTestBlogs = origBlogCount - blogs.length;
  console.log(`Original blogs:          ${origBlogCount}`);
  console.log(`Test blogs removed:      ${removedTestBlogs}`);
  console.log(`Authentic blogs saved:   ${blogs.length}`);

  writeFileSync(targetBlogsPath, JSON.stringify(blogs, null, 2), 'utf8');
  console.log(`✅ blogs.json saved to DATA_DIR\n`);

  // 6. Copy Remaining Core Business Files (Without Overwriting Newer Live Data)
  console.log('--- Business Files Migration ---');
  const CORE_FILES = [
    'products.json',
    'blog_categories.json',
    'home_banners.json',
    'about_banners.json',
    'coupons.json',
    'shipping_config.json',
    'legal_pages.json',
    'admin_auth.json',
    'reviews.json',
    'users.json',
    'enquiries.json',
    'email_config.json',
    'email_logs.json'
  ];

  for (const filename of CORE_FILES) {
    const dest = join(targetDataDir, filename);
    if (!existsSync(dest)) {
      const src = existsSync(join(existingSource, filename))
        ? join(existingSource, filename)
        : join(DEFAULT_DATA_DIR, filename);

      if (existsSync(src)) {
        copyFileSync(src, dest);
        console.log(` + Migrated ${filename} (${statSync(dest).size} bytes)`);
      }
    } else {
      console.log(` = Preserved existing live ${filename} (${statSync(dest).size} bytes)`);
    }
  }

  // 7. Image & Media Migration
  console.log('\n--- Media & Uploads Migration ---');
  let migratedMedia = 0;
  if (existsSync(REPO_UPLOADS_DIR)) {
    for (const file of readdirSync(REPO_UPLOADS_DIR)) {
      const src = join(REPO_UPLOADS_DIR, file);
      const dst = join(targetUploadsDir, file);
      if (!existsSync(dst)) {
        copyFileSync(src, dst);
        migratedMedia++;
      }
    }
  }
  if (existsSync(CLIENT_UPLOADS_DIR)) {
    for (const file of readdirSync(CLIENT_UPLOADS_DIR)) {
      const src = join(CLIENT_UPLOADS_DIR, file);
      const dst = join(targetUploadsDir, file);
      if (!existsSync(dst)) {
        copyFileSync(src, dst);
        migratedMedia++;
      }
    }
  }

  const finalUploadsCount = readdirSync(targetUploadsDir).length;
  console.log(`Newly copied media:      ${migratedMedia}`);
  console.log(`Total files in UPLOADS:  ${finalUploadsCount}`);

  // 8. Final Report and Hostinger Instructions
  console.log('\n================================================================');
  console.log('🎉 PRODUCTION STORAGE ACTIVATION PREPARATION COMPLETE!');
  console.log('================================================================');
  console.log('\n📋 EXACT VALUES TO CONFIGURE IN HOSTINGER hPanel:');
  console.log('----------------------------------------------------------------');
  console.log(`DATA_DIR=${targetDataDir}`);
  console.log(`UPLOADS_DIR=${targetUploadsDir}`);
  console.log('----------------------------------------------------------------\n');
  console.log('👉 Next Steps on Hostinger:');
  console.log('1. In hPanel → Advanced → Node.js → Environment Variables:');
  console.log(`   Add DATA_DIR with value:    ${targetDataDir}`);
  console.log(`   Add UPLOADS_DIR with value: ${targetUploadsDir}`);
  console.log('2. Click "Save", then click "Restart" on the Node.js application.');
  console.log('3. Visit https://fibaxpharma.com/api/health to confirm storagePaths.\n');
}

runActivation().catch(err => {
  console.error('❌ Activation script encountered an error:', err);
  process.exit(1);
});
