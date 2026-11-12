# Admin Web

Next.js admin dashboard powered by Convex.

## Requirements

- Node.js 20+
- pnpm (lockfile is `pnpm-lock.yaml`)
- A Convex deployment URL

## Setup

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Set `NEXT_PUBLIC_CONVEX_URL` in `.env.local`, then run:

```sh
pnpm dev
```

## Checks and production build

```sh
pnpm typecheck
pnpm build
```

## Deployment

Configure `NEXT_PUBLIC_CONVEX_URL` as a production environment variable in your hosting provider. This is a Next.js application; deploy to a Next.js-compatible host. Cloudflare Pages requires the OpenNext Cloudflare adapter for current Next.js versions; do not use the legacy next-on-pages adapter without verifying compatibility.
