# Value Miner

Mobile-first inbox for saving YouTube Shorts, auto-summarizing with AI, and generating a 3-step action plan you can act on immediately.

## What’s here
- Next.js (App Router) + Tailwind for a sleek mobile-first UI.
- Custom auth with JWT + Prisma (SQLite locally, Postgres-ready in prod).
- API routes to ingest Shorts, fetch transcripts (captions → audio fallback), summarize, categorize, and list clips.
- Default categories (Business / Relationships / Philosophy) seeded at signup.

## Quick start
1) Install dependencies
```bash
npm install
```
2) Set env vars in `.env`
```
DATABASE_URL="file:./dev.db"        # or postgres url in prod
AUTH_SECRET="replace-me-with-strong-random-string"
OPENAI_API_KEY="sk-..."             # required for summarization + audio fallback
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
3) Generate client and sync the local DB
```bash
npx prisma generate
npx prisma db push
```
4) Run the app
```bash
npm run dev
```

## Ingestion flow
1) POST `/api/ingest` with `{ youtubeUrl, categoryId?, autoCategorize? }`.
2) Server grabs captions via `youtube-transcript`; if missing, downloads audio and sends to Whisper via OpenAI.
3) AI summarizes to 3 sentences and builds a 3-step plan, then saves the clip, transcript, summary, and action steps.
4) Categories are assigned explicitly or auto-picked via AI; unknown picks are created for the user.

## Auth flow
- Email + password (bcrypt) stored in DB.
- JWT session cookie (`vm_session`) set via `/api/auth/signup` or `/api/auth/login`.
- `/api/auth/me` for session checks, `/api/auth/logout` to clear.

## Production notes
- Swap `DATABASE_URL` to your managed Postgres.
- Keep `AUTH_SECRET` long and random.
- Ensure `OPENAI_API_KEY` is set wherever you deploy.
- API routes are marked `runtime = "nodejs"` for transcript/audio work.

## Next improvements
- Web Share Target + manifest for one-tap mobile shares.
- Background jobs for retrying failed transcriptions.
- Offline-friendly PWA shell and optimistic UI for uploads.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
