# Chronicle Personal Memory Operating System - Handoff Document

## Welcome to Avuno (Chronicle)

This is the primary handoff document for Avuno. It provides complete context for a new developer or AI agent picking up this codebase.

### What is Avuno?

Avuno is a premium, beautifully crafted personal media tracking platform. It allows users to track their movies, books, games, anime, and podcasts in a single, unified library. Rather than just acting as a database, Chronicle functions as a "memory capsule," providing intelligent resurfacing, mood reflections, and dynamic journaling.

### Current Project State

The project just completed **Phase 4C-3: Memory Detail & Vault Foundation**.
The core backend architecture for relational Memories, Timelines, Journals, and Media is robust and protected by a hard PostgreSQL CHECK constraint guaranteeing "Truth-First" evidence rules.

### The "Truth-First" Rule (CRITICAL)

- **Memory:** "I chose to preserve this." It is a deliberate, user-authored curation.
- **Journal:** "I wrote this."
- **Timeline:** "This happened."
- **Media:** "This is what I experienced."
  **Rule:** A Memory _MUST_ be created through explicit user action. No AI generation, no detached synthesis. If a Memory is created from a Journal or Quote, it must reference it (journalId or quoteId). The backend enforces this.

### What is Currently Complete

- **Frontend Architecture:** React 19, Vite, TanStack Router, TailwindCSS 4, OKLCH glassmorphism design system.
- **Backend Architecture:** NestJS 11, Prisma, PostgreSQL 16, custom JWT auth.
- **Phase 4B-2:** Relational memory foundations (Schema, CHECK constraint, API endpoints, ownership validation, MemoryMedia junction). **22 verified relational tests passing.**
- **Phase 4C-1:** Journal polish (Timeline / Media / Mood reflections integration in UI).
- **Phase 4C-2:** Memory Capsule Creation Experience (UI). **13 backend Memory creation tests passing.**
- **Phase 4C-3:** Memory Vault (/app/memories) and Memory Detail (/app/memories/).

### What is NOT Complete (Next Steps)

- **Phase 4C-4:** Complete Media → Memory integration.
- **Future:** Timeline ↔ Memory integration polish.
- **Future:** Quote experience.
- **Future:** AI / Memory Universe (DEFERRED - DO NOT BUILD YET).

### What Must Not Be Changed

- Do NOT rewrite or remove the memory_evidence_check in PostgreSQL.
- Do NOT add AI/LLM summarization for memories.
- Do NOT alter the OKLCH / PremiumGlass aesthetic (refer to \docs/DESIGN_SYSTEM.md\).
- Do NOT change the Auth mechanism (Custom JWT + Cookie/LocalStorage sync).
- Do NOT change the frontend framework (React 19 + TanStack Router).

### How to Run Locally

Refer to \docs/DEVELOPMENT.md\.

### Documentation Index

- [Architecture](ARCHITECTURE.md)
- [API](API.md)
- [Database](DATABASE.md)
- [Development](DEVELOPMENT.md)
- [Deployment & Infrastructure](DEPLOYMENT.md)
- [Design System](DESIGN_SYSTEM.md)
- [Product Principles](PRODUCT_PRINCIPLES.md)
