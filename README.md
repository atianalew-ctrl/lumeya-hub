# Lumeya Dev Hub

Private development dashboard for managing Lumeya Connect.

## Pages
- `/` — Dashboard (stats, phase progress, latest deploy)
- `/board` — Kanban project board with drag-and-drop
- `/preview` — Live preview of lumeya-connect.vercel.app
- `/deploys` — GitHub commit / deploy log
- `/docs` — Project documentation

## Auth
Password: `lumeya2026`

## Hosting
Self-hosted on Lucas's VPS at **lumeya.mlfrance.dev** (port 8012, behind Cloudflare tunnel).

```bash
# Build
npx next build

# Start
npx next start -p 8012
```

The dev hub is NOT on Vercel. The main Lumeya Connect site (lumeya-connect.vercel.app) remains on Vercel.
