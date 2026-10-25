# Gharmai Kirana — Project Architecture & Rules

## 1. System Overview
- **Backend API**: Node.js / Express 5 with TypeScript (`online groshries/src/server.ts`).
- **Database**: Hosted PostgreSQL on **Supabase** via **Prisma ORM 7** with `@prisma/adapter-pg` connection pooling.
- **Web Client**: React 19 + TypeScript + Vite SPA (`online groshries/client`). Built to `client/dist` and statically served by Express in production.
- **Mobile Client**: React Native 0.86 + Expo 57 (`online groshries mobile app/mobile`). Communicates with Express API over HTTP.

## 2. Key Directories
- `online groshries/src`: Express API routes, services, middleware, validations, and Prisma client.
- `online groshries/prisma`: Schema definition (`schema.prisma`) and seed scripts.
- `online groshries/client`: React Vite SPA for customer web store and store admin portal.
- `online groshries mobile app/mobile`: Expo React Native cross-platform mobile app.
- `online groshries/legacy`: Archived historical Next.js 15 pages kept for design and logic reference.

## 3. Database Commands
- Schema push to Supabase: `npm run db:push`
- Prisma Client generation: `npm run db:generate`
- Seed store data: `npm run db:seed`
- Test suite: `npm test`
