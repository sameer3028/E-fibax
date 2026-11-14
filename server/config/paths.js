import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'fs';
import { dirname, join, resolve, basename } from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const SERVER_ROOT = resolve(__dirname, '..');
export const REPO_ROOT = resolve(SERVER_ROOT, '..');
export const DEFAULT_DATA_DIR = join(SERVER_ROOT, 'default_data');
export const REPO_DATA_DIR = join(SERVER_ROOT, 'data');
export const REPO_UPLOADS_DIR = join(SERVER_ROOT, 'uploads');
export const CLIENT_UPLOADS_DIR = join(REPO_ROOT, 'client', 'public', 'uploads');

const REQUIRED_FILES = [
  'about_banners.json',
  'admin_auth.json',
  'blog_categories.json',
  'blogs.json',
  'coupons.json',
  'email_config.json',
  'email_logs.json',
  'enquiries.json',
  'home_banners.json',
  'legal_pages.json',
  'orders.json',
  'products.json',
  'reviews.json',
  'shipping_config.json',
  'users.json'
];

/**
 * Determine persistent DATA_DIR:
 * In production: MUST be outside the Git repository to protect business data.
 * In development: defaults to server/data or explicit DATA_DIR.
 */
function resolveDataDir() {
  if (process.env.DATA_DIR && process.env.DATA_DIR.trim()) {
    const custom = resolve(process.env.DATA_DIR.trim());
    return custom;
  }

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    if (existsSync('/var/www/fibax-data')) {
      return '/var/www/fibax-data';
    }
    const homeDataDir = join(os.homedir(), 'fibax-data');
    return homeDataDir;
  }

  // Development fallback
  return REPO_DATA_DIR;
}

/**
 * Determine persistent UPLOADS_DIR:
 * In production: persistent directory outside Git repo.
 * In development: server/uploads.
 */
function resolveUploadsDir() {
  if (process.env.UPLOADS_DIR && process.env.UPLOADS_DIR.trim()) {
    return resolve(process.env.UPLOADS_DIR.trim());
  }

  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    if (existsSync('/var/www/fibax-uploads')) {
      return '/var/www/fibax-uploads';
    }
    const homeUploadsDir = join(os.homedir(), 'fibax-uploads');
    return homeUploadsDir;
  }

  // Development fallback
  return REPO_UPLOADS_DIR;
}

export const DATA_DIR = resolveDataDir();
export const UPLOADS_DIR = resolveUploadsDir();

/**
 * Validates storage path safety.
 * In production, warns loudly if DATA_DIR is inside the Git repo.
 */
export function validateStoragePaths() {
  const isProd = process.env.NODE_ENV === 'production';
  const dataPathNorm = resolve(DATA_DIR).toLowerCase();
  const repoPathNorm = resolve(REPO_ROOT).toLowerCase();

  const isInsideRepo = dataPathNorm.startsWith(repoPathNorm);

  if (isProd && isInsideRepo) {
    console.warn('⚠️ =========================================================');
    console.warn('⚠️ WARNING: DATA_DIR is inside the Git repository directory:');
    console.warn(`⚠️   DATA_DIR: ${DATA_DIR}`);
    console.warn(`⚠️   REPO:     ${REPO_ROOT}`);
    console.warn('⚠️ Set DATA_DIR environment variable to an external path, e.g.');
    console.warn('⚠️   DATA_DIR=/home/uXXXXXXX/fibax-data (Hostinger)');
    console.warn('⚠️   DATA_DIR=/var/www/fibax-data (Linux VPS)');
    console.warn('⚠️ =========================================================');
  } else {
    console.log(`🗄️  Persistent Data Dir:    ${DATA_DIR}`);
    console.log(`🖼️  Persistent Uploads Dir: ${UPLOADS_DIR}`);
  }
}

/**
 * Initializes persistent storage directories and migrates baseline records
 * if the destination folder is freshly created or missing files.
 * NEVER overwrites an existing file in DATA_DIR.
 */
export function initializePersistentStorage() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
    console.log(`📁 Created persistent DATA_DIR: ${DATA_DIR}`);
  }

  if (!existsSync(UPLOADS_DIR)) {
    mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log(`📁 Created persistent UPLOADS_DIR: ${UPLOADS_DIR}`);
  }

  validateStoragePaths();

  // One-way migration / baseline seed for missing files only
  for (const filename of REQUIRED_FILES) {
    const destFile = join(DATA_DIR, filename);
    if (!existsSync(destFile)) {
      // 1. Try migrating from existing repo data first
      const repoFile = join(REPO_DATA_DIR, filename);
      const defaultFile = join(DEFAULT_DATA_DIR, filename);

      if (existsSync(repoFile)) {
        try {
          copyFileSync(repoFile, destFile);
          console.log(`📋 Seeded ${filename} into persistent DATA_DIR from repo data.`);
        } catch (e) {
          console.error(`Failed to seed ${filename}:`, e.message);
        }
      } else if (existsSync(defaultFile)) {
        try {
          copyFileSync(defaultFile, destFile);
          console.log(`📋 Seeded ${filename} into persistent DATA_DIR from default_data.`);
        } catch (e) {
          console.error(`Failed to seed ${filename} from default_data:`, e.message);
        }
      }
    }
  }

  // Seed baseline images if external UPLOADS_DIR is completely empty
  try {
    const uploadsCount = readdirSync(UPLOADS_DIR).length;
    if (uploadsCount === 0) {
      console.log('🖼️ Initializing persistent UPLOADS_DIR with baseline images...');
      if (existsSync(REPO_UPLOADS_DIR)) {
        for (const file of readdirSync(REPO_UPLOADS_DIR)) {
          const src = join(REPO_UPLOADS_DIR, file);
          const dst = join(UPLOADS_DIR, file);
          if (!existsSync(dst)) copyFileSync(src, dst);
        }
      }
      if (existsSync(CLIENT_UPLOADS_DIR)) {
        for (const file of readdirSync(CLIENT_UPLOADS_DIR)) {
          const src = join(CLIENT_UPLOADS_DIR, file);
          const dst = join(UPLOADS_DIR, file);
          if (!existsSync(dst)) copyFileSync(src, dst);
        }
      }
    }
  } catch (err) {
    console.warn('Notice during upload seeding:', err.message);
  }
}


export function ensureStorageDirs() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(UPLOADS_DIR)) mkdirSync(UPLOADS_DIR, { recursive: true });
}

export function getDataFilePath(filename) {
  return join(DATA_DIR, filename);
}
