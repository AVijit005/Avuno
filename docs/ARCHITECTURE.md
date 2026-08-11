# Architecture

## Overview
Avuno 2.0 is a modern monorepo web application using a decoupled client-server architecture.

## Frontend
- **Framework**: React via Vite.
- **Routing**: TanStack Router.
- **Data Fetching**: TanStack Query.
- **Styling**: Tailwind CSS with an OKLCH-based Design System 2.0.

## Backend
- **Framework**: NestJS (TypeScript).
- **Architecture**: Modular, controller-service pattern.
- **Task Queue**: BullMQ backed by Redis for background jobs.
- **Logging**: Pino structured logging.

## Database
- **Engine**: PostgreSQL 16.
- **ORM**: Prisma.
- **Schema**: Strongly typed, relational schema enforcing application constraints at the database level.

## Core Systems
- **Memory System**: Handles explicit user memories, optionally linked to Media, Journal entries, Quotes, or Timeline events. Enforces mutual exclusivity between Journal and Quote links.
- **Journal**: Chronological text entries authored by the user.
- **Timeline**: System-recorded milestones indicating what happened (can be optionally linked to user Memories via `memoryId`).
- **Media**: The canonical creative works (Movies, TV, Books, Games, Podcasts, etc.).
- **Analytics & Insights**: System-derived factual aggregations.

## Authentication & Authorization
- **Authentication**: Custom Auth / OAuth 2.0.
- **Authorization**: Strict backend ownership checks on every protected resource.

## Production Topology
LOCAL:
User -> Vite Dev Server -> NestJS Backend -> PostgreSQL

PRODUCTION:
User -> Cloudflare -> VPS -> (Frontend Static / Backend API) -> PostgreSQL
*(Note: Production topology is NOT VERIFIED FROM REPOSITORY)*
