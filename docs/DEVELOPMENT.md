# Local Development

## Prerequisites

- **Node.js**: v22.0.0 or higher
- **Package Manager**: Bun
- **Docker**: For running PostgreSQL and Redis locally

## Infrastructure Setup

Start the local database and Redis cache:
\`\`\`bash
cd apps/backend
docker compose up -d postgres redis
\`\`\`

## Backend Setup

1. Navigate to the backend directory:
   \`\`\`bash
   cd apps/backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   bun install
   \`\`\`
3. Setup Environment:
   Copy `.env.example` to `.env` and fill in necessary details (e.g. `DATABASE_URL`).
4. Run Database Migrations:
   \`\`\`bash
   bunx prisma migrate dev
   \`\`\`
5. Start the Development Server:
   \`\`\`bash
   bun run start:dev
   \`\`\`

## Frontend Setup

1. Navigate to the project root:
   \`\`\`bash
   cd /path/to/repo
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   bun install
   \`\`\`
3. Start the Development Server:
   \`\`\`bash
   bun run dev
   \`\`\`

## Type Checking & Linting

- **Typecheck**: `bun run typecheck` (Frontend)
- **Lint**: `bun run lint` (Frontend), `bun run lint` (Backend)
- **Build**: `bun run build` (Frontend and Backend)
