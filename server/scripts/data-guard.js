// Command line utility for Data Protection, Backup & Integrity Verification
import { createAutomatedBackup, verifyDataIntegrity, restoreBackup } from '../services/backupService.js';
import { DATA_DIR, BACKUPS_DIR } from '../config/paths.js';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

const command = process.argv[2] || 'verify';

switch (command) {
  case 'backup': {
    const reason = process.argv[3] || 'manual_cli';
    console.log(`📦 Initiating automated backup from ${DATA_DIR}...`);
    const res = createAutomatedBackup(reason);
    if (res.success) {
      console.log(`✅ Backup successfully created at: ${res.backupDir}`);
      console.log('Manifest summary:');
      Object.entries(res.manifest.files).forEach(([f, meta]) => {
        console.log(`  - ${f}: ${meta.recordCount !== undefined ? meta.recordCount + ' records' : meta.sizeBytes + ' bytes'}`);
      });
    } else {
      console.error(`❌ Backup failed: ${res.error}`);
      process.exit(1);
    }
    break;
  }

  case 'verify': {
    console.log(`🔍 Verifying data integrity in ${DATA_DIR}...`);
    const res = verifyDataIntegrity();
    console.log(`Integrity Status: ${res.status.toUpperCase()}`);
    console.log('Collections summary:');
    Object.entries(res.collections).forEach(([coll, count]) => {
      console.log(`  - ${coll}: ${count} records`);
    });
    if (res.repaired.length > 0) {
      console.log('Repairs performed:');
      res.repaired.forEach(r => console.log(`  🛡️ ${r}`));
    }
    if (res.issues.length > 0) {
      console.warn('Issues detected:');
      res.issues.forEach(i => console.warn(`  ⚠️ ${i}`));
      process.exit(1);
    } else {
      console.log('✅ All business data collections are healthy, valid, and verified.');
    }
    break;
  }

  case 'restore': {
    const backupName = process.argv[3];
    if (!backupName) {
      console.error('❌ Please specify the backup folder name to restore.');
      console.log('Available backups:');
      if (existsSync(BACKUPS_DIR)) {
        readdirSync(BACKUPS_DIR).filter(f => f.startsWith('backup_')).forEach(b => console.log(`  - ${b}`));
      }
      process.exit(1);
    }
    console.log(`⚠️ Restoring backup: ${backupName} into ${DATA_DIR}...`);
    try {
      const res = restoreBackup(backupName);
      console.log(`✅ Restored ${res.restoredFilesCount} files successfully.`);
      res.restoredFiles.forEach(f => console.log(`  - ${f}`));
    } catch (err) {
      console.error(`❌ Restoration failed: ${err.message}`);
      process.exit(1);
    }
    break;
  }

  default:
    console.log('Usage: node server/scripts/data-guard.js [backup|verify|restore <backupFolder>]');
}
