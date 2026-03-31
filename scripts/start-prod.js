const { existsSync } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

// Supports both outputs:
// - dist/main.js (nest build)
// - dist/src/main.js (some tsc/watch configs)
const candidates = ['dist/main.js', 'dist/src/main.js'];
const entry = candidates.find((relativePath) =>
  existsSync(join(process.cwd(), relativePath)),
);

if (!entry) {
  console.error(
    'Cannot find backend entry file. Expected one of: dist/main.js, dist/src/main.js',
  );
  process.exit(1);
}

const child = spawn(process.execPath, [entry], {
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
