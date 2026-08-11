# Avuno

Avuno is a premium personal media, experience, and memory SaaS. It is a digital vault designed as a chronological and intentional record of your life and media experiences.

## Product Philosophy

Avuno is built on a Truth-First model. The system acts strictly as a recorder of facts and explicit user inputs. Memories are never automatically created. The system never fabricates, synthesizes, or invents user memories, relationships, or insights. AI interpretation is explicitly deferred.

## Current Status

- **Current Phase**: Documentation & Handoff
- **Last Completed Phase**: Phase 4C-3: Memory Detail + Memory Vault foundation
- **AI Status**: NOT IMPLEMENTED (Deferred)

## Architecture Overview

Avuno is a full-stack monorepo:

- **Frontend**: React, Vite, Tailwind CSS, TanStack Router & Query.
- **Backend**: NestJS, exposing robust REST APIs.
- **Database**: PostgreSQL 16 managed via Prisma.
- **Caching/Queue**: Redis & BullMQ.

## Tech Stack

- Package Manager: Bun
- Languages: TypeScript, Node.js (v22+)
- UI: Design System 2.0 (OKLCH, Hyper-Glass, PremiumGlass)

## Repository Structure

- `/`: Frontend application (Vite setup)
- `/apps/backend`: NestJS API server
- `/docs`: Canonical project documentation

## Quick Start / Local Development

1. **Install Dependencies**

   ```bash
   bun install
   ```

2. **Start Infrastructure (Database & Redis)**

   ```bash
   cd apps/backend
   docker compose up -d postgres redis
   ```

3. **Database Migrations**

   ```bash
   cd apps/backend
   bunx prisma migrate dev
   ```

4. **Start Backend Server**

   ```bash
   cd apps/backend
   bun run start:dev
   ```

5. **Start Frontend Server**
   ```bash
   bun run dev
   ```

## Testing

- Unit tests: `bun run test`
- Visual tests: `bun run test:visual`

## Build

- Frontend: `bun run build`
- Backend: `cd apps/backend && bun run build`

## Docker

A `docker-compose.yml` is provided in `apps/backend` for local services.

## Deployment Overview

NOT VERIFIED FROM REPOSITORY

## Important Constraints

- **Memory Creation**: Explicit user action only. Never automatic.
- **Database Rules**: A `Memory` can reference a `Journal` or a `Quote`, but `journalId` and `quoteId` cannot both be present simultaneously.
- **Security**: Backend ownership checks are strictly enforced. Frontend hiding does not constitute security.

## Documentation Links

- [AI Developer Handoff](./HANDOFF.md) - **Read first if you are an AI.**
- [Product Principles](./docs/PRODUCT_PRINCIPLES.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Database](./docs/DATABASE.md)
- [API](./docs/API.md)
- [Design System](./docs/DESIGN_SYSTEM.md)
- [Development Workflow](./docs/DEVELOPMENT.md)
- [Roadmap](./docs/ROADMAP.md)

## Roadmap

**Next Phase**: Phase 4C-4: Media → Memory integration.
