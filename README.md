# Blank Template (Next.js 15 + React 19)

Beginner-friendly "best practice" starter:
- Next.js 15 App Router + TypeScript strict
- Tailwind + shadcn-ready
- Supabase SSR helpers
- Stripe webhook Route Handler
- PWA manifest + minimal SW registration (production only)
- Capacitor config placeholder
- Prettier + Tailwind class sorting
- `pnpm check` sanity command
- Basic security headers
- robots/sitemap routes

## Setup

```bash
pnpm install
pnpm dev
```

### Environment Variables

For **local development**, create a `.env.local` file in the project root with the following variables:

```bash
# Public (safe to expose to browser)
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-only
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Optional: used only if you later need privileged server operations
SUPABASE_SERVICE_ROLE_KEY=
```

**Environment Variable Files (in order of priority):**
- `.env.local` - **Use this for local development** (gitignored, never committed)
- `.env.development` - Development defaults (optional)
- `.env.production` - Production defaults (optional)

**Required for local development:**
- `NEXT_PUBLIC_APP_URL` - Your local URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_SUPABASE_URL` - From your Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From your Supabase project settings
- `STRIPE_SECRET_KEY` - From Stripe dashboard (only needed if using Stripe)
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook config (only needed for webhooks)

**Note:** The dev server won't crash if these are missing. You'll only get errors when you actually try to use Supabase/Stripe features.