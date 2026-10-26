// Uruchamia test filmów z prawdziwym YouTube (Chromium, desktop).
import { spawnSync } from 'node:child_process';

const r = spawnSync('npx', ['playwright', 'test', 'live-video', '--project=desktop'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, LIVE_VIDEO: '1' }
});
process.exit(r.status ?? 1);
