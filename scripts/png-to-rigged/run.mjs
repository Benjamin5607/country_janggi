#!/usr/bin/env node
/**
 * Default: FREE PNG -> 3D (Hugging Face Hunyuan3D-2, nation art).
 * Paid Tripo rigged: npm run png-to-rigged:tripo  (needs credits)
 * KayKit fallback only: npm run free-units:kaykit
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const useTripo = process.argv.includes('--tripo') || process.env.TRIPO_USE_PAID === '1';

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 1) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { stdio: 'inherit', cwd: ROOT, ...opts }).status ?? 1;
}

if (useTripo) {
  loadDotEnv();
  const key = process.env.TRIPO_API_KEY?.trim();
  if (!key) {
    console.error('TRIPO_API_KEY required for --tripo (paid, needs credits on tripo3d.ai)');
    process.exit(1);
  }
  console.log('Paid Tripo AI: PNG -> rigged GLB\n');
  const py = process.platform === 'win32' ? 'python' : 'python3';
  run(py, ['-m', 'pip', 'install', '-q', '-r', 'scripts/png-to-rigged/requirements.txt']);
  process.exit(
    run(py, ['scripts/png-to-rigged/generate.py'], {
      env: { ...process.env, TRIPO_API_KEY: key, PYTHONIOENCODING: 'utf-8' },
    }),
  );
}

console.log('FREE pipeline: your unit PNG -> nation 3D (Hugging Face Hunyuan3D-2)\n');
console.log('(KayKit optional: npm run free-units:kaykit)\n');
console.log('(Tripo rigged PNG: npm run png-to-rigged:tripo)\n');
const py = process.platform === 'win32' ? 'python' : 'python3';
run(py, ['-m', 'pip', 'install', '-q', '-r', 'scripts/free-units/requirements.txt']);
process.exit(
  run(py, ['scripts/free-units/generate-from-png.py'], {
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
  }),
);
