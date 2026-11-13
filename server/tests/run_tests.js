// Isolated Test Sandbox Runner for Fibax Ayurveda
// Protects live business data (server/data) from test mutations, mock orders, and test products.
import { existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sandboxDir = join(__dirname, 'test_data_sandbox');
const defaultsDir = join(__dirname, '..', 'default_data');

// 1. Prepare isolated sandbox directory with fresh copies of default templates
if (existsSync(sandboxDir)) {
  rmSync(sandboxDir, { recursive: true, force: true });
}
mkdirSync(sandboxDir, { recursive: true });
cpSync(defaultsDir, sandboxDir, { recursive: true });

// 2. Set environment variables so ALL test suites operate exclusively in sandbox
process.env.DATA_DIR = sandboxDir;
process.env.NODE_ENV = 'test';

console.log('🧪 Running test suite in isolated sandbox:', sandboxDir);
console.log('🛡️ Live business data directory (server/data) is 100% protected.');

// 3. Run node --test with native test runner
const child = spawn(process.execPath, ['--test', 'server/tests/*.test.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    DATA_DIR: sandboxDir,
    NODE_ENV: 'test'
  }
});

child.on('close', (code) => {
  // 4. Clean up sandbox after tests complete
  setTimeout(() => {
    try {
      if (existsSync(sandboxDir)) {
        rmSync(sandboxDir, { recursive: true, force: true });
      }
    } catch (_) {}
    process.exit(code || 0);
  }, 100);
});
