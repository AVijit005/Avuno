# Chronicle - Development & Testing

## Tech Stack
- Frontend: React 19, Vite, TanStack Router, Tailwind CSS v4
- Backend: NestJS 11, Prisma ORM (Bun/Node)
- Database: PostgreSQL (Neon / Docker)

## Commands

### Frontend
- \un run dev\: Start Vite dev server (proxies to production backend unless overridden)
- \un run build\: Build React app
- \un run typecheck\: Run TypeScript compilation check

### Backend (apps/backend)
- \un install\: Install backend deps
- \un run start:dev\: Start NestJS dev server
- \unx prisma migrate dev\: Run migrations against local DB
- \un test\: Run the Bun test suite

### Running Tests
The project uses un:test. Tests are highly specific and focus on relational integrity.
Run from pps/backend:
- \un test src/journal/memory-relations.spec.ts\ (22 passing tests)
- \un test src/journal/memory-creation.spec.ts\ (13 passing tests)

## Local Setup with Docker
You can spin up local PostgreSQL and Redis using the included docker-compose.yml files in the backend directory.
Ensure DATABASE_URL in pps/backend/.env points to your local Docker container (e.g., postgresql://postgres:postgres@localhost:5432/avuno).
