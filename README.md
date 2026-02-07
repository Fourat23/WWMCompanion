# WWM Companion — Where Winds Meet Build Planner

A community build builder and skill rotation planner for **Where Winds Meet**.
Create, share, and discover builds with an interactive rotation timeline editor.

> **Disclaimer:** This is a fan-made community tool. Not affiliated with or endorsed by the developers of Where Winds Meet. All game data is community-contributed and may not perfectly reflect in-game values.

## Features

- **Build Builder** — Create builds with skills, traits, stats, pros/cons, and how-to-play guides
- **Rotation Planner** — Visual timeline editor with cooldown tracking, downtime detection, and summary stats
- **Community** — Public build pages, upvoting, comments, and report system
- **SEO-Ready** — Server-rendered public pages with OpenGraph metadata
- **Zero Account Required** — Anonymous build creation with edit tokens
- **Security First** — Input validation, rate limiting, CSP headers, HTML sanitization

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** SQLite via Prisma (upgradeable to Postgres/Supabase)
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **Testing:** Jest + ts-jest

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and change IP_HASH_SALT to a random string

# 3. Run database migrations
npx prisma migrate dev

# 4. (Optional) Seed sample data
npm run db:seed

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | SQLite path or Postgres connection string | Yes |
| `IP_HASH_SALT` | Random string for hashing voter IPs | Yes (change in production) |
| `NODE_ENV` | `development` or `production` | No |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── builds/        # CRUD for builds
│   │   ├── comments/      # Comment creation
│   │   ├── reports/       # Report submission
│   │   ├── skills/        # Skill CRUD
│   │   └── votes/         # Voting
│   ├── build/
│   │   ├── new/           # Build creation page
│   │   └── [slug]/        # Build detail page
│   └── skills/            # Skills database page
├── components/
│   ├── build/             # Build-related components
│   ├── rotation/          # Rotation editor & timeline
│   ├── layout/            # Header, Footer
│   └── ui/                # Tag, Disclaimer
├── lib/                   # Core logic
│   ├── db.ts             # Prisma client singleton
│   ├── hash.ts           # IP hashing
│   ├── rate-limit.ts     # In-memory rate limiter
│   ├── rotation.ts       # Timeline computation engine
│   ├── sanitize.ts       # Input sanitization
│   ├── slug.ts           # Slug generation
│   ├── tokens.ts         # Edit token generation
│   └── validation.ts     # Zod schemas
├── __tests__/             # Unit tests
│   ├── rotation.test.ts
│   ├── validation.test.ts
│   ├── sanitize.test.ts
│   └── rate-limit.test.ts
└── generated/prisma/      # Generated Prisma client
prisma/
├── schema.prisma          # Database schema
└── migrations/            # SQL migrations
docs/
└── SECURITY.md            # Security & compliance doc
```

## API Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/builds` | List builds (paginated, filterable) | — |
| POST | `/api/builds` | Create a build | 10/hour |
| GET | `/api/builds/:slug` | Get build details | — |
| PUT | `/api/builds/:slug` | Update build (needs edit token) | 30/hour |
| DELETE | `/api/builds/:slug` | Delete build (needs edit token) | — |
| POST | `/api/votes` | Vote on a build | 60/hour |
| POST | `/api/comments` | Comment on a build | 20/hour |
| POST | `/api/reports` | Report a build/comment | 10/hour |
| GET | `/api/skills` | List approved skills | — |
| POST | `/api/skills` | Submit a skill for review | 20/hour |

## Testing

```bash
npm test            # Run all tests
npm run test:watch  # Watch mode
```

## Deployment (Vercel Free Tier)

1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard
4. For production: switch to Supabase Postgres (change `DATABASE_URL` and Prisma provider)

## Database Migration to Postgres

1. Change `provider` in `prisma/schema.prisma` from `sqlite` to `postgresql`
2. Update `DATABASE_URL` to your Postgres connection string
3. Run `npx prisma migrate dev --name switch-to-postgres`

## Security

See [docs/SECURITY.md](docs/SECURITY.md) for full security documentation, threat model, and compliance notes.

## License

MIT
