#!/usr/bin/env node
/**
 * PixelPal — Cross-platform one-click setup
 * Works on Windows, macOS, and Linux via: node setup.js
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

// ── ANSI colors (disabled on Windows cmd without VT support) ─────────────────
const C = {
  cyan:   s => `\x1b[36m${s}\x1b[0m`,
  green:  s => `\x1b[32m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  red:    s => `\x1b[31m${s}\x1b[0m`,
  bold:   s => `\x1b[1m${s}\x1b[0m`,
};

const log  = (msg) => console.log(`${C.cyan('▶')} ${msg}`);
const ok   = (msg) => console.log(`${C.green('✓')} ${msg}`);
const warn = (msg) => console.log(`${C.yellow('⚠')}  ${msg}`);
const fail = (msg) => { console.log(`${C.red('✗')} ${msg}`); process.exit(1); };

function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: opts.silent ? 'pipe' : 'inherit', cwd: __dirname, ...opts });
}

function runCapture(cmd) {
  try { return execSync(cmd, { stdio: 'pipe', cwd: __dirname }).toString().trim(); }
  catch { return ''; }
}

// ── Banner ────────────────────────────────────────────────────────────────────
console.log('');
console.log(C.cyan(C.bold('  ██████╗ ██╗██╗  ██╗███████╗██╗     ██████╗  █████╗ ██╗')));
console.log(C.cyan(C.bold('  ██╔══██╗██║╚██╗██╔╝██╔════╝██║     ██╔══██╗██╔══██╗██║')));
console.log(C.cyan(C.bold('  ██████╔╝██║ ╚███╔╝ █████╗  ██║     ██████╔╝███████║██║')));
console.log(C.cyan(C.bold('  ██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║     ██╔═══╝ ██╔══██║██║')));
console.log(C.cyan(C.bold('  ██║     ██║██╔╝ ██╗███████╗███████╗██║     ██║  ██║███████╗')));
console.log(C.cyan(C.bold('  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝╚══════╝')));
console.log('');
console.log(`  ${C.bold('Your cute pixel-art desktop companion 🐾')}`);
console.log(`  ${C.bold('One-click setup script')}`);
console.log('');

// ── Step 1: Node version check ────────────────────────────────────────────────
log('Checking Node.js version...');
const nodeMajor = parseInt(process.versions.node.split('.')[0]);
if (nodeMajor < 18) {
  fail(`Node.js 18+ required. You have ${process.version}. Download at: https://nodejs.org`);
}
ok(`Node.js ${process.version}`);

// ── Step 2: npm check ─────────────────────────────────────────────────────────
log('Checking npm...');
const npmVer = runCapture('npm --version');
if (!npmVer) fail('npm not found. Please install Node.js from https://nodejs.org');
ok(`npm ${npmVer}`);

// ── Step 3: Install dependencies ──────────────────────────────────────────────
log('Installing dependencies...');
console.log('    (Downloading Electron ~100 MB on first run — please wait)\n');

try {
  run('npm install');
  ok('Dependencies installed');
} catch {
  fail('npm install failed. Check your internet connection and try again.');
}

// ── Step 4: Verify Electron binary ───────────────────────────────────────────
log('Verifying Electron binary...');
const electronPath = path.join(__dirname, 'node_modules', '.bin', isWin ? 'electron.cmd' : 'electron');
const electronModPath = path.join(__dirname, 'node_modules', 'electron');

if (!fs.existsSync(electronModPath)) {
  fail('Electron module not found after install. Try: npm install electron --save-dev');
}

// Check the electron path file (electron module stores binary path here)
const electronPathFile = path.join(electronModPath, 'path.txt');
if (fs.existsSync(electronPathFile)) {
  const binaryRelPath = fs.readFileSync(electronPathFile, 'utf8').trim();
  const binaryPath = path.join(electronModPath, 'dist', binaryRelPath);
  if (fs.existsSync(binaryPath)) {
    ok(`Electron binary: ${binaryRelPath}`);
  } else {
    warn(`Electron binary not at expected path. May need manual Electron install.`);
    warn(`Try: ELECTRON_SKIP_BINARY_DOWNLOAD=0 npm install`);
  }
} else {
  ok('Electron module present');
}

// ── Step 5: Build renderer ────────────────────────────────────────────────────
log('Building renderer (Vite)...');
try {
  run('npm run build:renderer');
  ok('Renderer built successfully');
} catch {
  fail('Renderer build failed. Check errors above.');
}

// ── Step 6: Build main process ───────────────────────────────────────────────
log('Compiling main process (TypeScript)...');
try {
  run('npm run build:main');
  ok('Main process compiled');
} catch {
  fail('TypeScript compilation failed. Check errors above.');
}

// ── Step 7: Sanity check dist ─────────────────────────────────────────────────
log('Verifying build output...');
const checks = [
  'dist/main/main.js',
  'dist/main/preload.js',
  'dist/renderer/index.html',
];
for (const f of checks) {
  if (!fs.existsSync(path.join(__dirname, f))) {
    fail(`Missing build artifact: ${f}`);
  }
}
ok('All build artifacts present');

// ── Step 8: Platform-specific tips ───────────────────────────────────────────
console.log('');
console.log(C.green(C.bold('╔══════════════════════════════════════════════════╗')));
console.log(C.green(C.bold('║       ✅  Setup complete! Launching PixelPal     ║')));
console.log(C.green(C.bold('╚══════════════════════════════════════════════════╝')));
console.log('');
console.log(`  ${C.cyan('🐱 Your pet will appear on your desktop')}`);
console.log(`  ${C.cyan('🖱️  Right-click the pet → Settings to customize')}`);
console.log(`  ${C.cyan('🔵 Check the system tray icon to show/hide/quit')}`);
if (isMac) {
  console.log(`  ${C.yellow('🍎 macOS: If nothing appears, check Security & Privacy settings')}`);
}
console.log('');

// ── Step 9: Launch Electron ───────────────────────────────────────────────────
log('Launching PixelPal...');

const electronBin = isWin
  ? path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
  : path.join(__dirname, 'node_modules', '.bin', 'electron');

const proc = spawn(electronBin, ['.'], {
  cwd: __dirname,
  stdio: 'inherit',
  detached: false,
  shell: isWin,
});

proc.on('error', (err) => {
  if (err.message.includes('ENOENT')) {
    // Fallback to npx
    warn('Electron binary not in .bin, trying npx...');
    const fallback = spawn('npx', ['electron', '.'], {
      cwd: __dirname,
      stdio: 'inherit',
      shell: true,
    });
    fallback.on('error', (e) => fail(`Could not launch Electron: ${e.message}`));
  } else {
    fail(`Launch error: ${err.message}`);
  }
});

proc.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.log('');
    warn(`PixelPal exited with code ${code}`);
    console.log('  To run again: npm start');
    console.log('  To rebuild:   npm run build');
  }
});
