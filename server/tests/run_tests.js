import { spawn } from 'child_process';
import { existsSync, mkdirSync, copyFileSync, rmSync, readdirSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tmpDataDir = resolve(__dirname, 'tmp_test_data');
const tmpUploadsDir = resolve(__dirname, 'tmp_test_uploads');

// 1. Prepare isolated test directories
if (existsSync(tmpDataDir)) rmSync(tmpDataDir, { recursive: true, force: true });
if (existsSync(tmpUploadsDir)) rmSync(tmpUploadsDir, { recursive: true, force: true });
mkdirSync(tmpDataDir, { recursive: true });
mkdirSync(tmpUploadsDir, { recursive: true });

// 2. Seed clean baseline data from server/default_data
const defaultDataDir = resolve(__dirname, '..', 'default_data');
if (existsSync(defaultDataDir)) {
  for (const f of readdirSync(defaultDataDir)) {
    copyFileSync(join(defaultDataDir, f), join(tmpDataDir, f));
  }
}

const testFiles = readdirSync(__dirname)
  .filter(f => f.endsWith('.test.js'))
  .map(f => join('server', 'tests', f));

console.log(`🧪 Running ${testFiles.length} test suites against isolated test directory:`);
console.log(`   DATA_DIR:    ${tmpDataDir}`);
console.log(`   UPLOADS_DIR: ${tmpUploadsDir}\n`);

const child = spawn(process.execPath, ['--test', ...testFiles], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATA_DIR: tmpDataDir,
    UPLOADS_DIR: tmpUploadsDir,
    NODE_ENV: 'test'
  }
});

child.on('exit', (code) => {
  // Clean up temporary test data after execution
  try {
    if (existsSync(tmpDataDir)) rmSync(tmpDataDir, { recursive: true, force: true });
    if (existsSync(tmpUploadsDir)) rmSync(tmpUploadsDir, { recursive: true, force: true });
  } catch (_) {}
  process.exit(code || 0);
});
