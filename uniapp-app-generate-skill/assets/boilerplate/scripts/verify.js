const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function run(cmd, options = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      ESLINT_USE_FLAT_CONFIG: 'false',
    },
    ...options,
  });
}

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

let failed = false;

try {
  run('npm run lint');
  run('npm run build:h5');

  if (!exists('dist/build/h5')) {
    console.error('[verify] dist/build/h5 not found');
    failed = true;
  }

  if (failed) {
    process.exit(1);
  }

  console.log('\n[verify] all checks passed');
} catch (err) {
  console.error('\n[verify] failed');
  process.exit(1);
}
