# Remade Research Site

- Next.js App Router + Tailwind
- Live Google Scholar sync (server route + client UI)
- Interactive Lyapunov Lab (RK4, V and Vdot)

## Run locally
```bash
npm install
npm run dev
```

## Deploy on Vercel
1) Push folder to a GitHub repo.
2) Create Vercel project from that repo.
3) Add env vars `SCHOLAR_USER=EtkfNQMAAAAJ` and optionally `NEXT_PUBLIC_SCHOLAR_USER=EtkfNQMAAAAJ`.
4) Deploy, then open `/publications`.
