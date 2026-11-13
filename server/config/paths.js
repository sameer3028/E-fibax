// Centralized path configuration and data persistence manager for Fibax Ayurveda
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1. Data Directory: Persistent location for live business data
export const DATA_DIR = process.env.DATA_DIR || join(__dirname, '..', 'data');

// 2. Default/Seed Data Directory: Pristine starter templates tracked in Git
export const DEFAULT_DATA_DIR = join(__dirname, '..', 'default_data');

// 3. Uploads Directory: Persistent location for product photos, banners, and media
export function getUploadsDir() {
  if (process.env.UPLOADS_DIR) {
    if (!existsSync(process.env.UPLOADS_DIR)) {
      try { mkdirSync(process.env.UPLOADS_DIR, { recursive: true }); } catch (_) {}
    }
    return process.env.UPLOADS_DIR;
  }
  const prodPath = '/var/www/fibax-uploads';
  if (existsSync(prodPath)) return prodPath;

  const localUploads = join(__dirname, '..', 'uploads');
  if (!existsSync(localUploads)) {
    try { mkdirSync(localUploads, { recursive: true }); } catch (_) {}
  }
  return localUploads;
}

// 4. Backups Directory: Rolling timestamped snapshots
export const BACKUPS_DIR = process.env.BACKUPS_DIR || join(__dirname, '..', 'backups');

export function ensureDirectories() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DEFAULT_DATA_DIR)) mkdirSync(DEFAULT_DATA_DIR, { recursive: true });
  if (!existsSync(BACKUPS_DIR)) mkdirSync(BACKUPS_DIR, { recursive: true });
  getUploadsDir();
}

/**
 * Ensures a runtime data file exists in DATA_DIR.
 * RULE:
 * 1. If runtime file ALREADY exists -> DO NOTHING. Existing admin data is sacred.
 * 2. If runtime file is MISSING -> Initialize from DEFAULT_DATA_DIR or fallback.
 * 
 * NEVER replaces existing live records with default seed data!
 */
export function ensureRuntimeFile(fileName, fallbackData = null) {
  ensureDirectories();
  const runtimePath = join(DATA_DIR, fileName);
  if (existsSync(runtimePath)) {
    return runtimePath;
  }

  // File does not exist in DATA_DIR. Seed it once from default_data template
  const defaultPath = join(DEFAULT_DATA_DIR, fileName);
  if (existsSync(defaultPath)) {
    try {
      copyFileSync(defaultPath, runtimePath);
      console.log(`🌱 Initialized missing runtime data file: ${fileName} from defaults template.`);
      return runtimePath;
    } catch (err) {
      console.error(`⚠️ Failed to copy default template for ${fileName}:`, err.message);
    }
  }

  // Fallback initialization if template not found
  if (fallbackData !== null) {
    try {
      writeFileSync(runtimePath, JSON.stringify(fallbackData, null, 2), 'utf8');
      console.log(`🌱 Initialized missing runtime data file: ${fileName} from fallback data.`);
    } catch (err) {
      console.error(`⚠️ Failed to write fallback data for ${fileName}:`, err.message);
    }
  }

  return runtimePath;
}
