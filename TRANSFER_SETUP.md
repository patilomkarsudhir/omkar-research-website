# Transfer Setup Guide (Machine Migration)

This guide is the single source of truth for moving this repository between machines while keeping all features working.

## Purpose

- Separate machine-specific setup from repository-agnostic code
- Make migration repeatable for humans and AI agents
- Ensure scholar updates, analytics, and local development continue to work

## What is machine-specific

- Installed tools: Git, Node.js, npm
- Local environment file: `.env.local`
- Windows Task Scheduler registration for scholar updates
- Login/session state for GitHub, Vercel CLI, and related services

## What is repository-agnostic

- Source code and scripts in this repository
- `scripts/update-scholar-daily.bat`
- `scripts/register-scholar-task.ps1`
- `scripts/remove-scholar-task.ps1`
- `scripts/bootstrap-new-machine.ps1`
- `scripts/verify-machine-setup.ps1`
- Cached scholar fallback data in `data/scholar-cache.json`

## One-time steps on old machine (before handover)

1. Remove scheduled task:
   powershell -ExecutionPolicy Bypass -File "C:\Users\patilomkarsudhir\OneDrive - University of Florida\Desktop\Website\omkar-site-remade\omkar-research-site-remade\scripts\remove-scholar-task.ps1"
2. Verify task removal:
   schtasks /Query /TN "\Update Scholar Cache"

Expected verify output after removal: task not found.

## One-time steps on new machine

1. Clone repository to a local folder.
2. From repo root, run bootstrap:
   powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-new-machine.ps1 -RunBuild -EnableScholarTask
3. Fill in real values in `.env.local` if placeholders are present.
4. Validate setup:
   powershell -ExecutionPolicy Bypass -File .\scripts\verify-machine-setup.ps1

## Notes on environment values

Required for scholar route:
- `SCHOLAR_USER`
- `NEXT_PUBLIC_SCHOLAR_USER`

Optional (analytics persistence via Upstash/Vercel KV):
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

If KV vars are not set, analytics route falls back to default in-memory-like behavior and does not persist across serverless cold starts.

## AI Agent Operating Notes

When an AI agent is asked to make this repo operational on a new machine:

1. Read this file first.
2. Run `scripts/bootstrap-new-machine.ps1` with relevant flags.
3. Ensure `.env.local` exists and required vars are set.
4. Run `scripts/verify-machine-setup.ps1` and report any missing pieces.
5. If user wants no local scheduler, run `scripts/remove-scholar-task.ps1` and suggest cloud scheduling instead.

## Recommended future hardening

- Move scholar update scheduling from local Task Scheduler to GitHub Actions or Vercel Cron for device-independent automation.
