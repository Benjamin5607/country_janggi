/** @deprecated — use PNG→GLB: npm run png-to-glb */
import { spawnSync } from 'node:child_process';

const r = spawnSync('node', ['scripts/png-to-glb/index.mjs'], { stdio: 'inherit', shell: true });
process.exit(r.status ?? 1);
