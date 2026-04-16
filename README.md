# Sports Photography

Portfolio and gallery app for Dustin Lapuz built with Next.js 16, React 19, and Supabase.

## What is in this app

- Cinematic marketing homepage with current collection highlights
- Collection galleries with popup viewing, sharing, and full-gallery ZIP downloads
- Supabase-backed admin panel for captions, featured picks, and sort order
- Supabase-backed booking request form surfaced on the public site
- Optional hosted payment/deposit CTA via `NEXT_PUBLIC_BOOKING_DEPOSIT_URL`

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_BOOKING_DEPOSIT_URL` if you want a hosted Stripe or payment-link CTA
4. Apply [`supabase-schema.sql`](/C:/Users/dylan.2796668/Downloads/RoFlip/SportsPhotography/supabase-schema.sql) in Supabase SQL Editor.
5. Install dependencies with `npm install`.
6. Run `npm run dev`.

## Commands

- `npm run dev`: prepare gallery assets and start the webpack dev server
- `npm run dev:turbopack`: prepare gallery assets and start the default Next dev server
- `npm run build`: prepare gallery assets and create a production build
- `npm run lint`: run ESLint

## Supabase notes

The schema creates:

- `admin_users` for admin access
- `collection_photos` for captions, featured picks, and custom sort order
- `booking_requests` for public booking leads

After creating the admin user in Supabase Auth, insert that user into `admin_users` so the `/admin` route can authenticate correctly.

## Payments

This project is set up for hosted payment links instead of a custom checkout flow. Put a Stripe Payment Link or other hosted deposit URL into `NEXT_PUBLIC_BOOKING_DEPOSIT_URL` and the public site will expose a reserve-coverage CTA automatically.

If you later want full cart or per-photo checkout, add a server-side checkout session route and keep the current payment-link CTA as the fallback.

## Deploying

Vercel is the easiest deployment target.

1. Import the repo into Vercel.
2. Add the same environment variables from `.env.local`.
3. Make sure the build command stays `npm run build`.
4. Deploy once so `prepare-gallery-assets.mjs` copies `images/` into `public/collections/` during build.
5. In Supabase Auth, set the site URL and email redirect URL to your production domain.
6. Confirm `/auth/confirm`, `/admin`, gallery downloads, and booking requests work on the deployed URL.

## Important implementation detail

This repo includes local agent instructions noting that this Next.js version has breaking changes relative to older releases. Before making future framework-level changes, read the relevant guide in `node_modules/next/dist/docs/` after dependencies are installed.
