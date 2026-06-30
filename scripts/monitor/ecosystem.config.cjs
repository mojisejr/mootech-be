/**
 * pm2 process definition for the local Mumate prod monitor.
 *
 * Start:   pm2 start scripts/monitor/ecosystem.config.cjs
 * Persist: pm2 save
 * Stop:    pm2 delete mootech-monitor && pm2 save
 *
 * Runs LOCALLY only (off-stack) — alive only while this machine is awake + online.
 * Uses `bun` as interpreter (runs .ts directly, no build step).
 */
const path = require('path')

module.exports = {
  apps: [
    {
      name: 'mootech-monitor',
      script: 'scripts/monitor/prod-monitor.ts',
      interpreter: 'bun',
      // run from repo root so .env.local resolves and logs are predictable
      cwd: path.resolve(__dirname, '..', '..'),
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
      // the loop sleeps 60s between cycles; no cron needed
    },
  ],
}
