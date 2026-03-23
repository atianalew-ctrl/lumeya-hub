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

## Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select `atianalew-ctrl/lumeya-hub`
4. Leave all settings as default — it'll auto-detect Next.js
5. Click **Deploy**

That's it! No environment variables needed.

## Stack
- Next.js 16 (App Router)
- TypeScript + Tailwind CSS v4
- @dnd-kit for drag-and-drop
- Supabase REST API (direct)
- GitHub API (for commit history)
