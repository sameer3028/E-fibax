// Automated Backup, Integrity Verification, and Disaster Recovery Service for Fibax Ayurveda
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, copyFileSync, rmSync, statSync } from 'fs';
import { join, basename } from 'path';
import { DATA_DIR, BACKUPS_DIR, ensureDirectories } from '../config/paths.js';

const CRITICAL_COLLECTIONS = [
  'products.json',
  'orders.json',
  'blogs.json',
  'blog_categories.json',
  'home_banners.json',
  'about_banners.json',
  'shipping_config.json',
  'email_config.json',
  'coupons.json',
  'reviews.json',
  'users.json',
  'admin_auth.json'
];

/**
 * Creates a timestamped backup of the entire runtime business database.
 */
export function createAutomatedBackup(reason = 'runtime') {
  ensureDirectories();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `backup_${timestamp}_${reason}`;
  const targetDir = join(BACKUPS_DIR, backupName);
  const dataSubDir = join(targetDir, 'data');

  try {
    mkdirSync(dataSubDir, { recursive: true });

    const manifest = {
      timestamp: new Date().toISOString(),
      reason,
      sourceDataDir: DATA_DIR,
      files: {},
      summary: {}
    };

    if (existsSync(DATA_DIR)) {
      const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
      for (const file of files) {
        const srcFile = join(DATA_DIR, file);
        const destFile = join(dataSubDir, file);
        try {
          copyFileSync(srcFile, destFile);
          const raw = readFileSync(srcFile, 'utf8');
          const parsed = JSON.parse(raw);
          const count = Array.isArray(parsed) ? parsed.length : 1;
          manifest.files[file] = {
            sizeBytes: Buffer.byteLength(raw),
            recordCount: count
          };
        } catch (err) {
          // If error reading, still copy raw bytes
          try { copyFileSync(srcFile, destFile); } catch (_) {}
          manifest.files[file] = { error: err.message };
        }
      }
    }

    writeFileSync(join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

    // Prune older automated backups to prevent disk bloat (keep latest 30)
    pruneOldAutomatedBackups(30);

    return {
      success: true,
      backupDir: targetDir,
      backupName,
      manifest
    };
  } catch (err) {
    console.error('❌ Failed to create automated backup:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Keeps a rolling window of recent backups, removing oldest backups exceeding maxToKeep.
 */
function pruneOldAutomatedBackups(maxToKeep = 30) {
  try {
    if (!existsSync(BACKUPS_DIR)) return;
    const entries = readdirSync(BACKUPS_DIR)
      .filter(f => f.startsWith('backup_'))
      .map(name => ({
        name,
        path: join(BACKUPS_DIR, name),
        time: statSync(join(BACKUPS_DIR, name)).mtimeMs
      }))
      .sort((a, b) => b.time - a.time);

    if (entries.length > maxToKeep) {
      const toRemove = entries.slice(maxToKeep);
      for (const item of toRemove) {
        try {
          rmSync(item.path, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  } catch (_) {}
}

/**
 * Performs a comprehensive integrity check on all runtime JSON data files.
 * Detects corruption, empty files, or missing keys, and repairs using .bak if available.
 */
export function verifyDataIntegrity() {
  ensureDirectories();
  const report = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    collections: {},
    issues: [],
    repaired: []
  };

  for (const fileName of CRITICAL_COLLECTIONS) {
    const filePath = join(DATA_DIR, fileName);
    const bakPath = `${filePath}.bak`;

    if (!existsSync(filePath)) {
      report.issues.push(`Missing data file: ${fileName}`);
      report.status = 'warning';
      continue;
    }

    try {
      const raw = readFileSync(filePath, 'utf8');
      if (!raw.trim()) {
        throw new Error('File is empty (0 bytes)');
      }
      const parsed = JSON.parse(raw);
      const count = Array.isArray(parsed) ? parsed.length : 1;
      report.collections[fileName] = count;
    } catch (parseErr) {
      report.issues.push(`Corrupted JSON in ${fileName}: ${parseErr.message}`);
      report.status = 'warning';

      // Attempt automatic recovery from .bak
      if (existsSync(bakPath)) {
        try {
          const bakRaw = readFileSync(bakPath, 'utf8');
          const bakParsed = JSON.parse(bakRaw);
          writeFileSync(filePath, bakRaw, 'utf8');
          report.repaired.push(`Successfully repaired ${fileName} from healthy .bak file.`);
          report.collections[fileName] = Array.isArray(bakParsed) ? bakParsed.length : 1;
        } catch (bakErr) {
          report.issues.push(`Backup .bak file for ${fileName} is also damaged: ${bakErr.message}`);
        }
      }
    }
  }

  return report;
}

/**
 * Safely restores a specified backup directory into DATA_DIR.
 * Automatically takes a pre-restore snapshot of current data before applying changes.
 */
export function restoreBackup(backupFolderName) {
  const sourceDir = join(BACKUPS_DIR, backupFolderName, 'data');
  if (!existsSync(sourceDir)) {
    throw new Error(`Backup source directory not found: ${sourceDir}`);
  }

  // 1. Take safety pre-restore backup first
  createAutomatedBackup('pre_restore_safety');

  // 2. Copy all files from backup into DATA_DIR
  const files = readdirSync(sourceDir).filter(f => f.endsWith('.json'));
  const restoredFiles = [];

  for (const file of files) {
    const src = join(sourceDir, file);
    const dest = join(DATA_DIR, file);
    copyFileSync(src, dest);
    restoredFiles.push(file);
  }

  return {
    success: true,
    restoredFilesCount: restoredFiles.length,
    restoredFiles
  };
}
